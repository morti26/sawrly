import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type DownloadFile = {
    name: string;
    href: string;
    size: number;
    mtimeMs: number;
};

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    const formatted = index === 0 ? `${Math.round(value)}` : value.toFixed(1);
    return `${formatted} ${units[index]}`;
}

function formatDate(ms: number): string {
    if (!Number.isFinite(ms) || ms <= 0) return '';
    return new Date(ms).toISOString().replace('T', ' ').slice(0, 16);
}

async function getDownloadFiles(): Promise<DownloadFile[]> {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    try {
        const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
        const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);

        const enriched = await Promise.all(
            files.map(async (name) => {
                const stat = await fs.stat(path.join(downloadsDir, name));
                return {
                    name,
                    href: `/downloads/${encodeURIComponent(name)}`,
                    size: stat.size,
                    mtimeMs: stat.mtimeMs,
                } satisfies DownloadFile;
            }),
        );

        return enriched.sort((a, b) => b.mtimeMs - a.mtimeMs);
    } catch {
        return [];
    }
}

export default async function DownloadsPage() {
    const files = await getDownloadFiles();
    const apkFiles = files.filter((file) => file.name.toLowerCase().endsWith('.apk'));
    const latestApk = apkFiles[0] ?? null;

    return (
        <main dir="rtl" className="relative min-h-screen overflow-hidden px-6 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,74,151,0.16),_rgba(0,0,0,0)_55%)]" />

            <div className="relative mx-auto w-full max-w-4xl">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-extrabold">التنزيلات</h1>
                        <div className="text-xs text-white/60" dir="ltr">
                            Sawrly.com /downloads
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="w-fit rounded-full border border-white/10 bg-black/25 px-5 py-2 text-xs font-semibold text-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.22)] backdrop-blur hover:bg-white/10"
                    >
                        رجوع للرئيسية
                    </Link>
                </header>

                <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm backdrop-blur">
                    <div className="text-sm font-extrabold">أحدث ملف APK</div>

                    {latestApk ? (
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold" dir="ltr">
                                    {latestApk.name}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/60" dir="ltr">
                                    <span>{formatBytes(latestApk.size)}</span>
                                    <span>{formatDate(latestApk.mtimeMs)} UTC</span>
                                </div>
                            </div>

                            <a
                                href={latestApk.href}
                                className="w-fit rounded-full bg-[#ff4a97] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_28px_rgba(255,74,151,0.35)] hover:bg-[#ff4a97]/90"
                            >
                                تحميل APK
                            </a>
                        </div>
                    ) : (
                        <div className="mt-3 text-xs text-white/60">
                            لا يوجد ملفات APK حالياً. قم بنشر نسخة جديدة عبر السكربت ثم أعد تحميل الصفحة.
                        </div>
                    )}
                </section>

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm font-extrabold">كل الملفات</div>
                        <div className="text-[11px] text-white/50" dir="ltr">
                            {files.length} files
                        </div>
                    </div>

                    {files.length === 0 ? (
                        <div className="mt-4 text-xs text-white/60">
                            لا يوجد ملفات في مجلد downloads حالياً.
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                            <div className="grid grid-cols-[1fr_auto] gap-x-4 bg-black/30 px-4 py-2 text-[11px] font-semibold text-white/60">
                                <div dir="ltr">FILE</div>
                                <div dir="ltr">SIZE</div>
                            </div>

                            <div className="divide-y divide-white/10">
                                {files.map((file) => (
                                    <div key={file.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 px-4 py-3">
                                        <a href={file.href} className="truncate text-xs font-semibold text-white/85 hover:text-white" dir="ltr">
                                            {file.name}
                                        </a>
                                        <div className="text-[11px] text-white/60" dir="ltr">
                                            {formatBytes(file.size)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
