import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { ensureContentReportsTable } from '@/lib/content-reports';
import { ensureMediaReportsTable } from '@/lib/media-reports';
import { evaluateCreatorLevelKey, LEVEL_RULES } from '@/lib/creator-level';

type CreatorRow = {
    id: string;
    name: string;
    email: string;
    subscription_plan: string | null;
    subscription_expires_at: string | null;
    followers_count: string;
    completed_projects_30d: string;
    stories_30d: string;
    content_reports_30d?: string | null;
    media_reports_30d?: string | null;
};

function toInt(value: any): number {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function isActiveSubscription(subscriptionPlan: any, subscriptionExpiresAt: any): boolean {
    const plan = typeof subscriptionPlan === 'string' ? subscriptionPlan.trim() : '';
    if (!plan) return false;
    if (!subscriptionExpiresAt) return false;
    const expiresAt = new Date(subscriptionExpiresAt);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now();
}

export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(toInt(searchParams.get('limit')), 1), 500) || 200;

    const baseSql = `
        WITH creators AS (
            SELECT id, name, email, subscription_plan, subscription_expires_at, created_at
            FROM users
            WHERE role = 'creator'
            ORDER BY created_at DESC
            LIMIT $1
        )
        SELECT
            c.id,
            c.name,
            c.email,
            c.subscription_plan,
            c.subscription_expires_at,
            (SELECT COUNT(*) FROM followers f WHERE f.following_id = c.id) AS followers_count,
            (SELECT COUNT(*) FROM projects p
                WHERE p.creator_id = c.id
                  AND p.status = 'completed'
                  AND COALESCE(p.completed_at, p.created_at) >= NOW() - INTERVAL '30 days'
            ) AS completed_projects_30d,
            (SELECT COUNT(*) FROM creator_status cs
                WHERE cs.creator_id = c.id
                  AND cs.created_at >= NOW() - INTERVAL '30 days'
            ) AS stories_30d
        FROM creators c
    `;

    let rows: CreatorRow[] = [];

    try {
        await ensureContentReportsTable();
        await ensureMediaReportsTable();

        const sqlWithReports = `
            ${baseSql},
            (SELECT COUNT(*) FROM content_reports cr
                WHERE cr.owner_user_id = c.id
                  AND cr.status <> 'rejected'
                  AND cr.created_at >= NOW() - INTERVAL '30 days'
            ) AS content_reports_30d,
            (SELECT COUNT(*) FROM media_reports mr
                JOIN media_gallery mg ON mg.id = mr.media_id
                WHERE mg.creator_id = c.id
                  AND mr.status <> 'rejected'
                  AND mr.created_at >= NOW() - INTERVAL '30 days'
            ) AS media_reports_30d
        `;

        const res = await query(sqlWithReports, [limit]);
        rows = res.rows as CreatorRow[];
    } catch (error: any) {
        if (error?.code !== '42501' && error?.code !== '42P01') {
            console.error('Admin levels fetch error:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const res = await query(baseSql, [limit]);
        rows = res.rows as CreatorRow[];
    }

    const creators = rows.map((row) => {
        const followersCount = toInt(row.followers_count);
        const completedProjects30d = toInt(row.completed_projects_30d);
        const stories30d = toInt(row.stories_30d);
        const contentReports30d = row.content_reports_30d == null ? null : toInt(row.content_reports_30d);
        const mediaReports30d = row.media_reports_30d == null ? null : toInt(row.media_reports_30d);

        const reports30d =
            contentReports30d == null || mediaReports30d == null
                ? Number.MAX_SAFE_INTEGER
                : contentReports30d + mediaReports30d;

        const hasActiveSubscription = isActiveSubscription(
            row.subscription_plan,
            row.subscription_expires_at
        );

        const key = evaluateCreatorLevelKey({
            completedProjects30d,
            followersCount,
            stories30d,
            reports30d,
            hasActiveSubscription,
        });

        const name = key === 'enterprise' ? 'احترافي' : key === 'top' ? 'مميز' : 'أساسي';
        const icon = key === 'enterprise' ? '🥇' : key === 'top' ? '🥈' : '🥉';

        return {
            id: row.id,
            name: row.name,
            email: row.email,
            followers_count: followersCount,
            completed_projects_30d: completedProjects30d,
            stories_30d: stories30d,
            reports_30d: reports30d === Number.MAX_SAFE_INTEGER ? null : reports30d,
            has_active_subscription: hasActiveSubscription,
            creator_level_key: key,
            creator_level_name: name,
            creator_level_icon: icon,
        };
    });

    return NextResponse.json({
        window: '30d',
        rules: LEVEL_RULES,
        creators,
    });
}
