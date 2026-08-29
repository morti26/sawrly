import { NextRequest, NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/logic';
import { ensureWalletSchema } from '@/lib/wallet-schema';

const METHODS = new Set(['cash', 'bank_transfer', 'wallet', 'online']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalText(value: unknown, maxLength: number): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : null;
}

/** List payout records for the admin payout workflow. */
export async function GET(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await ensureWalletSchema();
        const creatorId = req.nextUrl.searchParams.get('creatorId')?.trim();
        const params: string[] = [];
        const filter = creatorId ? `WHERE wp.creator_id = $1` : '';
        if (creatorId) params.push(creatorId);

        const result = await query(
            `
              SELECT wp.id, wp.creator_id, u.name AS creator_name, u.email AS creator_email,
                     wp.amount::float8 AS amount, wp.method::text AS method, wp.status,
                     wp.reference, wp.note, wp.created_at, wp.processed_at,
                     created_by.name AS created_by_name, processed_by.name AS processed_by_name
              FROM wallet_payouts wp
              JOIN users u ON u.id = wp.creator_id
              JOIN users created_by ON created_by.id = wp.created_by
              LEFT JOIN users processed_by ON processed_by.id = wp.processed_by
              ${filter}
              ORDER BY wp.created_at DESC
              LIMIT 200
            `,
            params
        );
        return NextResponse.json({ payouts: result.rows });
    } catch (error) {
        console.error('Admin wallet payouts GET Error:', error);
        return NextResponse.json({ error: 'Unable to load payouts' }, { status: 500 });
    }
}

/** Record money that the platform has actually sent to a creator. */
export async function POST(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const creatorId = optionalText(body?.creatorId, 100);
    const method = optionalText(body?.method, 30) || 'bank_transfer';
    const reference = optionalText(body?.reference, 200);
    const note = optionalText(body?.note, 1000);
    const amountValue = body?.amount;
    const amount =
        typeof amountValue === 'number'
            ? amountValue
            : typeof amountValue === 'string'
                ? Number(amountValue.trim())
                : NaN;

    if (!creatorId || !UUID_PATTERN.test(creatorId)) {
        return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }
    if (!METHODS.has(method)) {
        return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 });
    }

    try {
        await ensureWalletSchema();
        const client = await pool.connect();
        let payout: any;
        try {
            await client.query('BEGIN');

            const creator = await client.query(
                `SELECT id FROM users WHERE id = $1 AND role = 'creator' FOR UPDATE`,
                [creatorId]
            );
            if (creator.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
            }

            if (reference) {
                const duplicate = await client.query(
                    `SELECT id FROM wallet_payouts WHERE creator_id = $1 AND reference = $2 LIMIT 1`,
                    [creatorId, reference]
                );
                if (duplicate.rowCount) {
                    await client.query('ROLLBACK');
                    return NextResponse.json({ error: 'A payout with this reference already exists' }, { status: 409 });
                }
            }

            const totals = await client.query(
                `
                  SELECT
                    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
                     JOIN quotes q ON q.id = p.quote_id
                     WHERE q.creator_id = $1 AND p.status = 'confirmed') AS earned,
                    (SELECT COALESCE(SUM(wp.amount), 0) FROM wallet_payouts wp
                     WHERE wp.creator_id = $1 AND wp.status = 'completed') AS sent
                `,
                [creatorId]
            );
            const earned = Number(totals.rows[0]?.earned ?? 0);
            const sent = Number(totals.rows[0]?.sent ?? 0);
            if (amount > earned - sent) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Payout exceeds the creator available balance', available: Math.max(0, earned - sent) },
                    { status: 400 }
                );
            }

            const inserted = await client.query(
                `
                  INSERT INTO wallet_payouts
                    (creator_id, amount, method, status, reference, note, created_by, processed_by, processed_at)
                  VALUES ($1, $2, $3, 'completed', $4, $5, $6, $6, NOW())
                  RETURNING id, creator_id, amount::float8 AS amount, method::text AS method,
                            status, reference, note, created_at, processed_at
                `,
                [creatorId, amount, method, reference, note, auth.user.userId]
            );
            payout = inserted.rows[0];
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        await logAudit('payment', payout.id, 'creator_payout_recorded', auth.user.userId, {
            creatorId,
            amount,
            method,
            reference,
        });

        return NextResponse.json(payout, { status: 201 });
    } catch (error) {
        console.error('Admin wallet payout POST Error:', error);
        return NextResponse.json({ error: 'Unable to record payout' }, { status: 500 });
    }
}
