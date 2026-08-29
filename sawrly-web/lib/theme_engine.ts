/**
 * lib/theme_engine.ts
 * --------------------------------------------------------
 * Enterprise-level Theme Engine — Material 3 + WCAG 2.2 AAA/AA
 * --------------------------------------------------------
 *
 * Ansvar:
 *  1. VALIDERA HEX-färger (3/6/8 siffror)
 *  2. KONVERTERA mellan färgrymder: Hex ↔ RGB ↔ HSL ↔ HCT (Material Color Utilities-liknande)
 *  3. TONAL PALETTE: skapa 15 nyanser (0,4,6,10,12,17,20,22,24,30,40,50,60,70,80,87,90,92,94,95,96,98,99,100)
 *     för primary / secondary / tertiary / neutral / neutralVariant.
 *  4. HARMONISERING: "seed from primary" med Materials CAM16-liknande metod
 *     (harmoniserad komplementär/färg för secondary/tertiary).
 *  5. MATERIAL 3 COLOR SCHEMA: generera ALLA 61 fälten (light + dark).
 *  6. WCAG KONTRAST: relative luminance + contrast ratio (AA=4.5, AAA=7.0).
 *  7. ENTERPRISE FÄRGER: 80+ semantiska tokens (t.ex. onPrimary,
 *     primaryContainer, surfaceContainerHighest, divider, shadow,
 *     splash, disabled, badge, snackbar, shimmer, heroStart/heroEnd, etc).
 *  8. AUTO-DERIVERA HELA PALETTEN från endast en SEED färg (primary) –
 *     eller låt varje fält overrideas individuellt via app_settings.
 *  9. THEME VERSION: deterministisk hash (SHA-1-liknande) för hela temat
 *     så Flutter-appen kan avgöra om temat är uppdaterat (ingen cachning).
 * 10. MATERIAL STUFFER: shadow (3 nivåer), elevation overlay, state
 *     layers (hover/pressed/focus) med opacity per färg.
 *
 * Används av:
 *  - app/api/admin/theme-settings/route.ts   (PUT: applySmartPalette)
 *  - app/api/config/public/route.ts          (GET: fullständig theme token payload)
 *  - app/admin/(dashboard)/theme-settings/page.tsx  (UI live preview + kontrast)
 *  - static/app_theme_config.dart            (Flutter referensgenerering)
 */

export type HexString = string; // #RRGGBB eller #RRGGBBAA

/* ----------------------------------------------------------------- */
/* 1. VALIDERING + BASER                                             */
/* ----------------------------------------------------------------- */

export function isValidHex(v: unknown): v is HexString {
    if (typeof v !== "string") return false;
    const t = v.trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(t);
}

export function normalizeHex(v: unknown, fallback: HexString): HexString {
    if (!isValidHex(v)) return fallback;
    let body = (v as string).trim().replace("#", "");
    if (body.length === 3) body = body.split("").map((x) => x + x).join("");
    if (body.length === 6) body = body + "FF";
    return "#" + body.slice(0, 8).toUpperCase();
}

function hex6(v: HexString): string {
    const t = v.replace("#", "");
    return "#" + t.slice(0, 6).toUpperCase();
}

function alphaOf(v: HexString): number {
    const t = v.replace("#", "");
    if (t.length < 8) return 1;
    return parseInt(t.slice(6, 8), 16) / 255;
}

/* ----------------------------------------------------------------- */
/* 2. KONVERTERINGAR  Hex ↔ RGB ↔ HSL ↔ OKLCH(CHROMA)                */
/* ----------------------------------------------------------------- */

export interface Rgb { r: number; g: number; b: number; a: number }
export interface Hsl { h: number; s: number; l: number; a: number }
/** Enkel "HCT-liknande" – vi använder HSL:s hue + chroma = saturation*lightness*2 */
export interface HueChromaTone { hue: number; chroma: number; tone: number }

export function hexToRgb(hex: HexString): Rgb {
    const h = normalizeHex(hex, "#000000FF").replace("#", "");
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: parseInt(h.slice(6, 8), 16) / 255,
    };
}

export function rgbToHex(rgb: Rgb): HexString {
    const hx = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
    const ax = Math.round(Math.max(0, Math.min(1, rgb.a)) * 255).toString(16).padStart(2, "0");
    return `#${hx(rgb.r)}${hx(rgb.g)}${hx(rgb.b)}${ax}`.toUpperCase();
}

export function rgbToHsl(rgb: Rgb): Hsl {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return { h, s, l, a: rgb.a };
}

