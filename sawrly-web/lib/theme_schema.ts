import {
    buildEnterpriseFromSeed,
    contrastRatio,
    normalizeHex,
    type EnterpriseTheme,
    type HexString,
} from '@/lib/theme_engine';

export const THEME_SCHEMA_VERSION = 2 as const;

export type StylePresetId =
    | 'sawrly-noir' | 'luxury-dark' | 'glass-dark' | 'elegant-light'
    | 'soft-modern' | 'midnight' | 'aurora' | 'minimal' | 'high-contrast';
export type SurfaceStyle = 'flat' | 'soft' | 'glass' | 'layered';

export type StyleDNA = {
    darkness: number;
    contrast: number;
    accentStrength: number;
    whiteUsage: number;
    surfaceSeparation: number;
    glassStrength: number;
    blurStrength: number;
    borderOpacity: number;
    shadowStrength: number;
    shadowSoftness: number;
    ambientLight: number;
    vignetteStrength: number;
    gradientDepth: number;
    cardOpacity: number;
    radiusStyle: number;
    elevationDepth: number;
};

export type ThemeBackgroundRecipe = {
    style: 'solid' | 'soft-gradient' | 'deep-gradient' | 'ambient' | 'custom';
    stops: [HexString, HexString, HexString, HexString, HexString];
    angle: number;
    radialLight: { color: HexString; opacity: number; x: number; y: number };
    vignette: number;
};

export type ThemeComponentRecipes = {
    header: { style: 'solid' | 'gradient' | 'glass' | 'transparent'; opacity: number; borderOpacity: number; radius: number };
    card: { opacity: number; borderOpacity: number; radius: number; shadow: number };
    hero: { radius: number; borderOpacity: number; ambientLight: number };
    cta: { accentStrength: number; glow: number; radius: number };
    navigation: { style: 'solid' | 'glass' | 'floating'; opacity: number; blur: number; borderOpacity: number; radius: number };
};

export type ThemeOverrideMap = Partial<Record<string, string | number | boolean>>;

export type CanonicalThemeInput = {
    schemaVersion: typeof THEME_SCHEMA_VERSION;
    metadata: { name: string; style: StylePresetId };
    colors: { seed: HexString; accent?: HexString; brightness: 'light' | 'dark' };
    controls: { mood: number; brightness: number; accentStrength: number; surfaceStyle: SurfaceStyle; autoContrast: boolean };
    styleDNA: StyleDNA;
    overrides: ThemeOverrideMap;
};

