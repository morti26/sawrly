import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getDownloadsDir(): string {
    return path.join(process.cwd(), 'public', 'downloads');
}

function contentTypeForFile(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.apk')) return 'application/vnd.android.package-archive';
    return 'application/octet-stream';
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params;
    const safeName = path.basename(file);
    if (!safeName || safeName !== file) {
        return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const filePath = path.join(getDownloadsDir(), safeName);
    try {
        const stat = await fsPromises.stat(filePath);
        if (!stat.isFile()) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const stream = fs.createReadStream(filePath);
        return new Response(Readable.toWeb(stream) as any, {
            status: 200,
            headers: {
                'Content-Type': contentTypeForFile(safeName),
                'Content-Length': String(stat.size),
                'Content-Disposition': `attachment; filename="${safeName}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}

