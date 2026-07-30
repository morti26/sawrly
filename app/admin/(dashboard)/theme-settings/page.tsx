"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type ThemeColors = {
    primary: string | null;
    primaryLight: string | null;
    primaryDark: string | null;
    accentPink: string | null;
    background: string | null;
    surface: string | null;
    surfaceLight: string | null;
    menuBackground: string | null;
    textPrimary: string | null;
    textSecondary: string | null;
    textTertiary: string | null;
    success: string | null;
    warning: string | null;
    error: string | null;
    info: string | null;
    border: string | null;
    borderLight: string | null;
};

type NavIcons = {
    home: string | null;
    search: string | null;
    categories: string | null;
    orders: string | null;
    profile: string | null;
    homeActive: string | null;
    searchActive: string | null;
    categoriesActive: string | null;
    ordersActive: string | null;
    profileActive: string | null;
};

type ThemeEffects = {
    primaryGradientAngle: number | null;
    cardRadius: number | null;
    chipRadius: number | null;
    buttonRadius: number | null;
    navShadowOpacity: number | null;
    cardShadowOpacity: number | null;
    activeGlowOpacity: number | null;
    glassBlur: number | null;
    surfaceOpacity: number | null;
    borderOpacity: number | null;
};

type ThemeSettings = {
    colors: ThemeColors;
    navIcons: NavIcons;
    effects: ThemeEffects;
};

const EMPTY_COLORS: ThemeColors = {
    primary: null,
    primaryLight: null,
    primaryDark: null,
    accentPink: null,
    background: null,
    surface: null,
    surfaceLight: null,
    menuBackground: null,
    textPrimary: null,
    textSecondary: null,
    textTertiary: null,
    success: null,
    warning: null,
    error: null,
    info: null,
    border: null,
    borderLight: null,
};

const EMPTY_NAV_ICONS: NavIcons = {
    home: null,
    search: null,
    categories: null,
    orders: null,
    profile: null,
    homeActive: null,
    searchActive: null,
    categoriesActive: null,
    ordersActive: null,
    profileActive: null,
};

const EMPTY_EFFECTS: ThemeEffects = {
    primaryGradientAngle: null,
    cardRadius: null,
    chipRadius: null,
    buttonRadius: null,
    navShadowOpacity: null,
    cardShadowOpacity: null,
    activeGlowOpacity: null,
    glassBlur: null,
    surfaceOpacity: null,
    borderOpacity: null,
};

const DEFAULT_EFFECTS: Required<ThemeEffects> = {
    primaryGradientAngle: 135,
    cardRadius: 16,
    chipRadius: 999,
    buttonRadius: 12,
    navShadowOpacity: 0.18,
    cardShadowOpacity: 0.12,
    activeGlowOpacity: 0.22,
    glassBlur: 14,
    surfaceOpacity: 0.85,
    borderOpacity: 0.45,
};

const DEFAULT_COLORS: ThemeColors = {
    primary: "#9B4DFF",
    primaryLight: "#C48CFF",
    primaryDark: "#7230CC",
    accentPink: "#FF4DA6",
    background: "#46205A",
    surface: "#57246F",
    surfaceLight: "#6F2E8E",
    menuBackground: "#421B54",
    textPrimary: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textTertiary: "#707070",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    border: "#7B469C",
    borderLight: "#5E2B79",
};

type ColorField = keyof ThemeColors;
type NavIconField = keyof NavIcons;
type EffectField = keyof ThemeEffects;

const EFFECT_FIELDS: { key: EffectField; label: string; desc: string; min: number; max: number; step: number; suffix?: string }[] = [
    { key: "primaryGradientAngle", label: "زاوية التدرج الرئيسي", desc: "زاوية تدرج لون الأزرار والعناوين (0 - 360 درجة).", min: 0, max: 360, step: 1, suffix: "°" },
    { key: "cardRadius", label: "انحناء زوايا البطاقات", desc: "نصف قطر استدارة أزواج بطاقات العروض.", min: 0, max: 40, step: 1, suffix: "px" },
    { key: "chipRadius", label: "انحناء الأزرار الصغيرة", desc: "مثل حالة المبدعين وعلامات الترقيم.", min: 0, max: 60, step: 1, suffix: "px" },
    { key: "buttonRadius", label: "انحناء الأزرار الكبيرة", desc: "مثل زر حفظ المظهر.", min: 0, max: 40, step: 1, suffix: "px" },
    { key: "glassBlur", label: "ضبابية الزجاج (blur)", desc: "تأثير الضبابية الزجاجية على البطاقات والشرائط العلوية.", min: 0, max: 60, step: 1, suffix: "px" },
    { key: "surfaceOpacity", label: "شفافية البطاقات", desc: "كلما قلّت كان المظهر زجاجياً وأكثر شفافية.", min: 0.2, max: 1, step: 0.01 },
    { key: "borderOpacity", label: "شفافية الحواف الزجاجية", desc: "حواف بيضاء/ملونة رقيقة حول البطاقات لشكل زجاجي.", min: 0, max: 1, step: 0.01 },
    { key: "navShadowOpacity", label: "ظل شريط التنقل", desc: "تأثير الظل أسفل شريط التنقل السفلي.", min: 0, max: 1, step: 0.01 },
    { key: "cardShadowOpacity", label: "ظل البطاقات", desc: "تأثير الظل حول البطاقات الصغيرة.", min: 0, max: 1, step: 0.01 },
    { key: "activeGlowOpacity", label: "توهج الزر المفعّل", desc: "توهج خلف أيقونة القسم المفتوح.", min: 0, max: 1, step: 0.01 },
];

