"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type ThemeColors = Record<string, string | null>;
type NavIcons = Record<string, string | null>;
type NavIconLibraries = Record<string, string | null>;
type ThemeEffects = Record<string, number | null>;

type AdminThemeFeatures = {
    themeMode: 'dark' | 'light' | 'system' | null;
    lightSeedPrimary: string | null;
    iconLibraryDefault: 'phosphor' | 'material' | 'fontawesome' | 'lucide' | null;
    dynamicColorEnabled: boolean | null;
    animationsEnabled: boolean | null;
    pageTransitionStyle: 'cupertino' | 'fade' | 'sharedAxis' | 'zoom' | null;
    activeTemplateId: string | null;
};

type ThemeSettingsResponse = {
    colors: ThemeColors;
    navIcons: NavIcons;
    navIconLibraries: NavIconLibraries;
    effects: ThemeEffects;
    features: AdminThemeFeatures;
};

type SavedTemplate = {
    id: string;
    name: string;
    description: string | null;
    isPreset: boolean;
    primaryPreview: string | null;
    backgroundPreview: string | null;
    createdAt: string;
    updatedAt: string;
    colors: ThemeColors;
    navIcons: NavIcons;
    effects: ThemeEffects;
};

type PresetTheme = {
    key: string;
    name: string;
    label: string;
    seed: string;
    previewBg: string;
    previewPrimary: string;
};

const PRESET_THEMES: PresetTheme[] = [
    { key: 'purple-dream', name: 'حلم بنفسجي', label: 'Purple Dream', seed: '#9B4DFF', previewBg: '#46205A', previewPrimary: '#9B4DFF' },
    { key: 'ocean-teal',   name: 'محيط زرقاء',  label: 'Ocean Teal',   seed: '#10B981', previewBg: '#0B2830', previewPrimary: '#10B981' },
    { key: 'sunset-orange',name: 'غروب برتقالي',label: 'Sunset Orange',seed: '#F97316', previewBg: '#2A1410', previewPrimary: '#F97316' },
    { key: 'royal-gold',   name: 'ذهبي ملكي',   label: 'Royal Gold',   seed: '#EAB308', previewBg: '#1C1917', previewPrimary: '#EAB308' },
    { key: 'snow-white',   name: 'ثلج ناصع',    label: 'Snow White',   seed: '#7C3AED', previewBg: '#F8FAFC', previewPrimary: '#7C3AED' },
    { key: 'neon-cyber',   name: 'نيون سيبر',   label: 'Neon Cyber',   seed: '#22D3EE', previewBg: '#07091C', previewPrimary: '#22D3EE' },
];

const THEME_MODES: { value: 'dark' | 'light' | 'system'; label: string; icon: string }[] = [
    { value: 'dark',   label: 'داكن',     icon: '🌙' },
    { value: 'light',  label: 'فاتح',     icon: '☀️' },
    { value: 'system', label: 'النظام',   icon: '🖥️' },
];

const ICON_LIBRARIES: { value: 'phosphor' | 'material' | 'fontawesome' | 'lucide'; label: string }[] = [
    { value: 'phosphor',    label: 'Phosphor Icons (6 Vikter)' },
    { value: 'material',    label: 'Google Material Symbols' },
    { value: 'fontawesome', label: 'Font Awesome 6 Solid' },
    { value: 'lucide',      label: 'Lucide Icons (Clean)' },
];

const PAGE_TRANSITIONS: { value: 'cupertino' | 'fade' | 'sharedAxis' | 'zoom'; label: string; desc: string }[] = [
    { value: 'cupertino',  label: 'Cupertino (iOS)',       desc: 'استيراد من اليسار مثل أيفون' },
    { value: 'fade',       label: 'Fade (تلاشي)',          desc: 'ظهور واختفاء تدريجي' },
    { value: 'sharedAxis', label: 'Shared Axis (مشترك)',   desc: 'انتقال أفقي مادي M3' },
    { value: 'zoom',       label: 'Zoom (تكبير)',          desc: 'تكبير من المركز' },
];

const EMPTY_COLORS: ThemeColors = {
    primary: null, background: null,
};

