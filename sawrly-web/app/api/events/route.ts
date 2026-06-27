import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireActiveCreator } from '@/lib/auth';
import { saveFile } from '@/lib/upload';

export const runtime = 'nodejs';

async function ensureEventSchema() {
    await query(`
        ALTER TABLE events
        ADD COLUMN IF NOT EXISTS calendar_status VARCHAR(20) NOT NULL DEFAULT 'event'
            CHECK (calendar_status IN ('event', 'booked', 'busy'))
    `);
    await query(`
        ALTER TABLE events
        ADD COLUMN IF NOT EXISTS notes TEXT
    `);
    await query(`
        ALTER TABLE events
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
}

function normalizeCalendarStatus(value: unknown): 'event' | 'booked' | 'busy' {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'booked' || normalized === 'busy') return normalized;
    return 'event';
}

function defaultTitleForStatus(status: 'event' | 'booked' | 'busy') {
    if (status === 'booked') return 'محجوز';
    if (status === 'busy') return 'مشغول';
    return 'فعالية';
}

// GET /api/events?creatorId=...
export async function GET(req: NextRequest) {
    await ensureEventSchema();
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');

    let sql = `
        SELECT id, creator_id, title, date_time, calendar_status, location, notes, cover_image_url, created_at, updated_at
        FROM events
        WHERE 1=1
    `;
    const params: any[] = [];

    if (creatorId) {
        sql += " AND creator_id = $1";
        params.push(creatorId);
    }

    sql += " ORDER BY date_time ASC";

    try {
        const res = await query(sql, params);
        return NextResponse.json(res.rows);
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/events
export async function POST(req: NextRequest) {
    await ensureEventSchema();
    const auth = await requireActiveCreator(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const methodOverride = searchParams.get('_method')?.toUpperCase();

    // 1. Get ID from URL first (most reliable on IIS)
    let id = searchParams.get('id');

    try {
        // FALLBACK DELETE via POST - Handle early to avoid body issues
        if (methodOverride === 'DELETE') {
            if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
            const res = await query(`
                DELETE FROM events 
                WHERE id = $1::uuid AND creator_id = $2::uuid
                RETURNING id
            `, [id, auth.user!.userId]);

            if (res.rows.length === 0) {
                return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        // Handle body for other methods (Update/Create)
        let contentType = req.headers.get('content-type') || '';
        let body: any = {};
        if (contentType.includes('application/json')) {
            const text = await req.text();
            if (text && text.trim().length > 0) {
                body = JSON.parse(text);
                if (!id) id = body.id;
            }
        }

        // FALLBACK UPDATE via POST (JSON)
        if (id || methodOverride === 'PATCH') {
            if (contentType.includes('application/json')) {
                const { title, dateTime, location, notes, coverImageUrl } = body;
                const calendarStatus = normalizeCalendarStatus(body.calendarStatus);
                const resolvedTitle = typeof title === 'string' && title.trim().length > 0
                    ? title.trim()
                    : defaultTitleForStatus(calendarStatus);
                const res = await query(`
                    UPDATE events 
                    SET title = COALESCE($1, title),
                        date_time = COALESCE($2, date_time),
                        calendar_status = COALESCE($3, calendar_status),
                        location = COALESCE($4, location),
                        notes = COALESCE($5, notes),
                        cover_image_url = COALESCE($6, cover_image_url),
                        updated_at = NOW()
                    WHERE id = $7::uuid AND creator_id = $8::uuid
                    RETURNING id
                `, [resolvedTitle, dateTime, calendarStatus, location, notes, coverImageUrl, id, auth.user!.userId]);

                if (res.rows.length === 0) {
                    return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
                }
                return NextResponse.json({ success: true });
            }
        }

        if (contentType.includes('application/json')) {
            const { title, dateTime, location, notes, coverImageUrl } = body;
            const calendarStatus = normalizeCalendarStatus(body.calendarStatus);
            const resolvedTitle = typeof title === 'string' && title.trim().length > 0
                ? title.trim()
                : defaultTitleForStatus(calendarStatus);
            if (!resolvedTitle || !dateTime) {
                return NextResponse.json({ error: 'Title and dateTime are required' }, { status: 400 });
            }
            const res = await query(`
                INSERT INTO events (creator_id, title, date_time, calendar_status, location, notes, cover_image_url)
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
                RETURNING id, title, calendar_status
            `, [auth.user!.userId, resolvedTitle, dateTime, calendarStatus, location ?? null, notes ?? null, coverImageUrl ?? null]);

            return NextResponse.json(res.rows[0], { status: 201 });
        }

        // ORIGINAL CREATE (Multipart)
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const dateTime = formData.get('dateTime') as string; // ISO string
        const location = formData.get('location') as string;
        const notes = formData.get('notes') as string;
        const calendarStatus = normalizeCalendarStatus(formData.get('calendarStatus'));
        const coverImage = formData.get('coverImage') as File;
        const resolvedTitle = title?.trim() ? title.trim() : defaultTitleForStatus(calendarStatus);

        let coverImageUrl = null;
        if (coverImage) {
            const isImage = coverImage.type.startsWith('image/');
            const isVideo = coverImage.type.startsWith('video/');
            if (!isImage && !isVideo) {
                return NextResponse.json({ error: 'Cover file must be an image or video' }, { status: 400 });
            }
            coverImageUrl = await saveFile(coverImage, 'events');
        }

        // Insert into DB
        const res = await query(`
            INSERT INTO events (creator_id, title, date_time, calendar_status, location, notes, cover_image_url)
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, calendar_status
        `, [auth.user!.userId, resolvedTitle, dateTime, calendarStatus, location || null, notes || null, coverImageUrl]);

        return NextResponse.json(res.rows[0], { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/events - Update Event
export async function PATCH(req: NextRequest) {
    await ensureEventSchema();
    const auth = await requireActiveCreator(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id, title, dateTime, location, notes, coverImageUrl, calendarStatus: rawStatus } = await req.json();
    const calendarStatus = normalizeCalendarStatus(rawStatus);
    const resolvedTitle = typeof title === 'string' && title.trim().length > 0
        ? title.trim()
        : defaultTitleForStatus(calendarStatus);

    if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });

    try {
        const res = await query(`
            UPDATE events 
            SET title = COALESCE($1, title),
                date_time = COALESCE($2, date_time),
                calendar_status = COALESCE($3, calendar_status),
                location = COALESCE($4, location),
                notes = COALESCE($5, notes),
                cover_image_url = COALESCE($6, cover_image_url),
                updated_at = NOW()
            WHERE id = $7::uuid AND creator_id = $8::uuid
            RETURNING id
        `, [resolvedTitle, dateTime, calendarStatus, location, notes, coverImageUrl, id, auth.user!.userId]);

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/events - Delete Event
export async function DELETE(req: NextRequest) {
    await ensureEventSchema();
    const auth = await requireActiveCreator(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });

    try {
        const res = await query(`
            DELETE FROM events 
            WHERE id = $1::uuid AND creator_id = $2::uuid
            RETURNING id
        `, [id, auth.user!.userId]);

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
