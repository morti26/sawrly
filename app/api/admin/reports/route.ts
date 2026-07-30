import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { ensureContentReportsTable } from '@/lib/content-reports';
import { ensureMediaReportsTable } from '@/lib/media-reports';

const ALLOWED_STATUSES = ['pending', 'in_review', 'resolved', 'rejected'] as const;
type ReportStatus = (typeof ALLOWED_STATUSES)[number];

export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await ensureMediaReportsTable();
        await ensureContentReportsTable();

        const status = req.nextUrl.searchParams.get('status')?.trim() || '';
        const onlyOpen = req.nextUrl.searchParams.get('onlyOpen') === '1';

        const params: any[] = [];
        const filters: string[] = [];

        if (status && ALLOWED_STATUSES.includes(status as ReportStatus)) {
            params.push(status);
            filters.push(`mr.status = $${params.length}`);
        }
        if (onlyOpen) {
            filters.push(`mr.status IN ('pending', 'in_review')`);
        }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const contentWhere = filters.length
            ? `WHERE ${filters.map((filter) => filter.replaceAll('mr.', 'cr.')).join(' AND ')}`
            : '';

        const res = await query(
            `
                SELECT *
                FROM (
                    SELECT
                        'media'::text AS report_scope,
                        'media'::text AS target_type,
                        mr.id,
                        mr.media_id,
                        mr.reason,
                        mr.details,
                        mr.status,
                        mr.admin_note,
                        mr.handled_at,
                        mr.created_at,
                        mr.updated_at,
                        mg.url AS media_url,
                        mg.type::text AS media_type,
                        mg.caption AS target_label,
                        mg.creator_id AS creator_id,
                        creator.name AS creator_name,
                        reporter.name AS reporter_name,
                        reporter.role AS reporter_role,
                        handler.name AS handled_by_name
                    FROM media_reports mr
                    LEFT JOIN media_gallery mg ON mg.id = mr.media_id
                    LEFT JOIN users creator ON creator.id = mg.creator_id
                    JOIN users reporter ON reporter.id = mr.reporter_id
                    LEFT JOIN users handler ON handler.id = mr.handled_by
                    ${where}

                    UNION ALL

                    SELECT
                        'content'::text AS report_scope,
                        cr.target_type,
                        cr.id,
                        NULL::uuid AS media_id,
                        cr.reason,
                        cr.details,
                        cr.status,
                        cr.admin_note,
                        cr.handled_at,
                        cr.created_at,
                        cr.updated_at,
                        cr.target_media_url AS media_url,
                        cr.target_media_type::text AS media_type,
                        cr.target_label,
                        cr.owner_user_id AS creator_id,
                        cr.target_owner_name AS creator_name,
                        reporter.name AS reporter_name,
                        reporter.role AS reporter_role,
                        handler.name AS handled_by_name
                    FROM content_reports cr
                    JOIN users reporter ON reporter.id = cr.reporter_id
                    LEFT JOIN users handler ON handler.id = cr.handled_by
                    ${contentWhere}
                ) reports
                ORDER BY
                    CASE
                        WHEN reports.status = 'pending' THEN 1
                        WHEN reports.status = 'in_review' THEN 2
                        WHEN reports.status = 'resolved' THEN 3
                        WHEN reports.status = 'rejected' THEN 4
                        ELSE 5
                    END,
                    reports.created_at DESC
            `,
            params
        );

        return NextResponse.json(res.rows);
    } catch (e) {
        console.error('Admin Get Reports Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await ensureMediaReportsTable();
        await ensureContentReportsTable();

        const body = await req.json();
        const id = (body?.id || '').toString().trim();
        const scope = (body?.scope || 'media').toString().trim();
        const status = (body?.status || '').toString().trim() as ReportStatus;
        const adminNote = (body?.adminNote || '').toString().trim();
        const removeMedia = body?.removeMedia === true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!id) {
            return NextResponse.json({ error: 'Report id is required' }, { status: 400 });
        }
        if (!uuidRegex.test(id)) {
            return NextResponse.json({ error: 'Invalid report id format' }, { status: 400 });
        }
        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (!['media', 'content'].includes(scope)) {
            return NextResponse.json({ error: 'Invalid report scope' }, { status: 400 });
        }

        const existingRes = await query(
            scope === 'content'
                ? `SELECT id, target_type, target_id, target_media_url FROM content_reports WHERE id = $1::uuid`
                : `SELECT id, media_id FROM media_reports WHERE id = $1::uuid`,
            [id]
        );
        if (existingRes.rowCount === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        if (scope === 'media' && removeMedia && existingRes.rows[0].media_id) {
            await query(`DELETE FROM media_gallery WHERE id = $1::uuid`, [existingRes.rows[0].media_id]);
        }

        if (scope === 'content' && removeMedia) {
            const report = existingRes.rows[0];
            if (report.target_type === 'story') {
                await query(`DELETE FROM creator_status WHERE id = $1::uuid`, [report.target_id]);
            }
        }

        const res = await query(
            scope === 'content'
                ? `
                    UPDATE content_reports
                    SET
                        status = $1,
                        admin_note = $2,
                        handled_by = $3::uuid,
                        handled_at = NOW(),
                        updated_at = NOW()
                    WHERE id = $4::uuid
                    RETURNING id, status, admin_note, handled_at, updated_at
                `
                : `
                    UPDATE media_reports
                    SET
                        status = $1,
                        admin_note = $2,
                        handled_by = $3::uuid,
                        handled_at = NOW(),
                        updated_at = NOW()
                    WHERE id = $4::uuid
                    RETURNING id, status, admin_note, handled_at, updated_at
                `,
            [status, adminNote || null, auth.user.userId, id]
        );

        return NextResponse.json({ success: true, report: res.rows[0] });
    } catch (e) {
        console.error('Admin Update Report Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
