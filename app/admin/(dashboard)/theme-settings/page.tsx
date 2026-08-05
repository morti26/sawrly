"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import * as Pi from "@phosphor-icons/react";

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
    homeId: string | null;
    searchId: string | null;
    categoriesId: string | null;
    ordersId: string | null;
    profileId: string | null;
    homeActiveId: string | null;
    searchActiveId: string | null;
    categoriesActiveId: string | null;
    ordersActiveId: string | null;
    profileActiveId: string | null;
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
    homeId: null,
    searchId: null,
    categoriesId: null,
    ordersId: null,
    profileId: null,
    homeActiveId: null,
    searchActiveId: null,
    categoriesActiveId: null,
    ordersActiveId: null,
    profileActiveId: null,
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

const NAV_ICON_ID_FIELDS: { key: NavIconField; label: string; desc: string }[] = [
    { key: "homeId", label: "الرئيسية عادية (ID)", desc: "معرف Phosphor للحالة العادية." },
    { key: "homeActiveId", label: "الرئيسية مفعّلة (ID)", desc: "معرف Phosphor عند فتح الرئيسية." },
    { key: "searchId", label: "البحث عادي (ID)", desc: "معرف Phosphor للبحث العادي." },
    { key: "searchActiveId", label: "البحث مفعّل (ID)", desc: "معرف Phosphor عند فتح البحث." },
    { key: "categoriesId", label: "الفئات عادية (ID)", desc: "معرف Phosphor للفئات العادي." },
    { key: "categoriesActiveId", label: "الفئات مفعّلة (ID)", desc: "معرف Phosphor عند فتح الفئات." },
    { key: "ordersId", label: "الطلبات عادي (ID)", desc: "معرف Phosphor للطلبات العادي." },
    { key: "ordersActiveId", label: "الطلبات مفعّلة (ID)", desc: "معرف Phosphor عند فتح الطلبات." },
    { key: "profileId", label: "الملف عادي (ID)", desc: "معرف Phosphor للحساب العادي." },
    { key: "profileActiveId", label: "الملف مفعّل (ID)", desc: "معرف Phosphor عند فتح الحساب." },
];

const PHOSPHOR_WEIGHTS: { key: string; label: string }[] = [
    { key: "thin", label: "رفيع جداً" },
    { key: "light", label: "رفيع" },
    { key: "regular", label: "عادي" },
    { key: "bold", label: "عريض" },
    { key: "fill", label: "مملوء" },
    { key: "duotone", label: "ثنائي اللون" },
];

