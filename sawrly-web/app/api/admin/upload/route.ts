import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/upload';
import { requireRole, ADMIN_PANEL_ROLES } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (!auth.user || auth.error) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', debug: auth.debug ?? null },
            { status: auth.status ?? 401 }
        );
    }
    try {
        const { searchParams } = new URL(req.url);
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const rawSubDir = (formData.get('subDir') ?? searchParams.get('subDir')) as unknown;
        const subDir = typeof rawSubDir === 'string' ? rawSubDir.trim() : '';
        const allowedSubDirs = new Set(['tasks', 'banners', 'badges', 'levels', 'photos']);

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (subDir && !allowedSubDirs.has(subDir)) {
            return NextResponse.json({ error: 'Invalid upload destination' }, { status: 400 });
        }

        const url = await saveFile(file, subDir || 'tasks');

        return NextResponse.json({ url });
    } catch (e) {
        const message = e instanceof Error ? e.message : '';
        if (
            message === 'No file provided' ||
            message === 'Uploaded file is empty' ||
            message === 'File size exceeds 150 MB limit' ||
            message === 'Unsupported file type'
        ) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        console.error('[Admin Upload Error]:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