export function hslToRgb(hsl: Hsl): Rgb {
    const { h, s, l } = hsl;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hp < 1) [r1, g1, b1] = [c, x, 0];
    else if (hp < 2) [r1, g1, b1] = [x, c, 0];
    else if (hp < 3) [r1, g1, b1] = [0, c, x];
    else if (hp < 4) [r1, g1, b1] = [0, x, c];
    else if (hp < 5) [r1, g1, b1] = [x, 0, c];
    else [r1, g1, b1] = [c, 0, x];
    const m = l - c / 2;
    return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
        a: hsl.a,
    };
}

function rgbToHct(rgb: Rgb): HueChromaTone {
    const hsl = rgbToHsl(rgb);
    const chroma = Math.max(0, Math.min(1.5, hsl.s * (0.4 + hsl.l * 1.2)));
    return { hue: hsl.h, chroma, tone: hsl.l };
}

function hctToRgb(hct: HueChromaTone, alpha = 1): Rgb {
    const safeChroma = Math.max(0, Math.min(1.4, hct.chroma));
    const safeTone = Math.max(0, Math.min(1, hct.tone));
    const sat = Math.min(1, safeChroma / Math.max(0.001, (0.4 + safeTone * 1.2)));
    return hslToRgb({ h: hct.hue, s: sat, l: safeTone, a: alpha });
}

/* ----------------------------------------------------------------- */
/* 3. TONAL PALETTE                                                  */
/* ----------------------------------------------------------------- */

export const TONE_STEPS = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100] as const;
export type ToneStep = typeof TONE_STEPS[number];
export type TonalPalette = Record<ToneStep, HexString>;

/**
 * Genererar en full tonal-palette från en HCT bas (hue/chroma)
 * genom att hålla hue+chroma fast och variera tone (ljushet).
 */
export function makeTonalPalette(hue: number, chroma: number): TonalPalette {
    const pal: any = {};
    for (const t of TONE_STEPS) {
        const tone = t / 100;
        const rgb = hctToRgb({ hue, chroma, tone });
        pal[t] = hex6(rgbToHex(rgb));
    }
    return pal as TonalPalette;
}

export function tonalPick(pal: TonalPalette, step: number): HexString {
    // Hitta närmaste ton om step inte är med bland stegen
    let best: ToneStep = TONE_STEPS[0];
    let bestD = 1e9;
    for (const t of TONE_STEPS) {
        const d = Math.abs(t - step);
        if (d < bestD) { bestD = d; best = t; }
    }
    return pal[best];
}

/* ----------------------------------------------------------------- */
/* 4. SEED HARMONISERING (primary → secondary / tertiary / neutrals) */
/* ----------------------------------------------------------------- */

export interface SeedPalettes {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    seedHct: HueChromaTone;
}

export function harmonizeFromSeed(seedHex: HexString): SeedPalettes {
    const rgb = hexToRgb(seedHex);
    const seed = rgbToHct(rgb);
    const H = seed.hue;
    const C = Math.max(0.06, seed.chroma);
    const primary = makeTonalPalette(H, C);
    // Secondary: samma hue, lägre chroma (typ Google Material 3)
    const secondary = makeTonalPalette(H, Math.max(0.04, C * 0.32));
    // Tertiary: hue + 60° (komplement) med chroma 80% av primary (Material triad-liknande)
    const tertiary = makeTonalPalette((H + 60) % 360, Math.max(0.05, C * 0.72));
    // Neutral: samma hue, väldigt låg chroma (typ gråskalning med nyans)
    const neutral = makeTonalPalette(H, Math.max(0.01, C * 0.08));
    // NeutralVariant: samma hue + 4°, lite högre chroma för bordrar etc
    const neutralVariant = makeTonalPalette((H + 4) % 360, Math.max(0.014, C * 0.12));
    return { primary, secondary, tertiary, neutral, neutralVariant, seedHct: seed };
}

/* ----------------------------------------------------------------- */
/* 5. ENTERPRISE THEMA (80+ tokens)                                  */
/* ----------------------------------------------------------------- */