const PHOSPHOR_ICONS: { name: string; label: string }[] = [
    { name: "house", label: "منزل" },
    { name: "magnifying-glass", label: "بحث" },
    { name: "squares-four", label: "فئات" },
    { name: "shopping-bag", label: "طلبات" },
    { name: "user", label: "ملف شخصي" },
    { name: "heart", label: "حب" },
    { name: "star", label: "نجمة" },
    { name: "gem", label: "ماس" },
    { name: "compass", label: "بوصلة" },
    { name: "bell", label: "جرس" },
    { name: "bookmark", label: "حفظ" },
    { name: "bolt", label: "صاعقة" },
    { name: "gift", label: "هدية" },
    { name: "chat-circle", label: "دردشة" },
    { name: "calendar", label: "تقويم" },
    { name: "map-pin", label: "موقع" },
    { name: "shopping-cart", label: "عربة" },
    { name: "crown", label: "تاج" },
    { name: "flame", label: "لهب" },
    { name: "camera", label: "كاميرا" },
    { name: "music-note", label: "موسيقى" },
    { name: "film-strip", label: "فيلم" },
    { name: "headphones", label: "سماعات" },
    { name: "game-controller", label: "لعبة" },
    { name: "wallet", label: "محفظة" },
    { name: "credit-card", label: "بطاقة" },
    { name: "ticket", label: "تذكرة" },
    { name: "couch", label: "أريكة" },
    { name: "car", label: "سيارة" },
    { name: "airplane", label: "طائرة" },
    { name: "briefcase", label: "حقيبة عمل" },
    { name: "paw-print", label: "حيوان" },
    { name: "leaf", label: "ورقة" },
    { name: "sun", label: "شمس" },
    { name: "moon", label: "قمر" },
    { name: "sparkle", label: "بريق" },
    { name: "fire", label: "نار" },
    { name: "lightbulb", label: "مصباح" },
    { name: "rocket", label: "صاروخ" },
    { name: "trophy", label: "كأس" },
    { name: "award", label: "جائزة" },
    { name: "scissors", label: "مقص" },
    { name: "scooter", label: "سكوتر" },
    { name: "truck", label: "شاحنة" },
    { name: "flower-lotus", label: "زهرة" },
    { name: "coffee", label: "قهوة" },
    { name: "cake", label: "كعكة" },
    { name: "hand-heart", label: "حب يدوي" },
    { name: "user-circle", label: "دائرة مستخدم" },
    { name: "users", label: "مستخدمون" },
    { name: "image", label: "صورة" },
    { name: "video", label: "فيديو" },
    { name: "notebook", label: "دفتر" },
    { name: "archive", label: "أرشيف" },
    { name: "folder", label: "مجلد" },
    { name: "tag", label: "وسم" },
    { name: "hash", label: "هاشتاج" },
    { name: "rss", label: "RSS" },
    { name: "chat-teardrop", label: "رسالة" },
    { name: "envelope-simple", label: "بريد" },
    { name: "phone", label: "هاتف" },
    { name: "fingerprint", label: "بصمة" },
    { name: "lock-key", label: "قفل" },
    { name: "gear-six", label: "إعدادات" },
    { name: "sliders-horizontal", label: "مرشحات" },
    { name: "funnel", label: "فلتر" },
    { name: "arrows-left-right", label: "تبديل" },
    { name: "trash", label: "حذف" },
    { name: "pencil-simple", label: "تعديل" },
    { name: "eye", label: "عين" },
    { name: "heartbeat", label: "نبض" },
    { name: "diamonds-four", label: "ماسات" },
    { name: "pentagram", label: "نجوم خماسية" },
    { name: "list-dashes", label: "قائمة" },
    { name: "grid-four", label: "شبكة 4" },
    { name: "dot-nine", label: "نقاط 9" },
    { name: "baseball", label: "كرة بيسبول" },
    { name: "basketball", label: "كرة سلة" },
    { name: "soccer-ball", label: "كرة قدم" },
    { name: "tennis-ball", label: "كرة تنس" },
    { name: "volleyball", label: "كرة طائرة" },
];

type ParsedIconId = { name: string; weight: string } | null;

function parseIconId(raw: string | null | undefined): ParsedIconId {
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();
    const parts = lower.split(/[.]+/).filter((s) => s.length > 0);
    if (parts.length === 0) return null;
    let name: string;
    let weight: string;
    if (parts[0] === "phosphor") {
        name = parts[1] ?? "circle";
        weight = parts[2] ?? "regular";
    } else {
        name = parts[0] ?? "circle";
        weight = parts[1] ?? "regular";
    }
    const validWeights = ["thin", "light", "regular", "bold", "fill", "duotone"];
    if (!validWeights.includes(weight)) weight = "regular";
    if (!/^[a-z0-9-]{1,40}$/.test(name)) return null;
    return { name, weight };
}

function buildIconId(name: string, weight: string): string {
    const n = name.trim().toLowerCase();
    const w = weight.trim().toLowerCase();
    return `phosphor.${n}.${w}`;
}

function iconNameToPascal(name: string): string {
    return name
        .split("-")
        .filter((s) => s.length > 0)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
}