function _authHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function _merge<T extends Record<string, any>>(a: T | null | undefined, b: Partial<T> | null): T {
    return { ...(a ?? ({} as any)), ...(b ?? {}) } as T;
}

export default function AdminThemeTemplatesPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isApplying, setIsApplying] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [serverData, setServerData] = useState<ThemeSettingsResponse | null>(null);

    const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system' | null>('dark');
    const [lightSeedPrimary, setLightSeedPrimary] = useState('#7C3AED');
    const [iconLibraryDefault, setIconLibraryDefault] = useState<'phosphor'|'material'|'fontawesome'|'lucide'|null>('phosphor');
    const [dynamicColorEnabled, setDynamicColorEnabled] = useState<boolean>(true);
    const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
    const [pageTransitionStyle, setPageTransitionStyle] = useState<'cupertino'|'fade'|'sharedAxis'|'zoom'|null>('cupertino');

    const [newTemplateName, setNewTemplateName] = useState('');

    const [templates, setTemplates] = useState<SavedTemplate[]>([]);

    const serverPrimaryPreview = useMemo<string>(() => {
        if (serverData?.features?.activeTemplateId && templates.length) {
            const t = templates.find(x => x.id === serverData.features!.activeTemplateId);
            if (t?.primaryPreview) return t.primaryPreview;
        }
        return serverData?.colors?.primary || '#9B4DFF';
    }, [serverData, templates]);

    const serverBgPreview = useMemo<string>(() => {
        if (serverData?.features?.activeTemplateId && templates.length) {
            const t = templates.find(x => x.id === serverData.features!.activeTemplateId);
            if (t?.backgroundPreview) return t.backgroundPreview;
        }
        return serverData?.colors?.background || '#46205A';
    }, [serverData, templates]);

    async function fetchAll(reloadSettings = true) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');

            const results = await Promise.all([
                reloadSettings ? fetch('/api/admin/theme-settings?enterprise=0', {
                    headers: { Authorization: `Bearer ${token}` },
                }) : null,
                fetch('/api/admin/theme-templates', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (reloadSettings) {
                const sRes = results[0]!;
                const sData = await sRes.json();
                if (!sRes.ok) throw new Error(sData?.error || 'فشل تحميل إعدادات المظهر');
                setServerData(sData);
                const f = sData.features || {};
                setThemeMode(f.themeMode ?? 'dark');
                setLightSeedPrimary(f.lightSeedPrimary || '#7C3AED');
                setIconLibraryDefault(f.iconLibraryDefault ?? 'phosphor');
                setDynamicColorEnabled(f.dynamicColorEnabled == null ? true : f.dynamicColorEnabled);
                setAnimationsEnabled(f.animationsEnabled == null ? true : f.animationsEnabled);
                setPageTransitionStyle(f.pageTransitionStyle ?? 'cupertino');
            }

            const tRes = results[1];
            const tData = await tRes.json();
            if (!tRes.ok) throw new Error(tData?.error || 'فشل تحميل القوالب');
            setTemplates((tData.templates || []) as SavedTemplate[]);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            setIsLoading(true);
            setError(null);
            if (mounted) await fetchAll(true);
        })();
        return () => { mounted = false; };
    }, []);

    async function saveSettings() {
        setIsSavingSettings(true);
        setMessage(null);
        setError(null);
        try {
            const body: any = {
                features: {
                    themeMode,
                    lightSeedPrimary,
                    iconLibraryDefault,
                    dynamicColorEnabled,
                    animationsEnabled,
                    pageTransitionStyle,
                },
            };
            const res = await fetch('/api/admin/theme-settings', {
                method: 'PUT',
                headers: _authHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل حفظ الإعدادات');
            setServerData({ ...(serverData as any), features: data.features ?? body.features });
            setMessage('✅ تم حفظ الإعدادات العامة بنجاح! التطبيق سيعكس التغييرات خلال 10 ثواني.');
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSavingSettings(false);
        }
    }

    async function saveCurrentAsTemplate() {
        const name = newTemplateName.trim();
        if (name.length < 1 || name.length > 80) {
            setError('اسم القالب يجب أن يكون بين 1 و 80 حرفاً.');
            return;
        }
        if (!serverData) {
            setError('لا يوجد إعدادات حالية لحفظها.');
            return;
        }
        setIsSavingTemplate(true);
        setMessage(null);
        setError(null);
        try {
            const body: any = {
                name,
                colors: serverData.colors ?? {},
                navIcons: {
                    ...(serverData.navIcons ?? {}),
                    ...(serverData.navIconLibraries ?? {}),
                },
                effects: serverData.effects ?? {},
            };
            const res = await fetch('/api/admin/theme-templates', {
                method: 'POST',
                headers: _authHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل حفظ القالب');
            setNewTemplateName('');
            setMessage(`✅ تم حفظ القالب الجديد "${name}" بنجاح!`);
            await fetchAll(false);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSavingTemplate(false);
        }
    }

    async function applyTemplate(id: string) {
        setIsApplying(id);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch('/api/admin/theme-settings?action=apply-template', {
                method: 'POST',
                headers: _authHeaders(),
                body: JSON.stringify({ templateId: id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل تطبيق القالب');
            setMessage('✅ تم تطبيق القالب بنجاح! يتم توجيهك إلى صفحة الألوان لمراجعة التفاصيل...');
            setTimeout(() => router.push('/admin/theme-settings'), 900);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsApplying(null);
        }
    }

    async function applyPreset(preset: PresetTheme) {
        setIsApplying('preset-' + preset.key);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch('/api/admin/theme-settings?action=smart-palette', {
                method: 'POST',
                headers: _authHeaders(),
                body: JSON.stringify({
                    seedPrimary: preset.seed,
                    mode: preset.key === 'snow-white' ? 'light' : 'dark',
                    writeToDb: true,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل تطبيق القالب الجاهز');
            setMessage(`✅ تم تطبيق القالب الجاهز "${preset.name}" بنجاح! يتم توجيهك...`);
            setTimeout(() => router.push('/admin/theme-settings'), 900);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsApplying(null);
        }
    }

    async function savePresetAsMyTemplate(preset: PresetTheme) {
        const name = `${preset.name} (نسخة)`;
        setIsSavingTemplate(true);
        setMessage(null);
        setError(null);
        try {
            const previewBg = preset.previewBg;
            const previewPrimary = preset.previewPrimary;
            const fakeColors: any = {
                primary: previewPrimary,
                background: previewBg,
            };
            const res = await fetch('/api/admin/theme-settings?action=smart-palette', {
                method: 'POST',
                headers: _authHeaders(),
                body: JSON.stringify({
                    seedPrimary: preset.seed,
                    mode: preset.key === 'snow-white' ? 'light' : 'dark',
                    writeToDb: false,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل توليد الألوان للقالب');
            const ent = data.enterprise || {};
            const colors: any = {};
            for (const k of Object.keys(ent)) {
                const v = (ent as any)[k];
                if (typeof v === 'string' && v.startsWith('#')) colors[k] = v;
            }
            const saveRes = await fetch('/api/admin/theme-templates', {
                method: 'POST',
                headers: _authHeaders(),
                body: JSON.stringify({
                    name,
                    description: `نسخة من القالب الجاهز ${preset.label}`,
                    presetTag: preset.key,
                    colors,
                    navIcons: {},
                    effects: (ent as any).effects || {},
                }),
            });
            const saveData = await saveRes.json();
            if (!saveRes.ok) throw new Error(saveData?.error || 'فشل حفظ القالب');
            setMessage(`✅ تم حفظ "${name}" إلى قوالبك الشخصية!`);
            await fetchAll(false);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSavingTemplate(false);
        }
    }

    async function deleteTemplate(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا القالب؟ لا يمكن التراجع عن الحذف.')) return;
        setIsDeleting(id);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch(`/api/admin/theme-templates?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: _authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'فشل حذف القالب');
            setMessage('🗑️ تم حذف القالب بنجاح.');
            await fetchAll(false);
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsDeleting(null);
        }
    }

    function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                } ${value ? 'bg-accent' : 'bg-m3-outline-variant'}`}
                aria-pressed={value}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-black text-m3-on-surface">إدارة قوالب المظهر</h1>
                <div className="rounded-card bg-m3-surface-container p-8 text-center text-m3-on-surface-variant">
                    جاري تحميل الإعدادات والقوالب...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-m3-on-surface">إدارة قوالب المظهر</h1>
                    <p className="mt-2 text-lg text-m3-on-surface-variant">
                        الإعدادات العامة للمظهر (الوضع الليلي/الفاتح، الرسوم المتحركة، الأيقونات) + قوالب المظهر المحفوظة.
                    </p>
                </div>
                <Link
                    href="/admin/theme-settings"
                    className="rounded-button bg-m3-secondary-container px-5 py-2.5 font-medium text-m3-on-secondary-container shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                    ← رجوع إلى إعدادات الألوان
                </Link>
            </div>

            {message && (
                <div className="rounded-card border border-m3-outline-variant bg-m3-tertiary-container px-5 py-3 font-medium text-m3-on-tertiary-container shadow-sm">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-card border border-m3-error/30 bg-m3-error-container px-5 py-3 font-medium text-m3-on-error-container shadow-sm">
                    ⚠️ {error}
                </div>
            )}

            <section className="rounded-card bg-m3-surface-container-high p-6 md:p-8 shadow-sm border border-m3-outline-variant">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-m3-on-surface">الإعدادات العامة للمظهر</h2>
                        <p className="mt-1 text-m3-on-surface-variant">
                            تُطبّق هذه الإعدادات على كامل التطبيق خلال ثوانٍ عند فتحه مرة أخرى.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-10 w-10 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: serverBgPreview }}
                                aria-label="خلفية المعاينة"
                            />
                            <div
                                className="h-10 w-10 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: serverPrimaryPreview }}
                                aria-label="اللون الرئيسي للمعاينة"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block font-bold text-m3-on-surface">وضع المظهر (Theme Mode)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {THEME_MODES.map(m => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setThemeMode(m.value)}
                                        className={`rounded-button px-3 py-3 font-medium transition-all duration-200 ${
                                            themeMode === m.value
                                                ? 'bg-accent text-m3-on-accent shadow-button -translate-y-0.5'
                                                : 'bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-highest'
                                        }`}
                                    >
                                        <div className="text-2xl">{m.icon}</div>
                                        <div className="mt-1 text-sm">{m.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block font-bold text-m3-on-surface">
                                لون بذرة الوضع الفاتح (Light Mode Seed)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={lightSeedPrimary.startsWith('#') && /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(lightSeedPrimary) ? lightSeedPrimary : '#7C3AED'}
                                    onChange={(e) => setLightSeedPrimary(e.target.value)}
                                    className="h-12 w-16 cursor-pointer rounded-button border border-m3-outline-variant bg-m3-surface-container p-1"
                                />
                                <input
                                    type="text"
                                    value={lightSeedPrimary}
                                    onChange={(e) => setLightSeedPrimary(e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="flex-1 rounded-button border border-m3-outline-variant bg-m3-surface px-4 py-2.5 font-mono text-m3-on-surface focus:border-accent focus:outline-none"
                                />
                            </div>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                من هذا اللون نُولد جميع ألوان الوضع الفاتح تلقائياً (85+ لون M3).
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block font-bold text-m3-on-surface">مكتبة الأيقونات الافتراضية</label>
                            <select
                                value={iconLibraryDefault ?? 'phosphor'}
                                onChange={(e) => setIconLibraryDefault(e.target.value as any)}
                                className="w-full rounded-button border border-m3-outline-variant bg-m3-surface px-4 py-2.5 text-m3-on-surface focus:border-accent focus:outline-none"
                            >
                                {ICON_LIBRARIES.map(lib => (
                                    <option key={lib.value} value={lib.value}>{lib.label}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                عند اختيار أيقونة في قسم الأيقونات دون تحديد مكتبة صريحة، نستخدم المكتبة الافتراضية أعلاه.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 rounded-button bg-m3-surface-container px-4 py-3">
                            <div>
                                <div className="font-bold text-m3-on-surface">لون النظام الديناميكي (Android 12+)</div>
                                <div className="text-sm text-m3-on-surface-variant">
                                    يأخذ لون خلفية الهاتف تلقائياً بدلاً من ألوانك المخصصة.
                                </div>
                            </div>
                            <Toggle value={dynamicColorEnabled} onChange={setDynamicColorEnabled} />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-button bg-m3-surface-container px-4 py-3">
                            <div>
                                <div className="font-bold text-m3-on-surface">الرسوم المتحركة (Animations)</div>
                                <div className="text-sm text-m3-on-surface-variant">
                                    تعطيلها يسرّع التطبيق على الأجهزة الضعيفة (إخفاء جميع انتقالات الصفحات).
                                </div>
                            </div>
                            <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} />
                        </div>

                        <div>
                            <label className="mb-2 block font-bold text-m3-on-surface">نمط الانتقال بين الصفحات</label>
                            <select
                                value={pageTransitionStyle ?? 'cupertino'}
                                onChange={(e) => setPageTransitionStyle(e.target.value as any)}
                                disabled={!animationsEnabled}
                                className="w-full rounded-button border border-m3-outline-variant bg-m3-surface px-4 py-2.5 text-m3-on-surface focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {PAGE_TRANSITIONS.map(pt => (
                                    <option key={pt.value} value={pt.value}>
                                        {pt.label} — {pt.desc}
                                    </option>
                                ))}
                            </select>
                            {!animationsEnabled && (
                                <p className="mt-1 text-sm text-m3-on-surface-variant">
                                    💡 مُعطّل لأن الرسوم المتحركة متوقفة أعلاه (سيتم إخفاء جميع الانتقالات).
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={isSavingSettings}
                                className="w-full rounded-button bg-accent px-6 py-3 font-bold text-m3-on-accent shadow-button transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isSavingSettings ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات العامة'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-card bg-m3-surface-container-high p-6 md:p-8 shadow-sm border border-m3-outline-variant">
                <h2 className="text-2xl font-bold text-m3-on-surface">حفظ المظهر الحالي كقالب جديد</h2>
                <p className="mt-1 mb-4 text-m3-on-surface-variant">
                    احفظ كل الألوان + التأثيرات + الأيقونات الحالية باسم خاص بك، ثم قم بتطبيقها بنقرة واحدة لاحقاً.
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentAsTemplate(); }}
                        placeholder="مثال: قالب رمضان 2026، النسخة البنفسجية المحسنة..."
                        className="flex-1 rounded-button border border-m3-outline-variant bg-m3-surface px-4 py-3 text-m3-on-surface focus:border-accent focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={saveCurrentAsTemplate}
                        disabled={isSavingTemplate}
                        className="rounded-button bg-m3-primary-container px-6 py-3 font-bold text-m3-on-primary-container shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isSavingTemplate ? '⏳ جاري الحفظ...' : '💾 حفظ كقالب جديد'}
                    </button>
                </div>
            </section>

            <section className="rounded-card bg-m3-surface-container-high p-6 md:p-8 shadow-sm border border-m3-outline-variant">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-m3-on-surface">قوالبك المحفوظة ({templates.filter(t => !t.isPreset).length})</h2>
                        <p className="mt-1 text-m3-on-surface-variant">
                            النقر على &quot;تطبيق&quot; يكتب جميع ألوان القالب إلى الإعدادات الحالية مباشرة.
                        </p>
                    </div>
                </div>
                {templates.filter(t => !t.isPreset).length === 0 ? (
                    <div className="rounded-card bg-m3-surface-container px-6 py-12 text-center text-m3-on-surface-variant">
                        <div className="text-5xl mb-3">📂</div>
                        <div className="font-medium">لا توجد قوالب محفوظة شخصياً حتى الآن.</div>
                        <div className="text-sm mt-1">احفظ القالب الحالي من الأعلى، أو احفظ أحد القوالب الجاهزة أدناه كنسخة خاصة بك.</div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {templates.filter(t => !t.isPreset).map(tpl => (
                            <div
                                key={tpl.id}
                                className="group relative flex flex-col gap-3 overflow-hidden rounded-card bg-m3-surface p-4 border border-m3-outline-variant transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div
                                    className="h-24 w-full rounded-lg flex items-center justify-center gap-2 shadow-inner"
                                    style={{
                                        background: `linear-gradient(135deg, ${tpl.backgroundPreview || serverBgPreview} 0%, ${tpl.backgroundPreview || serverBgPreview} 100%)`,
                                    }}
                                >
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-white shadow-md"
                                        style={{ backgroundColor: tpl.backgroundPreview || serverBgPreview }}
                                    />
                                    <div
                                        className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                                        style={{ backgroundColor: tpl.primaryPreview || serverPrimaryPreview }}
                                    />
                                </div>
                                <div>
                                    <div className="font-bold text-m3-on-surface truncate">{tpl.name}</div>
                                    <div className="mt-0.5 text-xs text-m3-on-surface-variant">
                                        آخر تحديث: {new Date(tpl.updatedAt).toLocaleDateString('ar-SA')}
                                    </div>
                                    {tpl.description && (
                                        <div className="mt-1 text-xs text-m3-on-surface-variant line-clamp-2">{tpl.description}</div>
                                    )}
                                    {serverData?.features?.activeTemplateId === tpl.id && (
                                        <div className="mt-2 inline-block rounded-full bg-m3-tertiary-container px-2.5 py-0.5 text-xs font-bold text-m3-on-tertiary-container">
                                            ⭐ القالب النشط حالياً
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => applyTemplate(tpl.id)}
                                        disabled={isApplying !== null}
                                        className="rounded-button bg-accent px-3 py-2 text-sm font-bold text-m3-on-accent shadow-sm transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {isApplying === tpl.id ? '⏳...' : '✅ تطبيق'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteTemplate(tpl.id)}
                                        disabled={isDeleting !== null}
                                        className="rounded-button bg-m3-error-container px-3 py-2 text-sm font-bold text-m3-on-error-container shadow-sm transition-all duration-150 hover:bg-m3-error-container/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting === tpl.id ? '⏳...' : '🗑️ حذف'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-card bg-m3-surface-container-high p-6 md:p-8 shadow-sm border border-m3-outline-variant">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-m3-on-surface">قوالب جاهزة (Presets)</h2>
                    <p className="mt-1 text-m3-on-surface-variant">
                        اضغط تطبيق لاستخدامها مباشرة، أو احفظها كقالب شخصي خاص بك أولاً لتعديل الألوان بحرية.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PRESET_THEMES.map(preset => (
                        <div
                            key={preset.key}
                            className="group relative flex flex-col gap-3 overflow-hidden rounded-card bg-m3-surface p-4 border border-m3-outline-variant transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className="h-24 w-full rounded-lg flex items-center justify-center gap-2 shadow-inner"
                                style={{
                                    background: `linear-gradient(135deg, ${preset.previewBg} 0%, ${preset.previewBg} 100%)`,
                                }}
                            >
                                <div
                                    className="h-10 w-10 rounded-full border-2 border-white shadow-md"
                                    style={{ backgroundColor: preset.previewBg }}
                                />
                                <div
                                    className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                                    style={{ backgroundColor: preset.previewPrimary }}
                                />
                            </div>
                            <div>
                                <div className="font-bold text-m3-on-surface">{preset.name}</div>
                                <div className="text-xs text-m3-on-surface-variant">{preset.label}</div>
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    disabled={isApplying !== null}
                                    className="rounded-button bg-accent px-3 py-2 text-sm font-bold text-m3-on-accent shadow-sm transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isApplying === 'preset-' + preset.key ? '⏳...' : '✅ تطبيق'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => savePresetAsMyTemplate(preset)}
                                    disabled={isSavingTemplate}
                                    className="rounded-button bg-m3-secondary-container px-3 py-2 text-sm font-bold text-m3-on-secondary-container shadow-sm transition-all duration-150 hover:bg-m3-secondary-container/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    💾 حفظ لي
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="pb-4 pt-2 text-center text-sm text-m3-on-surface-variant">
                🚀 تلميح: بعد تطبيق قالب جديد، افتح إعدادات الألوان لضبط ألوان محددة بدقة قبل إعادة حفظ القالب باسم أفضل.
            </footer>
        </div>
    );
}