const PRESET_THEMES: { name: string; label: string; colors: ThemeColors }[] = [
    {
        name: "purple-dream",
        label: "حلم بنفسجي",
        colors: {
            primary: "#9B4DFF", primaryLight: "#C48CFF", primaryDark: "#7230CC", accentPink: "#FF4DA6",
            background: "#46205A", surface: "#57246F", surfaceLight: "#6F2E8E", menuBackground: "#421B54",
            textPrimary: "#FFFFFF", textSecondary: "#B0B0B0", textTertiary: "#707070",
            success: "#22C55E", warning: "#F59E0B", error: "#EF4444", info: "#3B82F6",
            border: "#7B469C", borderLight: "#5E2B79",
        },
    },
    {
        name: "ocean-teal",
        label: "محيط زرقاء",
        colors: {
            primary: "#10B981", primaryLight: "#6EE7B7", primaryDark: "#047857", accentPink: "#38BDF8",
            background: "#0B2830", surface: "#0F3441", surfaceLight: "#145063", menuBackground: "#0A2430",
            textPrimary: "#F4FAFA", textSecondary: "#A8C5CC", textTertiary: "#6C8891",
            success: "#34D399", warning: "#FBBF24", error: "#F87171", info: "#60A5FA",
            border: "#18606C", borderLight: "#114752",
        },
    },
    {
        name: "sunset-orange",
        label: "غروب برتقالي",
        colors: {
            primary: "#F97316", primaryLight: "#FDBA74", primaryDark: "#C2410C", accentPink: "#FB7185",
            background: "#2A1410", surface: "#3F1F18", surfaceLight: "#5D2E24", menuBackground: "#23120D",
            textPrimary: "#FFF7ED", textSecondary: "#FED7AA", textTertiary: "#C9996A",
            success: "#4ADE80", warning: "#FACC15", error: "#F43F5E", info: "#22D3EE",
            border: "#7C2D12", borderLight: "#54200E",
        },
    },
    {
        name: "royal-gold",
        label: "ذهبي ملكي",
        colors: {
            primary: "#EAB308", primaryLight: "#FDE68A", primaryDark: "#A16207", accentPink: "#F472B6",
            background: "#1C1917", surface: "#292524", surfaceLight: "#3F3A36", menuBackground: "#151312",
            textPrimary: "#FAFAF9", textSecondary: "#D6D3D1", textTertiary: "#A8A29E",
            success: "#4ADE80", warning: "#FACC15", error: "#FB7185", info: "#38BDF8",
            border: "#57534E", borderLight: "#44403C",
        },
    },
    {
        name: "snow-white",
        label: "ثلج ناصع (فاتح)",
        colors: {
            primary: "#7C3AED", primaryLight: "#A78BFA", primaryDark: "#5B21B6", accentPink: "#DB2777",
            background: "#F8FAFC", surface: "#FFFFFF", surfaceLight: "#F1F5F9", menuBackground: "#FFFFFF",
            textPrimary: "#0F172A", textSecondary: "#475569", textTertiary: "#94A3B8",
            success: "#16A34A", warning: "#D97706", error: "#DC2626", info: "#2563EB",
            border: "#E2E8F0", borderLight: "#F1F5F9",
        },
    },
    {
        name: "neon-cyber",
        label: "نيون سيبر",
        colors: {
            primary: "#22D3EE", primaryLight: "#67E8F9", primaryDark: "#0891B2", accentPink: "#F0ABFC",
            background: "#07091C", surface: "#0E1230", surfaceLight: "#181E4A", menuBackground: "#050714",
            textPrimary: "#E0F2FE", textSecondary: "#7DD3FC", textTertiary: "#3B82F6",
            success: "#34D399", warning: "#FBBF24", error: "#FB7185", info: "#A78BFA",
            border: "#1E3A8A", borderLight: "#172554",
        },
    },
];

const COLOR_FIELDS: { key: ColorField; label: string; desc: string }[] = [
    { key: "primary", label: "اللون الرئيسي", desc: "لون العلامة التجارية الأساسي." },
    { key: "primaryLight", label: "فاتح الرئيسي", desc: "نسخة فاتحة للزرز والتوهجات." },
    { key: "primaryDark", label: "داكن الرئيسي", desc: "نسخة داكنة للتدرجات." },
    { key: "accentPink", label: "وردي مميز", desc: "لون التأكيد الثانوي." },
    { key: "background", label: "خلفية التطبيق", desc: "لون الخلفية العام." },
    { key: "surface", label: "سطح البطاقات", desc: "بطاقات والمربعات." },
    { key: "surfaceLight", label: "سطح فاتح", desc: "أسطح بارزة مثل الرؤوس." },
    { key: "menuBackground", label: "خلفية القائمة", desc: "شريط التنقل السفلي." },
    { key: "textPrimary", label: "نص أساسي", desc: "لون العناوين والنصوص." },
    { key: "textSecondary", label: "نص ثانوي", desc: "وصف وتفاصيل." },
    { key: "textTertiary", label: "نص ثالث", desc: "ملاحظات صغيرة." },
    { key: "success", label: "نجاح", desc: "رسائل وحالات ناجحة." },
    { key: "warning", label: "تحذير", desc: "رسائل التحذير." },
    { key: "error", label: "خطأ", desc: "رسائل الخطأ." },
    { key: "info", label: "معلومات", desc: "رسائل معلوماتية." },
    { key: "border", label: "حُدود", desc: "حدود البطاقات." },
    { key: "borderLight", label: "حدود خفيفة", desc: "فواصل داخلية." },
];

