import { query } from '@/lib/db';

let reportsTableEnsured = false;

function isTableMissing(error: any): boolean {
    return error?.code === '42P01';
}

export async function ensureContentReportsTable() {
    if (reportsTableEnsured) return;

    try {
        await query('SELECT 1 FROM content_reports LIMIT 1');
        reportsTableEnsured = true;
        return;
    } catch (error: any) {
        if (!isTableMissing(error)) {
            throw error;
        }
    }

    await query(`
        CREATE TABLE IF NOT EXISTS content_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            target_type VARCHAR(20) NOT NULL
                CHECK (target_type IN ('offer', 'profile', 'story')),
            target_id UUID NOT NULL,
            reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            target_label TEXT,
            target_owner_name TEXT,
            target_media_url TEXT,
            target_media_type VARCHAR(20),
            reason VARCHAR(120) NOT NULL,
            details TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
            admin_note TEXT,
            handled_by UUID REFERENCES users(id),
            handled_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(target_type, target_id, reporter_id)
        )
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_content_reports_status
        ON content_reports(status)
    `);
    await query(`
        CREATE INDEX IF NOT EXISTS idx_content_reports_created_at
        ON content_reports(created_at DESC)
    `);
    await query(`
        CREATE INDEX IF NOT EXISTS idx_content_reports_target
        ON content_reports(target_type, target_id)
    `);

    reportsTableEnsured = true;
}