export type ResolvedTheme = CanonicalThemeInput & {
    material3: EnterpriseTheme;
    background: ThemeBackgroundRecipe;
    surfaces: [HexString, HexString, HexString, HexString, HexString];
    components: ThemeComponentRecipes;
    accessibility: { score: number; status: 'good' | 'needs-attention'; checks: Record<string, number> };
    overrideSources: Record<string, 'generated' | 'manual'>;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function mix(a: string, b: string, amount: number): HexString {
    const read = (value: string, i: number) => parseInt(normalizeHex(value, '#000000').slice(1 + i * 2, 3 + i * 2), 16);
    const channel = (i: number) => Math.round(read(a, i) + (read(b, i) - read(a, i)) * clamp(amount)).toString(16).padStart(2, '0');
    return (`#${channel(0)}${channel(1)}${channel(2)}`).toUpperCase() as HexString;
}

export const STYLE_PRESETS: Record<StylePresetId, { label: string; dna: StyleDNA; seed: HexString; accent: HexString; surfaceStyle: SurfaceStyle }> = {
    'sawrly-noir': { label: 'Sawrly Noir', seed: '#9F1239', accent: '#DB2777', surfaceStyle: 'glass', dna: { darkness: .82, contrast: .74, accentStrength: .18, whiteUsage: .82, surfaceSeparation: .12, glassStrength: .54, blurStrength: 19, borderOpacity: .12, shadowStrength: .20, shadowSoftness: .85, ambientLight: .18, vignetteStrength: .22, gradientDepth: .72, cardOpacity: .94, radiusStyle: .72, elevationDepth: .34 } },
    'luxury-dark': { label: 'Luxury Dark', seed: '#6D214F', accent: '#D4AF37', surfaceStyle: 'layered', dna: { darkness: .78, contrast: .7, accentStrength: .22, whiteUsage: .78, surfaceSeparation: .16, glassStrength: .25, blurStrength: 10, borderOpacity: .14, shadowStrength: .24, shadowSoftness: .8, ambientLight: .14, vignetteStrength: .18, gradientDepth: .6, cardOpacity: .96, radiusStyle: .62, elevationDepth: .42 } },
    'glass-dark': { label: 'Glass Dark', seed: '#2563EB', accent: '#22D3EE', surfaceStyle: 'glass', dna: { darkness: .76, contrast: .7, accentStrength: .24, whiteUsage: .76, surfaceSeparation: .14, glassStrength: .82, blurStrength: 25, borderOpacity: .2, shadowStrength: .16, shadowSoftness: .9, ambientLight: .28, vignetteStrength: .12, gradientDepth: .62, cardOpacity: .72, radiusStyle: .78, elevationDepth: .3 } },
    'elegant-light': { label: 'Elegant Light', seed: '#7C3AED', accent: '#C026D3', surfaceStyle: 'soft', dna: { darkness: .08, contrast: .68, accentStrength: .18, whiteUsage: .15, surfaceSeparation: .1, glassStrength: .12, blurStrength: 6, borderOpacity: .12, shadowStrength: .12, shadowSoftness: .9, ambientLight: .1, vignetteStrength: 0, gradientDepth: .18, cardOpacity: .98, radiusStyle: .62, elevationDepth: .22 } },
    'soft-modern': { label: 'Soft Modern', seed: '#0F766E', accent: '#F59E0B', surfaceStyle: 'soft', dna: { darkness: .18, contrast: .62, accentStrength: .16, whiteUsage: .22, surfaceSeparation: .09, glassStrength: .18, blurStrength: 8, borderOpacity: .1, shadowStrength: .1, shadowSoftness: .95, ambientLight: .12, vignetteStrength: .03, gradientDepth: .22, cardOpacity: .98, radiusStyle: .8, elevationDepth: .18 } },
    midnight: { label: 'Midnight', seed: '#4338CA', accent: '#38BDF8', surfaceStyle: 'layered', dna: { darkness: .86, contrast: .78, accentStrength: .2, whiteUsage: .84, surfaceSeparation: .14, glassStrength: .28, blurStrength: 12, borderOpacity: .14, shadowStrength: .22, shadowSoftness: .82, ambientLight: .16, vignetteStrength: .2, gradientDepth: .65, cardOpacity: .94, radiusStyle: .58, elevationDepth: .36 } },
    aurora: { label: 'Aurora', seed: '#7C3AED', accent: '#F472B6', surfaceStyle: 'glass', dna: { darkness: .7, contrast: .68, accentStrength: .3, whiteUsage: .74, surfaceSeparation: .14, glassStrength: .64, blurStrength: 22, borderOpacity: .18, shadowStrength: .18, shadowSoftness: .88, ambientLight: .34, vignetteStrength: .1, gradientDepth: .72, cardOpacity: .78, radiusStyle: .78, elevationDepth: .32 } },
    minimal: { label: 'Minimal', seed: '#334155', accent: '#0EA5E9', surfaceStyle: 'flat', dna: { darkness: .12, contrast: .72, accentStrength: .12, whiteUsage: .14, surfaceSeparation: .06, glassStrength: 0, blurStrength: 0, borderOpacity: .1, shadowStrength: .05, shadowSoftness: .9, ambientLight: 0, vignetteStrength: 0, gradientDepth: .05, cardOpacity: 1, radiusStyle: .35, elevationDepth: .08 } },
    'high-contrast': { label: 'High Contrast', seed: '#0057FF', accent: '#FFB000', surfaceStyle: 'flat', dna: { darkness: .92, contrast: 1, accentStrength: .28, whiteUsage: 1, surfaceSeparation: .24, glassStrength: 0, blurStrength: 0, borderOpacity: .32, shadowStrength: .1, shadowSoftness: .4, ambientLight: 0, vignetteStrength: .1, gradientDepth: .18, cardOpacity: 1, radiusStyle: .25, elevationDepth: .2 } },
};

export function createThemeInput(style: StylePresetId = 'sawrly-noir', seed?: string, accent?: string): CanonicalThemeInput {
    const preset = STYLE_PRESETS[style];
    return {
        schemaVersion: THEME_SCHEMA_VERSION,
        metadata: { name: preset.label, style },
        colors: { seed: normalizeHex(seed, preset.seed), accent: normalizeHex(accent, preset.accent), brightness: style === 'elegant-light' || style === 'soft-modern' || style === 'minimal' ? 'light' : 'dark' },
        controls: { mood: .5, brightness: 1 - preset.dna.darkness, accentStrength: preset.dna.accentStrength, surfaceStyle: preset.surfaceStyle, autoContrast: true },
        styleDNA: { ...preset.dna },
        overrides: {},
    };
}

export function resolveTheme(input: CanonicalThemeInput): ResolvedTheme {
    const dna = input.styleDNA;
    const seed = normalizeHex(input.colors.seed, STYLE_PRESETS[input.metadata.style].seed);
    const accent = normalizeHex(input.colors.accent, STYLE_PRESETS[input.metadata.style].accent);
    const isDark = input.colors.brightness === 'dark';
    // Use hue-neutral darkness anchors. Burgundy anchors made every dark
    // preset inherit Sawrly Noir's red cast, especially high-darkness glass.
    const deep = mix(seed, '#020609', clamp(dna.darkness * .92));
    const upper = mix(seed, '#050A0F', clamp(dna.darkness * .78));
    const middle = mix(seed, '#071018', clamp(dna.darkness * .66));
    const lower = mix(seed, '#03080D', clamp(dna.darkness * .84));
    const bottom = mix(seed, '#000000', clamp(dna.darkness * .96));
    const surfaces = [deep, mix(deep, seed, .07 + dna.surfaceSeparation * .15), mix(deep, seed, .12 + dna.surfaceSeparation * .22), mix(deep, seed, .18 + dna.surfaceSeparation * .28), mix(deep, accent, .2)] as ResolvedTheme['surfaces'];
    const effects: Partial<EnterpriseTheme['effects']> = { primaryGradientAngle: 168, cardRadius: Math.round(10 + dna.radiusStyle * 18), chipRadius: 999, buttonRadius: Math.round(8 + dna.radiusStyle * 12), navShadowOpacity: dna.shadowStrength * .55, cardShadowOpacity: dna.shadowStrength, activeGlowOpacity: dna.accentStrength, glassBlur: Math.round(dna.blurStrength), surfaceOpacity: dna.cardOpacity, borderOpacity: dna.borderOpacity };
    const generatedOverrides: Partial<EnterpriseTheme> = { primary: seed, primaryDark: middle, primaryLight: mix(seed, '#FFFFFF', .2), accentPink: accent, background: deep, surface: surfaces[1], surfaceLight: surfaces[3], menuBackground: surfaces[1], cardBackground: surfaces[2], cardBorder: mix(surfaces[2], '#FFFFFF', dna.borderOpacity), heroStart: upper, heroMid: middle, heroEnd: bottom, textPrimary: isDark ? '#FFFFFF' : '#140A0F', textSecondary: isDark ? '#FFFFFFB8' : '#382C32', textTertiary: isDark ? '#FFFFFF8F' : '#62545B' } as Partial<EnterpriseTheme>;
    const manual = Object.fromEntries(Object.entries(input.overrides).filter(([, value]) => typeof value === 'string')) as Partial<EnterpriseTheme>;
    const material3 = buildEnterpriseFromSeed(seed, isDark ? 'dark' : 'light', effects, { ...generatedOverrides, ...manual });
    const checks = { body: contrastRatio(material3.textPrimary, material3.background), card: contrastRatio(material3.textPrimary, material3.cardBackground), button: contrastRatio(material3.onPrimary, material3.primary), navigation: contrastRatio(material3.textSecondary, material3.menuBackground) };
    const passed = Object.values(checks).filter((ratio) => ratio >= 4.5).length;
    const score = Math.round(65 + passed * 7 + Math.min(7, dna.surfaceSeparation * 40));
    return {
        ...input,
        material3,
        surfaces,
        background: { style: dna.ambientLight > .2 ? 'ambient' : dna.gradientDepth > .45 ? 'deep-gradient' : 'soft-gradient', stops: [upper, middle, mix(middle, seed, .06), lower, bottom], angle: 168, radialLight: { color: seed, opacity: dna.ambientLight, x: .5, y: .38 }, vignette: dna.vignetteStrength },
        components: {
            header: { style: 'solid', opacity: .96, borderOpacity: dna.borderOpacity, radius: Math.round(12 + dna.radiusStyle * 12) },
            card: { opacity: dna.cardOpacity, borderOpacity: dna.borderOpacity, radius: Math.round(12 + dna.radiusStyle * 16), shadow: dna.shadowStrength },
            hero: { radius: Math.round(16 + dna.radiusStyle * 11), borderOpacity: dna.borderOpacity * .8, ambientLight: dna.ambientLight * .4 },
            cta: { accentStrength: clamp(dna.accentStrength * 1.8), glow: dna.ambientLight * .45, radius: Math.round(8 + dna.radiusStyle * 12) },
            navigation: { style: input.controls.surfaceStyle === 'glass' ? 'floating' : input.controls.surfaceStyle === 'flat' ? 'solid' : 'glass', opacity: clamp(.9 - dna.glassStrength * .5, .42, .96), blur: dna.blurStrength, borderOpacity: dna.borderOpacity, radius: Math.round(20 + dna.radiusStyle * 22) },
        },
        accessibility: { score: Math.min(100, score), status: passed === 4 ? 'good' : 'needs-attention', checks },
        overrideSources: Object.fromEntries(Object.keys({ ...generatedOverrides, ...input.overrides }).map((key) => [key, key in input.overrides ? 'manual' : 'generated'])),
    };
}

export function migrateTheme(raw: unknown): CanonicalThemeInput {
    if (raw && typeof raw === 'object' && (raw as any).schemaVersion === THEME_SCHEMA_VERSION && (raw as any).styleDNA) return raw as CanonicalThemeInput;
    const old = (raw && typeof raw === 'object' ? raw : {}) as any;
    const style: StylePresetId = old.preset === 'rose-velvet' ? 'sawrly-noir' : old.preset === 'sawrly-aurora' ? 'aurora' : 'sawrly-noir';
    const input = createThemeInput(style, old.colors?.[1] ?? old.seed, old.accent);
    input.controls.mood = typeof old.intensity === 'number' ? clamp(old.intensity) : input.controls.mood;
    input.colors.brightness = old.brightness === 'light' ? 'light' : 'dark';
    return input;
}
