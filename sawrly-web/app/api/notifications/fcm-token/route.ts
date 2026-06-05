import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

/**
 * POST /api/notifications/fcm-token
 * Flutter app calls this to register its FCM device token
 */
export async function POST(req: NextRequest) {
    const auth = requireRole(req, ['client', 'creator', 'admin', 'moderator']);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = (await req.json().catch(() => null)) as {
        deviceToken?: unknown;
    } | null;

    const deviceToken = typeof body?.deviceToken === 'string' ? body.deviceToken.trim() : '';
    if (!deviceToken) {
        return NextResponse.json({ error: 'Device token is required' }, { status: 400 });
    }

    try {
        // Ensure the table exists
        await query(`
            CREATE TABLE IF NOT EXISTS fcm_device_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                device_token TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, device_token)
            )
        `);

        // Upsert: Insert or update if already exists
        await query(
            `
            INSERT INTO fcm_device_tokens (user_id, device_token, last_used_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT(user_id, device_token) DO UPDATE
            SET last_used_at = NOW()
            `,
            [auth.user.userId, deviceToken]
        );

        return NextResponse.json({ success: true, message: 'FCM token registered' }, { status: 200 });
    } catch (error) {
        console.error('Error registering FCM token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/notifications/fcm-token
 * Flutter app calls this to unregister its device token on logout
 */
export async function DELETE(req: NextRequest) {
    const auth = requireRole(req, ['client', 'creator', 'admin', 'moderator']);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = (await req.json().catch(() => null)) as {
        deviceToken?: unknown;
    } | null;

    const deviceToken = typeof body?.deviceToken === 'string' ? body.deviceToken.trim() : '';
    if (!deviceToken) {
        return NextResponse.json({ error: 'Device token is required' }, { status: 400 });
    }

    try {
        await query(
            `
            DELETE FROM fcm_device_tokens
            WHERE user_id = $1 AND device_token = $2
            `,
            [auth.user.userId, deviceToken]
        );

        return NextResponse.json({ success: true, message: 'FCM token unregistered' }, { status: 200 });
    } catch (error) {
        console.error('Error unregistering FCM token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
