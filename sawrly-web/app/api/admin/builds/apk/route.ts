import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { requireSuperAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

type ApkStatusResponse = {
    latestFile: string | null;
    latestNumber: number | null;
    latestUrl: string | null;
    nextFile: string;
    nextNumber: number;
};

function getPublicOrigin(req: NextRequest): string {
    const forwardedProto = req.headers.get('x-forwarded-proto')?.trim();
    const forwardedHost = req.headers.get('x-forwarded-host')?.trim();
    const host = forwardedHost || req.headers.get('host') || req.nextUrl.host;
    const proto = forwardedProto || (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
}

function getDownloadsDir(): string {
    return path.join(process.cwd(), 'public', 'downloads');
}

function getApkNumber(fileName: string): number | null {
    const match = /^sawrly-(\d+)\.apk$/i.exec(fileName);
    if (!match) return null;
    const value = Number.parseInt(match[1], 10);
    if (!Number.isFinite(value)) return null;
    return value;
}

function getNextApkFileName(files: string[]): { fileName: string; number: number } {
    let max = 0;
    for (const file of files) {
        const value = getApkNumber(file);
        if (value == null) continue;
        max = Math.max(max, value);
    }
    const next = max + 1;
    const padded = String(next).padStart(2, '0');
    return { fileName: `sawrly-${padded}.apk`, number: next };
}

async function readApkStatus(origin: string): Promise<ApkStatusResponse> {
    const downloadsDir = getDownloadsDir();
    await fs.promises.mkdir(downloadsDir, { recursive: true });

    const entries = await fs.promises.readdir(downloadsDir, { withFileTypes: true });
    const files = entries
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.apk'))
        .map(entry => entry.name);

    let latestNumber = -1;
    let latestFile: string | null = null;
    for (const name of files) {
        const n = getApkNumber(name);
        if (n == null) continue;
        if (n > latestNumber) {
            latestNumber = n;
            latestFile = name;
        }
    }

    const next = getNextApkFileName(files);
    const latestUrl = latestFile ? `${origin}/downloads/${encodeURIComponent(latestFile)}` : null;

    return {
        latestFile,
        latestNumber: latestFile ? latestNumber : null,
        latestUrl,
        nextFile: next.fileName,
        nextNumber: next.number,
    };
}

export async function GET(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const origin = getPublicOrigin(req);
    const status = await readApkStatus(origin);
    return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const origin = getPublicOrigin(req);
    const downloadsDir = getDownloadsDir();
    await fs.promises.mkdir(downloadsDir, { recursive: true });

    const entries = await fs.promises.readdir(downloadsDir, { withFileTypes: true });
    const files = entries
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.apk'))
        .map(entry => entry.name);

    const next = getNextApkFileName(files);
    const destinationPath = path.join(downloadsDir, next.fileName);

    if (!req.body) {
        return NextResponse.json({ error: 'Missing file body' }, { status: 400 });
    }

    const incoming = Readable.fromWeb(req.body as any);
    await pipeline(incoming, fs.createWriteStream(destinationPath));

    const status: ApkStatusResponse = {
        latestFile: next.fileName,
        latestNumber: next.number,
        latestUrl: `${origin}/downloads/${encodeURIComponent(next.fileName)}`,
        nextFile: `sawrly-${String(next.number + 1).padStart(2, '0')}.apk`,
        nextNumber: next.number + 1,
    };

    return NextResponse.json(status);
}
