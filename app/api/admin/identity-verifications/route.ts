import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SETUP_SQL = `
  CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('identity_document', 'address_proof', 'selfie')),
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS identity_verifications_user_idx
    ON identity_verifications (user_id, created_at DESC);
`;

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ADMIN_PANEL_ROLES);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status ?? 401 });
  }

  try {
    await query(SETUP_SQL);
    const result = await query(
      `SELECT iv.id, iv.user_id, iv.document_type, iv.file_url, iv.status, iv.created_at,
              u.name, u.email, u.phone
       FROM identity_verifications iv
       JOIN users u ON u.id = iv.user_id
       ORDER BY iv.created_at DESC`,
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Admin identity verification fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
