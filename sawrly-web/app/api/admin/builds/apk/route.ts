import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { requireSuperAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

type ApkBuildState = 'idle' | 'running' | 'done' | 'error';

type ApkBuildStatus = {
    state: ApkBuildState;
    jobId?: string;
    startedAt?: string;
    finishedAt?: string;
    log?: string;
    apkFile?: string;
    apkUrl?: string;
    error?: string;
};

const statusPath = path.join(os.tmpdir(), 'sawrly-apk-build-status.json');
const lockPath = path.join(os.tmpdir(), 'sawrly-apk-build.lock');

function readStatus(): ApkBuildStatus {
    try {
        if (!fs.existsSync(statusPath)) return { state: 'idle' };
        const raw = fs.readFileSync(statusPath, 'utf8');
        if (!raw.trim()) return { state: 'idle' };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { state: 'idle' };
        const state = (parsed as any).state;
        if (state !== 'idle' && state !== 'running' && state !== 'done' && state !== 'error') {
            return { state: 'idle' };
        }
        return parsed as ApkBuildStatus;
    } catch {
        return { state: 'idle' };
    }
}

function writeStatus(update: Partial<ApkBuildStatus>): ApkBuildStatus {
    const current = readStatus();
    const next: ApkBuildStatus = { ...current, ...update } as ApkBuildStatus;
    fs.writeFileSync(statusPath, JSON.stringify(next, null, 2), 'utf8');
    return next;
}

function appendLog(chunk: string) {
    const current = readStatus();
    const existing = current.log || '';
    const next = (existing + chunk).slice(-20000);
    writeStatus({ log: next });
}

function resolveCandidateDir(candidates: string[]): string | null {
    for (const candidate of candidates) {
        try {
            if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
                return candidate;
            }
        } catch {}
    }
    return null;
}

function resolveMobileDir(): string | null {
    const configured = process.env.APK_BUILD_MOBILE_PATH?.trim();
    const cwd = process.cwd();
    return resolveCandidateDir([
        configured || '',
        path.resolve(cwd, 'sawrly-mobile'),
        path.resolve(cwd, '..', 'sawrly-mobile'),
    ]);
}

function resolveDownloadsDir(): string | null {
    const configured = process.env.APK_BUILD_DOWNLOADS_PATH?.trim();
    const cwd = process.cwd();
    return resolveCandidateDir([
        configured || '',
        path.resolve(cwd, 'public', 'downloads'),
        path.resolve(cwd, '..', 'sawrly-web', 'public', 'downloads'),
    ]);
}

function getNextApkFileName(downloadsDir: string): string {
    let max = 0;
    try {
        const files = fs.readdirSync(downloadsDir);
        for (const file of files) {
            const match = /^sawrly-(\d+)\.apk$/i.exec(file);
            if (!match) continue;
            const value = Number.parseInt(match[1], 10);
            if (!Number.isFinite(value)) continue;
            max = Math.max(max, value);
        }
    } catch {}
    const next = max + 1;
    const padded = String(next).padStart(2, '0');
    return `sawrly-${padded}.apk`;
}

async function safeMkdir(dir: string) {
    await fs.promises.mkdir(dir, { recursive: true });
}

export async function GET(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const status = readStatus();
    return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
    const auth = requireSuperAdmin(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const current = readStatus();
    if (current.state === 'running' && fs.existsSync(lockPath)) {
        return NextResponse.json({ error: 'Build already running', status: current }, { status: 409 });
    }

    const mobileDir = resolveMobileDir();
    const downloadsDir = resolveDownloadsDir();
    if (!mobileDir) {
        return NextResponse.json(
            { error: 'Missing APK build mobile path. Set APK_BUILD_MOBILE_PATH on the server.' },
            { status: 500 }
        );
    }
    if (!downloadsDir) {
        return NextResponse.json(
            { error: 'Missing downloads directory. Set APK_BUILD_DOWNLOADS_PATH on the server.' },
            { status: 500 }
        );
    }

    await safeMkdir(downloadsDir);

    const jobId = `${Date.now()}`;
    const startedAt = new Date().toISOString();
    fs.writeFileSync(lockPath, jobId, 'utf8');
    writeStatus({
        state: 'running',
        jobId,
        startedAt,
        finishedAt: undefined,
        error: undefined,
        apkFile: undefined,
        apkUrl: undefined,
        log: '',
    });

    const buildOutputApk = path.join(mobileDir, 'build', 'app', 'outputs', 'flutter-apk', 'app-profile.apk');
    const destinationFile = getNextApkFileName(downloadsDir);
    const destinationPath = path.join(downloadsDir, destinationFile);

    const child = spawn('bash', ['-lc', 'flutter build apk --profile'], {
        cwd: mobileDir,
        env: process.env,
    });

    child.stdout.on('data', (data) => appendLog(data.toString()));
    child.stderr.on('data', (data) => appendLog(data.toString()));

    child.on('error', (error) => {
        try {
            fs.unlinkSync(lockPath);
        } catch {}
        writeStatus({
            state: 'error',
            finishedAt: new Date().toISOString(),
            error: error.message,
        });
    });

    child.on('close', async (code) => {
        try {
            if (code !== 0) {
                writeStatus({
                    state: 'error',
                    finishedAt: new Date().toISOString(),
                    error: `flutter build failed (exit ${code ?? 'unknown'})`,
                });
                return;
            }

            await fs.promises.copyFile(buildOutputApk, destinationPath);
            const apkUrl = `${req.nextUrl.origin}/downloads/${destinationFile}`;
            writeStatus({
                state: 'done',
                finishedAt: new Date().toISOString(),
                apkFile: destinationFile,
                apkUrl,
            });
        } catch (e) {
            writeStatus({
                state: 'error',
                finishedAt: new Date().toISOString(),
                error: e instanceof Error ? e.message : 'Build finished but failed to publish APK',
            });
        } finally {
            try {
                fs.unlinkSync(lockPath);
            } catch {}
        }
    });

    return NextResponse.json({ ok: true, jobId });
}

