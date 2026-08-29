import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
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

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const documentType = typeof body?.documentType === 'string'
      ? body.documentType.trim()
      : '';
    const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '';

    if (!['identity_document', 'address_proof', 'selfie'].includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    if (!fileUrl.startsWith('/uploads/identity-verification/')) {
      return NextResponse.json({ error: 'Invalid verification file' }, { status: 400 });
    }

    await query(SETUP_SQL);
    const result = await query(
      `INSERT INTO identity_verifications (user_id, document_type, file_url)
       VALUES ($1, $2, $3)
       RETURNING id, document_type, status, created_at`,
      [user.userId, documentType, fileUrl],
    );

    return NextResponse.json({ success: true, submission: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Identity verification submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