const NAV_ICON_FIELDS: { key: NavIconField; label: string; desc: string }[] = [
    { key: "home", label: "الرئيسية غير المفعّلة", desc: "أيقونة الرئيسية في الشريط السفلي." },
    { key: "homeActive", label: "الرئيسية مفعّلة", desc: "عند فتح شاشة الرئيسية." },
    { key: "search", label: "البحث غير المفعّل", desc: "أيقونة البحث." },
    { key: "searchActive", label: "البحث مفعّل", desc: "عند فتح شاشة البحث." },
    { key: "categories", label: "الفئات غير المفعّلة", desc: "أيقونة الفئات." },
    { key: "categoriesActive", label: "الفئات مفعّلة", desc: "عند فتح الفئات." },
    { key: "orders", label: "الطلبات غير المفعّلة", desc: "أيقونة الطلبات." },
    { key: "ordersActive", label: "الطلبات مفعّلة", desc: "عند فتح الطلبات." },
    { key: "profile", label: "الملف غير المفعّل", desc: "أيقونة الحساب." },
    { key: "profileActive", label: "الملف مفعّل", desc: "عند فتح الحساب." },
];

const NAV_ORDER: { inKey: NavIconField; activeKey: NavIconField; label: string }[] = [
    { inKey: "home", activeKey: "homeActive", label: "الرئيسية" },
    { inKey: "search", activeKey: "searchActive", label: "البحث" },
    { inKey: "categories", activeKey: "categoriesActive", label: "الفئات" },
    { inKey: "orders", activeKey: "ordersActive", label: "الطلبات" },
    { inKey: "profile", activeKey: "profileActive", label: "الملف" },
];

function hexToCss(hex: string | null, fallback: string): string {
    if (!hex) return fallback;
    const trimmed = hex.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return trimmed;
    return fallback;
}

function colorToSixDigitHex(color: string): string {
    // Tar emot #RGB/#RRGGBB/#RRGGBBAA och returnerar alltid #RRGGBB (alpha tas bort).
    // Används för <input type=color> som endast accepterar #RRGGBB.
    const c = color.replace("#", "");
    const full =
        c.length === 3
            ? c.split("").map((x) => x + x).join("")
            : c.length === 8
              ? c.slice(0, 6)
              : c.length === 6
                ? c
                : "9B4DFF";
    return `#${full.slice(0, 6)}`;
}

function mixOnBackground(colorHex: string, mixWhite: number): string {
    const c = colorHex.replace("#", "");
    const full =
        c.length === 3
            ? c.split("").map((x) => x + x).join("")
            : c.length === 8
              ? c.slice(0, 6)
              : c;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const mix = (v: number) => Math.round(v + (255 - v) * mixWhite);
    return (
        "#" +
        [mix(r), mix(g), mix(b)]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("")
    );
}

