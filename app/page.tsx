import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import { LandingPreviewSlider } from '@/components/landing-preview-slider';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LatestApkInfo = {
    fileName: string;
    number: number | null;
};

async function getLatestApkInfo(): Promise<LatestApkInfo | null> {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    try {
        const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
        const apks = entries
            .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.apk'))
            .map(entry => entry.name);

        if (apks.length === 0) return null;

        let bestNumber = -1;
        let bestNumberFile: string | null = null;
        for (const name of apks) {
            const match = /^sawrly-(\d+)\.apk$/i.exec(name);
            if (!match) continue;
            const value = Number.parseInt(match[1], 10);
            if (!Number.isFinite(value)) continue;
            if (value > bestNumber) {
                bestNumber = value;
                bestNumberFile = name;
            }
        }

        if (bestNumberFile) {
            return { fileName: bestNumberFile, number: bestNumber };
        }

        const stats = await Promise.all(
            apks.map(async name => {
                const stat = await fs.stat(path.join(downloadsDir, name));
                return { name, mtimeMs: stat.mtimeMs };
            }),
        );
        stats.sort((a, b) => b.mtimeMs - a.mtimeMs);
        const latest = stats[0]?.name;
        if (!latest) return null;
        return { fileName: latest, number: null };
    } catch {
        return null;
    }
}

