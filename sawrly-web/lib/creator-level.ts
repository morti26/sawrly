import { query } from '@/lib/db';
import { ensureContentReportsTable } from '@/lib/content-reports';
import { ensureMediaReportsTable } from '@/lib/media-reports';

export type CreatorLevelKey = 'basic' | 'top' | 'enterprise';

export type CreatorLevelSummary = {
    key: CreatorLevelKey;
    name: string;
    icon: string;
};

export type CreatorLevelMetrics = {
    completedProjects30d: number;
    followersCount: number;
    stories30d: number;
    reports30d: number;
    hasActiveSubscription: boolean;
};

export const LEVEL_RULES = {
    enterprise: {
        completedProjects30d: 10,
        followersCount: 200,
        stories30d: 8,
        reports30dMax: 1,
        requiresSubscription: true,
    },
    top: {
        completedProjects30d: 3,
        followersCount: 50,
        stories30d: 4,
        reports30dMax: 3,
    },
} as const;

function parseCount(value: any): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function isActiveSubscription(subscriptionPlan: any, subscriptionExpiresAt: any): boolean {
    const plan = typeof subscriptionPlan === 'string' ? subscriptionPlan.trim() : '';
    if (!plan) return false;
    if (!subscriptionExpiresAt) return false;
    const expiresAt = new Date(subscriptionExpiresAt);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now();
}

async function getCreatorLevelMetrics(input: {
    userId: string;
    followersCount: number;
    subscriptionPlan: any;
    subscriptionExpiresAt: any;
}): Promise<CreatorLevelMetrics> {
    const [completedProjectsRes, storiesRes] = await Promise.all([
        query(
            `
                SELECT COUNT(*) AS completed_projects_30d
                FROM projects
                WHERE creator_id = $1
                  AND status = 'completed'
                  AND COALESCE(completed_at, created_at) >= NOW() - INTERVAL '30 days'
            `,
            [input.userId]
        ),
        query(
            `
                SELECT COUNT(*) AS stories_30d
                FROM creator_status
                WHERE creator_id = $1
                  AND created_at >= NOW() - INTERVAL '30 days'
            `,
            [input.userId]
        ).catch(() => ({ rows: [{ stories_30d: 0 }] })),
    ]);

    const completedProjects30d = parseCount(completedProjectsRes.rows?.[0]?.completed_projects_30d);
    const stories30d = parseCount(storiesRes.rows?.[0]?.stories_30d);
    const hasActiveSubscription = isActiveSubscription(input.subscriptionPlan, input.subscriptionExpiresAt);

    let reports30d = Number.MAX_SAFE_INTEGER;
    try {
        await ensureContentReportsTable();
        await ensureMediaReportsTable();

        const [contentReportsRes, mediaReportsRes] = await Promise.all([
            query(
                `
                    SELECT COUNT(*) AS content_reports_30d
                    FROM content_reports
                    WHERE owner_user_id = $1
                      AND status <> 'rejected'
                      AND created_at >= NOW() - INTERVAL '30 days'
                `,
                [input.userId]
            ),
            query(
                `
                    SELECT COUNT(*) AS media_reports_30d
                    FROM media_reports mr
                    JOIN media_gallery mg ON mg.id = mr.media_id
                    WHERE mg.creator_id = $1
                      AND mr.status <> 'rejected'
                      AND mr.created_at >= NOW() - INTERVAL '30 days'
                `,
                [input.userId]
            ),
        ]);

        reports30d =
            parseCount(contentReportsRes.rows?.[0]?.content_reports_30d) +
            parseCount(mediaReportsRes.rows?.[0]?.media_reports_30d);
    } catch (error: any) {
        if (error?.code === '42501') {
            reports30d = Number.MAX_SAFE_INTEGER;
        } else {
            throw error;
        }
    }

    return {
        completedProjects30d,
        followersCount: input.followersCount,
        stories30d,
        reports30d,
        hasActiveSubscription,
    };
}

export function evaluateCreatorLevelKey(metrics: CreatorLevelMetrics): CreatorLevelKey {
    if (
        (!LEVEL_RULES.enterprise.requiresSubscription || metrics.hasActiveSubscription) &&
        metrics.completedProjects30d >= LEVEL_RULES.enterprise.completedProjects30d &&
        metrics.followersCount >= LEVEL_RULES.enterprise.followersCount &&
        metrics.stories30d >= LEVEL_RULES.enterprise.stories30d &&
        metrics.reports30d <= LEVEL_RULES.enterprise.reports30dMax
    ) {
        return 'enterprise';
    }

    if (
        metrics.completedProjects30d >= LEVEL_RULES.top.completedProjects30d &&
        metrics.followersCount >= LEVEL_RULES.top.followersCount &&
        metrics.stories30d >= LEVEL_RULES.top.stories30d &&
        metrics.reports30d <= LEVEL_RULES.top.reports30dMax
    ) {
        return 'top';
    }

    return 'basic';
}

export async function getCreatorLevelSummary(input: {
    userId: string;
    role: any;
    followersCount: number;
    subscriptionPlan: any;
    subscriptionExpiresAt: any;
}): Promise<CreatorLevelSummary | null> {
    const role = typeof input.role === 'string' ? input.role.toLowerCase() : input.role;
    if (role !== 'creator') return null;

    const metrics = await getCreatorLevelMetrics({
        userId: input.userId,
        followersCount: input.followersCount,
        subscriptionPlan: input.subscriptionPlan,
        subscriptionExpiresAt: input.subscriptionExpiresAt,
    });

    const key = evaluateCreatorLevelKey(metrics);
    if (key === 'enterprise') return { key, name: 'احترافي', icon: '🥇' };
    if (key === 'top') return { key, name: 'مميز', icon: '🥈' };
    return { key: 'basic', name: 'أساسي', icon: '🥉' };
}
