import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');

    try {
        const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
        const apks = entries
            .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.apk'))
            .map(entry => entry.name);

        if (apks.length === 0) {
            return NextResponse.json({ error: 'No APK available' }, { status: 404 });
        }

        const stats = await Promise.all(
            apks.map(async name => {
                const stat = await fs.stat(path.join(downloadsDir, name));
                return { name, mtimeMs: stat.mtimeMs };
            }),
        );

        stats.sort((a, b) => b.mtimeMs - a.mtimeMs);
        const latest = stats[0]?.name;

        if (!latest) {
            return NextResponse.json({ error: 'No APK available' }, { status: 404 });
        }

        const url = new URL(`/downloads/${encodeURIComponent(latest)}`, 'https://sawrly.com');
        return NextResponse.redirect(url, 302);
    } catch {
        return NextResponse.json({ error: 'No APK available' }, { status: 404 });
    }
}

