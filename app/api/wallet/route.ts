import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const totals = await query(`
    SELECT
      COALESCE(SUM(CASE WHEN p.status='confirmed' THEN p.amount ELSE 0 END),0) AS earned,
      COALESCE(SUM(CASE WHEN p.status='pending' THEN p.amount ELSE 0 END),0) AS outstanding,
      COALESCE(SUM(CASE WHEN p.status='confirmed' THEN p.amount ELSE 0 END),0) AS balance
    FROM payments p JOIN quotes q ON q.id=p.quote_id WHERE q.creator_id=$1`, [user.userId]);
  const history = await query(`
    SELECT p.id, p.amount, p.status, p.method, p.created_at, p.confirmed_at, o.title
    FROM payments p JOIN quotes q ON q.id=p.quote_id JOIN offers o ON o.id=q.offer_id
    WHERE q.creator_id=$1 ORDER BY p.created_at DESC LIMIT 100`, [user.userId]);
  const t = totals.rows[0] ?? {};
  return NextResponse.json({
    sent: 0,
    outstanding: Number(t.outstanding ?? 0),
    earned: Number(t.earned ?? 0),
    balance: Number(t.balance ?? 0),
    history: history.rows,
  });
}