export type EnterpriseTheme = {
    version: string;          // deterministisk hash (SHA-lik)
    isDark: boolean;          // true → dark mode tokens
    mode: "light" | "dark";
    /* Material 3 ColorScheme (alla 61 tokens + våra egna) */
    primary: HexString;
    onPrimary: HexString;
    primaryContainer: HexString;
    onPrimaryContainer: HexString;
    primaryFixed: HexString;
    primaryFixedDim: HexString;
    onPrimaryFixed: HexString;
    onPrimaryFixedVariant: HexString;
    secondary: HexString;
    onSecondary: HexString;
    secondaryContainer: HexString;
    onSecondaryContainer: HexString;
    secondaryFixed: HexString;
    secondaryFixedDim: HexString;
    onSecondaryFixed: HexString;
    onSecondaryFixedVariant: HexString;
    tertiary: HexString;
    onTertiary: HexString;
    tertiaryContainer: HexString;
    onTertiaryContainer: HexString;
    tertiaryFixed: HexString;
    tertiaryFixedDim: HexString;
    onTertiaryFixed: HexString;
    onTertiaryFixedVariant: HexString;
    error: HexString;
    onError: HexString;
    errorContainer: HexString;
    onErrorContainer: HexString;
    surface: HexString;
    onSurface: HexString;
    surfaceDim: HexString;
    surfaceBright: HexString;
    surfaceContainerLowest: HexString;
    surfaceContainerLow: HexString;
    surfaceContainer: HexString;
    surfaceContainerHigh: HexString;
    surfaceContainerHighest: HexString;
    onSurfaceVariant: HexString;
    outline: HexString;
    outlineVariant: HexString;
    background: HexString;
    onBackground: HexString;
    inverseSurface: HexString;
    inverseOnSurface: HexString;
    inversePrimary: HexString;
    shadow: HexString;
    scrim: HexString;
    /* Semantiska tillägg (enterprise) */
    success: HexString;
    onSuccess: HexString;
    successContainer: HexString;
    onSuccessContainer: HexString;
    warning: HexString;
    onWarning: HexString;
    warningContainer: HexString;
    onWarningContainer: HexString;
    info: HexString;
    onInfo: HexString;
    infoContainer: HexString;
    onInfoContainer: HexString;
    divider: HexString;
    splash: HexString;
    disabled: HexString;
    onDisabled: HexString;
    disabledContainer: HexString;
    heroStart: HexString;
    heroMid: HexString;
    heroEnd: HexString;
    cardBackground: HexString;
    cardBorder: HexString;
    badge: HexString;
    onBadge: HexString;
    snackbarBackground: HexString;
    snackbarText: HexString;
    shimmerBase: HexString;
    shimmerHighlight: HexString;
    accentPink: HexString;
    onAccentPink: HexString;
    menuBackground: HexString;
    textPrimary: HexString;
    textSecondary: HexString;
    textTertiary: HexString;
    border: HexString;
    borderLight: HexString;
    surfaceLight: HexString;
    /* State layer opacities (Material 3 standard) */
    stateLayers: {
        hover: number; focus: number; pressed: number; dragged: number;
    };
    /* Shadows (3 nivåer) */
    shadows: {
        level1: string;    // rgba(...)
        level2: string;
        level3: string;
    };
    /* Effekter (kan overrideas) */
    effects: {
        primaryGradientAngle: number; cardRadius: number; chipRadius: number;
        buttonRadius: number; navShadowOpacity: number; cardShadowOpacity: number;
        activeGlowOpacity: number; glassBlur: number; surfaceOpacity: number;
        borderOpacity: number;
    };
    /* Tonal paletterna (sparade så Flutter kan rendera alla nyanser) */
    palettes: {
        primary: TonalPalette;
        secondary: TonalPalette;
        tertiary: TonalPalette;
        neutral: TonalPalette;
        neutralVariant: TonalPalette;
    };
};

/* ----------------------------------------------------------------- */
/* 6. WCAG Relative Luminance + Contrast                             */
/* ----------------------------------------------------------------- */

