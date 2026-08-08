"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import * as Pi from "@phosphor-icons/react";
import type { EnterpriseTheme } from "@/lib/theme_engine";

type LegacyThemeColors = {
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

type M3ThemeColors = {
    onPrimary: string | null;
    primaryContainer: string | null;
    onPrimaryContainer: string | null;
    primaryFixed: string | null;
    primaryFixedDim: string | null;
    onPrimaryFixed: string | null;
    onPrimaryFixedVariant: string | null;
    secondary: string | null;
    onSecondary: string | null;
    secondaryContainer: string | null;
    onSecondaryContainer: string | null;
    secondaryFixed: string | null;
    secondaryFixedDim: string | null;
    onSecondaryFixed: string | null;
    onSecondaryFixedVariant: string | null;
    tertiary: string | null;
    onTertiary: string | null;
    tertiaryContainer: string | null;
    onTertiaryContainer: string | null;
    tertiaryFixed: string | null;
    tertiaryFixedDim: string | null;
    onTertiaryFixed: string | null;
    onTertiaryFixedVariant: string | null;
    onError: string | null;
    errorContainer: string | null;
    onErrorContainer: string | null;
    onSurface: string | null;
    surfaceDim: string | null;
    surfaceBright: string | null;
    surfaceContainerLowest: string | null;
    surfaceContainerLow: string | null;
    surfaceContainer: string | null;
    surfaceContainerHigh: string | null;
    surfaceContainerHighest: string | null;
    onSurfaceVariant: string | null;
    outline: string | null;
    outlineVariant: string | null;
    onBackground: string | null;
    inverseSurface: string | null;
    inverseOnSurface: string | null;
    inversePrimary: string | null;
    shadow: string | null;
    scrim: string | null;
    onSuccess: string | null;
    successContainer: string | null;
    onSuccessContainer: string | null;
    onWarning: string | null;
    warningContainer: string | null;
    onWarningContainer: string | null;
    onInfo: string | null;
    infoContainer: string | null;
    onInfoContainer: string | null;
    divider: string | null;
    splash: string | null;
    disabled: string | null;
    onDisabled: string | null;
    disabledContainer: string | null;
    heroStart: string | null;
    heroMid: string | null;
    heroEnd: string | null;
    cardBackground: string | null;
    cardBorder: string | null;
    badge: string | null;
    onBadge: string | null;
    snackbarBackground: string | null;
    snackbarText: string | null;
    shimmerBase: string | null;
    shimmerHighlight: string | null;
    onAccentPink: string | null;
};

type ThemeColors = LegacyThemeColors & M3ThemeColors;

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

type WcagBadge = { aaNormal: boolean; aaaNormal: boolean; ratio: number };

const EMPTY_COLORS: ThemeColors = {
    primary: null, primaryLight: null, primaryDark: null, accentPink: null,
    background: null, surface: null, surfaceLight: null, menuBackground: null,
    textPrimary: null, textSecondary: null, textTertiary: null,
    success: null, warning: null, error: null, info: null,
    border: null, borderLight: null,
    onPrimary: null, primaryContainer: null, onPrimaryContainer: null,
    primaryFixed: null, primaryFixedDim: null, onPrimaryFixed: null, onPrimaryFixedVariant: null,
    secondary: null, onSecondary: null, secondaryContainer: null, onSecondaryContainer: null,
    secondaryFixed: null, secondaryFixedDim: null, onSecondaryFixed: null, onSecondaryFixedVariant: null,
    tertiary: null, onTertiary: null, tertiaryContainer: null, onTertiaryContainer: null,
    tertiaryFixed: null, tertiaryFixedDim: null, onTertiaryFixed: null, onTertiaryFixedVariant: null,
    onError: null, errorContainer: null, onErrorContainer: null,
    onSurface: null, surfaceDim: null, surfaceBright: null,
    surfaceContainerLowest: null, surfaceContainerLow: null, surfaceContainer: null,
    surfaceContainerHigh: null, surfaceContainerHighest: null,
    onSurfaceVariant: null, outline: null, outlineVariant: null, onBackground: null,
    inverseSurface: null, inverseOnSurface: null, inversePrimary: null,
    shadow: null, scrim: null,
    onSuccess: null, successContainer: null, onSuccessContainer: null,
    onWarning: null, warningContainer: null, onWarningContainer: null,
    onInfo: null, infoContainer: null, onInfoContainer: null,
    divider: null, splash: null, disabled: null, onDisabled: null, disabledContainer: null,
    heroStart: null, heroMid: null, heroEnd: null,
    cardBackground: null, cardBorder: null, badge: null, onBadge: null,
    snackbarBackground: null, snackbarText: null, shimmerBase: null, shimmerHighlight: null,
    onAccentPink: null,
};

const EMPTY_NAV_ICONS: NavIcons = {
    home: null, search: null, categories: null, orders: null, profile: null,
    homeActive: null, searchActive: null, categoriesActive: null,
    ordersActive: null, profileActive: null,
    homeId: null, searchId: null, categoriesId: null, ordersId: null, profileId: null,
    homeActiveId: null, searchActiveId: null, categoriesActiveId: null,
    ordersActiveId: null, profileActiveId: null,
};

const EMPTY_EFFECTS: ThemeEffects = {
    primaryGradientAngle: null, cardRadius: null, chipRadius: null, buttonRadius: null,
    navShadowOpacity: null, cardShadowOpacity: null, activeGlowOpacity: null, glassBlur: null,
    surfaceOpacity: null, borderOpacity: null,
};

const DEFAULT_EFFECTS: Required<ThemeEffects> = {
    primaryGradientAngle: 135, cardRadius: 16, chipRadius: 999, buttonRadius: 12,
    navShadowOpacity: 0.18, cardShadowOpacity: 0.12, activeGlowOpacity: 0.22, glassBlur: 14,
    surfaceOpacity: 0.85, borderOpacity: 0.45,
};

const DEFAULT_COLORS: ThemeColors = {
    primary: "#9B4DFF", primaryLight: "#C48CFF", primaryDark: "#7230CC", accentPink: "#FF4DA6",
    background: "#46205A", surface: "#57246F", surfaceLight: "#6F2E8E", menuBackground: "#421B54",
    textPrimary: "#FFFFFF", textSecondary: "#B0B0B0", textTertiary: "#707070",
    success: "#22C55E", warning: "#F59E0B", error: "#EF4444", info: "#3B82F6",
    border: "#7B469C", borderLight: "#5E2B79",
    onPrimary: "#FFFFFF", primaryContainer: "#E9DDFF", onPrimaryContainer: "#23005B",
    primaryFixed: "#E9DDFF", primaryFixedDim: "#D0BCFF", onPrimaryFixed: "#23005B", onPrimaryFixedVariant: "#4F378B",
    secondary: "#6750A4", onSecondary: "#FFFFFF", secondaryContainer: "#E8DEF8", onSecondaryContainer: "#1F0242",
    secondaryFixed: "#E8DEF8", secondaryFixedDim: "#CCC2DC", onSecondaryFixed: "#1F0242", onSecondaryFixedVariant: "#4A4458",
    tertiary: "#7D5260", onTertiary: "#FFFFFF", tertiaryContainer: "#FFD8E4", onTertiaryContainer: "#31111D",
    tertiaryFixed: "#FFD8E4", tertiaryFixedDim: "#EFB8C8", onTertiaryFixed: "#31111D", onTertiaryFixedVariant: "#633B48",
    onError: "#FFFFFF", errorContainer: "#FFDAD6", onErrorContainer: "#410002",
    onSurface: "#1D1B20", surfaceDim: "#DED8E1", surfaceBright: "#FEF7FF",
    surfaceContainerLowest: "#FFFFFF", surfaceContainerLow: "#F7F2FA", surfaceContainer: "#F3EDF7",
    surfaceContainerHigh: "#ECE6F0", surfaceContainerHighest: "#E6E0E9",
    onSurfaceVariant: "#49454F", outline: "#79747E", outlineVariant: "#CAC4D0", onBackground: "#1D1B20",
    inverseSurface: "#322F35", inverseOnSurface: "#F5EFF7", inversePrimary: "#D0BCFF",
    shadow: "#000000", scrim: "#000000",
    onSuccess: "#FFFFFF", successContainer: "#C8E6C9", onSuccessContainer: "#003300",
    onWarning: "#FFFFFF", warningContainer: "#FFE0B2", onWarningContainer: "#3E2723",
    onInfo: "#FFFFFF", infoContainer: "#BBDEFB", onInfoContainer: "#0D2A56",
    divider: "#CAC4D0", splash: "#6750A4", disabled: "#CAC4D0", onDisabled: "#49454F", disabledContainer: "#E6E0E9",
    heroStart: "#4F378B", heroMid: "#6750A4", heroEnd: "#FF4DA6",
    cardBackground: "#FFFFFF", cardBorder: "#CAC4D0", badge: "#7D5260", onBadge: "#FFFFFF",
    snackbarBackground: "#322F35", snackbarText: "#F5EFF7", shimmerBase: "#E6E0E9", shimmerHighlight: "#FEF7FF",
    onAccentPink: "#FFFFFF",
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

const PRESET_THEMES: { name: string; label: string; seed: string; colors: ThemeColors }[] = [
    {
        name: "purple-dream", label: "حلم بنفسجي", seed: "#9B4DFF",
        colors: { ...DEFAULT_COLORS },
    },
    {
        name: "ocean-teal", label: "محيط زرقاء", seed: "#10B981",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#10B981", primaryLight: "#6EE7B7", primaryDark: "#047857", accentPink: "#38BDF8",
            background: "#0B2830", surface: "#0F3441", surfaceLight: "#145063", menuBackground: "#0A2430",
            textPrimary: "#F4FAFA", textSecondary: "#A8C5CC", textTertiary: "#6C8891",
            success: "#34D399", warning: "#FBBF24", error: "#F87171", info: "#60A5FA",
            border: "#18606C", borderLight: "#114752",
        },
    },
    {
        name: "sunset-orange", label: "غروب برتقالي", seed: "#F97316",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#F97316", primaryLight: "#FDBA74", primaryDark: "#C2410C", accentPink: "#FB7185",
            background: "#2A1410", surface: "#3F1F18", surfaceLight: "#5D2E24", menuBackground: "#23120D",
            textPrimary: "#FFF7ED", textSecondary: "#FED7AA", textTertiary: "#C9996A",
            success: "#4ADE80", warning: "#FACC15", error: "#F43F5E", info: "#22D3EE",
            border: "#7C2D12", borderLight: "#54200E",
        },
    },
    {
        name: "royal-gold", label: "ذهبي ملكي", seed: "#EAB308",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#EAB308", primaryLight: "#FDE68A", primaryDark: "#A16207", accentPink: "#F472B6",
            background: "#1C1917", surface: "#292524", surfaceLight: "#3F3A36", menuBackground: "#151312",
            textPrimary: "#FAFAF9", textSecondary: "#D6D3D1", textTertiary: "#A8A29E",
            success: "#4ADE80", warning: "#FACC15", error: "#FB7185", info: "#38BDF8",
            border: "#57534E", borderLight: "#44403C",
        },
    },
    {
        name: "snow-white", label: "ثلج ناصع (فاتح)", seed: "#7C3AED",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#7C3AED", primaryLight: "#A78BFA", primaryDark: "#5B21B6", accentPink: "#DB2777",
            background: "#F8FAFC", surface: "#FFFFFF", surfaceLight: "#F1F5F9", menuBackground: "#FFFFFF",
            textPrimary: "#0F172A", textSecondary: "#475569", textTertiary: "#94A3B8",
            success: "#16A34A", warning: "#D97706", error: "#DC2626", info: "#2563EB",
            border: "#E2E8F0", borderLight: "#F1F5F9",
        },
    },
    {
        name: "neon-cyber", label: "نيون سيبر", seed: "#22D3EE",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#22D3EE", primaryLight: "#67E8F9", primaryDark: "#0891B2", accentPink: "#F0ABFC",
            background: "#07091C", surface: "#0E1230", surfaceLight: "#181E4A", menuBackground: "#050714",
            textPrimary: "#E0F2FE", textSecondary: "#7DD3FC", textTertiary: "#3B82F6",
            success: "#34D399", warning: "#FBBF24", error: "#FB7185", info: "#A78BFA",
            border: "#1E3A8A", borderLight: "#172554",
        },
    },
];

