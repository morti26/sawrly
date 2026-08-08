"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
    colors: {
        background: string;
        primary: string;
        primaryDark: string;
        surface: string;
        accentPink: string;
    };
};

const PRESET_THEMES: PresetTheme[] = [
    { key: 'purple-dream', name: 'حلم بنفسجي', label: 'Purple Dream', seed: '#9B4DFF',
        colors: { background: '#46205A', primary: '#9B4DFF', primaryDark: '#5724A6', surface: '#2C1339', accentPink: '#FF49AE' } },
    { key: 'ocean-teal',   name: 'محيط زرقاء',  label: 'Ocean Teal',   seed: '#10B981',
        colors: { background: '#0B2830', primary: '#10B981', primaryDark: '#065F46', surface: '#071A1E', accentPink: '#FF4D8F' } },
    { key: 'sunset-orange',name: 'غروب برتقالي',label: 'Sunset Orange',seed: '#F97316',
        colors: { background: '#2A1410', primary: '#F97316', primaryDark: '#9A3412', surface: '#1A0C08', accentPink: '#FF2263' } },
    { key: 'royal-gold',   name: 'ذهبي ملكي',   label: 'Royal Gold',   seed: '#EAB308',
        colors: { background: '#1C1917', primary: '#EAB308', primaryDark: '#A16207', surface: '#292524', accentPink: '#FD2285' } },
    { key: 'snow-white',   name: 'ثلج ناصع',    label: 'Snow White',   seed: '#7C3AED',
        colors: { background: '#F8FAFC', primary: '#7C3AED', primaryDark: '#5B21B6', surface: '#EFF6FF', accentPink: '#EC4899' } },
    { key: 'neon-cyber',   name: 'نيون سيبر',   label: 'Neon Cyber',   seed: '#22D3EE',
        colors: { background: '#07091C', primary: '#22D3EE', primaryDark: '#0E7490', surface: '#111827', accentPink: '#F0ABFC' } },
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

const NAV_ORDER: Array<{ label: string; inKey: string; activeKey: string }> = [
    { label: 'الرئيسية',  inKey: 'navHomeInactive',    activeKey: 'navHomeActive' },
    { label: 'البحث',     inKey: 'navSearchInactive',  activeKey: 'navSearchActive' },
    { label: 'المشاريع',  inKey: 'navOffersInactive',  activeKey: 'navOffersActive' },
    { label: 'البحث ٢',   inKey: 'navAccountInactive', activeKey: 'navAccountActive' },
    { label: 'الرئيسية',  inKey: 'navProfileInactive', activeKey: 'navProfileActive' },
];

function _hex(v: string | null | undefined, fallback: string): string {
    if (!v) return fallback;
    if (typeof v === 'string' && /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) return v;
    return fallback;
}
function _num(v: number | null | undefined, fallback: number): number {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    return fallback;
}
function _withAlpha(hex: string, alpha: number): string {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const r = parseInt(full.substring(0,2), 16);
    const g = parseInt(full.substring(2,4), 16);
    const b = parseInt(full.substring(4,6), 16);
    const a = Math.max(0, Math.min(1, alpha));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function _authHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
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
    const [activeNav, setActiveNav] = useState(4);

    // === LIVE PREVIEW: colors + effects ===
    const c = useMemo(() => {
        const s = serverData?.colors ?? {};
        return {
            background:       _hex(s.background,      PRESET_THEMES[0].colors.background),
            surface:          _hex(s.surface,         PRESET_THEMES[0].colors.surface),
            surfaceContainer: _hex(s.surfaceContainer ?? s.surfaceLight, PRESET_THEMES[0].colors.surface),
            surfaceLight:     _hex(s.surfaceLight ?? s.surface, PRESET_THEMES[0].colors.surface),
            cardSurface:      _hex(s.cardSurface ?? s.surface, PRESET_THEMES[0].colors.surface),
            primary:          _hex(s.primary,         PRESET_THEMES[0].colors.primary),
            primaryDark:      _hex(s.primaryDark ?? s.primary, PRESET_THEMES[0].colors.primaryDark),
            primaryLight:     _hex(s.primaryLight ?? s.accent ?? s.primary, PRESET_THEMES[0].colors.primary),
            accentPink:       _hex(s.accentPink ?? s.primary, PRESET_THEMES[0].colors.accentPink),
            textPrimary:      _hex(s.textPrimary,     '#FFFFFF'),
            textSecondary:    _hex(s.textSecondary ?? s.textPrimary, '#C4B5FD'),
            textTertiary:     _hex(s.textTertiary ?? s.textSecondary, '#9CA3AF'),
            borderLight:      _hex(s.borderLight,     'rgba(255,255,255,0.10)'),
            border:           _hex(s.border ?? s.borderLight, 'rgba(255,255,255,0.14)'),
            cardBorder:       _hex(s.cardBorder ?? s.borderLight, 'rgba(255,255,255,0.10)'),
            success:          _hex(s.success,         '#10B981'),
            warning:          _hex(s.warning,         '#F59E0B'),
            info:             _hex(s.info ?? s.primaryLight, '#3B82F6'),
        };
    }, [serverData]);

    const e = useMemo(() => {
        const s = serverData?.effects ?? {};
        return {
            surfaceOpacity:    _num(s.surfaceOpacity,    0.72),
            borderOpacity:     _num(s.borderOpacity,     0.55),
            glassBlur:         _num(s.glassBlur,         24),
            navShadowOpacity:  _num(s.navShadowOpacity,  0.28),
            activeGlowOpacity: _num(s.activeGlowOpacity, 0.34),
            cardShadowOpacity: _num(s.cardShadowOpacity, 0.22),
            cardRadius:        _num(s.cardRadius,        18),
            buttonRadius:      _num(s.buttonRadius,      14),
            chipRadius:        _num(s.chipRadius,        999),
        };
    }, [serverData]);

    const previewStyle = useMemo<React.CSSProperties>(() => ({
        background: c.background,
        color: c.textPrimary,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    }), [c]);

    const cardStyle = useMemo<React.CSSProperties>(() => ({
        background: _withAlpha(c.cardSurface, e.surfaceOpacity),
        backdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
        WebkitBackdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
        border: `1px solid ${_withAlpha(c.cardBorder, e.borderOpacity)}`,
        borderRadius: `${e.cardRadius}px`,
        boxShadow: `0 10px 36px ${_withAlpha('#000000', e.cardShadowOpacity)}`,
        color: c.textPrimary,
    }), [c, e]);

    const primaryGradient = useMemo(() => (
        `linear-gradient(135deg, ${c.primary} 0%, ${c.accentPink} 50%, ${c.primaryDark} 100%)`
    ), [c]);

    const menuBg = useMemo(() => _withAlpha(c.surfaceContainer, e.surfaceOpacity), [c, e]);
    const glassBlurVal = useMemo(() => Math.min(40, Math.max(4, e.glassBlur)), [e]);
    const textSecondary = c.textSecondary;
    const textTertiary  = c.textTertiary;
    const chipRadius = `${e.chipRadius}px`;
    const buttonRadius = `${e.buttonRadius}px`;
    const cardRadius = `${e.cardRadius}px`;
    const surfaceLight = c.surfaceLight;
    const primary = c.primary;
    const primaryLight = c.primaryLight;
    const cardSurface = c.cardSurface;
    const cardBorder = c.cardBorder;
    const surfaceOpacity = e.surfaceOpacity;
    const borderOpacity = e.borderOpacity;

    const serverPrimaryPreview = useMemo<string>(() => {
        if (serverData?.features?.activeTemplateId && templates.length) {
            const t = templates.find(x => x.id === serverData.features!.activeTemplateId);
            if (t?.primaryPreview) return t.primaryPreview;
        }
        return c.primary;
    }, [serverData, templates, c.primary]);

    const serverBgPreview = useMemo<string>(() => {
        if (serverData?.features?.activeTemplateId && templates.length) {
            const t = templates.find(x => x.id === serverData.features!.activeTemplateId);
            if (t?.backgroundPreview) return t.backgroundPreview;
        }
        return c.background;
    }, [serverData, templates, c.background]);

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
            setMessage('✅ تم تطبيق القالب بنجاح! إعادة تحميل المعاينة...');
            await fetchAll(true);
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
            setMessage(`✅ تم تطبيق القالب الجاهز "${preset.name}" بنجاح! إعادة تحميل المعاينة...`);
            await fetchAll(true);
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
                <h1 className="text-3xl font-black text-m3-on-surface">إدارة قوالب المظهر والمعاينة الحية</h1>
                <div className="rounded-card bg-m3-surface-container p-8 text-center text-m3-on-surface-variant">
                    جاري تحميل الإعدادات والقوالب...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-m3-on-surface text-right">
                        إدارة قوالب المظهر والمعاينة الحية
                    </h1>
                    <p className="mt-2 text-lg text-m3-on-surface-variant text-right">
                        تغيّر الألوان والإعدادات → شاهد النتيجة فوراً على معاينة التطبيق على اليسار.
                    </p>
                </div>
                <Link
                    href="/admin/theme-settings"
                    className="rounded-button bg-m3-secondary-container px-5 py-2.5 font-medium text-m3-on-secondary-container shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                    تفاصيل الألوان الدقيقة →
                </Link>
            </div>

            {message && (
                <div className="rounded-card border border-m3-outline-variant bg-m3-tertiary-container px-5 py-3 font-medium text-m3-on-tertiary-container shadow-sm text-right">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-card border border-m3-error/30 bg-m3-error-container px-5 py-3 font-medium text-m3-on-error-container shadow-sm text-right">
                    ⚠️ {error}
                </div>
            )}

            {/* ====================================================== */}
            {/*  MAIN 2-COLUMN GRID: PHONE PREVIEW (LEFT) + SETTINGS (RIGHT) */}
            {/* ====================================================== */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

                {/* ========== LEFT / CENTER: LIVE PHONE PREVIEW (STICKY!) ========== */}
                <div className="xl:col-span-5">
                    <div className="sticky top-6 space-y-4">
                        <div className="rounded-2xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-6 w-6 rounded-full border-2 border-white shadow"
                                            style={{ backgroundColor: serverBgPreview }}
                                        />
                                        <div
                                            className="h-8 w-8 rounded-full border-2 border-white shadow"
                                            style={{ backgroundColor: serverPrimaryPreview }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-m3-on-background">معاينة التطبيق (مباشرة)</h3>
                                    <p className="mt-1 text-sm text-m3-on-surface-variant">
                                        تعكس الألوان، الزجاجية، الحدود، وشريط التنقل. كلما غيّرت شيئاً يظهر هنا!
                                    </p>
                                </div>
                            </div>

                            {/* iPhone Frame */}
                            <div className="mt-6 mx-auto w-[320px] overflow-hidden rounded-[36px] border border-m3-outline-variant bg-m3-on-surface p-2 shadow-2xl">
                                <div
                                    className="flex h-[620px] w-full flex-col overflow-hidden rounded-[28px]"
                                    style={previewStyle}
                                >
                                    {/* Status Bar */}
                                    <div
                                        className="flex items-center justify-between px-4 pt-4 pb-3 text-xs"
                                        style={{ color: _hex(c.textPrimary, '#FFFFFF'), opacity: 0.88 }}
                                    >
                                        <span>100%</span>
                                        <div className="flex items-center gap-1.5">
                                            <span>●●●●</span>
                                            <span>9:41</span>
                                        </div>
                                    </div>

                                    {/* Glass App Bar */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3"
                                        style={{
                                            background: _withAlpha(surfaceLight, 0.6),
                                            backdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                            WebkitBackdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                        }}
                                    >
                                        <div className="flex gap-2">
                                            <div
                                                className="h-7 w-7 rounded-full"
                                                style={{
                                                    background: _hex(c.surfaceContainer ?? c.surface, PRESET_THEMES[0].colors.surface),
                                                    border: `1px solid ${_hex(c.borderLight, 'rgba(255,255,255,0.12)')}`,
                                                }}
                                            />
                                            <div
                                                className="h-7 w-7 rounded-full"
                                                style={{
                                                    background: _hex(c.surfaceContainer ?? c.surface, PRESET_THEMES[0].colors.surface),
                                                    border: `1px solid ${_hex(c.borderLight, 'rgba(255,255,255,0.12)')}`,
                                                }}
                                            />
                                        </div>
                                        <div
                                            className="rounded-full px-3 py-1 text-xs"
                                            style={{
                                                background: _withAlpha(primary, 0.18),
                                                color: _hex(c.textPrimary, '#FFFFFF'),
                                                borderRadius: chipRadius,
                                            }}
                                        >
                                            مرحباً بك 👋
                                        </div>
                                    </div>

                                    {/* Hero */}
                                    <div className="px-4 pt-4 pb-3 text-right">
                                        <div className="text-lg font-bold leading-tight">اكتشف أحدث الإبداعات</div>
                                        <div className="mt-1 text-xs" style={{ color: textSecondary }}>
                                            اختر فئة أو ابحث عن مصوّر محترف بالقرب منك
                                        </div>
                                    </div>

                                    {/* Glass Search */}
                                    <div
                                        className="mx-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-right"
                                        style={{
                                            background: _withAlpha(cardSurface, surfaceOpacity),
                                            border: `1px solid ${_withAlpha(cardBorder, borderOpacity)}`,
                                            color: textTertiary,
                                            borderRadius: buttonRadius,
                                            backdropFilter: `blur(${glassBlurVal}px) saturate(1.3)`,
                                            WebkitBackdropFilter: `blur(${glassBlurVal}px) saturate(1.3)`,
                                        }}
                                    >
                                        <span className="text-xs flex-1">ابحث عن خدمة، مدينة، حسابات…</span>
                                        <span>🔍</span>
                                    </div>

                                    {/* Offers Grid */}
                                    <div className="mt-5 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-semibold" style={{ color: primaryLight }}>عرض الكل</div>
                                            <div className="text-xs" style={{ color: textSecondary }}>آخر العروض</div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-24 overflow-hidden border"
                                                    style={cardStyle}
                                                >
                                                    <div className="h-12 w-full" style={{ background: primaryGradient }} />
                                                    <div className="px-2 pt-2 text-right">
                                                        <div
                                                            className="text-[11px] font-semibold"
                                                            style={{ color: _hex(c.textPrimary ?? c.textPrimary, '#FFFFFF') }}
                                                        >
                                                            جلسة تصوير
                                                        </div>
                                                        <div className="text-[10px]" style={{ color: textTertiary }}>
                                                            بغداد · 50,000 د.ع
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Creators Status Card */}
                                    <div
                                        className="mt-5 mx-4 border px-4 py-3 text-right"
                                        style={cardStyle}
                                    >
                                        <div className="text-xs" style={{ color: textSecondary }}>حالة مبدعيّن اليوم</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: _withAlpha(_hex(c.success, '#10B981'), 0.16),
                                                    color: _hex(c.success, '#10B981'),
                                                }}
                                            >
                                                12 متاح
                                            </span>
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: _withAlpha(_hex(c.warning, '#F59E0B'), 0.16),
                                                    color: _hex(c.warning, '#F59E0B'),
                                                }}
                                            >
                                                3 محجوز جزئياً
                                            </span>
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: _withAlpha(_hex(c.info ?? c.primaryLight, '#3B82F6'), 0.16),
                                                    color: _hex(c.info ?? c.primaryLight, '#3B82F6'),
                                                }}
                                            >
                                                8 نشطون
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    {/* Bottom Nav Bar */}
                                    <div
                                        className="mx-3 mb-3 flex items-center justify-around px-2 py-2"
                                        style={{
                                            background: menuBg,
                                            borderTop: `1px solid ${_hex(c.borderLight, 'rgba(255,255,255,0.10)')}`,
                                            borderRadius: cardRadius,
                                            boxShadow: `0 -8px 26px ${_withAlpha(primary, e.navShadowOpacity)}`,
                                        }}
                                    >
                                        {NAV_ORDER.map((item, idx) => {
                                            const isActive = idx === activeNav;
                                            const ics = ['🏠', '🔍', '💎', '💬', '🟣'];
                                            return (
                                                <button
                                                    key={item.inKey}
                                                    type="button"
                                                    onClick={() => setActiveNav(idx)}
                                                    className="flex flex-1 flex-col items-center gap-1 py-1"
                                                    style={{
                                                        borderRadius: buttonRadius,
                                                        background: isActive
                                                            ? _withAlpha(primary, e.activeGlowOpacity)
                                                            : 'transparent',
                                                        boxShadow: isActive
                                                            ? `0 0 18px ${_withAlpha(primary, e.activeGlowOpacity * 0.7)}`
                                                            : 'none',
                                                    }}
                                                >
                                                    <div
                                                        className="h-[22px] w-[22px] flex items-center justify-center text-sm"
                                                        style={{ color: isActive ? primaryLight : textSecondary }}
                                                    >
                                                        {ics[idx]}
                                                    </div>
                                                    <span
                                                        className="text-[10px]"
                                                        style={{ color: isActive ? primaryLight : textSecondary }}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-right text-xs text-m3-on-surface-variant">
                                💡 هذه المعاينة مطابقة لما ستراه في تطبيق Flutter. للحصول على تفاصيل أدق (M3 85 لوناً) استخدم صفحة <Link className="font-semibold text-m3-primary underline" href="/admin/theme-settings">إعدادات مظهر التطبيق</Link>.
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== RIGHT / MAIN: SETTINGS + PRESETS + TEMPLATES ========== */}
                <div className="space-y-6 xl:col-span-7">

                    {/* === SECTION 1: FEATURES (الإعدادات العامة) === */}
                    <section className="rounded-2xl bg-m3-surface-container-high p-6 shadow-sm border border-m3-outline-variant">
                        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-m3-on-surface">الإعدادات العامة للمظهر</h2>
                                <p className="mt-1 text-m3-on-surface-variant">
                                    هذه الإعدادات تُطبّق مباشرةً في تطبيق Flutter خلال ثوانٍ (Dark/Light/System، الرسوم، الأيقونات، انتقالات الصفحات).
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4 text-right">
                                <div>
                                    <label className="mb-2 block font-bold text-m3-on-surface">وضع المظهر (Theme Mode)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {THEME_MODES.map(m => (
                                            <button
                                                key={m.value}
                                                type="button"
                                                onClick={() => setThemeMode(m.value)}
                                                className={`rounded-xl px-3 py-3 font-medium transition-all duration-200 ${
                                                    themeMode === m.value
                                                        ? 'bg-accent text-m3-on-accent shadow-md -translate-y-0.5'
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
                                            type="text"
                                            value={lightSeedPrimary}
                                            onChange={(e) => setLightSeedPrimary(e.target.value)}
                                            placeholder="#RRGGBB"
                                            className="flex-1 rounded-xl border border-m3-outline-variant bg-m3-surface px-4 py-2.5 font-mono text-m3-on-surface focus:border-accent focus:outline-none text-left"
                                        />
                                        <input
                                            type="color"
                                            value={lightSeedPrimary.startsWith('#') && /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(lightSeedPrimary) ? lightSeedPrimary : '#7C3AED'}
                                            onChange={(e) => setLightSeedPrimary(e.target.value)}
                                            className="h-12 w-16 cursor-pointer rounded-xl border border-m3-outline-variant bg-m3-surface-container p-1"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-m3-on-surface-variant">
                                        تولّد ألوان الوضع الفاتح تلقائياً من هذه البذرة.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block font-bold text-m3-on-surface">مكتبة الأيقونات الافتراضية</label>
                                    <select
                                        value={iconLibraryDefault ?? 'phosphor'}
                                        onChange={(e) => setIconLibraryDefault(e.target.value as any)}
                                        className="w-full rounded-xl border border-m3-outline-variant bg-m3-surface px-4 py-2.5 text-m3-on-surface focus:border-accent focus:outline-none text-right"
                                    >
                                        {ICON_LIBRARIES.map(lib => (
                                            <option key={lib.value} value={lib.value}>{lib.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4 rounded-xl bg-m3-surface-container px-4 py-3">
                                    <div dir="rtl" className="text-right flex-1">
                                        <div className="font-bold text-m3-on-surface">لون النظام الديناميكي (Android 12+)</div>
                                        <div className="text-sm text-m3-on-surface-variant">
                                            يأخذ ألوان خلفية الهاتف تلقائياً.
                                        </div>
                                    </div>
                                    <Toggle value={dynamicColorEnabled} onChange={setDynamicColorEnabled} />
                                </div>

                                <div className="flex items-center justify-between gap-4 rounded-xl bg-m3-surface-container px-4 py-3">
                                    <div dir="rtl" className="text-right flex-1">
                                        <div className="font-bold text-m3-on-surface">الرسوم المتحركة (Animations)</div>
                                        <div className="text-sm text-m3-on-surface-variant">
                                            تعطيلها يسرّع التطبيق على الأجهزة الضعيفة.
                                        </div>
                                    </div>
                                    <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} />
                                </div>

                                <div dir="rtl" className="text-right">
                                    <label className="mb-2 block font-bold text-m3-on-surface">نمط الانتقال بين الصفحات</label>
                                    <select
                                        value={pageTransitionStyle ?? 'cupertino'}
                                        onChange={(e) => setPageTransitionStyle(e.target.value as any)}
                                        disabled={!animationsEnabled}
                                        className="w-full rounded-xl border border-m3-outline-variant bg-m3-surface px-4 py-2.5 text-m3-on-surface focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-right"
                                    >
                                        {PAGE_TRANSITIONS.map(pt => (
                                            <option key={pt.value} value={pt.value}>
                                                {pt.label} — {pt.desc}
                                            </option>
                                        ))}
                                    </select>
                                    {!animationsEnabled && (
                                        <p className="mt-1 text-sm text-m3-on-surface-variant">
                                            💡 مُعطّل لأن الرسوم المتحركة متوقفة أعلاه.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={saveSettings}
                                        disabled={isSavingSettings}
                                        className="w-full rounded-xl bg-accent px-6 py-3 font-bold text-m3-on-accent shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {isSavingSettings ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات العامة'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* === SECTION 2: SAVE CURRENT === */}
                    <section className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-violet-50/60 via-surface-card to-fuchsia-50/60 p-6 shadow-sm">
                        <h2 className="text-2xl font-bold text-m3-on-surface text-right">حفظ المظهر الحالي كقالب خاص (A / B / C)</h2>
                        <p className="mt-1 mb-4 text-m3-on-surface-variant text-right">
                            احفظ كل الألوان + التأثيرات + الأيقونات باسم. بعدها يمكنك العودة بأي نقرة.
                        </p>
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentAsTemplate(); }}
                                placeholder="مثال: النسخة البنفسجية المحسنة / قالب رمضان / الخيار A..."
                                className="flex-1 rounded-xl border border-m3-outline-variant bg-m3-surface px-4 py-3 text-m3-on-surface text-right focus:border-accent focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={saveCurrentAsTemplate}
                                disabled={isSavingTemplate}
                                className="rounded-xl bg-m3-primary-container px-6 py-3 font-bold text-m3-on-primary-container shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isSavingTemplate ? '⏳ جاري الحفظ...' : '💾 حفظ كقالب جديد'}
                            </button>
                        </div>
                    </section>

                    {/* === SECTION 3: PRESETS (OLD STYLE 4-COLOR GRID!) === */}
                    <section className="rounded-2xl border border-m3-outline-variant/60 bg-surface-card p-6 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-m3-on-background text-2xl">قوالب جاهزة (Presets) — الأصلية</h3>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                اضغط على أي قالب ليتم توليد 85 لون + 10 تأثيرات وحفظها مباشرة في قاعدة البيانات للتطبيق!
                            </p>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                            {PRESET_THEMES.map((preset) => {
                                const isActive = serverPrimaryPreview === preset.colors.primary;
                                return (
                                    <div
                                        key={preset.key}
                                        className={`flex flex-col gap-2 rounded-2xl border p-2 transition ${
                                            isActive
                                                ? 'border-primary bg-accent/10 shadow'
                                                : 'border-m3-outline-variant/60 bg-m3-background/60 hover:border-primary/40 hover:bg-surface-card'
                                        }`}
                                    >
                                        <div
                                            className="grid h-16 w-full grid-cols-4 overflow-hidden rounded-lg border border-m3-outline-variant/60"
                                            style={{ background: preset.colors.background }}
                                        >
                                            <div style={{ background: preset.colors.primary }} />
                                            <div style={{ background: preset.colors.primaryDark }} />
                                            <div style={{ background: preset.colors.surface }} />
                                            <div style={{ background: preset.colors.accentPink }} />
                                        </div>
                                        <div className="w-full text-right">
                                            <div className="text-[12px] font-semibold text-m3-on-background">{preset.label}</div>
                                            <div className="text-[11px] text-m3-on-surface-variant">{preset.name}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => savePresetAsMyTemplate(preset)}
                                                disabled={isSavingTemplate}
                                                className="rounded-lg bg-m3-secondary-container px-2 py-1.5 text-[11px] font-bold text-m3-on-secondary-container transition hover:bg-m3-secondary-container/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                💾 حفظ لي
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applyPreset(preset)}
                                                disabled={isApplying !== null}
                                                className="rounded-lg bg-accent px-2 py-1.5 text-[11px] font-bold text-m3-on-accent transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                {isApplying === 'preset-' + preset.key ? '⏳' : '✅ تطبيق'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* === SECTION 4: MY TEMPLATES === */}
                    <section className="rounded-2xl border border-m3-outline-variant/60 bg-surface-card p-6 shadow-sm">
                        <div className="mb-5 text-right">
                            <h2 className="text-2xl font-bold text-m3-on-background">
                                قوالبك المحفوظة ({templates.filter(t => !t.isPreset).length})
                            </h2>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                النقر على تطبيق يكتب جميع الألوان مباشرة في قاعدة البيانات لتطبيق Flutter.
                            </p>
                        </div>
                        {templates.filter(t => !t.isPreset).length === 0 ? (
                            <div className="rounded-2xl bg-m3-surface-container px-6 py-12 text-center text-m3-on-surface-variant">
                                <div className="text-5xl mb-3">📂</div>
                                <div className="font-medium">لا توجد قوالب شخصية حتى الآن.</div>
                                <div className="text-sm mt-1">
                                    استخدم الحقل أعلاه لحفظ القالب الحالي، أو اضغط على "💾 حفظ لي" من إحدى القوالب الجاهزة.
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {templates.filter(t => !t.isPreset).map(tpl => (
                                    <div
                                        key={tpl.id}
                                        className="group flex flex-col gap-3 overflow-hidden rounded-2xl bg-m3-surface p-4 border border-m3-outline-variant transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div
                                            className="h-20 w-full rounded-lg flex items-center justify-center gap-2 shadow-inner"
                                            style={{
                                                background: `linear-gradient(135deg, ${tpl.backgroundPreview || serverBgPreview} 0%, ${tpl.backgroundPreview || serverBgPreview} 100%)`,
                                            }}
                                        >
                                            <div
                                                className="h-9 w-9 rounded-full border-2 border-white shadow"
                                                style={{ backgroundColor: tpl.backgroundPreview || serverBgPreview }}
                                            />
                                            <div
                                                className="h-11 w-11 rounded-full border-2 border-white shadow"
                                                style={{ backgroundColor: tpl.primaryPreview || serverPrimaryPreview }}
                                            />
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-m3-on-surface truncate">{tpl.name}</div>
                                            <div className="mt-0.5 text-xs text-m3-on-surface-variant">
                                                آخر تحديث: {new Date(tpl.updatedAt).toLocaleDateString('ar-SA')}
                                            </div>
                                            {tpl.description && (
                                                <div className="mt-1 text-xs text-m3-on-surface-variant line-clamp-2">
                                                    {tpl.description}
                                                </div>
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
                                                className="rounded-xl bg-accent px-3 py-2 text-sm font-bold text-m3-on-accent shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                {isApplying === tpl.id ? '⏳' : '✅ تطبيق'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteTemplate(tpl.id)}
                                                disabled={isDeleting !== null}
                                                className="rounded-xl bg-m3-error-container px-3 py-2 text-sm font-bold text-m3-on-error-container transition hover:bg-m3-error-container/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isDeleting === tpl.id ? '⏳' : '🗑️ حذف'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <footer className="pb-2 pt-1 text-center text-sm text-m3-on-surface-variant">
                        🚀 بعد تطبيق قالب جديد → افتح تطبيق Flutter واسحب للأسفل للتحديث. التغييرات تظهر فوراً!
                    </footer>
                </div>
            </div>
        </div>
    );
}
