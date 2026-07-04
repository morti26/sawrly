import { NextRequest, NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import {
    GATEWAY_PAYMENT_METHOD,
    type PaymentGatewayCredentials,
    getCheckoutNextStep,
    getPaymentGatewayCredentials,
    getPaymentRuntimeConfig,
    isSupportedPaymentMethod,
    type PaymentMethod,
} from '@/lib/payment-runtime';
import { createGatewayCheckout, PaymentGatewayError } from '@/lib/payment-gateway';
import { ensurePaymentSchema, hasPaymentGatewayColumns } from '@/lib/payment-schema';
import { logOpsError } from '@/lib/ops-monitoring';

async function ensureQuoteBookingSchema() {
    await query(`
        ALTER TABLE quotes
        ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE
    `);
    await query(`
        ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS payment_portion VARCHAR(20) NOT NULL DEFAULT 'full'
    `);
}

function normalizePositiveAmount(value: unknown): number | null {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
}

export async function POST(req: NextRequest) {
    const auth = requireRole(req, ['client']);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await ensurePaymentSchema();
    await ensureQuoteBookingSchema();

    const body = (await req.json().catch(() => null)) as {
        offerIds?: unknown[];
        paymentMethod?: unknown;
        paymentPortion?: unknown;
        scheduledForByOfferId?: Record<string, unknown>;
    } | null;
    const rawOfferIds: unknown[] = Array.isArray(body?.offerIds) ? body!.offerIds! : [];
    const offerIds = Array.from(
        new Set(
            rawOfferIds
                .map((value: unknown) => String(value).trim())
                .filter((value: string) => value.length > 0)
        )
    );
    const paymentMethod =
        typeof body?.paymentMethod === 'string' ? body.paymentMethod.trim() : '';
    const paymentPortion =
        typeof body?.paymentPortion === 'string' ? body.paymentPortion.trim().toLowerCase() : 'full';
    const rawScheduledForByOfferId =
        body?.scheduledForByOfferId && typeof body.scheduledForByOfferId === 'object'
            ? body.scheduledForByOfferId
            : {};
    const scheduledForByOfferId = new Map<string, string>();
    for (const [offerId, rawValue] of Object.entries(rawScheduledForByOfferId)) {
        const normalizedOfferId = String(offerId).trim();
        const scheduledFor = typeof rawValue === 'string' ? rawValue.trim() : '';
        if (!normalizedOfferId || !scheduledFor) continue;
        if (!Number.isNaN(Date.parse(scheduledFor))) {
            scheduledForByOfferId.set(normalizedOfferId, scheduledFor);
        }
    }

    if (offerIds.length === 0) {
        return NextResponse.json({ error: 'Offer IDs are required' }, { status: 400 });
    }

    if (offerIds.length > 20) {
        return NextResponse.json({ error: 'Too many offers in one checkout' }, { status: 400 });
    }

    const missingScheduledOffers = offerIds.filter((offerId) => !scheduledForByOfferId.has(offerId));
    if (missingScheduledOffers.length > 0) {
        return NextResponse.json(
            { error: 'Booking date and time are required for every offer', missingOfferIds: missingScheduledOffers },
            { status: 400 }
        );
    }

    const runtimeConfig = await getPaymentRuntimeConfig();
    const gatewayColumnsAvailable = await hasPaymentGatewayColumns();
    if (paymentMethod === GATEWAY_PAYMENT_METHOD && !runtimeConfig.gatewayConfigured) {
        return NextResponse.json(
            { error: 'Online payment gateway is not fully configured' },
            { status: 400 }
        );
    }
    if (paymentMethod === GATEWAY_PAYMENT_METHOD && !runtimeConfig.webhookConfigured) {
        return NextResponse.json(
            { error: 'Online payment webhook secret is not configured' },
            { status: 400 }
        );
    }
    if (paymentMethod === GATEWAY_PAYMENT_METHOD && !gatewayColumnsAvailable) {
        return NextResponse.json(
            { error: 'Online payment schema is not available for this database user' },
            { status: 503 }
        );
    }
    if (!isSupportedPaymentMethod(paymentMethod, runtimeConfig)) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (paymentPortion !== 'full' && paymentPortion !== 'partial') {
        return NextResponse.json({ error: 'Invalid payment portion' }, { status: 400 });
    }
    const nextStep = getCheckoutNextStep(paymentMethod as PaymentMethod);
    const isOnlinePayment = paymentMethod === GATEWAY_PAYMENT_METHOD;

    let gatewayCredentials: PaymentGatewayCredentials | null = null;
    if (isOnlinePayment) {
        gatewayCredentials = await getPaymentGatewayCredentials();
        if (!gatewayCredentials) {
            return NextResponse.json(
                { error: 'Online payment gateway is not fully configured' },
                { status: 400 }
            );
        }
    }

    const client = await pool.connect();
    let transactionOpen = false;
    try {
        await client.query('BEGIN');
        transactionOpen = true;

        const offersRes = await client.query(
            `
                SELECT id, title, creator_id, price_iqd, partial_payment_iqd, full_payment_iqd
                FROM offers
                WHERE status = 'active'
                  AND id = ANY($1::uuid[])
            `,
            [offerIds]
        );

        const offersById = new Map<
            string,
            {
                id: string;
                title: string;
                creator_id: string;
                price_iqd: number | string;
                partial_payment_iqd: number | string | null;
                full_payment_iqd: number | string | null;
            }
        >();
        for (const row of offersRes.rows as Array<{
            id: string;
            title: string;
            creator_id: string;
            price_iqd: number | string;
            partial_payment_iqd: number | string | null;
            full_payment_iqd: number | string | null;
        }>) {
            offersById.set(String(row.id), row);
        }
        const missingOfferIds = offerIds.filter((id) => !offersById.has(id));

        if (missingOfferIds.length > 0) {
            await client.query('ROLLBACK');
            transactionOpen = false;
            return NextResponse.json(
                { error: 'Some offers were not found or are inactive', missingOfferIds },
                { status: 404 }
            );
        }

        const items: Array<{
            offerId: string;
            offerTitle: string;
            quoteId: string;
            paymentId: string;
            creatorId: string;
            paymentPortion: 'partial' | 'full';
            amount: number;
            checkoutUrl?: string;
            gatewayReference?: string | null;
        }> = [];
        const gatewayQueue: Array<{
            paymentId: string;
            quoteId: string;
            offerId: string;
            creatorId: string;
            paymentPortion: 'partial' | 'full';
            amount: number;
        }> = [];
        let totalAmount = 0;

        for (const offerId of offerIds) {
            const offer = offersById.get(offerId);
            if (!offer) {
                throw new Error(`Offer ${offerId} is missing after validation`);
            }
            const catalogPrice = Number(offer.price_iqd ?? 0);
            const fullAmount =
                normalizePositiveAmount(offer.full_payment_iqd) ??
                normalizePositiveAmount(offer.price_iqd) ??
                0;
            const partialAmount =
                normalizePositiveAmount(offer.partial_payment_iqd) ??
                Math.ceil(fullAmount * 0.30);
            const amount =
                paymentPortion === 'partial' && partialAmount < fullAmount
                    ? partialAmount
                    : fullAmount;
            const scheduledFor = scheduledForByOfferId.get(offerId);
            if (!scheduledFor) {
                await client.query('ROLLBACK');
                transactionOpen = false;
                return NextResponse.json(
                    { error: 'Booking date and time are required for every offer' },
                    { status: 400 }
                );
            }

            const scheduleConflictRes = await client.query(
                `
                    SELECT id
                    FROM events
                    WHERE creator_id = $1
                      AND calendar_status IN ('booked', 'busy')
                      AND DATE(date_time AT TIME ZONE 'UTC') = DATE($2::timestamptz AT TIME ZONE 'UTC')
                    LIMIT 1
                `,
                [offer.creator_id, scheduledFor]
            );
            if (scheduleConflictRes.rows.length > 0) {
                await client.query('ROLLBACK');
                transactionOpen = false;
                return NextResponse.json(
                    {
                        error: `Selected date is not available for offer ${offer.title}`,
                        offerId: offer.id,
                    },
                    { status: 409 }
                );
            }

            const quoteRes = await client.query(
                `
                    INSERT INTO quotes (offer_id, client_id, creator_id, price_snapshot, status, scheduled_for)
                    VALUES ($1, $2, $3, $4, 'accepted', $5)
                    RETURNING id, price_snapshot
                `,
                [offer.id, auth.user.userId, offer.creator_id, offer.price_iqd, scheduledFor]
            );

            const quote = quoteRes.rows[0];

            const paymentRes = await client.query(
                `
                    INSERT INTO payments (quote_id, amount, method, status, proof_url, created_by, payment_portion)
                    VALUES ($1, $2, $3, 'pending', NULL, $4, $5)
                    RETURNING id, status
                `,
                [quote.id, amount, paymentMethod, auth.user.userId, paymentPortion]
            );

            const payment = paymentRes.rows[0];
            let checkoutUrl: string | undefined;
            let gatewayReference: string | null = null;

            if (isOnlinePayment && gatewayCredentials) {
                await client.query(
                    `
                        UPDATE payments
                        SET gateway_status = $1
                        WHERE id = $2
                    `,
                    ['pending', payment.id]
                );
                gatewayQueue.push({
                    paymentId: String(payment.id),
                    quoteId: String(quote.id),
                    offerId: String(offer.id),
                    creatorId: String(offer.creator_id),
                    paymentPortion: paymentPortion as 'partial' | 'full',
                    amount,
                });
            }

            await client.query(
                `
                    INSERT INTO audit_logs (entity_type, entity_id, event_type, actor_id, metadata)
                    VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    'quote',
                    quote.id,
                    'quote_created',
                    auth.user.userId,
                    JSON.stringify({
                        offerId: offer.id,
                        price: catalogPrice,
                        fullPaymentAmount: fullAmount,
                        paymentAmount: amount,
                        paymentPortion,
                        scheduledFor,
                    }),
                ]
            );

            await client.query(
                `
                    INSERT INTO audit_logs (entity_type, entity_id, event_type, actor_id, metadata)
                    VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    'payment',
                    payment.id,
                    'payment_submitted',
                    auth.user.userId,
                    JSON.stringify({
                        quoteId: quote.id,
                        amount,
                        fullAmount,
                        catalogPrice,
                        method: paymentMethod,
                        paymentPortion,
                    }),
                ]
            );

            await client.query(
                `
                    INSERT INTO notifications (user_id, type, title, message, payload, is_read)
                    VALUES ($1, 'booking', $2, $3, $4, false)
                `,
                [
                    offer.creator_id,
                    'طلب جديد',
                    `تم إنشاء طلب جديد للعرض: ${offer.title}`,
                    JSON.stringify({
                        offerId: offer.id,
                        quoteId: quote.id,
                        paymentId: payment.id,
                        paymentAmount: amount,
                        paymentPortion,
                        scheduledFor,
                    }),
                ]
            );

            totalAmount += amount;
            items.push({
                offerId: String(offer.id),
                offerTitle: String(offer.title),
                quoteId: String(quote.id),
                paymentId: String(payment.id),
                creatorId: String(offer.creator_id),
                paymentPortion: paymentPortion as 'partial' | 'full',
                amount,
                checkoutUrl,
                gatewayReference,
            });
        }

        await client.query(
            `
                INSERT INTO notifications (user_id, type, title, message, payload, is_read)
                VALUES ($1, 'payment', $2, $3, $4, false)
            `,
            [
                auth.user.userId,
                'تم إرسال الطلب',
                `تم إنشاء ${items.length} طلب ودفع معلق بانتظار التأكيد`,
                JSON.stringify({ paymentMethod, paymentPortion, itemsCount: items.length, totalAmount }),
            ]
        );

        await client.query('COMMIT');
        transactionOpen = false;

        const onlineCheckoutErrors: Array<{ paymentId: string; message: string }> = [];

        if (isOnlinePayment && gatewayCredentials) {
            for (const pendingItem of gatewayQueue) {
                try {
                    const gatewayCheckout = await createGatewayCheckout(gatewayCredentials, {
                        paymentId: pendingItem.paymentId,
                        quoteId: pendingItem.quoteId,
                        offerId: pendingItem.offerId,
                        creatorId: pendingItem.creatorId,
                        clientId: auth.user.userId,
                        amountIqd: pendingItem.amount,
                    });

                    await query(
                        `
                            UPDATE payments
                            SET gateway_reference = $1,
                                gateway_checkout_url = $2,
                                gateway_status = $3,
                                gateway_payload = $4::jsonb
                            WHERE id = $5
                        `,
                        [
                            gatewayCheckout.gatewayReference,
                            gatewayCheckout.checkoutUrl,
                            'pending',
                            JSON.stringify(gatewayCheckout.gatewayPayload),
                            pendingItem.paymentId,
                        ]
                    );

                    const item = items.find((entry) => entry.paymentId === pendingItem.paymentId);
                    if (item) {
                        item.checkoutUrl = gatewayCheckout.checkoutUrl;
                        item.gatewayReference = gatewayCheckout.gatewayReference;
                    }
                } catch (gatewayError: unknown) {
                    const message =
                        gatewayError instanceof PaymentGatewayError
                            ? gatewayError.message
                            : 'Unable to create gateway checkout session';
                    onlineCheckoutErrors.push({ paymentId: pendingItem.paymentId, message });

                    try {
                        await query(
                            `
                                UPDATE payments
                                SET gateway_status = $1,
                                    gateway_payload = COALESCE(gateway_payload, $2::jsonb)
                                WHERE id = $3
                            `,
                            [
                                'failed',
                                JSON.stringify({
                                    error: message,
                                    failedAt: new Date().toISOString(),
                                }),
                                pendingItem.paymentId,
                            ]
                        );
                    } catch {
                        // Ignore secondary persistence failure; primary error is already captured below.
                    }

                    await logOpsError({
                        source: 'api.checkout.gateway',
                        message,
                        level: 'error',
                        requestPath: req.nextUrl.pathname,
                        details: {
                            userId: auth.user.userId,
                            paymentMethod,
                            paymentId: pendingItem.paymentId,
                            offerId: pendingItem.offerId,
                        },
                    });
                }
            }
        }

        return NextResponse.json(
            {
                quotesCount: items.length,
                paymentsCount: items.length,
                totalAmount,
                paymentMethod,
                paymentMode: runtimeConfig.mode,
                gatewayConfigured: runtimeConfig.gatewayConfigured,
                webhookConfigured: runtimeConfig.webhookConfigured,
                paymentProviderName: runtimeConfig.paymentProviderName,
                gatewayCheckoutUrl: items.find((item) => item.checkoutUrl)?.checkoutUrl ?? null,
                gatewayCheckoutUrls: items
                    .map((item) => item.checkoutUrl)
                    .filter((url): url is string => Boolean(url)),
                onlineCheckoutErrors,
                nextStep,
                items,
            },
            { status: 201 }
        );
    } catch (e: any) {
        if (transactionOpen) {
            await client.query('ROLLBACK');
            transactionOpen = false;
        }
        if (e instanceof PaymentGatewayError) {
            await logOpsError({
                source: 'api.checkout.gateway',
                message: e.message,
                level: 'error',
                requestPath: req.nextUrl.pathname,
                details: {
                    userId: auth.user.userId,
                    paymentMethod,
                    offerCount: offerIds.length,
                },
            });
            return NextResponse.json({ error: e.message }, { status: 502 });
        }
        await logOpsError({
            source: 'api.checkout',
            message: e?.message || 'Internal Server Error',
            level: 'error',
            requestPath: req.nextUrl.pathname,
            details: {
                userId: auth.user.userId,
                paymentMethod,
                offerCount: offerIds.length,
            },
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