const LEGACY_COLOR_FIELDS: { key: ColorField; label: string; desc: string }[] = [
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

type ColorGroup = {
    id: string;
    title: string;
    desc: string;
    fields: { key: ColorField; label: string; fgOf?: ColorField; desc?: string }[];
};

const M3_COLOR_GROUPS: ColorGroup[] = [
    {
        id: "primary", title: "مجموعة الرئيسي (Material 3)",
        desc: "مجموعة الألوان الأساسية للعلامة التجارية مع حاويات وألوان نص مضمونة WCAG.",
        fields: [
            { key: "primary", label: "Primary", desc: "اللون الأساسي." },
            { key: "onPrimary", label: "On Primary", fgOf: "primary", desc: "لون النص فوق Primary." },
            { key: "primaryContainer", label: "Primary Container", desc: "حاوية مركبات الرئيسية." },
            { key: "onPrimaryContainer", label: "On Primary Container", fgOf: "primaryContainer", desc: "نص داخل الحاوية." },
            { key: "primaryFixed", label: "Primary Fixed" },
            { key: "primaryFixedDim", label: "Primary Fixed Dim" },
            { key: "onPrimaryFixed", label: "On Primary Fixed", fgOf: "primaryFixed" },
            { key: "onPrimaryFixedVariant", label: "On Primary Fixed Variant", fgOf: "primaryFixedDim" },
        ],
    },
    {
        id: "secondary", title: "مجموعة الثانوي (Secondary)",
        desc: "ألوان ثانوية متناغمة مع الرئيسي (منسقة تلقائياً عبر Smart Palette).",
        fields: [
            { key: "secondary", label: "Secondary" },
            { key: "onSecondary", label: "On Secondary", fgOf: "secondary" },
            { key: "secondaryContainer", label: "Secondary Container" },
            { key: "onSecondaryContainer", label: "On Secondary Container", fgOf: "secondaryContainer" },
            { key: "secondaryFixed", label: "Secondary Fixed" },
            { key: "secondaryFixedDim", label: "Secondary Fixed Dim" },
            { key: "onSecondaryFixed", label: "On Secondary Fixed", fgOf: "secondaryFixed" },
            { key: "onSecondaryFixedVariant", label: "On Secondary Fixed Variant", fgOf: "secondaryFixedDim" },
        ],
    },
    {
        id: "tertiary", title: "مجموعة الثالث (Tertiary)",
        desc: "لون تكميلي مستوحى من الحلقة اللونية (hue + 60°) للتباين الجمالي.",
        fields: [
            { key: "tertiary", label: "Tertiary" },
            { key: "onTertiary", label: "On Tertiary", fgOf: "tertiary" },
            { key: "tertiaryContainer", label: "Tertiary Container" },
            { key: "onTertiaryContainer", label: "On Tertiary Container", fgOf: "tertiaryContainer" },
            { key: "tertiaryFixed", label: "Tertiary Fixed" },
            { key: "tertiaryFixedDim", label: "Tertiary Fixed Dim" },
            { key: "onTertiaryFixed", label: "On Tertiary Fixed", fgOf: "tertiaryFixed" },
            { key: "onTertiaryFixedVariant", label: "On Tertiary Fixed Variant", fgOf: "tertiaryFixedDim" },
        ],
    },
    {
        id: "error", title: "مجموعة الخطأ (Error)",
        desc: "حالات الخطأ والحاويات مع نصوص مضادة WCAG.",
        fields: [
            { key: "error", label: "Error" },
            { key: "onError", label: "On Error", fgOf: "error" },
            { key: "errorContainer", label: "Error Container" },
            { key: "onErrorContainer", label: "On Error Container", fgOf: "errorContainer" },
        ],
    },
    {
        id: "semantic-status", title: "الحالات الدلالية (نجاح / تحذير / معلومات)",
        desc: "مستخدمة في الشارات والتنبيهات والرسائل. الألوان مشتقة تلقائياً من النظام.",
        fields: [
            { key: "success", label: "Success" },
            { key: "onSuccess", label: "On Success", fgOf: "success" },
            { key: "successContainer", label: "Success Container" },
            { key: "onSuccessContainer", label: "On Success Container", fgOf: "successContainer" },
            { key: "warning", label: "Warning" },
            { key: "onWarning", label: "On Warning", fgOf: "warning" },
            { key: "warningContainer", label: "Warning Container" },
            { key: "onWarningContainer", label: "On Warning Container", fgOf: "warningContainer" },
            { key: "info", label: "Info" },
            { key: "onInfo", label: "On Info", fgOf: "info" },
            { key: "infoContainer", label: "Info Container" },
            { key: "onInfoContainer", label: "On Info Container", fgOf: "infoContainer" },
        ],
    },
    {
        id: "surface", title: "الأسطح (Surface Family)",
        desc: "تدرج المستويات من الأغمق (Dim) إلى الأكثر سطوعاً (Bright) مع الحاويات الخمس (Material 3).",
        fields: [
            { key: "surface", label: "Surface" },
            { key: "onSurface", label: "On Surface", fgOf: "surface" },
            { key: "surfaceDim", label: "Surface Dim" },
            { key: "surfaceBright", label: "Surface Bright" },
            { key: "surfaceContainerLowest", label: "Surface Container Lowest" },
            { key: "surfaceContainerLow", label: "Surface Container Low" },
            { key: "surfaceContainer", label: "Surface Container" },
            { key: "surfaceContainerHigh", label: "Surface Container High" },
            { key: "surfaceContainerHighest", label: "Surface Container Highest" },
            { key: "onSurfaceVariant", label: "On Surface Variant", fgOf: "surfaceContainerHighest" },
            { key: "onBackground", label: "On Background", fgOf: "background" },
            { key: "inverseSurface", label: "Inverse Surface" },
            { key: "inverseOnSurface", label: "Inverse On Surface", fgOf: "inverseSurface" },
            { key: "inversePrimary", label: "Inverse Primary" },
        ],
    },
    {
        id: "outlines", title: "الحدود والمخططات (Outline / Divider)",
        desc: "حدود العناصر والفواصل مع الشفافية.",
        fields: [
            { key: "outline", label: "Outline (focus/borders)" },
            { key: "outlineVariant", label: "Outline Variant" },
            { key: "divider", label: "Divider (فواصل)" },
            { key: "cardBorder", label: "Card Border" },
            { key: "shadow", label: "Shadow" },
            { key: "scrim", label: "Scrim (شاشة تعتيم)" },
        ],
    },
    {
        id: "components", title: "مكونات (Hero / Card / Badge / Snackbar / Shimmer / Splash)",
        desc: "مكونات خاصة بـ صورلي مع تدرجات البطل وشيمر التحميل.",
        fields: [
            { key: "heroStart", label: "Hero Gradient Start" },
            { key: "heroMid", label: "Hero Gradient Mid" },
            { key: "heroEnd", label: "Hero Gradient End" },
            { key: "splash", label: "Splash (ripple)" },
            { key: "cardBackground", label: "Card Background" },
            { key: "badge", label: "Badge" },
            { key: "onBadge", label: "On Badge", fgOf: "badge" },
            { key: "snackbarBackground", label: "Snackbar Background" },
            { key: "snackbarText", label: "Snackbar Text", fgOf: "snackbarBackground" },
            { key: "shimmerBase", label: "Shimmer Base" },
            { key: "shimmerHighlight", label: "Shimmer Highlight" },
            { key: "disabled", label: "Disabled" },
            { key: "onDisabled", label: "On Disabled", fgOf: "disabled" },
            { key: "disabledContainer", label: "Disabled Container" },
            { key: "onAccentPink", label: "On Accent Pink", fgOf: "accentPink" },
        ],
    },
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

function relativeLuminance(hex: string): number {
    const c = colorToSixDigitHex(hex).replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const lin = (s: number) => (s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(a: string, b: string): number {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
}
function wcagQuick(fg: string, bg: string): WcagBadge {
    const ratio = contrastRatio(fg, bg);
    return { aaNormal: ratio >= 4.5, aaaNormal: ratio >= 7, ratio };
}

function WcagTag({ rating }: { rating: WcagBadge }) {
    if (rating.aaaNormal) {
        return (
            <span
                className="mr-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-m3-on-surface shadow-sm"
                title={`WCAG AAA — ${rating.ratio.toFixed(2)}:1`}
            >
                ⭐ AAA {rating.ratio.toFixed(1)}
            </span>
        );
    }
    if (rating.aaNormal) {
        return (
            <span
                className="mr-2 rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-bold text-m3-on-surface"
                title={`WCAG AA — ${rating.ratio.toFixed(2)}:1`}
            >
                ✅ AA {rating.ratio.toFixed(1)}
            </span>
        );
    }
    return (
        <span
            className="mr-2 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-m3-on-surface"
            title={`Failed WCAG AA — ${rating.ratio.toFixed(2)}:1 (requires 4.5)`}
        >
            ❌ {rating.ratio.toFixed(1)}
        </span>
    );
}

const ALL_COLOR_KEYS = new Set([
    ...LEGACY_COLOR_FIELDS.map((f) => f.key as string),
    ...M3_COLOR_GROUPS.flatMap((g) => g.fields.map((f) => f.key as string)),
]);

export default function AdminThemeSettingsPage() {
    const [settings, setSettings] = useState<ThemeSettings>({
        colors: EMPTY_COLORS, navIcons: EMPTY_NAV_ICONS, effects: EMPTY_EFFECTS,
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
    const [enterpriseTheme, setEnterpriseTheme] = useState<EnterpriseTheme | null>(null);
    const [wcagRatings, setWcagRatings] = useState<Record<string, WcagBadge>>({});
    const [smartSeed, setSmartSeed] = useState<string>("#9B4DFF");
    const [smartMode, setSmartMode] = useState<"light" | "dark">("dark");
    const [smartGenerating, setSmartGenerating] = useState(false);
    const [activeGroup, setActiveGroup] = useState<string | null>("primary");

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
        if (enterpriseTheme) {
            for (const k of ALL_COLOR_KEYS) {
                const v = (enterpriseTheme as any)[k];
                if (typeof v === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) {
                    next[k] = v;
                }
            }
        }
        for (const key of Object.keys(EMPTY_COLORS) as ColorField[]) {
            const override = colorInputs[key];
            const hexFromSettings = settings.colors[key];
            const candidate = override ? override.trim() : hexFromSettings ? hexFromSettings.trim() : "";
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)) {
                next[key] = candidate;
            } else if (hexFromSettings && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hexFromSettings)) {
                next[key] = hexFromSettings;
            }
        }
        return next;
    }, [colorInputs, settings.colors, enterpriseTheme]);

    const computedWcag = useMemo(() => {
        const res: Record<string, WcagBadge> = { ...wcagRatings };
        for (const grp of M3_COLOR_GROUPS) {
            for (const f of grp.fields) {
                if (f.fgOf) {
                    const fg = effectiveColors[f.key];
                    const bg = effectiveColors[f.fgOf];
                    if (typeof fg === "string" && typeof bg === "string") {
                        res[`${f.key}__${f.fgOf}`] = wcagQuick(fg, bg);
                    }
                }
            }
        }
        return res;
    }, [effectiveColors, wcagRatings]);

    const effectiveEffects = useMemo<Required<ThemeEffects>>(() => {
        const next: any = { ...DEFAULT_EFFECTS };
        if (enterpriseTheme?.effects) {
            for (const k of Object.keys(enterpriseTheme.effects)) {
                const v = (enterpriseTheme.effects as any)[k];
                if (typeof v === "number" && Number.isFinite(v)) next[k] = v;
            }
        }
        for (const key of Object.keys(EMPTY_EFFECTS) as EffectField[]) {
            const override = effectInputs[key];
            const fromSettings = settings.effects[key];
            if (typeof override === "number" && Number.isFinite(override)) {
                next[key] = override;
            } else if (typeof fromSettings === "number" && Number.isFinite(fromSettings)) {
                next[key] = fromSettings;
            }
        }
        return next;
    }, [effectInputs, settings.effects, enterpriseTheme]);

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
            home: "homeId", search: "searchId", categories: "categoriesId", orders: "ordersId", profile: "profileId",
            homeActive: "homeActiveId", searchActive: "searchActiveId", categoriesActive: "categoriesActiveId",
            ordersActive: "ordersActiveId", profileActive: "profileActiveId",
        };
        return mapping[field] ?? null;
    }

    async function loadSettings() {
        setLoading(true); setError(null); setMessage(null);
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
            if (data?.enterprise) setEnterpriseTheme(data.enterprise as EnterpriseTheme);
            if (data?.wcag) setWcagRatings(data.wcag as any);
            if (colors.primary) setSmartSeed(colors.primary);
            const inputs: Partial<Record<ColorField, string>> = {};
            for (const k of Object.keys(EMPTY_COLORS) as ColorField[]) {
                const v = (colors as any)[k];
                if (typeof v === "string" && v.length > 0) inputs[k] = v;
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
        setMessage(null); setError(null);
        const id = buildIconId(name, weight);
        setIconIdInputs((prev) => ({ ...prev, [field]: id }));
    }

    function handleClearIconId(field: NavIconField) {
        setMessage(null); setError(null);
        setIconIdInputs((prev) => { const next = { ...prev }; delete next[field]; return next; });
        setSettings((prev) => ({ ...prev, navIcons: { ...prev.navIcons, [field]: null } }));
    }

    function handleColorChange(key: ColorField, value: string) {
        setError(null); setMessage(null);
        setColorInputs((prev) => ({ ...prev, [key]: value }));
    }

    function handleEffectChange(key: EffectField, raw: number) {
        setError(null); setMessage(null);
        const meta = EFFECT_FIELDS.find((f) => f.key === key);
        const value = meta ? Math.min(meta.max, Math.max(meta.min, raw)) : raw;
        setEffectInputs((prev) => ({ ...prev, [key]: value }));
    }

    function handleResetEffect(key: EffectField) {
        setError(null); setMessage(null);
        setEffectInputs((prev) => { const next = { ...prev }; delete next[key]; return next; });
        setSettings((prev) => ({ ...prev, effects: { ...prev.effects, [key]: null } }));
    }

    function handleApplyPreset(preset: (typeof PRESET_THEMES)[number]) {
        setError(null); setMessage(null);
        setSmartSeed(preset.seed);
        const inputs: Partial<Record<ColorField, string>> = {};
        for (const k of Object.keys(EMPTY_COLORS) as ColorField[]) {
            const v = (preset.colors as any)[k];
            if (typeof v === "string") inputs[k] = v;
        }
        setColorInputs(inputs);
        setSettings((prev) => ({ ...prev, colors: { ...preset.colors } }));
    }

    async function handleGenerateSmartPalette(writeToDb: boolean) {
        setError(null); setMessage(null); setSmartGenerating(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("جلسة الأدمن غير متاحة. أعد تسجيل الدخول.");
            if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(smartSeed.trim())) {
                throw new Error("الرجاء إدخال لون صحيح للبذرة (مثل #9B4DFF).");
            }
            const body: any = { seedPrimary: smartSeed.trim(), mode: smartMode };
            const effectsOverride: any = {};
            for (const f of EFFECT_FIELDS) {
                const v = effectInputs[f.key] ?? settings.effects[f.key];
                if (typeof v === "number") effectsOverride[f.key] = v;
            }
            if (Object.keys(effectsOverride).length > 0) body.effectsOverride = effectsOverride;
            if (writeToDb) body.writeToDb = true;

            const res = await fetch("/api/admin/theme-settings?action=smart-palette", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "فشل توليد لوحة الألوان الذكية");
            if (data?.enterprise) {
                setEnterpriseTheme(data.enterprise as EnterpriseTheme);
                const ent = data.enterprise as any;
                const newColors: any = { ...settings.colors };
                const newInputs: any = { ...colorInputs };
                for (const k of Object.keys(EMPTY_COLORS)) {
                    const v = ent[k];
                    if (typeof v === "string") {
                        newColors[k] = v;
                        newInputs[k] = v;
                    }
                }
                setSettings((prev) => ({ ...prev, colors: newColors }));
                setColorInputs(newInputs);
                setSmartSeed(ent.primary ?? smartSeed);
                setMessage(
                    writeToDb
                        ? `✅ تم توليد 85 لوناً و10 تأثيرات وحفظها في قاعدة البيانات مباشرة (نسخة ${ent.version ?? ""}). افتح التطبيق للعرض.`
                        : `✅ تم إنشاء لوحة الم3 بذكاء (نسخة ${ent.version ?? ""}). اضغط "تطبيق وحفظ" لحفظها في النظام.`
                );
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
        } finally {
            setSmartGenerating(false);
        }
    }

    function handleFileChange(key: NavIconField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        setMessage(null); setError(null);
        setSelectedFiles((prev) => ({ ...prev, [key]: file }));
        setPreviewUrls((prev) => {
            const current = prev[key];
            if (current) URL.revokeObjectURL(current);
            return { ...prev, [key]: URL.createObjectURL(file) };
        });
    }

    function handleRemoveColor(key: ColorField) {
        setError(null); setMessage(null);
        setColorInputs((prev) => { const next = { ...prev }; delete next[key]; return next; });
        setSettings((prev) => ({ ...prev, colors: { ...prev.colors, [key]: null } }));
    }

    function handleRemoveIcon(key: NavIconField) {
        setMessage(null); setError(null);
        setSelectedFiles((prev) => { const next = { ...prev }; delete next[key]; return next; });
        setPreviewUrls((prev) => {
            const next = { ...prev };
            if (next[key]) URL.revokeObjectURL(next[key]!);
            delete next[key];
            return next;
        });
        setSettings((prev) => ({ ...prev, navIcons: { ...prev.navIcons, [key]: null } }));
        const idKey = navFieldToIdField(key);
        if (idKey) handleClearIconId(idKey);
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
        if (!res.ok || !data?.url) throw new Error(data?.error || "فشل رفع أيقونة التنقل");
        return data.url as string;
    }

    async function handleSave() {
        setSaving(true); setError(null); setMessage(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("جلسة الأدمن غير متاحة. أعد تسجيل الدخول.");

            const nextColors: Partial<ThemeColors> = {};
            for (const k of Object.keys(EMPTY_COLORS) as ColorField[]) {
                const raw = colorInputs[k];
                if (raw == null) { nextColors[k] = settings.colors[k] ?? null; continue; }
                const trimmed = raw.trim();
                if (trimmed.length === 0) nextColors[k] = null;
                else if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) nextColors[k] = trimmed;
                else nextColors[k] = settings.colors[k] ?? null;
            }

            const nextEffects: Partial<ThemeEffects> = {};
            for (const f of EFFECT_FIELDS) {
                const raw = effectInputs[f.key];
                if (typeof raw === "number" && Number.isFinite(raw)) nextEffects[f.key] = raw;
                else nextEffects[f.key] = settings.effects[f.key] ?? null;
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
                if (trimmed.length === 0) nextNavIcons[f.key] = null;
                else if (/^[a-z0-9_.-]{1,80}$/i.test(trimmed)) nextNavIcons[f.key] = trimmed.toLowerCase();
            }

            const res = await fetch("/api/admin/theme-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ colors: nextColors, navIcons: nextNavIcons, effects: nextEffects }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "فشل حفظ إعدادات المظهر");

            setSettings({
                colors: { ...EMPTY_COLORS, ...(data?.colors ?? {}) },
                navIcons: { ...EMPTY_NAV_ICONS, ...(data?.navIcons ?? {}) },
                effects: { ...EMPTY_EFFECTS, ...(data?.effects ?? {}) },
            });
            if (data?.enterprise) setEnterpriseTheme(data.enterprise as EnterpriseTheme);
            if (data?.wcag) setWcagRatings(data.wcag as any);
            const cleanInputs: Partial<Record<ColorField, string>> = {};
            for (const k of Object.keys(EMPTY_COLORS) as ColorField[]) {
                const v = data?.colors?.[k];
                if (typeof v === "string") cleanInputs[k] = v;
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
            Object.values(previewUrls).forEach((url) => { if (url) URL.revokeObjectURL(url); });
            setPreviewUrls({});
            const v = data?.enterprise?.version ?? "";
            setMessage(`تم حفظ إعدادات المظهر بنجاح — Theme Version: ${v}. افتح التطبيق لتجد التغييرات فوراً (انسحب للتحديث أو أعد تشغيل التطبيق).`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
        } finally {
            setSaving(false);
        }
    }

    const c = effectiveColors;
    const _mergeE: any = { ...DEFAULT_EFFECTS, ...(effectiveEffects as any) };
    const DE = DEFAULT_EFFECTS;
    const e = {
        primaryGradientAngle: (_mergeE.primaryGradientAngle ?? DE.primaryGradientAngle) as number,
        cardRadius: (_mergeE.cardRadius ?? DE.cardRadius) as number,
        chipRadius: (_mergeE.chipRadius ?? DE.chipRadius) as number,
        buttonRadius: (_mergeE.buttonRadius ?? DE.buttonRadius) as number,
        navShadowOpacity: (_mergeE.navShadowOpacity ?? DE.navShadowOpacity) as number,
        cardShadowOpacity: (_mergeE.cardShadowOpacity ?? DE.cardShadowOpacity) as number,
        activeGlowOpacity: (_mergeE.activeGlowOpacity ?? DE.activeGlowOpacity) as number,
        glassBlur: (_mergeE.glassBlur ?? DE.glassBlur) as number,
        surfaceOpacity: (_mergeE.surfaceOpacity ?? DE.surfaceOpacity) as number,
        borderOpacity: (_mergeE.borderOpacity ?? DE.borderOpacity) as number,
    };

    const previewStyle: React.CSSProperties = {
        background: `linear-gradient(160deg, ${hexToCss(c.heroStart ?? c.background, DEFAULT_COLORS.background!)} 0%, ${hexToCss(c.primaryDark ?? c.surface, DEFAULT_COLORS.primaryDark!)} 55%, ${hexToCss(c.heroEnd ?? c.accentPink, DEFAULT_COLORS.accentPink!)} 110%)`,
        color: hexToCss(c.textPrimary ?? c.onSurface, DEFAULT_COLORS.textPrimary!),
        borderColor: hexToCss(c.border ?? c.outline, DEFAULT_COLORS.border!),
        position: "relative",
    };
    const cardRadius = `${e.cardRadius}px`;
    const chipRadiusVal = e.chipRadius;
    const chipRadius = chipRadiusVal >= 999 ? "9999px" : `${chipRadiusVal}px`;
    const buttonRadius = `${e.buttonRadius}px`;
    const glassBlurVal = `${e.glassBlur}px`;
    const cardSurface = hexToCss(c.cardBackground ?? c.surface, DEFAULT_COLORS.surface!);
    const cardBorder = hexToCss(c.cardBorder ?? c.borderLight ?? c.outlineVariant, DEFAULT_COLORS.borderLight!);
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
    const primaryLight = hexToCss(c.primaryLight ?? c.primaryFixedDim, DEFAULT_COLORS.primaryLight!);
    const primaryDark = hexToCss(c.primaryDark ?? c.onPrimaryContainer, DEFAULT_COLORS.primaryDark!);
    const primaryGradient = `linear-gradient(${e.primaryGradientAngle}deg, ${primary}, ${primaryDark})`;
    const surfaceLight = hexToCss(c.surfaceLight ?? c.surfaceContainerHigh, DEFAULT_COLORS.surfaceLight!);
    const textSecondary = hexToCss(c.textSecondary ?? c.onSurfaceVariant, DEFAULT_COLORS.textSecondary!);
    const textTertiary = hexToCss(c.textTertiary ?? c.onSurfaceVariant, DEFAULT_COLORS.textTertiary!);

    return (
        <div dir="rtl" className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-right text-2xl font-bold">إعدادات مظهر التطبيق (Enterprise Theme Engine)</h2>
                <p className="text-right text-sm text-m3-on-surface-variant">
                    نظام الألوان الآن على مستوى Enterprise — Material 3 + 85 لوناً + 5 ألواح لونية نغمية (Tonal
                    Palettes) + WCAG 2.2 AA/AAA لكل نص. استخدم <strong>Smart Palette</strong> (البذرة) لتوليد
                    النظام بأكمله بضغطة زر — ثم عدّل التفاصيل إن أردت.
                </p>
                {enterpriseTheme?.version ? (
                    <div className="flex items-center justify-end gap-2 text-[11px]">
                        <span className="rounded-md bg-m3-surface-container-highest px-2 py-1 font-mono text-amber-300">
                            themeVersion: {enterpriseTheme.version}
                        </span>
                        <span className="rounded-md bg-emerald-900/20 px-2 py-1 font-mono text-emerald-700">
                            M3 ColorScheme: 61 tokens
                        </span>
                        <span className="rounded-md bg-primary-container/20 px-2 py-1 font-mono text-m3-primary">
                            Semantic: 25 tokens
                        </span>
                    </div>
                ) : null}
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
                        <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-right">
                                    <h3 className="font-bold text-m3-on-background">معاينة التطبيق</h3>
                                    <p className="mt-1 text-sm text-m3-on-surface-variant">
                                        معاينة المباشرة تعكس التدرج البطولي (Hero)، الحاويات الزجاجية، الحدود، وشريط التنقل بالكامل.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 mx-auto w-[320px] overflow-hidden rounded-[36px] border border-m3-outline-variant bg-m3-on-surface p-2 shadow-xl">
                                <div className="flex h-[620px] flex-col overflow-hidden rounded-[28px]" style={previewStyle}>
                                    <div className="flex items-center justify-between px-4 pt-4 pb-3 text-xs"
                                         style={{ color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!), opacity: 0.85 }}>
                                        <span>9:41</span>
                                        <div className="flex items-center gap-1"><span>●●●●</span><span>100%</span></div>
                                    </div>

                                    <div className="flex items-center justify-between px-4 py-3"
                                         style={{
                                             background: withAlpha(surfaceLight, 0.6),
                                             backdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                             WebkitBackdropFilter: `blur(${e.glassBlur}px) saturate(1.2)`,
                                         }}>
                                        <div className="rounded-full px-3 py-1 text-xs" style={{
                                            background: withAlpha(primary, 0.18),
                                            color: hexToCss(c.textPrimary, DEFAULT_COLORS.textPrimary!),
                                            borderRadius: chipRadius,
                                        }}>
                                            مرحباً بك 👋
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-7 w-7 rounded-full" style={{
                                                background: hexToCss(c.surfaceContainer ?? c.surface, DEFAULT_COLORS.surface!),
                                                border: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                            }} />
                                            <div className="h-7 w-7 rounded-full" style={{
                                                background: hexToCss(c.surfaceContainer ?? c.surface, DEFAULT_COLORS.surface!),
                                                border: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                            }} />
                                        </div>
                                    </div>

                                    <div className="px-4 pt-4 pb-3 text-right">
                                        <div className="text-lg font-bold leading-tight">اكتشف أحدث الإبداعات</div>
                                        <div className="mt-1 text-xs" style={{ color: textSecondary }}>
                                            اختر فئة أو ابحث عن مصوّر محترف بالقرب منك
                                        </div>
                                    </div>

                                    <div className="mx-4 flex items-center gap-2 rounded-2xl px-3 py-2" style={{
                                        background: withAlpha(cardSurface, e.surfaceOpacity),
                                        border: `1px solid ${withAlpha(cardBorder, e.borderOpacity)}`,
                                        color: textTertiary,
                                        borderRadius: buttonRadius,
                                        backdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
                                        WebkitBackdropFilter: `blur(${glassBlurVal}) saturate(1.3)`,
                                    }}>
                                        <span>🔍</span>
                                        <span className="text-xs">ابحث عن خدمة، مدينة، حسابات…</span>
                                    </div>

                                    <div className="mt-5 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs" style={{ color: textSecondary }}>آخر العروض</div>
                                            <div className="text-xs font-semibold" style={{ color: primaryLight }}>عرض الكل</div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div key={i} className="h-24 overflow-hidden border" style={cardStyle}>
                                                    <div className="h-12 w-full" style={{ background: primaryGradient }} />
                                                    <div className="px-2 pt-2 text-right">
                                                        <div className="text-[11px] font-semibold" style={{
                                                            color: hexToCss(c.textPrimary ?? c.onSurface, DEFAULT_COLORS.textPrimary!),
                                                        }}>جلسة تصوير</div>
                                                        <div className="text-[10px]" style={{ color: textTertiary }}>بغداد · 50,000 د.ع</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 mx-4 border px-4 py-3 text-right" style={cardStyle}>
                                        <div className="text-xs" style={{ color: textSecondary }}>حالة مبدعيّن اليوم</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 text-[10px]" style={{
                                                borderRadius: chipRadius,
                                                background: withAlpha(hexToCss(c.success, DEFAULT_COLORS.success!), 0.16),
                                                color: hexToCss(c.success, DEFAULT_COLORS.success!),
                                            }}>12 متاح</span>
                                            <span className="px-2 py-1 text-[10px]" style={{
                                                borderRadius: chipRadius,
                                                background: withAlpha(hexToCss(c.warning, DEFAULT_COLORS.warning!), 0.16),
                                                color: hexToCss(c.warning, DEFAULT_COLORS.warning!),
                                            }}>3 محجوز جزئياً</span>
                                            <span className="px-2 py-1 text-[10px]" style={{
                                                borderRadius: chipRadius,
                                                background: withAlpha(hexToCss(c.info, DEFAULT_COLORS.info!), 0.16),
                                                color: hexToCss(c.info, DEFAULT_COLORS.info!),
                                            }}>8 نشطون</span>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    <div className="mx-3 mb-3 flex items-center justify-around px-2 py-2" style={{
                                        background: menuBg,
                                        borderTop: `1px solid ${hexToCss(c.borderLight, DEFAULT_COLORS.borderLight!)}`,
                                        borderRadius: cardRadius,
                                        boxShadow: `0 -8px 26px ${withAlpha(primary, e.navShadowOpacity)}`,
                                    }}>
                                        {NAV_ORDER.map((item, idx) => {
                                            const isActive = idx === activeNav;
                                            const iconUrl = isActive
                                                ? effectiveNavIcons[item.activeKey]
                                                : effectiveNavIcons[item.inKey];
                                            const idField = navFieldToIdField(isActive ? item.activeKey : item.inKey);
                                            const iconId = idField != null ? effectiveNavIcons[idField] ?? null : null;
                                            const parsed = parseIconId(iconId);
                                            const IconComp = parsed ? iconComponent(parsed.name, parsed.weight) : null;
                                            return (
                                                <button key={item.inKey} type="button" onClick={() => setActiveNav(idx)}
                                                        className="flex flex-1 flex-col items-center gap-1 py-1"
                                                        style={{
                                                            borderRadius: buttonRadius,
                                                            background: isActive ? withAlpha(primary, e.activeGlowOpacity) : "transparent",
                                                            boxShadow: isActive ? `0 0 18px ${withAlpha(primary, e.activeGlowOpacity * 0.7)}` : "none",
                                                        }}>
                                                    {IconComp ? (
                                                        <IconComp size={22} weight={parsed?.weight ?? "regular"} color={isActive ? primaryLight : textSecondary} />
                                                    ) : iconUrl ? (
                                                        <Image src={iconUrl} alt={item.label} width={22} height={22}
                                                               className="h-[22px] w-[22px] object-contain" unoptimized />
                                                    ) : (
                                                        <div className="h-[22px] w-[22px] rounded-md" style={{
                                                            background: isActive ? primary : hexToCss(c.textSecondary, DEFAULT_COLORS.textSecondary!),
                                                        }} />
                                                    )}
                                                    <span className="text-[10px]" style={{ color: isActive ? primaryLight : textSecondary }}>
                                                        {item.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-right text-xs text-m3-on-surface-variant">
                                أي لون تركه فارغاً يستخدم القيمة المشتقة من <strong>Smart Palette</strong>. الألوان الأساسية لـ M3 مضمونة بدرجة WCAG AA كحد أدنى.
                            </div>
                        </div>

                        <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button type="button" onClick={() => void loadSettings()}
                                        className="rounded-lg border border-m3-outline-variant/60 px-4 py-2 text-sm font-medium text-m3-on-surface transition hover:bg-m3-background">
                                    إعادة التحميل
                                </button>
                                <button type="button" onClick={() => void handleSave()} disabled={saving || loading}
                                        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-m3-on-surface transition hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-accent/60">
                                    {saving ? "جارٍ الحفظ..." : "حفظ المظهر والأيقونات"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-3">
                    {/* Smart Palette */}
                    <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-violet-50 via-surface-card to-fuchsia-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="text-right">
                                <h3 className="flex items-center justify-end gap-2 font-bold text-m3-on-background">
                                    <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-m3-on-surface shadow">
                                        Enterprise
                                    </span>
                                    لوحة الألوان الذكية (Material Color Utilities)
                                </h3>
                                <p className="mt-1 text-sm text-m3-on-surface-variant">
                                    اختر لوناً واحداً (البذرة) ليتم توليد 5 ألواح نغمية (Primary / Secondary / Tertiary / Neutral /
                                    NeutralVariant) + 85 لوناً + 10 تأثيرات تلقائياً مع ضمان WCAG AA لكل نص.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                            <div className="sm:col-span-4">
                                <label className="mb-2 block text-right text-xs font-semibold text-m3-on-surface">
                                    لون البذرة (Seed Primary)
                                </label>
                                <div dir="ltr" className="flex items-center overflow-hidden rounded-lg border border-m3-outline-variant bg-surface-card focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-violet-100">
                                    <label className="relative block shrink-0 cursor-pointer border-r border-m3-outline-variant/60 bg-m3-background px-3 py-2">
                                        <input type="color" value={colorToSixDigitHex(smartSeed)}
                                               onChange={(e) => setSmartSeed(e.target.value)}
                                               className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                        <div className="h-8 w-8 rounded-md border border-m3-outline-variant shadow-inner"
                                             style={{ background: colorToSixDigitHex(smartSeed) }} />
                                    </label>
                                    <input type="text" dir="ltr" inputMode="text" placeholder="#9B4DFF" value={smartSeed}
                                           onChange={(e) => setSmartSeed(e.target.value)}
                                           className="min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-sm font-mono text-m3-on-background outline-none placeholder:text-m3-outline" />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="mb-2 block text-right text-xs font-semibold text-m3-on-surface">
                                    الوضع (Mode)
                                </label>
                                <div className="flex rounded-lg border border-m3-outline-variant bg-surface-card p-1">
                                    <button type="button" onClick={() => setSmartMode("dark")}
                                            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                smartMode === "dark"
                                                    ? "bg-m3-surface-container-highest text-m3-on-surface shadow-inner"
                                                    : "text-m3-on-surface-variant hover:bg-m3-background"
                                            }`}>🌙 داكن</button>
                                    <button type="button" onClick={() => setSmartMode("light")}
                                            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                smartMode === "light"
                                                    ? "bg-amber-100 text-amber-900 shadow-inner"
                                                    : "text-m3-on-surface-variant hover:bg-m3-background"
                                            }`}>☀️ فاتح</button>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end gap-2 sm:col-span-5">
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" disabled={smartGenerating}
                                            onClick={() => void handleGenerateSmartPalette(false)}
                                            className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-m3-on-surface shadow transition hover:bg-primary-container disabled:opacity-60">
                                        {smartGenerating ? "جارٍ التوليد..." : "⚡ معاينة فقط"}
                                    </button>
                                    <button type="button" disabled={smartGenerating}
                                            onClick={() => void handleGenerateSmartPalette(true)}
                                            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-m3-on-surface shadow transition hover:bg-emerald-700 disabled:opacity-60">
                                        💾 تطبيق وحفظ مباشر
                                    </button>
                                </div>
                                <p className="text-[11px] text-right text-m3-on-surface-variant">
                                    💡 تلميح: ابدأ بـ <span className="font-mono">#9B4DFF</span> (Purple Dream) أو{" "}
                                    <span className="font-mono">#10B981</span> (Ocean) ثم عدّل التفاصيل إن أردت.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-m3-on-background">قوالب جاهزة (Presets)</h3>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                اضغط على أي قالب ليتم تعبئة البذرة والألوان الأساسية — ثم استخدم Smart Palette للتوسيع إلى 85 لون.
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                            {PRESET_THEMES.map((preset) => {
                                const isActive = (colorInputs.primary ?? settings.colors.primary ?? DEFAULT_COLORS.primary) === preset.colors.primary;
                                return (
                                    <button key={preset.name} type="button"
                                            onClick={() => handleApplyPreset(preset)}
                                            className={`group flex flex-col items-center gap-2 rounded-xl border p-2 text-right transition ${
                                                isActive
                                                    ? "border-primary bg-accent/10/70 shadow"
                                                    : "border-m3-outline-variant/60 bg-m3-background/60 hover:border-primary/40 hover:bg-surface-card"
                                            }`}>
                                        <div className="grid h-16 w-full grid-cols-4 overflow-hidden rounded-lg border border-m3-outline-variant/60"
                                             style={{ background: preset.colors.background ?? undefined }}>
                                            <div style={{ background: preset.colors.primary ?? undefined }} />
                                            <div style={{ background: preset.colors.primaryDark ?? undefined }} />
                                            <div style={{ background: preset.colors.surface ?? undefined }} />
                                            <div style={{ background: preset.colors.accentPink ?? undefined }} />
                                        </div>
                                        <div className="w-full text-right text-[12px] font-semibold text-m3-on-background">{preset.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legacy Quick Colors */}
                    <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="text-right">
                                <h3 className="font-bold text-m3-on-background">ألوان سريعة (الإصدار القديم — متوافق)</h3>
                                <p className="mt-1 text-sm text-m3-on-surface-variant">
                                    17 لوناً أساسياً للتوافق مع الإصدارات القديمة من التطبيق. استخدم المجموعات M3 أدناه للتحكم الدقيق.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {LEGACY_COLOR_FIELDS.map((field) => {
                                const current = colorInputs[field.key] ?? "";
                                const effective = hexToCss(effectiveColors[field.key], (DEFAULT_COLORS as any)[field.key]!);
                                const isOverriding = current.length > 0 || settings.colors[field.key];
                                const pickerValue = colorToSixDigitHex(effective);
                                return (
                                    <div key={field.key} className="flex flex-col gap-3 overflow-hidden rounded-xl border border-m3-outline-variant/60 bg-m3-background/60 p-4 text-right">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-m3-on-background">{field.label}</div>
                                                <div className="mt-1 text-[11px] text-m3-on-surface-variant">{field.desc}</div>
                                            </div>
                                            <label className="relative block shrink-0 cursor-pointer">
                                                <input type="color" value={pickerValue}
                                                       onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                       className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                                <div className="h-16 w-28 overflow-hidden rounded-xl border border-m3-outline-variant/60 shadow-inner transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                     style={{
                                                         background: isOverriding
                                                             ? `linear-gradient(135deg, ${effective}, ${mixOnBackground(effective, 0.18)})`
                                                             : effective,
                                                     }} title="اختر اللون">
                                                    <div className="flex h-full items-end justify-start p-1.5">
                                                        <span className="rounded-md bg-m3-on-surface/40 px-2 py-0.5 text-[10px] font-mono tracking-wide text-m3-on-surface">
                                                            {pickerValue}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        <div dir="ltr" className="flex items-center overflow-hidden rounded-lg border border-m3-outline-variant/60 bg-surface-card focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-purple-100">
                                            <label className="relative block shrink-0 cursor-pointer border-r border-m3-outline-variant/60 bg-m3-background/70 px-2.5 py-2">
                                                <input type="color" value={pickerValue}
                                                       onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                       className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-md border border-m3-outline-variant shadow-inner" style={{ background: pickerValue }} />
                                                    <span className="hidden text-[10px] font-medium text-m3-on-surface-variant sm:inline">اختر</span>
                                                </div>
                                            </label>
                                            <input type="text" inputMode="text" dir="ltr" placeholder="#9B4DFF" value={current}
                                                   onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                   className="min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-sm font-mono text-m3-on-background outline-none placeholder:text-m3-outline" />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveColor(field.key)}
                                                className="self-start rounded-md border border-m3-outline-variant/60 bg-surface-card px-3 py-1 text-[11px] text-m3-on-surface-variant transition hover:bg-m3-surface-container-lowest">
                                            إرجاع للافتراضي
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* M3 Color Groups Tabs */}
                    <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-m3-on-background">مجموعات Material 3 (85 لوناً + واجهة WCAG)</h3>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                اختر المجموعة لتصفح الألوان الدقيقة. كل لون نص يُظهر علامة WCAG ⭐ (AAA) / ✅ (AA) / ❌ (أقل من AA).
                            </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 border-b border-m3-outline-variant/60 pb-3">
                            {M3_COLOR_GROUPS.map((grp) => (
                                <button key={grp.id} type="button" onClick={() => setActiveGroup(activeGroup === grp.id ? null : grp.id)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                            activeGroup === grp.id
                                                ? "border-primary bg-accent text-m3-on-surface shadow-sm"
                                                : "border-m3-outline-variant/60 bg-surface-card text-m3-on-surface hover:border-primary/40 hover:bg-accent/10"
                                        }`}>
                                    {grp.title}
                                    <span className="mr-1 rounded bg-m3-on-surface/10 px-1.5 py-0.5 text-[10px] opacity-70">
                                        {grp.fields.length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {M3_COLOR_GROUPS.map((grp) => {
                            if (activeGroup !== grp.id) return null;
                            return (
                                <div key={grp.id} className="mt-4">
                                    <div className="mb-3 rounded-lg border border-violet-200 bg-accent/10/60 px-4 py-3 text-right">
                                        <div className="font-semibold text-m3-on-primary-container">{grp.title}</div>
                                        <div className="mt-1 text-[12px] text-m3-on-primary-container/80">{grp.desc}</div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {grp.fields.map((field) => {
                                            const current = colorInputs[field.key] ?? "";
                                            const effective = hexToCss(effectiveColors[field.key], (DEFAULT_COLORS as any)[field.key]!);
                                            const pickerValue = colorToSixDigitHex(effective);
                                            const wcagKey = `${field.key}__${field.fgOf}`;
                                            const rating = field.fgOf ? computedWcag[wcagKey] : null;
                                            return (
                                                <div key={field.key} className="flex flex-col gap-3 overflow-hidden rounded-xl border border-m3-outline-variant/60 bg-m3-background/60 p-4 text-right">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center justify-end gap-1">
                                                                {rating ? <WcagTag rating={rating} /> : null}
                                                                <div className="text-sm font-semibold text-m3-on-background">{field.label}</div>
                                                            </div>
                                                            {field.desc ? (
                                                                <div className="mt-1 text-[11px] text-m3-on-surface-variant">{field.desc}</div>
                                                            ) : null}
                                                            {field.fgOf ? (
                                                                <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-m3-outline">
                                                                    <span>نص فوق:</span>
                                                                    <span dir="ltr" className="rounded bg-m3-surface-container-high px-1.5 py-0.5 font-mono text-m3-on-surface/80">
                                                                        {field.fgOf}
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <label className="relative block shrink-0 cursor-pointer">
                                                            <input type="color" value={pickerValue}
                                                                   onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                                   className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                                            <div className="h-14 w-24 overflow-hidden rounded-xl border border-m3-outline-variant/60 shadow-inner transition-transform hover:scale-[1.02]"
                                                                 style={{ background: effective }}>
                                                                <div className="flex h-full items-end justify-start p-1">
                                                                    <span className="rounded bg-m3-on-surface/50 px-1.5 py-0.5 text-[9px] font-mono text-m3-on-surface">
                                                                        {pickerValue}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    <div dir="ltr" className="flex items-center overflow-hidden rounded-lg border border-m3-outline-variant/60 bg-surface-card focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-violet-100">
                                                        <label className="relative block shrink-0 cursor-pointer border-r border-m3-outline-variant/60 bg-m3-background/70 px-2.5 py-2">
                                                            <input type="color" value={pickerValue}
                                                                   onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                                   className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                                            <div className="h-8 w-8 rounded-md border border-m3-outline-variant shadow-inner" style={{ background: pickerValue }} />
                                                        </label>
                                                        <input type="text" inputMode="text" dir="ltr" placeholder="#9B4DFF" value={current}
                                                               onChange={(e) => handleColorChange(field.key, e.target.value)}
                                                               className="min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-sm font-mono text-m3-on-background outline-none placeholder:text-m3-outline" />
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveColor(field.key)}
                                                            className="self-start rounded-md border border-m3-outline-variant/60 bg-surface-card px-3 py-1 text-[11px] text-m3-on-surface-variant transition hover:bg-m3-surface-container-lowest">
                                                        إرجاع للافتراضي (Smart Palette)
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Effects */}
                    <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-m3-on-background">تأثيرات وتفاصيل التصميم</h3>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                حرّك المؤشرات لتجربة التدرجات، حواف البطاقات، ظلال الأزرار، وتوهج القسم المفعّل.
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
                                const isOverriding = typeof raw === "number" && Number.isFinite(raw);
                                return (
                                    <div key={field.key} className="rounded-xl border border-m3-outline-variant/60 bg-m3-background/60 p-4 text-right">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-m3-on-background">{field.label}</div>
                                                <div className="mt-1 text-[11px] text-m3-on-surface-variant">{field.desc}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-1.5 text-left text-xs font-mono text-m3-on-background" dir="ltr">
                                                    {field.key.includes("Opacity") ? value.toFixed(2) : value}
                                                    {field.suffix ?? ""}
                                                </div>
                                                {preview ? (
                                                    <div className="h-10 w-10 rounded-lg border border-m3-outline-variant/60" style={{ background: preview }} />
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <input type="range" min={field.min} max={field.max} step={field.step}
                                                   value={value}
                                                   onChange={(e) => handleEffectChange(field.key, parseFloat(e.target.value))}
                                                   className="h-2 flex-1 cursor-pointer accent-purple-600" />
                                            <button type="button" onClick={() => handleResetEffect(field.key)}
                                                    disabled={!isOverriding}
                                                    className="rounded-md border border-m3-outline-variant/60 bg-surface-card px-2.5 py-1 text-[11px] text-m3-on-surface-variant transition hover:bg-m3-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-50">
                                                افتراضي
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nav Icons */}
                    <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                        <div className="text-right">
                            <h3 className="font-bold text-m3-on-background">أيقونات شريط التنقل السفلي</h3>
                            <p className="mt-1 text-sm text-m3-on-surface-variant">
                                لكل زر حالتان: عادية ومفعّلة. اختر من مكتبة Phosphor (78 أيقونة × 6 أنماط) أو ارفع صورة مخصصة.
                            </p>
                        </div>
                        <div className="mt-4 space-y-5">
                            {NAV_ORDER.map((pair) => {
                                const inactive = NAV_ICON_FIELDS.find((f) => f.key === pair.inKey)!;
                                const active = NAV_ICON_FIELDS.find((f) => f.key === pair.activeKey)!;
                                const inIdKey = navFieldToIdField(pair.inKey)!;
                                const activeIdKey = navFieldToIdField(pair.activeKey)!;
                                const inactiveUrl = previewUrls[pair.inKey] ?? settings.navIcons[pair.inKey] ?? null;
                                const activeUrl = previewUrls[pair.activeKey] ?? settings.navIcons[pair.activeKey] ?? null;
                                const inactiveId = iconIdInputs[inIdKey] ?? settings.navIcons[inIdKey] ?? null;
                                const activeId = iconIdInputs[activeIdKey] ?? settings.navIcons[activeIdKey] ?? null;
                                const inParsed = parseIconId(inactiveId);
                                const activeParsed = parseIconId(activeId);
                                const InIconComp = inParsed ? iconComponent(inParsed.name, inParsed.weight) : null;
                                const ActiveIconComp = activeParsed ? iconComponent(activeParsed.name, activeParsed.weight) : null;
                                return (
                                    <div key={pair.inKey} className="space-y-4 rounded-xl border border-m3-outline-variant/60 bg-m3-background/60 p-4">
                                        <div className="text-right">
                                            <div className="text-base font-bold text-m3-on-background">{pair.label}</div>
                                            <div className="text-[11px] text-m3-on-surface-variant">{inactive.desc}</div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-3 text-right">
                                                <div className="text-sm font-semibold text-m3-on-background">حالة عادية (غير محدّدة)</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button type="button" onClick={() => setIconPickerField(inIdKey)}
                                                            className="rounded-lg bg-m3-surface-container-highest px-3 py-2 text-center text-sm font-medium text-m3-on-surface transition hover:bg-m3-surface-container-high">
                                                        اختر من المكتبة
                                                    </button>
                                                    <button type="button" onClick={() => handleClearIconId(inIdKey)} disabled={!inactiveId}
                                                            className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-2 text-sm text-m3-on-surface transition hover:bg-m3-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-50">
                                                        إزالة الأيقونة
                                                    </button>
                                                </div>
                                                <div className="flex justify-center">
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-m3-outline-variant"
                                                         style={{ background: hexToCss(c.menuBackground, DEFAULT_COLORS.menuBackground!) }}>
                                                        {InIconComp ? (
                                                            <InIconComp size={48} weight={inParsed?.weight ?? "regular"}
                                                                       color={hexToCss(c.textSecondary, DEFAULT_COLORS.textSecondary!)} />
                                                        ) : inactiveUrl ? (
                                                            <Image src={inactiveUrl} alt={inactive.label} width={64} height={64}
                                                                   className="h-16 w-16 object-contain" unoptimized />
                                                        ) : (
                                                            <span className="text-center text-[11px] text-m3-outline-variant">لا توجد أيقونة</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {inParsed ? (
                                                    <div dir="ltr" className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-2 py-1 text-center font-mono text-[11px] text-m3-on-surface-variant">
                                                        {buildIconId(inParsed.name, inParsed.weight)}
                                                    </div>
                                                ) : null}
                                                <div className="space-y-2 border-t border-dashed border-m3-outline-variant pt-3">
                                                    <div className="text-[11px] font-medium text-m3-on-surface-variant">أو صورة مخصصة (PNG/WEBP):</div>
                                                    <label className="block cursor-pointer rounded-lg border border-m3-outline-variant bg-surface-card px-3 py-2 text-center text-xs font-medium text-m3-on-surface transition hover:bg-m3-surface-container-lowest">
                                                        اختيار ملف
                                                        <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                                               onChange={(event) => handleFileChange(pair.inKey, event)} />
                                                    </label>
                                                    <button type="button" onClick={() => handleRemoveIcon(pair.inKey)}
                                                            className="w-full rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-1.5 text-[11px] text-m3-on-surface transition hover:bg-m3-surface-container-lowest">
                                                        إزالة الصورة
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-3 text-right">
                                                <div className="text-sm font-semibold text-m3-on-background">حالة مفعّلة (عند فتح القسم)</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button type="button" onClick={() => setIconPickerField(activeIdKey)}
                                                            className="rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-m3-on-surface transition hover:bg-primary-container">
                                                        اختر من المكتبة
                                                    </button>
                                                    <button type="button" onClick={() => handleClearIconId(activeIdKey)} disabled={!activeId}
                                                            className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-2 text-sm text-m3-on-surface transition hover:bg-m3-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-50">
                                                        إزالة الأيقونة
                                                    </button>
                                                </div>
                                                <div className="flex justify-center">
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed"
                                                         style={{
                                                             background: withAlpha(primary, 0.18),
                                                             borderColor: hexToCss(c.primaryLight, DEFAULT_COLORS.primaryLight!),
                                                         }}>
                                                        {ActiveIconComp ? (
                                                            <ActiveIconComp size={48} weight={activeParsed?.weight ?? "fill"} color={primaryLight} />
                                                        ) : activeUrl ? (
                                                            <Image src={activeUrl} alt={active.label} width={64} height={64}
                                                                   className="h-16 w-16 object-contain" unoptimized />
                                                        ) : (
                                                            <span className="text-center text-[11px] text-m3-outline-variant">لا توجد أيقونة مفعّلة</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {activeParsed ? (
                                                    <div dir="ltr" className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-2 py-1 text-center font-mono text-[11px] text-m3-on-surface-variant">
                                                        {buildIconId(activeParsed.name, activeParsed.weight)}
                                                    </div>
                                                ) : null}
                                                <div className="space-y-2 border-t border-dashed border-m3-outline-variant pt-3">
                                                    <div className="text-[11px] font-medium text-m3-on-surface-variant">أو صورة مخصصة (PNG/WEBP):</div>
                                                    <label className="block cursor-pointer rounded-lg border border-primary/40 bg-accent/10 px-3 py-2 text-center text-xs font-medium text-m3-primary transition hover:bg-accent/15">
                                                        اختيار ملف
                                                        <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                                               onChange={(event) => handleFileChange(pair.activeKey, event)} />
                                                    </label>
                                                    <button type="button" onClick={() => handleRemoveIcon(pair.activeKey)}
                                                            className="w-full rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-1.5 text-[11px] text-m3-on-surface transition hover:bg-m3-surface-container-lowest">
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
                            defaultWeight={iconPickerField.toLowerCase().includes("active") ? "fill" : "regular"}
                        />
                    ) : null}
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card px-4 py-6 text-center text-sm text-m3-on-surface-variant shadow-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-m3-on-surface/60 p-4 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-m3-outline-variant/60 bg-surface-card shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-m3-outline-variant/60 bg-m3-background px-5 py-3">
                    <div className="text-right">
                        <div className="font-bold text-m3-on-background">اختيار أيقونة — Phosphor Icons</div>
                        <div className="text-[11px] text-m3-on-surface-variant">
                            اختر الأيقونة ثمّ النمط (الوزن) الملائم. النمط المقترح:{" "}
                            <span className="font-semibold">
                                {weight === "fill" ? "مملوء (الحالة المفعّلة)" : "عادي (الحالة العادية)"}
                            </span>
                        </div>
                    </div>
                    <button type="button" onClick={props.onClose}
                            className="rounded-lg border border-m3-outline-variant/60 bg-surface-card px-3 py-1.5 text-sm text-m3-on-surface transition hover:bg-m3-surface-container-lowest">
                        إغلاق
                    </button>
                </div>

                <div className="space-y-3 border-b border-m3-outline-variant/60 px-5 py-3">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {PHOSPHOR_WEIGHTS.map((w) => {
                                const Comp = iconComponent("house", w.key);
                                const active = w.key === weight;
                                return (
                                    <button key={w.key} type="button" onClick={() => setWeight(w.key)}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                                active
                                                    ? "border-primary bg-accent/10 text-m3-primary shadow-sm"
                                                    : "border-m3-outline-variant/60 bg-surface-card text-m3-on-surface hover:bg-m3-background"
                                            }`}>
                                        {Comp ? <Comp size={16} /> : null}
                                        {w.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div dir="ltr" className="flex items-center overflow-hidden rounded-lg border border-m3-outline-variant/60 bg-surface-card focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-purple-100">
                            <Pi.MagnifyingGlass size={16} className="ml-2 shrink-0 text-m3-outline" weight="bold" />
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                   placeholder="ابحث باسم الأيقونة (home, search, gem, heart...)"
                                   className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-right text-sm text-m3-on-background outline-none placeholder:text-m3-outline" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-m3-outline-variant py-12 text-center text-sm text-m3-on-surface-variant">
                            لا توجد أيقونات مطابقة للبحث.
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12">
                            {filtered.map((item) => {
                                const Comp = iconComponent(item.name, weight);
                                if (!Comp) return null;
                                return (
                                    <button key={item.name} type="button"
                                            title={`${item.label} — ${item.name} (${weight})`}
                                            onClick={() => props.onPick(item.name, weight)}
                                            className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-m3-outline-variant/60 bg-m3-background/50 p-1.5 text-center transition hover:-translate-y-0.5 hover:border-primary/70 hover:bg-accent/10 hover:shadow-md active:translate-y-0">
                                        <Comp size={24} className="text-m3-on-surface group-hover:text-accent" />
                                        <span className="truncate text-[9px] font-medium text-m3-on-surface-variant group-hover:text-m3-primary">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-m3-outline-variant/60 bg-m3-background px-5 py-2.5 text-[11px] text-m3-on-surface-variant">
                    <span>
                        المكتبة تحتوي على 78 أيقونة × 6 أنماط (Phosphor Icons) — يتطابق مع Flutter مباشرةً.
                    </span>
                    <span dir="ltr" className="font-mono">
                        {filtered.length} / {PHOSPHOR_ICONS.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
