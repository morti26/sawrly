import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ensureWalletSchema } from '@/lib/wallet-schema';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['creator']);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await ensureWalletSchema();

    const [earnings, outstanding, payouts, history] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(p.amount), 0)::float8 AS total
         FROM payments p
         JOIN quotes q ON q.id = p.quote_id
         WHERE q.creator_id = $1 AND p.status = 'confirmed'`,
        [auth.user.userId]
      ),
      query(
        `SELECT COALESCE(SUM(p.amount), 0)::float8 AS total
         FROM payments p
         JOIN quotes q ON q.id = p.quote_id
         WHERE q.creator_id = $1 AND p.status = 'pending'`,
        [auth.user.userId]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::float8 AS total
         FROM wallet_payouts
         WHERE creator_id = $1 AND status = 'completed'`,
        [auth.user.userId]
      ),
      query(
        `
          SELECT * FROM (
            SELECT
              p.id,
              'earning'::text AS entry_type,
              'in'::text AS direction,
              p.amount::float8 AS amount,
              p.status::text AS status,
              p.method::text AS method,
              p.created_at,
              p.confirmed_at,
              o.title,
              NULL::text AS reference,
              NULL::text AS note
            FROM payments p
            JOIN quotes q ON q.id = p.quote_id
            LEFT JOIN offers o ON o.id = q.offer_id
            WHERE q.creator_id = $1

            UNION ALL

            SELECT
              wp.id,
              'payout'::text AS entry_type,
              'out'::text AS direction,
              wp.amount::float8 AS amount,
              wp.status,
              wp.method::text AS method,
              wp.created_at,
              wp.processed_at AS confirmed_at,
              'Payout'::text AS title,
              wp.reference,
              wp.note
            FROM wallet_payouts wp
            WHERE wp.creator_id = $1
          ) entries
          ORDER BY created_at DESC
          LIMIT 100
        `,
        [auth.user.userId]
      ),
    ]);

    const earned = Number(earnings.rows[0]?.total ?? 0);
    const sent = Number(payouts.rows[0]?.total ?? 0);
    const balance = earned - sent;

    return NextResponse.json({
      sent,
      outstanding: Number(outstanding.rows[0]?.total ?? 0),
      earned,
      balance,
      history: history.rows,
    });
  } catch (error) {
    console.error('Wallet GET Error:', error);
    return NextResponse.json({ error: 'Unable to load wallet' }, { status: 500 });
  }
}
