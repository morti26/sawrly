import Link from 'next/link';
import { LandingPreviewSlider } from '@/components/landing-preview-slider';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
    const [
        aboutCard1TitleSetting,
        aboutCard1BodySetting,
        aboutCard2TitleSetting,
        aboutCard2BodySetting,
        aboutCard3TitleSetting,
        aboutCard3BodySetting,
    ] = await Promise.all([
        getAppSetting(APP_SETTING_KEYS.aboutCard1Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard1Body),
        getAppSetting(APP_SETTING_KEYS.aboutCard2Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard2Body),
        getAppSetting(APP_SETTING_KEYS.aboutCard3Title),
        getAppSetting(APP_SETTING_KEYS.aboutCard3Body),
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

    return (
        <main id="home" dir="rtl" className="relative min-h-screen overflow-hidden px-6 py-8 text-white">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

            <div className="relative mx-auto w-full max-w-7xl">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <nav className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 p-1 text-sm font-bold text-white/75 shadow-[0_12px_35px_rgba(0,0,0,0.22)] backdrop-blur">
                        <Link href="#home" className="rounded-full bg-white/10 px-4 py-2 text-white shadow-[0_8px_24px_rgba(255,74,151,0.18)] hover:bg-white/[0.15]">
                            الرئيسية
                        </Link>
                        <Link href="/about" className="rounded-full px-4 py-2 hover:bg-white/10 hover:text-white">
                            من نحن
                        </Link>
                    </nav>

                    <div className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 shadow-[0_10px_35px_rgba(255,74,151,0.16)] backdrop-blur">
                        Mobile Experience صورلي
                    </div>
                </header>

                <section dir="ltr" className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                    <div dir="rtl" className="relative">
                        <LandingPreviewSlider />
                    </div>

                    <div dir="rtl" className="flex flex-col gap-6">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                            حمّل تطبيق
                            <br />
                            صورلي
                            <br />
                            للعملاء
                        </h1>

                        <p className="max-w-xl text-sm leading-6 text-white/70">
                            احجز المصور المناسب، تصفح العروض، وتابع طلباتك من
                            iPhone و Android بنفس الوان الواجهة والهوية الموجودة داخل التطبيق.
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-sm backdrop-blur">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/25 text-xs font-bold">
                                        iOS
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/50">APP STORE</div>
                                        <div className="mt-1 text-lg font-extrabold">iPhone</div>
                                        <div className="mt-1 text-xs text-white/60">رابط مباشر لمستخدمي iPhone و iPad</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-white/60">قريباً</div>
                                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold text-white/80">
                                        App store
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-sm backdrop-blur">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/25 text-xs font-bold">
                                        A
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/50">GOOGLE PLAY</div>
                                        <div className="mt-1 text-lg font-extrabold">Android</div>
                                        <div className="mt-1 text-xs text-white/60">تحميل سريع لمستخدمي Android</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-white/60">قريباً</div>
                                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold text-white/80">
                                        Google play
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-sm backdrop-blur">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#ff4a97]/15 text-xs font-bold text-[#ff8ad4] shadow-[0_10px_30px_rgba(255,74,151,0.2)]">
                                        APK
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/50">ANDROID</div>
                                        <div className="mt-1 text-lg font-extrabold">تحميل مباشر</div>
                                        <div className="mt-1 text-xs text-white/60">ملف APK جاهز للتحميل بدون متجر</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <Link href="/downloads" className="text-xs text-white/60 hover:text-white/80">
                                        قائمة الملفات
                                    </Link>
                                    <a
                                        href="/api/downloads/latest-apk"
                                        className="rounded-2xl bg-[#ff4a97] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_22px_rgba(255,74,151,0.35)] hover:bg-[#ff4a97]/90"
                                    >
                                        تحميل APK
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/about"
                                className="rounded-full bg-[#ff4a97] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_28px_rgba(255,74,151,0.35)] hover:bg-[#ff4a97]/90"
                            >
                                من نحن
                            </Link>

                            <div className="rounded-full border border-white/10 bg-white/[0.07] px-5 py-2 text-xs font-semibold text-white/70 backdrop-blur" dir="ltr">
                                واجهة العملاء منفصلة عن لوحة الإدارة
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="mt-10 grid grid-cols-1 gap-4 scroll-mt-10 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-sm backdrop-blur">
                        <div className="text-sm font-extrabold">{aboutCard1Title}</div>
                        <div className="mt-2 text-xs leading-5 text-white/70">
                            {aboutCard1Body}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-sm backdrop-blur">
                        <div className="text-sm font-extrabold">{aboutCard2Title}</div>
                        <div className="mt-2 text-xs leading-5 text-white/70">
                            {aboutCard2Body}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-sm backdrop-blur">
                        <div className="text-sm font-extrabold">{aboutCard3Title}</div>
                        <div className="mt-2 text-xs leading-5 text-white/70">
                            {aboutCard3Body}
                        </div>
                    </div>
                </section>

                <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="hover:text-white/80">
                            شروط الاستخدام
                        </Link>
                        <Link href="/privacy" className="hover:text-white/80">
                            سياسة الخصوصية
                        </Link>
                        <Link href="#" className="hover:text-white/80">
                            اتصل بنا
                        </Link>
                    </div>
                    <div className="text-white/40" dir="ltr">
                        Sawrly.com
                    </div>
                </footer>
            </div>
        </main>
    );
}