function iconComponent(name: string, weight: string) {
    const pascalName = iconNameToPascal(name);
    const capitalWeight = weight.charAt(0).toUpperCase() + weight.slice(1);
    const key = `${pascalName}${capitalWeight === "Regular" ? "" : capitalWeight}` as keyof typeof Pi;
    return (Pi as any)[key] || null;
}

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
    const [iconIdInputs, setIconIdInputs] = useState<Partial<Record<NavIconField, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeNav, setActiveNav] = useState(0);
    const [iconPickerField, setIconPickerField] = useState<NavIconField | null>(null);

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
        const next: any = { ...EMPTY_NAV_ICONS, ...settings.navIcons };
        for (const [key, value] of Object.entries(iconIdInputs)) {
            if (typeof value === "string" && value.trim().length > 0) {
                next[key as NavIconField] = value;
            }
        }
        for (const [key, value] of Object.entries(previewUrls)) {
            if (typeof value === "string" && value.trim().length > 0) {
                next[key as NavIconField] = value;
            }
        }
        return next;
    }, [previewUrls, settings.navIcons, iconIdInputs]);

    function navFieldToIdField(field: NavIconField): NavIconField | null {
        const mapping: Partial<Record<NavIconField, NavIconField>> = {
            home: "homeId",
            search: "searchId",
            categories: "categoriesId",
            orders: "ordersId",
            profile: "profileId",
            homeActive: "homeActiveId",
            searchActive: "searchActiveId",
            categoriesActive: "categoriesActiveId",
            ordersActive: "ordersActiveId",
            profileActive: "profileActiveId",
        };
        return mapping[field] ?? null;
    }

    function navFieldFromIdField(field: NavIconField): NavIconField | null {
        const mapping: Partial<Record<NavIconField, NavIconField>> = {
            homeId: "home",
            searchId: "search",
            categoriesId: "categories",
            ordersId: "orders",
            profileId: "profile",
            homeActiveId: "homeActive",
            searchActiveId: "searchActive",
            categoriesActiveId: "categoriesActive",
            ordersActiveId: "ordersActive",
            profileActiveId: "profileActive",
        };
        return mapping[field] ?? null;
    }

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
            const iconIds: Partial<Record<NavIconField, string>> = {};
            for (const f of NAV_ICON_ID_FIELDS) {
                const raw = navIcons[f.key];
                if (typeof raw === "string" && raw.trim().length > 0) iconIds[f.key] = raw;
            }
            setIconIdInputs(iconIds);
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    }

    function handlePickIconId(field: NavIconField, name: string, weight: string) {
        setMessage(null);
        setError(null);
        const id = buildIconId(name, weight);
        setIconIdInputs((prev) => ({ ...prev, [field]: id }));
    }

    function handleClearIconId(field: NavIconField) {
        setMessage(null);
        setError(null);
        setIconIdInputs((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setSettings((prev) => ({
            ...prev,
            navIcons: { ...prev.navIcons, [field]: null },
        }));
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
        const idKey = navFieldToIdField(key);
        if (idKey) {
            handleClearIconId(idKey);
        }
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
            for (const f of NAV_ICON_ID_FIELDS) {
                const raw = iconIdInputs[f.key];
                if (raw == null) continue;
                const trimmed = raw.trim();
                if (trimmed.length === 0) {
                    nextNavIcons[f.key] = null;
                } else if (/^[a-z0-9_.-]{1,80}$/i.test(trimmed)) {
                    nextNavIcons[f.key] = trimmed.toLowerCase();
                }
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
            const cleanIconIds: Partial<Record<NavIconField, string>> = {};
            for (const f of NAV_ICON_ID_FIELDS) {
                const v = data?.navIcons?.[f.key];
                if (typeof v === "string" && v.trim().length > 0) cleanIconIds[f.key] = v;
            }
            setIconIdInputs(cleanIconIds);
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
                                            const idField = navFieldToIdField(
                                                isActive ? item.activeKey : item.inKey
                                            );
                                            const iconId =
                                                idField != null ? effectiveNavIcons[idField] ?? null : null;
                                            const parsed = parseIconId(iconId);
                                            const IconComp = parsed
                                                ? iconComponent(parsed.name, parsed.weight)
                                                : null;
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
                                                    {IconComp ? (
                                                        <IconComp
                                                            size={22}
                                                            weight={parsed?.weight ?? "regular"}
                                                            color={
                                                                isActive
                                                                    ? primaryLight
                                                                    : textSecondary
                                                            }
                                                        />
                                                    ) : iconUrl ? (
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
                                لكل زر حالتان: عادية (غير محدّدة) ومفعّلة (عند فتح القسم). اختر
                                من مكتبة الأيقونات الجاهزة (Phosphor — 78 أيقونة مع 6 أنماط)
                                أو ارفع صورة مخصصة PNG/WEBP.
                            </p>
                        </div>

                        <div className="mt-4 space-y-5">
                            {NAV_ORDER.map((pair) => {
                                const inactive = NAV_ICON_FIELDS.find((f) => f.key === pair.inKey)!;
                                const active = NAV_ICON_FIELDS.find((f) => f.key === pair.activeKey)!;
                                const inIdKey = navFieldToIdField(pair.inKey)!;
                                const activeIdKey = navFieldToIdField(pair.activeKey)!;
                                const inactiveUrl =
                                    previewUrls[pair.inKey] ?? settings.navIcons[pair.inKey] ?? null;
                                const activeUrl =
                                    previewUrls[pair.activeKey] ??
                                    settings.navIcons[pair.activeKey] ??
                                    null;
                                const inactiveId =
                                    iconIdInputs[inIdKey] ?? settings.navIcons[inIdKey] ?? null;
                                const activeId =
                                    iconIdInputs[activeIdKey] ?? settings.navIcons[activeIdKey] ?? null;
                                const inParsed = parseIconId(inactiveId);
                                const activeParsed = parseIconId(activeId);
                                const InIconComp = inParsed
                                    ? iconComponent(inParsed.name, inParsed.weight)
                                    : null;
                                const ActiveIconComp = activeParsed
                                    ? iconComponent(activeParsed.name, activeParsed.weight)
                                    : null;
                                return (
                                    <div
                                        key={pair.inKey}
                                        className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                                    >
                                        <div className="text-right">
                                            <div className="text-base font-bold text-slate-900">
                                                {pair.label}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {inactive.desc}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-3 text-right">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    حالة عادية (غير محدّدة)
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIconPickerField(inIdKey)}
                                                        className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-800"
                                                    >
                                                        اختر من المكتبة
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearIconId(inIdKey)}
                                                        disabled={!inactiveId}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        إزالة الأيقونة
                                                    </button>
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
                                                        {InIconComp ? (
                                                            <InIconComp
                                                                size={48}
                                                                weight={inParsed?.weight ?? "regular"}
                                                                color={hexToCss(
                                                                    c.textSecondary,
                                                                    DEFAULT_COLORS.textSecondary!
                                                                )}
                                                            />
                                                        ) : inactiveUrl ? (
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
                                                {inParsed ? (
                                                    <div
                                                        dir="ltr"
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-mono text-[11px] text-slate-600"
                                                    >
                                                        {buildIconId(inParsed.name, inParsed.weight)}
                                                    </div>
                                                ) : null}
                                                <div className="space-y-2 border-t border-dashed border-slate-300 pt-3">
                                                    <div className="text-[11px] font-medium text-slate-600">
                                                        أو صورة مخصصة (PNG/WEBP):
                                                    </div>
                                                    <label className="block cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                                                        اختيار ملف
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
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        إزالة الصورة
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-right">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    حالة مفعّلة (عند فتح القسم)
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIconPickerField(activeIdKey)}
                                                        className="rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-purple-700"
                                                    >
                                                        اختر من المكتبة
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearIconId(activeIdKey)}
                                                        disabled={!activeId}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        إزالة الأيقونة
                                                    </button>
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
                                                        {ActiveIconComp ? (
                                                            <ActiveIconComp
                                                                size={48}
                                                                weight={activeParsed?.weight ?? "fill"}
                                                                color={primaryLight}
                                                            />
                                                        ) : activeUrl ? (
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
                                                {activeParsed ? (
                                                    <div
                                                        dir="ltr"
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-mono text-[11px] text-slate-600"
                                                    >
                                                        {buildIconId(activeParsed.name, activeParsed.weight)}
                                                    </div>
                                                ) : null}
                                                <div className="space-y-2 border-t border-dashed border-slate-300 pt-3">
                                                    <div className="text-[11px] font-medium text-slate-600">
                                                        أو صورة مخصصة (PNG/WEBP):
                                                    </div>
                                                    <label className="block cursor-pointer rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-center text-xs font-medium text-purple-700 transition hover:bg-purple-100">
                                                        اختيار ملف
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
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        إزالة الصورة
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {iconPickerField ? (
                        <IconPickerModal
                            field={iconPickerField}
                            onClose={() => setIconPickerField(null)}
                            onPick={(name, weight) => {
                                handlePickIconId(iconPickerField, name, weight);
                                setIconPickerField(null);
                            }}
                            defaultWeight={
                                iconPickerField.toLowerCase().includes("active") ? "fill" : "regular"
                            }
                        />
                    ) : null}
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

function IconPickerModal(props: {
    field: string;
    onClose: () => void;
    onPick: (name: string, weight: string) => void;
    defaultWeight?: string;
}) {
    const [query, setQuery] = useState("");
    const [weight, setWeight] = useState<string>(props.defaultWeight ?? "regular");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return PHOSPHOR_ICONS;
        return PHOSPHOR_ICONS.filter(
            (i) => i.name.toLowerCase().includes(q) || i.label.includes(q)
        );
    }, [query]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <div className="text-right">
                        <div className="font-bold text-slate-900">اختيار أيقونة — Phosphor Icons</div>
                        <div className="text-[11px] text-slate-500">
                            اختر الأيقونة ثمّ النمط (الوزن) الملائم. النمط المقترح:{" "}
                            <span className="font-semibold">
                                {weight === "fill" ? "مملوء (الحالة المفعّلة)" : "عادي (الحالة العادية)"}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={props.onClose}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                        إغلاق
                    </button>
                </div>

                <div className="space-y-3 border-b border-slate-200 px-5 py-3">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {PHOSPHOR_WEIGHTS.map((w) => {
                                const Comp = iconComponent("house", w.key);
                                const active = w.key === weight;
                                return (
                                    <button
                                        key={w.key}
                                        type="button"
                                        onClick={() => setWeight(w.key)}
                                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                            active
                                                ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {Comp ? <Comp size={16} /> : null}
                                        {w.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div
                            dir="ltr"
                            className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100"
                        >
                            <Pi.MagnifyingGlass
                                size={16}
                                className="ml-2 shrink-0 text-slate-400"
                                weight="bold"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث باسم الأيقونة (home, search, gem, heart...)"
                                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-right text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                            لا توجد أيقونات مطابقة للبحث.
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12">
                            {filtered.map((item) => {
                                const Comp = iconComponent(item.name, weight);
                                if (!Comp) return null;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        title={`${item.label} — ${item.name} (${weight})`}
                                        onClick={() => props.onPick(item.name, weight)}
                                        className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 text-center transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md active:translate-y-0"
                                    >
                                        <Comp
                                            size={24}
                                            className="text-slate-700 group-hover:text-purple-600"
                                        />
                                        <span className="truncate text-[9px] font-medium text-slate-500 group-hover:text-purple-700">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
                    <span>
                        المكتبة تحتوي على 78 أيقونة × 6 أنماط (Phosphor Icons) — يتطابق مع Flutter
                        مباشرةً.
                    </span>
                    <span dir="ltr" className="font-mono">
                        {filtered.length} / {PHOSPHOR_ICONS.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