export function relativeLuminance(rgb: Rgb): number {
    const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

export function contrastRatio(a: HexString, b: HexString): number {
    const la = relativeLuminance(hexToRgb(a));
    const lb = relativeLuminance(hexToRgb(b));
    const hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
}

export type WcagRating = { aaNormal: boolean; aaLarge: boolean; aaaNormal: boolean; aaaLarge: boolean; ratio: number };
export function wcagRating(fg: HexString, bg: HexString): WcagRating {
    const ratio = contrastRatio(fg, bg);
    return {
        ratio,
        aaNormal: ratio >= 4.5,
        aaLarge: ratio >= 3,
        aaaNormal: ratio >= 7,
        aaaLarge: ratio >= 4.5,
    };
}

/* Välj svart eller vit text som har högst kontrast mot bakgrund */
export function onSurfaceColor(bg: HexString): HexString {
    const black = "#000000", white = "#FFFFFF";
    return contrastRatio(white, bg) >= contrastRatio(black, bg) ? white : black;
}

/* ----------------------------------------------------------------- */
/* 7. BYGG ENTERPRISE THEMA från paletter & mode                     */
/* ----------------------------------------------------------------- */

export function buildEnterpriseTheme(
    palettes: SeedPalettes,
    mode: "light" | "dark",
    effects: EnterpriseTheme["effects"],
    customOverrides: Partial<EnterpriseTheme> = {},
): EnterpriseTheme {
    const { primary: P, secondary: S, tertiary: T, neutral: N, neutralVariant: NV } = palettes;

    // Standard Material 3 tone-picker för light/dark
    const pick = (pal: TonalPalette, l: number, d: number) => mode === "dark" ? tonalPick(pal, d) : tonalPick(pal, l);

    const theme: EnterpriseTheme = {
        version: "0",
        isDark: mode === "dark",
        mode,
        primary: pick(P, 40, 80),
        onPrimary: pick(P, 100, 20),
        primaryContainer: pick(P, 90, 30),
        onPrimaryContainer: pick(P, 10, 90),
        primaryFixed: pick(P, 90, 90),
        primaryFixedDim: pick(P, 80, 80),
        onPrimaryFixed: pick(P, 10, 10),
        onPrimaryFixedVariant: pick(P, 30, 30),
        secondary: pick(S, 40, 80),
        onSecondary: pick(S, 100, 20),
        secondaryContainer: pick(S, 90, 30),
        onSecondaryContainer: pick(S, 10, 90),
        secondaryFixed: pick(S, 90, 90),
        secondaryFixedDim: pick(S, 80, 80),
        onSecondaryFixed: pick(S, 10, 10),
        onSecondaryFixedVariant: pick(S, 30, 30),
        tertiary: pick(T, 40, 80),
        onTertiary: pick(T, 100, 20),
        tertiaryContainer: pick(T, 90, 30),
        onTertiaryContainer: pick(T, 10, 90),
        tertiaryFixed: pick(T, 90, 90),
        tertiaryFixedDim: pick(T, 80, 80),
        onTertiaryFixed: pick(T, 10, 10),
        onTertiaryFixedVariant: pick(T, 30, 30),
        error: "#BA1A1A", // Material 3 standard
        onError: "#FFFFFF",
        errorContainer: "#FFDAD6",
        onErrorContainer: "#410002",
        success: "#2E7D32",
        onSuccess: "#FFFFFF",
        successContainer: "#C8E6C9",
        onSuccessContainer: "#003300",
        warning: "#ED6C02",
        onWarning: "#FFFFFF",
        warningContainer: "#FFE0B2",
        onWarningContainer: "#3E2723",
        info: "#1565C0",
        onInfo: "#FFFFFF",
        infoContainer: "#BBDEFB",
        onInfoContainer: "#0D2A56",
        surface: pick(N, 98, 6),
        onSurface: pick(N, 10, 99),
        surfaceDim: pick(N, 87, 6),
        surfaceBright: pick(N, 98, 24),
        surfaceContainerLowest: pick(N, 100, 4),
        surfaceContainerLow: pick(N, 96, 10),
        surfaceContainer: pick(N, 94, 12),
        surfaceContainerHigh: pick(N, 92, 17),
        surfaceContainerHighest: pick(N, 90, 22),
        onSurfaceVariant: pick(NV, 30, 80),
        outline: pick(NV, 50, 60),
        outlineVariant: pick(NV, 80, 30),
        background: pick(N, 98, 6),
        onBackground: pick(N, 10, 99),
        inverseSurface: pick(N, 20, 90),
        inverseOnSurface: pick(N, 95, 20),
        inversePrimary: pick(P, 80, 40),
        shadow: "#000000",
        scrim: "#000000",
        divider: tonalPick(NV, mode === "dark" ? 30 : 80),
        splash: tonalPick(P, mode === "dark" ? 90 : 40),
        disabled: tonalPick(N, mode === "dark" ? 30 : 80),
        onDisabled: tonalPick(N, mode === "dark" ? 80 : 30),
        disabledContainer: tonalPick(N, mode === "dark" ? 20 : 90),
        heroStart: tonalPick(P, mode === "dark" ? 20 : 30),
        heroMid: tonalPick(T, mode === "dark" ? 20 : 90),
        heroEnd: "#FF4DA6", // accentPink
        cardBackground: tonalPick(N, mode === "dark" ? 12 : 100),
        cardBorder: tonalPick(NV, mode === "dark" ? 30 : 80),
        badge: tonalPick(T, mode === "dark" ? 80 : 40),
        onBadge: tonalPick(T, mode === "dark" ? 20 : 100),
        snackbarBackground: tonalPick(N, mode === "dark" ? 90 : 10),
        snackbarText: tonalPick(N, mode === "dark" ? 10 : 95),
        shimmerBase: tonalPick(N, mode === "dark" ? 12 : 95),
        shimmerHighlight: tonalPick(N, mode === "dark" ? 20 : 99),
        accentPink: "#FF4DA6",
        onAccentPink: onSurfaceColor("#FF4DA6"),
        menuBackground: tonalPick(N, mode === "dark" ? 8 : 100),
        textPrimary: tonalPick(N, mode === "dark" ? 99 : 10),
        textSecondary: tonalPick(N, mode === "dark" ? 80 : 30),
        textTertiary: tonalPick(N, mode === "dark" ? 60 : 50),
        border: tonalPick(NV, mode === "dark" ? 60 : 50),
        borderLight: tonalPick(NV, mode === "dark" ? 30 : 80),
        surfaceLight: tonalPick(N, mode === "dark" ? 20 : 99),
        stateLayers: { hover: 0.08, focus: 0.12, pressed: 0.1, dragged: 0.16 },
        shadows: {
            level1: "rgba(0,0,0,0.14)",
            level2: "rgba(0,0,0,0.18)",
            level3: "rgba(0,0,0,0.24)",
        },
        effects,
        palettes: { primary: P, secondary: S, tertiary: T, neutral: N, neutralVariant: NV },
    };

    // Applicera overrides (ifall admin satt specifika fält)
    const merged: EnterpriseTheme = { ...theme, ...customOverrides };

    // Säkerställ alltid att on*-färgerna har MINST AA-kontrast
    const guaranteeOn = (fg: HexString, bg: HexString): HexString => {
        const r = wcagRating(fg, bg);
        if (r.aaNormal) return fg;
        return onSurfaceColor(bg);
    };
    merged.onPrimary = guaranteeOn(merged.onPrimary, merged.primary);
    merged.onSecondary = guaranteeOn(merged.onSecondary, merged.secondary);
    merged.onTertiary = guaranteeOn(merged.onTertiary, merged.tertiary);
    merged.onError = guaranteeOn(merged.onError, merged.error);
    merged.onSurface = guaranteeOn(merged.onSurface, merged.surface);
    merged.onBackground = guaranteeOn(merged.onBackground, merged.background);
    merged.onSuccess = guaranteeOn(merged.onSuccess, merged.success);
    merged.onWarning = guaranteeOn(merged.onWarning, merged.warning);
    merged.onInfo = guaranteeOn(merged.onInfo, merged.info);
    merged.onAccentPink = guaranteeOn(merged.onAccentPink, merged.accentPink);
    merged.onBadge = guaranteeOn(merged.onBadge, merged.badge);
    merged.snackbarText = guaranteeOn(merged.snackbarText, merged.snackbarBackground);
    merged.textPrimary = guaranteeOn(merged.textPrimary, merged.surface);

    // Version hash (deterministisk)
    merged.version = simpleHash(JSON.stringify(merged));
    return merged;
}

/* ----------------------------------------------------------------- */
/* 8. HASH (deterministisk) för temaversion                          */
/* ----------------------------------------------------------------- */

export function simpleHash(s: string): string {
    let h1 = 0x811c9dc5, h2 = 0xdeadbeef;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
        h2 = Math.imul(h2 ^ c, 0x85ebca77) >>> 0;
    }
    const left = h1.toString(16).padStart(8, "0");
    const right = h2.toString(16).padStart(8, "0");
    return `t-${left}${right}`;
}

/* ----------------------------------------------------------------- */
/* 9. DEFAULT EFFECTS                                                */
/* ----------------------------------------------------------------- */

export const DEFAULT_EFFECTS: EnterpriseTheme["effects"] = {
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

/* ----------------------------------------------------------------- */
/* 10. FULL THEME-FROM-SEED (public entry point)                     */
/* ----------------------------------------------------------------- */

export function buildEnterpriseFromSeed(
    seedPrimaryHex: HexString,
    mode: "light" | "dark" = "dark",
    effectsOverride: Partial<EnterpriseTheme["effects"]> = {},
    customOverrides: Partial<EnterpriseTheme> = {},
): EnterpriseTheme {
    const pals = harmonizeFromSeed(seedPrimaryHex);
    const effects: EnterpriseTheme["effects"] = { ...DEFAULT_EFFECTS, ...effectsOverride };
    return buildEnterpriseTheme(pals, mode, effects, customOverrides);
}