function withAlpha(colorHex: string, alpha: number): string {
    const c = colorHex.replace("#", "");
    const full =
        c.length === 3
            ? c.split("").map((x) => x + x).join("")
            : c.length === 8
              ? c.slice(0, 6)
              : c;
    const alphaHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${full}${alphaHex}`;
}

export default function AdminThemeSettingsPage() {
    const [settings, setSettings] = useState<ThemeSettings>({
        colors: EMPTY_COLORS,
        navIcons: EMPTY_NAV_ICONS,
        effects: EMPTY_EFFECTS,
    });
    const [selectedFiles, setSelectedFiles] = useState<Partial<Record<NavIconField, File>>>({});
    const [previewUrls, setPreviewUrls] = useState<Partial<Record<NavIconField, string>>>({});
    const [colorInputs, setColorInputs] = useState<Partial<Record<ColorField, string>>>({});
    const [effectInputs, setEffectInputs] = useState<Partial<Record<EffectField, number>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeNav, setActiveNav] = useState(0);

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

    const effectiveColors = useMemo<ThemeColors>(() => {
        const next: any = { ...DEFAULT_COLORS };
        for (const key of Object.keys(EMPTY_COLORS) as ColorField[]) {
            const override = colorInputs[key];
            const hexFromSettings = settings.colors[key];
            const candidate = override ? override.trim() : hexFromSettings ? hexFromSettings.trim() : "";
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)) {
                next[key] = candidate;
            } else if (hexFromSettings && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hexFromSettings)) {
                next[key] = hexFromSettings;
            } else {
                next[key] = DEFAULT_COLORS[key];
            }
        }
        return next;
    }, [colorInputs, settings.colors]);

    const effectiveEffects = useMemo<Required<ThemeEffects>>(() => {
        const next: any = { ...DEFAULT_EFFECTS };
        for (const key of Object.keys(EMPTY_EFFECTS) as EffectField[]) {
            const override = effectInputs[key];
            const fromSettings = settings.effects[key];
            if (typeof override === "number" && Number.isFinite(override)) {
                next[key] = override;
            } else if (typeof fromSettings === "number" && Number.isFinite(fromSettings)) {
                next[key] = fromSettings;
            } else {
                next[key] = DEFAULT_EFFECTS[key];
            }
        }
        return next;
    }, [effectInputs, settings.effects]);

    const effectiveNavIcons = useMemo<NavIcons>(() => {
        const next: any = { ...settings.navIcons };
        for (const key of Object.keys(EMPTY_NAV_ICONS) as NavIconField[]) {
            const preview = previewUrls[key];
            if (preview) next[key] = preview;
        }
        return next;
    }, [previewUrls, settings.navIcons]);

    async function loadSettings() {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("جلسة الأدمن غير متاحة. أعد تسجيل الدخول.");
            const res = await fetch("/api/admin/theme-settings", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "فشل تحميل إعدادات المظهر");
            const colors = { ...EMPTY_COLORS, ...(data?.colors ?? {}) };
            const navIcons = { ...EMPTY_NAV_ICONS, ...(data?.navIcons ?? {}) };
            const effects = { ...EMPTY_EFFECTS, ...(data?.effects ?? {}) };
            setSettings({ colors, navIcons, effects });
            const inputs: Partial<Record<ColorField, string>> = {};
            for (const f of COLOR_FIELDS) {
                const v = colors[f.key];
                if (v) inputs[f.key] = v;
            }
            setColorInputs(inputs);
            const eff: Partial<Record<EffectField, number>> = {};
            for (const f of EFFECT_FIELDS) {
                const raw = effects[f.key];
                if (typeof raw === "number" && Number.isFinite(raw)) eff[f.key] = raw;
            }
            setEffectInputs(eff);
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    }

    function handleColorChange(key: ColorField, value: string) {
        setError(null);
        setMessage(null);
        setColorInputs((prev) => ({ ...prev, [key]: value }));
    }

    function handleEffectChange(key: EffectField, raw: number) {
        setError(null);
        setMessage(null);
        const meta = EFFECT_FIELDS.find((f) => f.key === key);
        const value = meta
            ? Math.min(meta.max, Math.max(meta.min, raw))
            : raw;
        setEffectInputs((prev) => ({ ...prev, [key]: value }));
    }

    function handleResetEffect(key: EffectField) {
        setError(null);
        setMessage(null);
        setEffectInputs((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setSettings((prev) => ({
            ...prev,
            effects: { ...prev.effects, [key]: null },
        }));
    }

    function handleApplyPreset(preset: (typeof PRESET_THEMES)[number]) {
        setError(null);
        setMessage(null);
        const inputs: Partial<Record<ColorField, string>> = {};
        for (const f of COLOR_FIELDS) {
            const v = preset.colors[f.key];
            if (v) inputs[f.key] = v;
        }
        setColorInputs(inputs);
        setSettings((prev) => ({ ...prev, colors: { ...preset.colors } }));
    }

    function handleFileChange(key: NavIconField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        setMessage(null);
        setError(null);
        setSelectedFiles((prev) => ({ ...prev, [key]: file }));
        setPreviewUrls((prev) => {
            const current = prev[key];
            if (current) URL.revokeObjectURL(current);
            return { ...prev, [key]: URL.createObjectURL(file) };
        });
    }

    function handleRemoveColor(key: ColorField) {
        setError(null);
        setMessage(null);
        setColorInputs((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setSettings((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: null },
        }));
    }

    function handleRemoveIcon(key: NavIconField) {
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
        setSettings((prev) => ({
            ...prev,
            navIcons: { ...prev.navIcons, [key]: null },
        }));
    }

    async function uploadFile(file: File, token: string): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subDir", "theme-icons");
        const res = await fetch("/api/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data?.url) {
            throw new Error(data?.error || "فشل رفع أيقونة التنقل");
        }
        return data.url as string;
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("جلسة الأدمن غير متاحة. أعد تسجيل الدخول.");

            const nextColors: Partial<ThemeColors> = {};
            for (const f of COLOR_FIELDS) {
                const raw = colorInputs[f.key];
                if (raw == null) {
                    nextColors[f.key] = settings.colors[f.key] ?? null;
                    continue;
                }
                const trimmed = raw.trim();
                if (trimmed.length === 0) {
                    nextColors[f.key] = null;
                } else if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
                    nextColors[f.key] = trimmed;
                } else {
                    nextColors[f.key] = settings.colors[f.key] ?? null;
                }
            }

            const nextEffects: Partial<ThemeEffects> = {};
            for (const f of EFFECT_FIELDS) {
                const raw = effectInputs[f.key];
                if (typeof raw === "number" && Number.isFinite(raw)) {
                    nextEffects[f.key] = raw;
                } else {
                    nextEffects[f.key] = settings.effects[f.key] ?? null;
                }
            }

            const nextNavIcons: Partial<NavIcons> = { ...settings.navIcons };
            for (const f of NAV_ICON_FIELDS) {
                const file = selectedFiles[f.key];
                if (file) nextNavIcons[f.key] = await uploadFile(file, token);
            }

            const res = await fetch("/api/admin/theme-settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ colors: nextColors, navIcons: nextNavIcons, effects: nextEffects }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "فشل حفظ إعدادات المظهر");

            setSettings({
                colors: { ...EMPTY_COLORS, ...(data?.colors ?? {}) },
                navIcons: { ...EMPTY_NAV_ICONS, ...(data?.navIcons ?? {}) },
                effects: { ...EMPTY_EFFECTS, ...(data?.effects ?? {}) },
            });
            const cleanInputs: Partial<Record<ColorField, string>> = {};
            for (const f of COLOR_FIELDS) {
                const v = data?.colors?.[f.key];
                if (v) cleanInputs[f.key] = v;
            }
            setColorInputs(cleanInputs);
            const cleanEff: Partial<Record<EffectField, number>> = {};
            for (const f of EFFECT_FIELDS) {
                const v = data?.effects?.[f.key];
                if (typeof v === "number" && Number.isFinite(v)) cleanEff[f.key] = v;
            }
            setEffectInputs(cleanEff);
            setSelectedFiles({});
            Object.values(previewUrls).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
            setPreviewUrls({});
            setMessage("تم حفظ إعدادات المظهر بنجاح — افتح التطبيق لتجد التغييرات فوراً (أو انسحب للتحديث).");
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
        } finally {
            setSaving(false);
        }
    }

    const c = effectiveColors;
    const _mergeE: any = { ...DEFAULT_EFFECTS, ...(effectiveEffects as any) };
    const e = _mergeE as {
        primaryGradientAngle: number; cardRadius: number; chipRadius: number;
        buttonRadius: number; navShadowOpacity: number; cardShadowOpacity: number;
        activeGlowOpacity: number; glassBlur: number;
        surfaceOpacity: number; borderOpacity: number;
    };
    const previewStyle: React.CSSProperties = {
        background: `linear-gradient(160deg, ${hexToCss(
            c.background,
            DEFAULT_COLORS.background!
        )} 0%, ${hexToCss(c.primaryDark, DEFAULT_COLORS.primaryDark!)} 55%, ${hexToCss(
            c.accentPink,
            DEFAULT_COLORS.accentPink!
        )} 110%)`,
        color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!),
        borderColor: hexToCss(c.border, DEFAULT_COLORS.border!),
        position: "relative",
    };
    const cardRadius = `${e.cardRadius}px`;
    const chipRadiusVal = e.chipRadius;
    const chipRadius = chipRadiusVal >= 999 ? "9999px" : `${chipRadiusVal}px`;
    const buttonRadius = `${e.buttonRadius}px`;
    const glassBlurVal = `${e.glassBlur}px`;
    const cardSurface = hexToCss(c.surface, DEFAULT_COLORS.surface!);
    const cardBorder = hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!);
    const cardStyle: React.CSSProperties = {
        background: withAlpha(cardSurface, e.surfaceOpacity),
        border: `1px solid ${withAlpha(cardBorder, e.borderOpacity)}`,
        borderRadius: cardRadius,
        boxShadow: `0 6px 18px ${withAlpha("#000000", e.cardShadowOpacity)}`,
        backdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
        WebkitBackdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
    };
    const menuBg = withAlpha(
        hexToCss(c.menuBackground, DEFAULT_COLORS.menuBackground!),
        e.surfaceOpacity
    );
    const primary = hexToCss(c.primary, DEFAULT_COLORS.primary!);
    const primaryLight = hexToCss(c.primaryLight, DEFAULT_COLORS.primaryLight!);
    const primaryDark = hexToCss(c.primaryDark, DEFAULT_COLORS.primaryDark!);
    const primaryGradient = `linear-gradient(${e.primaryGradientAngle}deg, ${primary}, ${primaryDark})`;
    const surfaceLight = hexToCss(c.surfaceLight, DEFAULT_COLORS.surfaceLight!);
    const textSecondary = hexToCss(c.textSecondary, DEFAULT_COLORS.textSecondary!);
    const textTertiary = hexToCss(c.textTertiary, DEFAULT_COLORS.textTertiary!);

    return (
        <div dir="rtl" className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-right text-2xl font-bold">إعدادات مظهر التطبيق</h2>
                <p className="text-right text-sm text-slate-600">
                    هنا تحدد ألوان التطبيق بشكل مباشر وتبدّل أيقونات شريط التنقل السفلي. الجانب
                    الأيسر (أو الأعلى على الهاتف) يعرض نسخة توضيحية من الشاشة الرئيسية مع
                    القيم الجديدة قبل الحفظ.
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <div className="sticky top-6 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900">معاينة التطبيق</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        هذه نسخة توضيحية لشكل الشاشة الرئيسية مع الألوان
                                        الحالية. تغيّر اللون في المربعات اليمنى لتجد فرقها فوراً
                                        هنا قبل الحفظ.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 mx-auto w-[320px] overflow-hidden rounded-[36px] border border-slate-300 bg-black p-2 shadow-xl">
                                <div
                                    className="flex h-[620px] flex-col overflow-hidden rounded-[28px]"
                                    style={previewStyle}
                                >
                                    <div
                                        className="flex items-center justify-between px-4 pt-4 pb-3 text-xs"
                                        style={{
                                            color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!),
                                            opacity: 0.85,
                                        }}
                                    >
                                        <span>9:41</span>
                                        <div className="flex items-center gap-1">
                                            <span>●●●●</span>
                                            <span>100%</span>
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center justify-between px-4 py-3"
                                        style={{
                                            background: withAlpha(surfaceLight, 0.6),
                                            backdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                            WebkitBackdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                        }}
                                    >
                                        <div
                                            className="rounded-full px-3 py-1 text-xs"
                                            style={{
                                                background: withAlpha(primary, 0.18),
                                                color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!),
                                                borderRadius: chipRadius,
                                            }}
                                        >
                                            مرحباً بك 👋
                                        </div>
                                        <div className="flex gap-2">
                                            <div
                                                className="h-7 w-7 rounded-full"
                                                style={{
                                                    background: hexToCss(c.surface, DEFAULT_COLORS.surface!),
                                                    border: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                                }}
                                            />
                                            <div
                                                className="h-7 w-7 rounded-full"
                                                style={{
                                                    background: hexToCss(c.surface, DEFAULT_COLORS.surface!),
                                                    border: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="px-4 pt-4 pb-3 text-right">
                                        <div className="text-lg font-bold leading-tight">
                                            اكتشف أحدث الإبداعات
                                        </div>
                                        <div className="mt-1 text-xs" style={{ color: textSecondary }}>
                                            اختر فئة أو ابحث عن مصوّر محترف بالقرب منك
                                        </div>
                                    </div>

                                    <div
                                        className="mx-4 flex items-center gap-2 rounded-2xl px-3 py-2"
                                        style={{
                                            background: withAlpha(cardSurface, e.surfaceOpacity),
                                            border: `1px solid ${withAlpha(cardBorder, e.borderOpacity)}`,
                                            color: textTertiary,
                                            borderRadius: buttonRadius,
                                            backdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
                                            WebkitBackdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
                                        }}
                                    >
                                        <span>🔍</span>
                                        <span className="text-xs">ابحث عن خدمة، مدينة، حسابات…</span>
                                    </div>

                                    <div className="mt-5 px-4">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="text-xs"
                                                style={{ color: textSecondary }}
                                            >
                                                آخر العروض
                                            </div>
                                            <div
                                                className="text-xs font-semibold"
                                                style={{ color: primaryLight }}
                                            >
                                                عرض الكل
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-24 overflow-hidden border"
                                                    style={cardStyle}
                                                >
                                                    <div
                                                        className="h-12 w-full"
                                                        style={{ background: primaryGradient }}
                                                    />
                                                    <div className="px-2 pt-2 text-right">
                                                        <div
                                                            className="text-[11px] font-semibold"
                                                            style={{
                                                                color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!),
                                                            }}
                                                        >
                                                            جلسة تصوير
                                                        </div>
                                                        <div
                                                            className="text-[10px]"
                                                            style={{ color: textTertiary }}
                                                        >
                                                            بغداد · 50,000 د.ع
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        className="mt-5 mx-4 border px-4 py-3 text-right"
                                        style={cardStyle}
                                    >
                                        <div
                                            className="text-xs"
                                            style={{ color: textSecondary }}
                                        >
                                            حالة مبدعيّن اليوم
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: withAlpha(
                                                        hexToCss(c.success, DEFAULT_COLORS.success!),
                                                        0.16
                                                    ),
                                                    color: hexToCss(c.success, DEFAULT_COLORS.success!),
                                                }}
                                            >
                                                12 متاح
                                            </span>
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: withAlpha(
                                                        hexToCss(c.warning, DEFAULT_COLORS.warning!),
                                                        0.16
                                                    ),
                                                    color: hexToCss(c.warning, DEFAULT_COLORS.warning!),
                                                }}
                                            >
                                                3 محجوز جزئياً
                                            </span>
                                            <span
                                                className="px-2 py-1 text-[10px]"
                                                style={{
                                                    borderRadius: chipRadius,
                                                    background: withAlpha(
                                                        hexToCss(c.info, DEFAULT_COLORS.info!),
                                                        0.16
                                                    ),
                                                    color: hexToCss(c.info, DEFAULT_COLORS.info!),
                                                }}
                                            >
                                                8 نشطون
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    <div
                                        className="mx-3 mb-3 flex items-center justify-around px-2 py-2"
                                        style={{
                                            background: menuBg,
                                            borderTop: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                            borderRadius: cardRadius,
                                            boxShadow: `0 -8px 26px ${withAlpha(primary, e.navShadowOpacity)}`,
                                        }}
                                    >
                                        {NAV_ORDER.map((item, idx) => {
                                            const isActive = idx === activeNav;
                                            const iconUrl = isActive
                                                ? effectiveNavIcons[item.activeKey]
                                                : effectiveNavIcons[item.inKey];
                                            return (
                                                <button
                                                    key={item.inKey}
                                                    type="button"
                                                    onClick={() => setActiveNav(idx)}
                                                    className="flex flex-1 flex-col items-center gap-1 py-1"
                                                    style={{
                                                        borderRadius: buttonRadius,
                                                        background: isActive
                                                            ? withAlpha(primary, e.activeGlowOpacity)
                                                            : "transparent",
                                                        boxShadow: isActive
                                                            ? `0 0 18px ${withAlpha(primary, e.activeGlowOpacity * 0.7)}`
                                                            : "none",
                                                    }}
                                                >
                                                    {iconUrl ? (
                                                        <Image
                                                            src={iconUrl}
                                                            alt={item.label}
                                                            width={22}
                                                            height={22}
                                                            className="h-[22px] w-[22px] object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div
                                                            className="h-[22px] w-[22px] rounded-md"
                                                            style={{
                                                                background: isActive
                                                                    ? primary
                                                                    : hexToCss(c.textSecondary, DEFAULT_COLORS.textSecondary!),
                                                            }}
                                                        />
                                                    )}
                                                    <span
                                                        className="text-[10px]"
                                                        style={{
                                                            color: isActive
                                                                ? primaryLight
                                                                : textSecondary,
                                                        }}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-right text-xs text-slate-500">
                                ملاحظة: أي لون تركه فارغاً سيعود للون الافتراضي في التطبيق.
                                الأيقونات المفعّلة في الشريط السفلي هي التي تظهر عند تحديد
                                القسم.
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => void loadSettings()}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    إعادة التحميل
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleSave()}
                                    disabled={saving || loading}
                                    className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
                                >
                                    {saving ? "جارٍ الحفظ..." : "حفظ المظهر والأيقونات"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-slate-900">قوالب جاهزة</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                اضغط على أي قالب لتطبيقه فوراً على جميع الألوان — ثم عدّل التفاصيل
                                فيما بعد.
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                            {PRESET_THEMES.map((preset) => {
                                const isActive = COLOR_FIELDS.every(
                                    (f) =>
                                        (colorInputs[f.key] ??
                                            settings.colors[f.key] ??
                                            DEFAULT_COLORS[f.key]) === preset.colors[f.key]
                                );
                                return (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => handleApplyPreset(preset)}
                                        className={`group flex flex-col items-center gap-2 rounded-xl border p-2 text-right transition ${
                                            isActive
                                                ? "border-purple-500 bg-purple-50/70 shadow"
                                                : "border-slate-200 bg-slate-50/60 hover:border-purple-300 hover:bg-white"
                                        }`}
                                    >
                                        <div
                                            className="grid h-16 w-full grid-cols-4 overflow-hidden rounded-lg border border-slate-200"
                                            style={{ background: preset.colors.background ?? undefined }}
                                        >
                                            <div style={{ background: preset.colors.primary ?? undefined }} />
                                            <div style={{ background: preset.colors.primaryDark ?? undefined }} />
                                            <div style={{ background: preset.colors.surface ?? undefined }} />
                                            <div style={{ background: preset.colors.accentPink ?? undefined }} />
                                        </div>
                                        <div className="w-full text-right text-[12px] font-semibold text-slate-900">
                                            {preset.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-slate-900">ألوان التطبيق</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                اضغط على المربع اللوني الكبير لاختيار اللون مباشرة، أو اكتب الرمز
                                إن أردت الدقة. المعاينة على اليسار تتحدّث فوراً.
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {COLOR_FIELDS.map((field) => {
                                const current = colorInputs[field.key] ?? "";
                                const effective = hexToCss(
                                    effectiveColors[field.key],
                                    DEFAULT_COLORS[field.key]!
                                );
                                const isOverriding = current.length > 0 || settings.colors[field.key];
                                const pickerValue = colorToSixDigitHex(effective);
                                return (
                                    <div
                                        key={field.key}
                                        className="flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-right"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {field.label}
                                                </div>
                                                <div className="mt-1 text-[11px] text-slate-500">
                                                    {field.desc}
                                                </div>
                                            </div>
                                            <label className="relative block shrink-0 cursor-pointer">
                                                <input
                                                    type="color"
                                                    value={pickerValue}
                                                    onChange={(e) =>
                                                        handleColorChange(field.key, e.target.value)
                                                    }
                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                />
                                                <div
                                                    className="h-16 w-28 overflow-hidden rounded-xl border border-slate-200 shadow-inner transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                    style={{
                                                        background: isOverriding
                                                            ? `linear-gradient(135deg, ${effective}, ${mixOnBackground(effective, 0.18)})`
                                                            : effective,
                                                    }}
                                                    title="اختر اللون"
                                                >
                                                    <div className="flex h-full items-end justify-start p-1.5">
                                                        <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono tracking-wide text-white">
                                                            {pickerValue}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        <div
                                            dir="ltr"
                                            className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100"
                                        >
                                            <label className="relative block shrink-0 cursor-pointer border-r border-slate-200 bg-slate-50/70 px-2.5 py-2">
                                                <input
                                                    type="color"
                                                    value={pickerValue}
                                                    onChange={(e) =>
                                                        handleColorChange(field.key, e.target.value)
                                                    }
                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-8 w-8 rounded-md border border-slate-300 shadow-inner"
                                                        style={{ background: pickerValue }}
                                                    />
                                                    <span className="hidden text-[10px] font-medium text-slate-500 sm:inline">
                                                        اختر
                                                    </span>
                                                </div>
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="text"
                                                dir="ltr"
                                                placeholder="#9B4DFF"
                                                value={current}
                                                onChange={(e) =>
                                                    handleColorChange(field.key, e.target.value)
                                                }
                                                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-sm font-mono text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(field.key)}
                                            className="self-start rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 transition hover:bg-slate-100"
                                        >
                                            إرجاع للافتراضي
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-slate-900">تأثيرات وتفاصيل التصميم</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                حرّك المؤشرات لتجربة التدرجات، حواف البطاقات، ظلال الأزرار، وتوهج
                                القسم المفعّل.
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
                            {EFFECT_FIELDS.map((field) => {
                                const raw = effectInputs[field.key];
                                const value: number =
                                    (typeof raw === "number" && Number.isFinite(raw)
                                        ? raw
                                        : (settings.effects[field.key] ?? DEFAULT_EFFECTS[field.key])) ?? 0;
                                const preview =
                                    field.key === "primaryGradientAngle"
                                        ? `linear-gradient(${value}deg, ${primary}, ${primaryDark})`
                                        : undefined;
                                const isOverriding =
                                    typeof raw === "number" && Number.isFinite(raw);
                                return (
                                    <div
                                        key={field.key}
                                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-right"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {field.label}
                                                </div>
                                                <div className="mt-1 text-[11px] text-slate-500">
                                                    {field.desc}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-mono text-slate-900"
                                                    dir="ltr"
                                                >
                                                    {field.key.includes("Opacity")
                                                        ? value.toFixed(2)
                                                        : value}
                                                    {field.suffix ?? ""}
                                                </div>
                                                {preview ? (
                                                    <div
                                                        className="h-10 w-10 rounded-lg border border-slate-200"
                                                        style={{ background: preview }}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={field.min}
                                                max={field.max}
                                                step={field.step}
                                                value={value}
                                                onChange={(e) =>
                                                    handleEffectChange(
                                                        field.key,
                                                        parseFloat(e.target.value)
                                                    )
                                                }
                                                className="h-2 flex-1 cursor-pointer accent-purple-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleResetEffect(field.key)}
                                                disabled={!isOverriding}
                                                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                افتراضي
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-slate-900">أيقونات شريط التنقل السفلي</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                لكل زر حالتان: عادية (غير محدّدة) ومفعّلة (عند فتح القسم). يمكنك
                                رفع PNG/WEBP شفاف بحجم 48x48 تقريباً. إذا تركتها فارغة يستخدم
                                التطبيق الأيقونات الافتراضية.
                            </p>
                        </div>

                        <div className="mt-4 space-y-4">
                            {NAV_ORDER.map((pair) => {
                                const inactive = NAV_ICON_FIELDS.find((f) => f.key === pair.inKey)!;
                                const active = NAV_ICON_FIELDS.find((f) => f.key === pair.activeKey)!;
                                const inactiveUrl =
                                    previewUrls[pair.inKey] ?? settings.navIcons[pair.inKey] ?? null;
                                const activeUrl =
                                    previewUrls[pair.activeKey] ??
                                    settings.navIcons[pair.activeKey] ??
                                    null;
                                return (
                                    <div
                                        key={pair.inKey}
                                        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2"
                                    >
                                        <div className="space-y-3 text-right">
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {pair.label} — عادية
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {inactive.desc}
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <div
                                                    className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300"
                                                    style={{
                                                        background: hexToCss(
                                                            c.menuBackground,
                                                            DEFAULT_COLORS.menuBackground!
                                                        ),
                                                    }}
                                                >
                                                    {inactiveUrl ? (
                                                        <Image
                                                            src={inactiveUrl}
                                                            alt={inactive.label}
                                                            width={64}
                                                            height={64}
                                                            className="h-16 w-16 object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <span className="text-center text-[11px] text-slate-300">
                                                            لا توجد أيقونة
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-800">
                                                    اختر أيقونة عادية
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/webp,image/jpeg"
                                                        className="hidden"
                                                        onChange={(event) =>
                                                            handleFileChange(pair.inKey, event)
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIcon(pair.inKey)}
                                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                                >
                                                    إزالة الأيقونة العادية
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-right">
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {pair.label} — مفعّلة
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {active.desc}
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <div
                                                    className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed"
                                                    style={{
                                                        background: withAlpha(primary, 0.18),
                                                        borderColor: hexToCss(
                                                            c.primaryLight,
                                                            DEFAULT_COLORS.primaryLight!
                                                        ),
                                                    }}
                                                >
                                                    {activeUrl ? (
                                                        <Image
                                                            src={activeUrl}
                                                            alt={active.label}
                                                            width={64}
                                                            height={64}
                                                            className="h-16 w-16 object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <span className="text-center text-[11px] text-slate-300">
                                                            لا توجد أيقونة مفعّلة
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-purple-700">
                                                    اختر أيقونة مفعّلة
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/webp,image/jpeg"
                                                        className="hidden"
                                                        onChange={(event) =>
                                                            handleFileChange(pair.activeKey, event)
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIcon(pair.activeKey)}
                                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                                >
                                                    إزالة الأيقونة المفعّلة
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
                    جارٍ تحميل إعدادات المظهر...
                </div>
            ) : null}
        </div>
    );
}
