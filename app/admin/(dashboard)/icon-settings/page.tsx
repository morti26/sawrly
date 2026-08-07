"use client";

import Image from 'next/image';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type IconSettings = {
    femaleProfileIconUrl: string | null;
    maleProfileIconUrl: string | null;
    superAdminIconUrl: string | null;
    limitedMonthlySubscriptionIconUrl: string | null;
    unlimitedMonthlySubscriptionIconUrl: string | null;
    unlimitedYearlySubscriptionIconUrl: string | null;
};

type IconField = keyof IconSettings;

type IconCardConfig = {
    key: IconField;
    title: string;
    description: string;
};

const ICON_CARDS: IconCardConfig[] = [
    {
        key: 'femaleProfileIconUrl',
        title: 'أيقونة الأنثى',
        description: 'تظهر في ملف الحساب الأنثوي عندما نربطها داخل التطبيق.',
    },
    {
        key: 'maleProfileIconUrl',
        title: 'أيقونة الذكر',
        description: 'تظهر في ملف الحساب الذكري عندما نربطها داخل التطبيق.',
    },
    {
        key: 'superAdminIconUrl',
        title: 'أيقونة السوبر أدمن',
        description: 'شارة خاصة للحساب الإداري المميز.',
    },
    {
        key: 'limitedMonthlySubscriptionIconUrl',
        title: 'أيقونة الاشتراك المحدود الشهري',
        description: 'خاصة بالخطة المحدودة الشهرية.',
    },
    {
        key: 'unlimitedMonthlySubscriptionIconUrl',
        title: 'أيقونة الاشتراك الشهري غير المحدود',
        description: 'خاصة بالخطة الشهرية غير المحدودة.',
    },
    {
        key: 'unlimitedYearlySubscriptionIconUrl',
        title: 'أيقونة الاشتراك السنوي غير المحدود',
        description: 'خاصة بالخطة السنوية غير المحدودة.',
    },
];

const EMPTY_SETTINGS: IconSettings = {
    femaleProfileIconUrl: null,
    maleProfileIconUrl: null,
    superAdminIconUrl: null,
    limitedMonthlySubscriptionIconUrl: null,
    unlimitedMonthlySubscriptionIconUrl: null,
    unlimitedYearlySubscriptionIconUrl: null,
};

export default function AdminIconSettingsPage() {
    const [settings, setSettings] = useState<IconSettings>(EMPTY_SETTINGS);
    const [selectedFiles, setSelectedFiles] = useState<Partial<Record<IconField, File>>>({});
    const [previewUrls, setPreviewUrls] = useState<Partial<Record<IconField, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadSettings();
    }, []);

    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [previewUrls]);

    const cards = useMemo(() => {
        return ICON_CARDS.map((card) => ({
            ...card,
            currentUrl: previewUrls[card.key] || settings[card.key] || null,
        }));
    }, [previewUrls, settings]);

    async function loadSettings() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }

            const res = await fetch('/api/admin/icon-settings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'فشل تحميل الأيقونات');
            }
            setSettings({ ...EMPTY_SETTINGS, ...data });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(key: IconField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setMessage(null);
        setError(null);
        setSelectedFiles((prev) => ({ ...prev, [key]: file }));
        setPreviewUrls((prev) => {
            const current = prev[key];
            if (current) URL.revokeObjectURL(current);
            return {
                ...prev,
                [key]: URL.createObjectURL(file),
            };
        });
    }

    async function uploadFile(file: File, token: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subDir', 'badges');

        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data?.url) {
            throw new Error(data?.error || 'فشل رفع الأيقونة');
        }
        return data.url as string;
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }

            const nextSettings: IconSettings = { ...settings };
            for (const card of ICON_CARDS) {
                const file = selectedFiles[card.key];
                if (file) {
                    nextSettings[card.key] = await uploadFile(file, token);
                }
            }

            const res = await fetch('/api/admin/icon-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(nextSettings),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'فشل حفظ الأيقونات');
            }

            setSettings({ ...EMPTY_SETTINGS, ...data });
            setSelectedFiles({});
            Object.values(previewUrls).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
            setPreviewUrls({});
            setMessage('تم حفظ الأيقونات بنجاح');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    }

    function handleRemove(key: IconField) {
        setMessage(null);
        setError(null);
        setSelectedFiles((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setPreviewUrls((prev) => {
            const next = { ...prev };
            if (next[key]) URL.revokeObjectURL(next[key]!);
            delete next[key];
            return next;
        });
        setSettings((prev) => ({ ...prev, [key]: null }));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-right text-2xl font-bold">أيقونات الحساب والاشتراك</h2>
                <p className="text-right text-sm text-m3-on-surface-variant">
                    هنا ترفع أيقونات الأنثى والذكر والسوبر أدمن وأنواع الاشتراكات، ثم نربطها
                    داخل التطبيق حسب النوع.
                </p>
            </div>

            {message ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-sm text-emerald-700">
                    {message}
                </div>
            ) : null}
            {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-right text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.key} className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="space-y-1 text-right">
                            <h3 className="font-bold text-m3-on-background">{card.title}</h3>
                            <p className="text-sm text-m3-on-surface-variant">{card.description}</p>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-m3-outline-variant bg-m3-background">
                                {card.currentUrl ? (
                                    <Image
                                        src={card.currentUrl}
                                        alt={card.title}
                                        width={112}
                                        height={112}
                                        className="h-full w-full object-contain"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="px-3 text-center text-xs text-m3-outline">
                                        لا توجد أيقونة بعد
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                            <label className="cursor-pointer rounded-lg bg-m3-surface-container-highest px-4 py-2 text-center text-sm font-medium text-m3-on-surface transition hover:bg-m3-surface-container-high">
                                اختر ملف PNG
                                <input
                                    type="file"
                                    accept="image/png,image/webp,image/jpeg"
                                    className="hidden"
                                    onChange={(event) => handleFileChange(card.key, event)}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => handleRemove(card.key)}
                                className="rounded-lg border border-m3-outline-variant/60 px-4 py-2 text-sm font-medium text-m3-on-surface transition hover:bg-m3-background"
                            >
                                إزالة الأيقونة
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={() => void loadSettings()}
                        className="rounded-lg border border-m3-outline-variant/60 px-4 py-2 text-sm font-medium text-m3-on-surface transition hover:bg-m3-background"
                    >
                        إعادة التحميل
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving || loading}
                        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-m3-on-surface transition hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-accent/60"
                    >
                        {saving ? 'جارٍ الحفظ...' : 'حفظ الأيقونات'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card px-4 py-6 text-center text-sm text-m3-on-surface-variant shadow-sm">
                    جارٍ تحميل الأيقونات...
                </div>
            ) : null}
        </div>
    );
}
