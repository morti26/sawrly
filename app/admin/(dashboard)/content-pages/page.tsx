"use client";

import { useEffect, useState } from 'react';

interface AdminContentPagesResponse {
    aboutCard1Title: string | null;
    aboutCard1Body: string | null;
    aboutCard2Title: string | null;
    aboutCard2Body: string | null;
    aboutCard3Title: string | null;
    aboutCard3Body: string | null;
    aboutPageTitle: string | null;
    aboutPageBody: string | null;
    termsBody: string | null;
    privacyBody: string | null;
}

export default function AdminContentPages() {
    const [aboutCard1Title, setAboutCard1Title] = useState('');
    const [aboutCard1Body, setAboutCard1Body] = useState('');
    const [aboutCard2Title, setAboutCard2Title] = useState('');
    const [aboutCard2Body, setAboutCard2Body] = useState('');
    const [aboutCard3Title, setAboutCard3Title] = useState('');
    const [aboutCard3Body, setAboutCard3Body] = useState('');
    const [aboutPageTitle, setAboutPageTitle] = useState('');
    const [aboutPageBody, setAboutPageBody] = useState('');
    const [termsBody, setTermsBody] = useState('');
    const [privacyBody, setPrivacyBody] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setIsLoading(true);
            setError(null);
            setMessage(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
                }

                const res = await fetch('/api/admin/content-pages', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || 'فشل تحميل محتوى الصفحات');
                }

                if (!isMounted) return;

                const payload = data as AdminContentPagesResponse;
                setAboutCard1Title(payload.aboutCard1Title || '');
                setAboutCard1Body(payload.aboutCard1Body || '');
                setAboutCard2Title(payload.aboutCard2Title || '');
                setAboutCard2Body(payload.aboutCard2Body || '');
                setAboutCard3Title(payload.aboutCard3Title || '');
                setAboutCard3Body(payload.aboutCard3Body || '');
                setAboutPageTitle(payload.aboutPageTitle || '');
                setAboutPageBody(payload.aboutPageBody || '');
                setTermsBody(payload.termsBody || '');
                setPrivacyBody(payload.privacyBody || '');
            } catch (e) {
                if (isMounted) {
                    setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void load();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }

            const res = await fetch('/api/admin/content-pages', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    aboutCard1Title,
                    aboutCard1Body,
                    aboutCard2Title,
                    aboutCard2Body,
                    aboutCard3Title,
                    aboutCard3Body,
                    aboutPageTitle,
                    aboutPageBody,
                    termsBody,
                    privacyBody,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'فشل حفظ محتوى الصفحات');
            }

            const payload = data as AdminContentPagesResponse;
            setAboutCard1Title(payload.aboutCard1Title || '');
            setAboutCard1Body(payload.aboutCard1Body || '');
            setAboutCard2Title(payload.aboutCard2Title || '');
            setAboutCard2Body(payload.aboutCard2Body || '');
            setAboutCard3Title(payload.aboutCard3Title || '');
            setAboutCard3Body(payload.aboutCard3Body || '');
            setAboutPageTitle(payload.aboutPageTitle || '');
            setAboutPageBody(payload.aboutPageBody || '');
            setTermsBody(payload.termsBody || '');
            setPrivacyBody(payload.privacyBody || '');

            setMessage('تم حفظ المحتوى بنجاح');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div dir="rtl" className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">محتوى الصفحات</h1>
                <p className="text-sm text-gray-500">إدارة محتوى واجهة الموقع (من نحن، الشروط، الخصوصية).</p>
            </div>

            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
            {message && (
                <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">قسم من نحن (بطاقات الصفحة الرئيسية)</h2>

                {isLoading ? (
                    <p className="text-sm text-gray-500">جاري تحميل المحتوى...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">عنوان البطاقة الأولى</label>
                                <input
                                    value={aboutCard1Title}
                                    onChange={(e) => setAboutCard1Title(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="من نحن"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">نص البطاقة الأولى</label>
                                <textarea
                                    value={aboutCard1Body}
                                    onChange={(e) => setAboutCard1Body(e.target.value)}
                                    className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="صورلي منصة تجمع العملاء..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">عنوان البطاقة الثانية</label>
                                <input
                                    value={aboutCard2Title}
                                    onChange={(e) => setAboutCard2Title(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="تجربة للعملاء"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">نص البطاقة الثانية</label>
                                <textarea
                                    value={aboutCard2Body}
                                    onChange={(e) => setAboutCard2Body(e.target.value)}
                                    className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="الصفحة الرئيسية مخصصة..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">عنوان البطاقة الثالثة</label>
                                <input
                                    value={aboutCard3Title}
                                    onChange={(e) => setAboutCard3Title(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="تصميم قريب من التطبيق"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">نص البطاقة الثالثة</label>
                                <textarea
                                    value={aboutCard3Body}
                                    onChange={(e) => setAboutCard3Body(e.target.value)}
                                    className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    placeholder="نفس الإحساس الداكن..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">صفحة من نحن (صفحة مستقلة)</h2>

                {isLoading ? (
                    <p className="text-sm text-gray-500">جاري تحميل المحتوى...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">عنوان الصفحة</label>
                            <input
                                value={aboutPageTitle}
                                onChange={(e) => setAboutPageTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                placeholder="من نحن"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">محتوى الصفحة</label>
                            <textarea
                                value={aboutPageBody}
                                onChange={(e) => setAboutPageBody(e.target.value)}
                                className="min-h-64 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                placeholder="اكتب محتوى صفحة من نحن هنا..."
                            />
                        </div>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">شروط الاستخدام</h2>

                {isLoading ? (
                    <p className="text-sm text-gray-500">جاري تحميل المحتوى...</p>
                ) : (
                    <textarea
                        value={termsBody}
                        onChange={(e) => setTermsBody(e.target.value)}
                        className="min-h-64 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="اكتب شروط الاستخدام هنا..."
                    />
                )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">سياسة الخصوصية</h2>

                {isLoading ? (
                    <p className="text-sm text-gray-500">جاري تحميل المحتوى...</p>
                ) : (
                    <textarea
                        value={privacyBody}
                        onChange={(e) => setPrivacyBody(e.target.value)}
                        className="min-h-64 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="اكتب سياسة الخصوصية هنا..."
                    />
                )}
            </section>

            <div className="flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
            </div>
        </div>
    );
}
