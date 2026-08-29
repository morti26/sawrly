import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureCreatorNotFrozen, getUserFromRequest } from '@/lib/auth';
import { ensureUserProfileSchema } from '@/lib/feature-schema';
import { getCreatorLevelSummary } from '@/lib/creator-level';
import { getSuperadminBadge } from '@/lib/superadmin-badge';

export async function GET(req: NextRequest) {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const frozen = await ensureCreatorNotFrozen(userPayload);
    if (frozen) {
        return NextResponse.json({
            error: frozen.error,
            frozenUntil: frozen.frozenUntil,
        }, { status: frozen.status });
    }

    await ensureUserProfileSchema();
    const res = await query(
        'SELECT id, name, email, role, phone, avatar_url, cover_image_url, bio, gender, country, city, subscription_plan, subscription_expires_at FROM users WHERE id = $1',
        [userPayload.userId]
    );
    if ((res.rowCount ?? 0) === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = res.rows[0];

    const statsResult = await query(
        `
            SELECT 
                (SELECT COUNT(*) FROM followers WHERE following_id = $1) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = $1) as following_count
        `,
        [userPayload.userId]
    );
    user.followers_count = parseInt(statsResult.rows[0].followers_count);
    user.following_count = parseInt(statsResult.rows[0].following_count);

    const level = await getCreatorLevelSummary({
        userId: userPayload.userId,
        role: user.role,
        followersCount: user.followers_count,
        subscriptionPlan: user.subscription_plan,
        subscriptionExpiresAt: user.subscription_expires_at,
    });
    user.creator_level_key = level?.key ?? null;
    user.creator_level_name = level?.name ?? null;
    user.creator_level_icon = level?.icon ?? null;

    const superadminBadge = await getSuperadminBadge({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    user.is_superadmin = superadminBadge.isSuperadmin;
    user.superadmin_badge_label = superadminBadge.label;
    user.superadmin_badge_icon_url = superadminBadge.iconUrl;

    return NextResponse.json(user);
}
