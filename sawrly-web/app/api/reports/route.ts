import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ensureContentReportsTable } from '@/lib/content-reports';

type TargetType = 'offer' | 'profile' | 'story';

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function loadTargetMetadata(targetType: TargetType, targetId: string) {
    if (targetType === 'offer') {
        const res = await query(
            `
                SELECT
                    o.id,
                    o.creator_id AS owner_user_id,
                    o.title AS target_label,
                    u.name AS target_owner_name,
                    o.image_url AS target_media_url,
                    'image'::text AS target_media_type
                FROM offers o
                JOIN users u ON u.id = o.creator_id
                WHERE o.id = $1::uuid
                LIMIT 1
            `,
            [targetId]
        );
        return res.rows[0] ?? null;
    }

    if (targetType === 'profile') {
        const res = await query(
            `
                SELECT
                    u.id,
                    u.id AS owner_user_id,
                    u.name AS target_label,
                    u.name AS target_owner_name,
                    u.avatar_url AS target_media_url,
                    CASE
                        WHEN COALESCE(u.avatar_url, '') <> '' THEN 'image'
                        ELSE NULL
                    END AS target_media_type
                FROM users u
                WHERE u.id = $1::uuid
                LIMIT 1
            `,
            [targetId]
        );
        return res.rows[0] ?? null;
    }

    const res = await query(
        `
            SELECT
                cs.id,
                cs.creator_id AS owner_user_id,
                NULLIF(TRIM(cs.caption), '') AS target_label,
                u.name AS target_owner_name,
                cs.media_url AS target_media_url,
                cs.media_type AS target_media_type
            FROM creator_status cs
            JOIN users u ON u.id = cs.creator_id
            WHERE cs.id = $1::uuid
            LIMIT 1
        `,
        [targetId]
    );
    return res.rows[0] ?? null;
}

export async function POST(req: NextRequest) {
    const auth = requireRole(req, ['client', 'creator', 'admin']);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await ensureContentReportsTable();

        const body = await req.json();
        const targetType = (body?.targetType || '').toString().trim() as TargetType;
        const targetId = (body?.targetId || '').toString().trim();
        const reason = (body?.reason || '').toString().trim();
        const details = (body?.details || '').toString().trim();

        if (!['offer', 'profile', 'story'].includes(targetType)) {
            return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
        }
        if (!targetId) {
            return NextResponse.json({ error: 'targetId is required' }, { status: 400 });
        }
        if (!isUuid(targetId)) {
            return NextResponse.json({ error: 'Invalid targetId format' }, { status: 400 });
        }
        if (!reason) {
            return NextResponse.json({ error: 'reason is required' }, { status: 400 });
        }

        const target = await loadTargetMetadata(targetType, targetId);
        if (!target) {
            return NextResponse.json({ error: 'Target not found' }, { status: 404 });
        }
        if (target.owner_user_id === auth.user.userId) {
            return NextResponse.json({ error: 'You cannot report your own content' }, { status: 400 });
        }

        const upsert = await query(
            `
                INSERT INTO content_reports (
                    target_type,
                    target_id,
                    reporter_id,
                    owner_user_id,
                    target_label,
                    target_owner_name,
                    target_media_url,
                    target_media_type,
                    reason,
                    details,
                    status,
                    updated_at
                )
                VALUES (
                    $1,
                    $2::uuid,
                    $3::uuid,
                    $4::uuid,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    'pending',
                    NOW()
                )
                ON CONFLICT (target_type, target_id, reporter_id)
                DO UPDATE SET
                    owner_user_id = EXCLUDED.owner_user_id,
                    target_label = EXCLUDED.target_label,
                    target_owner_name = EXCLUDED.target_owner_name,
                    target_media_url = EXCLUDED.target_media_url,
                    target_media_type = EXCLUDED.target_media_type,
                    reason = EXCLUDED.reason,
                    details = EXCLUDED.details,
                    status = 'pending',
                    updated_at = NOW(),
                    admin_note = NULL,
                    handled_by = NULL,
                    handled_at = NULL
                RETURNING id, status, created_at, updated_at
            `,
            [
                targetType,
                targetId,
                auth.user.userId,
                target.owner_user_id,
                target.target_label || null,
                target.target_owner_name || null,
                target.target_media_url || null,
                target.target_media_type || null,
                reason,
                details || null,
            ]
        );

        return NextResponse.json({
            success: true,
            report: upsert.rows[0],
        });
    } catch (e) {
        console.error('Create Content Report Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
