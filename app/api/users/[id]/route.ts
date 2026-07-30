import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-middleware-helper';
import { ensureUserProfileSchema } from '@/lib/feature-schema';
import { getCreatorLevelSummary } from '@/lib/creator-level';
import { getSuperadminBadge } from '@/lib/superadmin-badge';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;
        await ensureUserProfileSchema();

        // Fetch basic user details
        const userQuery = `
            SELECT id, name, email, role, phone, avatar_url, cover_image_url, bio, gender, country, city, subscription_plan, subscription_expires_at, created_at 
            FROM users 
            WHERE id = $1
        `;
        const userResult = await query(userQuery, [targetUserId]);

        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Fetch Follow Stats
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM followers WHERE following_id = $1) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = $1) as following_count
        `;
        const statsResult = await query(statsQuery, [targetUserId]);

        user.followers_count = parseInt(statsResult.rows[0].followers_count);
        user.following_count = parseInt(statsResult.rows[0].following_count);
        user.is_following = false; // Default

        // Determine request auth state to check if the current user is following them
        const currentUserId = await getUserIdFromRequest(req);
        if (currentUserId) {
            const checkFollowQuery = `
                SELECT id FROM followers 
                WHERE follower_id = $1 AND following_id = $2
            `;
            const checkResult = await query(checkFollowQuery, [currentUserId, targetUserId]);
            user.is_following = (checkResult.rowCount ?? 0) > 0;
        }

        const level = await getCreatorLevelSummary({
            userId: targetUserId,
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

    } catch (error) {
        console.error('Fetch User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