export default async function Home() {
    const [
        aboutCard1TitleSetting,
        aboutCard1BodySetting,
        aboutCard2TitleSetting,
        aboutCard2BodySetting,
        aboutCard3TitleSetting,
        aboutCard3BodySetting,
        latestApk,
    ] = await Promise.all([
        getAppSetting(APP_SETTING_KEYS.aboutCard1Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard1Body),
        getAppSetting(APP_SETTING_KEYS.aboutCard2Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard2Body),
        getAppSetting(APP_SETTING_KEYS.aboutCard3Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard3Body),
        getLatestApkInfo(),
    ]);

    const aboutCard1Title = aboutCard1TitleSetting ?? 'من نحن';
    const aboutCard1Body =
        aboutCard1BodySetting ??
        'صورلي منصة تجمع العملاء مع المصورين وصناع الفيديو بطريقة سهلة وسريعة داخل العراق.';
    const aboutCard2Title = aboutCard2TitleSetting ?? 'تجربة للعملاء';
    const aboutCard2Body =
        aboutCard2BodySetting ??
        'الصفحة الرئيسية مخصصة للزبائن: تحميل التطبيق، تصفح الخدمة، والوصول السريع للمعلومات المهمة.';
    const aboutCard3Title = aboutCard3TitleSetting ?? 'تصميم قريب من التطبيق';
    const aboutCard3Body =
        aboutCard3BodySetting ??
        'نفس الإحساس الداكن والواجهات اللامعة، مع لون وردي يعطي الصفحة طابعاً أنيقاً وحديثاً.';

    const latestApkLabel =
        latestApk?.number != null ? String(latestApk.number).padStart(2, '0') : null;

    return (
        <main id="home" dir="rtl" className="relative min-h-screen overflow-hidden px-6 py-8 text-m3-text-primary">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

            <div className="relative mx-auto w-full max-w-7xl">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <nav className="flex w-fit items-center gap-2 rounded-chip border border-border-outline-variant bg-surface-container/80 p-1 text-sm font-bold text-m3-text-secondary shadow-level-2 backdrop-blur-glass">
                        <Link href="#home" className="rounded-chip bg-white/10 px-4 py-2 text-m3-on-accent shadow-glow-accent hover:bg-white/[0.15]">
                            الرئيسية
                        </Link>
                        <Link href="/about" className="rounded-chip px-4 py-2 hover:bg-white/10 hover:text-m3-text-primary">
                            من نحن
                        </Link>
                    </nav>

                    <div className="rounded-chip border border-border-outline-variant bg-surface-container/80 px-4 py-1.5 text-xs font-semibold text-m3-on-surface shadow-level-2 backdrop-blur-glass">
                        Mobile Experience صورلي
                    </div>
                </header>

                <section dir="ltr" className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                    <div dir="rtl" className="relative">
                        <LandingPreviewSlider />
                    </div>

                    <div dir="rtl" className="flex flex-col gap-6">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-m3-on-background">
                            حمّل تطبيق
                            <br />
                            صورلي
                            <br />
                            للعملاء
                        </h1>

                        <p className="max-w-xl text-sm leading-6 text-m3-text-secondary">
                            احجز المصور المناسب، تصفح العروض، وتابع طلباتك من
                            iPhone و Android بنفس الوان الواجهة والهوية الموجودة داخل التطبيق.
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-4 shadow-card backdrop-blur-glass">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border-outline-variant bg-surface-container-low/80 text-xs font-bold">
                                        iOS
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-m3-text-tertiary">APP STORE</div>
                                        <div className="mt-1 text-lg font-extrabold text-m3-on-surface">iPhone</div>
                                        <div className="mt-1 text-xs text-m3-text-secondary">رابط مباشر لمستخدمي iPhone و iPad</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-m3-text-secondary">قريباً</div>
                                    <div className="rounded-button border border-border-outline-variant bg-surface-container-low/80 px-4 py-2 text-xs font-semibold text-m3-on-surface">
                                        App store
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-4 shadow-card backdrop-blur-glass">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border-outline-variant bg-surface-container-low/80 text-xs font-bold">
                                        A
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-m3-text-tertiary">GOOGLE PLAY</div>
                                        <div className="mt-1 text-lg font-extrabold text-m3-on-surface">Android</div>
                                        <div className="mt-1 text-xs text-m3-text-secondary">تحميل سريع لمستخدمي Android</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-m3-text-secondary">قريباً</div>
                                    <div className="rounded-button border border-border-outline-variant bg-surface-container-low/80 px-4 py-2 text-xs font-semibold text-m3-on-surface">
                                        Google play
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-4 shadow-card backdrop-blur-glass">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/30 bg-accent/15 text-[10px] font-extrabold text-primary-light shadow-glow-accent leading-none">
                                        <div className="grid gap-0.5 text-center">
                                            <div>APK</div>
                                            {latestApkLabel ? <div className="text-white/80">{latestApkLabel}</div> : null}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-m3-text-tertiary">ANDROID</div>
                                        <div className="mt-1 text-lg font-extrabold text-m3-on-surface">تحميل مباشر</div>
                                        <div className="mt-1 text-xs text-m3-text-secondary">ملف APK جاهز للتحميل بدون متجر</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <Link href="/downloads" className="text-xs text-m3-text-secondary hover:text-m3-text-primary">
                                        قائمة الملفات
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        {latestApkLabel ? (
                                            <div className="rounded-button border border-border-outline-variant bg-surface-container-low/80 px-3 py-2 text-[10px] font-semibold text-m3-on-surface/80">
                                                v{latestApkLabel}
                                            </div>
                                        ) : null}
                                        <a
                                            href="/api/downloads/latest-apk"
                                            className="rounded-button bg-accent px-4 py-2 text-xs font-extrabold text-m3-on-accent shadow-button hover:bg-accent/90"
                                        >
                                            تحميل APK
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/about"
                                className="rounded-chip bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-on shadow-button hover:bg-primary/90"
                            >
                                من نحن
                            </Link>

                            <div className="rounded-chip border border-border-outline-variant bg-surface-container/80 px-5 py-2 text-xs font-semibold text-m3-text-secondary backdrop-blur-glass" dir="ltr">
                                واجهة العملاء منفصلة عن لوحة الإدارة
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="mt-10 grid grid-cols-1 gap-4 scroll-mt-10 md:grid-cols-3">
                    <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-5 shadow-card backdrop-blur-glass">
                        <div className="text-sm font-extrabold text-m3-on-surface">{aboutCard1Title}</div>
                        <div className="mt-2 text-xs leading-5 text-m3-text-secondary">
                            {aboutCard1Body}
                        </div>
                    </div>
                    <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-5 shadow-card backdrop-blur-glass">
                        <div className="text-sm font-extrabold text-m3-on-surface">{aboutCard2Title}</div>
                        <div className="mt-2 text-xs leading-5 text-m3-text-secondary">
                            {aboutCard2Body}
                        </div>
                    </div>
                    <div className="rounded-card border border-m3-card-border bg-surface-card/90 p-5 shadow-card backdrop-blur-glass">
                        <div className="text-sm font-extrabold text-m3-on-surface">{aboutCard3Title}</div>
                        <div className="mt-2 text-xs leading-5 text-m3-text-secondary">
                            {aboutCard3Body}
                        </div>
                    </div>
                </section>

                <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border-outline-variant pt-6 text-xs text-m3-text-secondary sm:flex-row">
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="hover:text-m3-text-primary">
                            شروط الاستخدام
                        </Link>
                        <Link href="/privacy" className="hover:text-m3-text-primary">
                            سياسة الخصوصية
                        </Link>
                        <Link href="#" className="hover:text-m3-text-primary">
                            اتصل بنا
                        </Link>
                    </div>
                    <div className="text-m3-text-tertiary" dir="ltr">
                        Sawrly.com
                    </div>
                </footer>
            </div>
        </main>
    );
}
