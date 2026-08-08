import Link from 'next/link';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
    const [aboutPageTitleSetting, aboutPageBodySetting] = await Promise.all([
        getAppSetting(APP_SETTING_KEYS.aboutPageTitle),
        getAppSetting(APP_SETTING_KEYS.aboutPageBody),
    ]);

    const title = aboutPageTitleSetting ?? 'من نحن';
    const body =
        aboutPageBodySetting ??
        'صورلي منصة تجمع العملاء مع المصورين وصُنّاع الفيديو داخل العراق. هدفنا تسهيل الوصول للمبدعين المناسبين وحجز الخدمة بطريقة واضحة وسريعة.';

    return (
        <main dir="rtl" className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-white">
            <header className="mb-8 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-extrabold">{title}</h1>
                <Link href="/" className="text-sm text-white/70 hover:text-white">
                    الرجوع للرئيسية
                </Link>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-sm backdrop-blur">
                <div className="whitespace-pre-wrap text-sm leading-6 text-white/75">{body}</div>
            </div>
        </main>
    );
}
