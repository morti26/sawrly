import { NextRequest, NextResponse } from 'next/server';
import { probeVideoDurationSeconds, saveFile } from '@/lib/upload';
import { ensureCreatorNotFrozen, getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';
const MAX_VIDEO_DURATION_SECONDS = 60;

export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const frozen = await ensureCreatorNotFrozen(user);
    if (frozen) {
        return NextResponse.json({
            error: frozen.error,
            frozenUntil: frozen.frozenUntil,
        }, { status: frozen.status });
    }

    try {
        const { searchParams } = new URL(req.url);
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const rawSubDir = (formData.get('subDir') ?? searchParams.get('subDir')) as unknown;
        const subDir = typeof rawSubDir === 'string' ? rawSubDir.trim() : '';
        const allowedSubDirs = new Set(['status', 'offers', 'photos', 'videos', 'events', 'banners', 'badges', 'identity-verification']);

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (subDir && !allowedSubDirs.has(subDir)) {
            return NextResponse.json({ error: 'Invalid upload destination' }, { status: 400 });
        }

        const normalizedType = (file.type || '').toLowerCase();
        const normalizedName = (file.name || '').toLowerCase();
        const isVideo =
            normalizedType.startsWith('video/') ||
            ['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi', '.3gp']
                .some((extension) => normalizedName.endsWith(extension));

        if (isVideo) {
            const durationSeconds = await probeVideoDurationSeconds(file);
            if (durationSeconds > MAX_VIDEO_DURATION_SECONDS + 0.25) {
                return NextResponse.json(
                    { error: 'Each video must be no longer than one minute.' },
                    { status: 400 },
                );
            }
        }

        const url = await saveFile(file, subDir || 'status');

        return NextResponse.json({ url });
    } catch (e) {
        const message = e instanceof Error ? e.message : '';
        if (
            message === 'No file provided' ||
            message === 'Uploaded file is empty' ||
            message === 'File size exceeds 150 MB limit' ||
            message === 'Unsupported file type' ||
            message === 'Unable to verify video duration'
        ) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        console.error('Upload Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
