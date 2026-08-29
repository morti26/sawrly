import { NextRequest, NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ensurePaymentSchema, hasPaymentGatewayColumns } from '@/lib/payment-schema';
import {
  GATEWAY_PAYMENT_METHOD,
  getPaymentGatewayCredentials,
  getPaymentRuntimeConfig,
} from '@/lib/payment-runtime';
import { createGatewayCheckout } from '@/lib/payment-gateway';

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['creator']);
  if (auth.error || !auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = (await req.json().catch(() => null)) as { planId?: unknown; billingCycle?: unknown } | null;
  const planId = String(body?.planId ?? '').trim();
  const billingCycle = body?.billingCycle === 'yearly' ? 'yearly' : 'monthly';
  if (!planId) return NextResponse.json({ error: 'Plan is required' }, { status: 400 });

  const planRes = await query(
    `SELECT id, code, price_monthly, price_yearly, currency, is_enterprise
       FROM subscription_plans WHERE id=$1 AND is_active=true`, [planId]);
  if (!planRes.rowCount) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  const plan = planRes.rows[0];
  const amount = Number(billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly);
  if (!Number.isFinite(amount) || amount <= 0 || plan.is_enterprise) {
    return NextResponse.json({ error: 'This plan requires contacting sales' }, { status: 400 });
  }

  const runtime = await getPaymentRuntimeConfig();
  const credentials = await getPaymentGatewayCredentials();
  if (!runtime.gatewayConfigured || !runtime.webhookConfigured || !credentials || !(await hasPaymentGatewayColumns())) {
    return NextResponse.json({ error: 'Online payment gateway is not configured' }, { status: 503 });
  }
  await ensurePaymentSchema();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const paymentRes = await client.query(
      `INSERT INTO payments (quote_id, amount, method, status, created_by)
       VALUES (NULL, $1, $2, 'pending', $3) RETURNING id`,
      [amount, GATEWAY_PAYMENT_METHOD, auth.user.userId]);
    const paymentId = String(paymentRes.rows[0].id);
    await client.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status, amount_paid, currency, last_payment_id, notes)
       VALUES ($1, $2, 'trialing', 0, $3, $4, $5)`,
      [auth.user.userId, plan.id, plan.currency, paymentId, JSON.stringify({ billingCycle })]);
    const gateway = await createGatewayCheckout(credentials, {
      paymentId,
      quoteId: '',
      offerId: '',
      creatorId: auth.user.userId,
      clientId: auth.user.userId,
      amountIqd: amount,
    });
    await client.query(
      `UPDATE payments SET gateway_reference=$1, gateway_checkout_url=$2, gateway_status='pending' WHERE id=$3`,
      [gateway.gatewayReference ?? null, gateway.checkoutUrl, paymentId]);
    await client.query('COMMIT');
    return NextResponse.json({ checkoutUrl: gateway.checkoutUrl, paymentId });
  } catch (e: any) {
    await client.query('ROLLBACK').catch(() => undefined);
    return NextResponse.json({ error: e?.message ?? 'Unable to create checkout' }, { status: 500 });
  } finally {
    client.release();
  }
}
