import { buildEnterpriseFromSeed, type EnterpriseTheme, type HexString, normalizeHex } from '@/lib/theme_engine';
import { createThemeInput, resolveTheme, type ResolvedTheme, type StylePresetId } from '@/lib/theme_schema';

export type ThemeComposerMood = 'soft' | 'premium' | 'bold' | 'minimal' | 'neon' | 'luxury';
export type ThemeComposerPreset =
    | 'sawrly-noir' | 'sawrly-aurora' | 'purple-dream' | 'ocean-glass' | 'sunset-glow' | 'royal-luxury'
    | 'emerald-night' | 'midnight-blue' | 'rose-velvet' | 'cyber-neon' | 'clean-light' | 'custom';

export type ThemeComposerConfig = {
    mode: 'easy' | 'advanced';
    preset: ThemeComposerPreset;
    colors: string[];
    accent?: string;
    mood: ThemeComposerMood;
    intensity: number;
    variation: number;
    brightness: 'light' | 'dark';
};

export type ThemeComposerVisuals = {
    backgroundMesh: { enabled: boolean; points: Array<{ color: HexString; x: number; y: number; radius: number; opacity: number }> };
    ambientGlows: Array<{ color: HexString; x: number; y: number; radius: number; opacity: number }>;
    radialHighlight: { enabled: boolean; color: HexString; opacity: number; radius: number; x: number; y: number };
    surfaceTint: { card: HexString; header: HexString; navigation: HexString };
    headerStyle: 'solid' | 'gradient' | 'glass' | 'transparent';
    noise: { enabled: boolean; opacity: number; scale: number };
    vignette: { enabled: boolean; strength: number; radius: number };
    cta: { fill: 'solid' | 'gradient'; glow: number; shadow: number; highlight: number };
};

export type GeneratedVisualTheme = { enterprise: EnterpriseTheme; composer: ThemeComposerConfig; visuals: ThemeComposerVisuals; resolved?: ResolvedTheme };

export type CompleteThemePreset = { colors: [string, string, string]; accent: string; mood: ThemeComposerMood; styleDNA: StylePresetId; brightness: 'light' | 'dark' };

export const THEME_COMPOSER_PRESETS: Record<Exclude<ThemeComposerPreset, 'custom'>, CompleteThemePreset> = {
    'sawrly-noir': { colors: ['#200810', '#9F1239', '#0D0509'], accent: '#DB2777', mood: 'luxury', styleDNA: 'sawrly-noir', brightness: 'dark' },
    'sawrly-aurora': { colors: ['#211136', '#7E22CE', '#F472B6'], accent: '#F9A8D4', mood: 'premium', styleDNA: 'aurora', brightness: 'dark' },
    'purple-dream': { colors: ['#251044', '#7C3AED', '#C026D3'], accent: '#F0ABFC', mood: 'luxury', styleDNA: 'luxury-dark', brightness: 'dark' },
    'ocean-glass': { colors: ['#062B3A', '#0E7490', '#2DD4BF'], accent: '#A7F3D0', mood: 'soft', styleDNA: 'glass-dark', brightness: 'dark' },
    'sunset-glow': { colors: ['#431407', '#EA580C', '#DB2777'], accent: '#FDBA74', mood: 'bold', styleDNA: 'luxury-dark', brightness: 'dark' },
    'royal-luxury': { colors: ['#241047', '#4338CA', '#D4A72C'], accent: '#FDE68A', mood: 'luxury', styleDNA: 'luxury-dark', brightness: 'dark' },
    'emerald-night': { colors: ['#052E25', '#047857', '#14B8A6'], accent: '#A7F3D0', mood: 'premium', styleDNA: 'glass-dark', brightness: 'dark' },
    'midnight-blue': { colors: ['#070B22', '#1D4ED8', '#6366F1'], accent: '#BFDBFE', mood: 'minimal', styleDNA: 'midnight', brightness: 'dark' },
    'rose-velvet': { colors: ['#3B0A24', '#9F1239', '#DB2777'], accent: '#FBCFE8', mood: 'luxury', styleDNA: 'sawrly-noir', brightness: 'dark' },
    'cyber-neon': { colors: ['#030712', '#0891B2', '#7C3AED'], accent: '#A3E635', mood: 'neon', styleDNA: 'high-contrast', brightness: 'dark' },
    'clean-light': { colors: ['#F8FAFC', '#E2E8F0', '#C4B5FD'], accent: '#7C3AED', mood: 'minimal', styleDNA: 'elegant-light', brightness: 'light' },
};

export function applyCompletePreset(current: ThemeComposerConfig, preset: Exclude<ThemeComposerPreset, 'custom'>): ThemeComposerConfig {
    const definition = THEME_COMPOSER_PRESETS[preset];
    return { ...current, preset, colors: [...definition.colors], accent: definition.accent, mood: definition.mood, brightness: definition.brightness };
}

const MOOD_VALUES: Record<ThemeComposerMood, { blur: number; surfaceOpacity: number; borderOpacity: number; glow: number; headerStyle: ThemeComposerVisuals['headerStyle'] }> = {
    soft: { blur: 16, surfaceOpacity: .84, borderOpacity: .42, glow: .14, headerStyle: 'glass' },
    premium: { blur: 22, surfaceOpacity: .76, borderOpacity: .5, glow: .22, headerStyle: 'glass' },
    bold: { blur: 10, surfaceOpacity: .9, borderOpacity: .56, glow: .28, headerStyle: 'gradient' },
    minimal: { blur: 4, surfaceOpacity: .94, borderOpacity: .28, glow: .08, headerStyle: 'solid' },
    neon: { blur: 18, surfaceOpacity: .64, borderOpacity: .62, glow: .42, headerStyle: 'gradient' },
    luxury: { blur: 20, surfaceOpacity: .7, borderOpacity: .48, glow: .2, headerStyle: 'glass' },
};

function validColors(colors: string[]): [HexString, HexString, HexString] {
    const fallback = THEME_COMPOSER_PRESETS['sawrly-aurora'].colors;
    return [0, 1, 2].map((i) => normalizeHex(colors[i], fallback[i])) as [HexString, HexString, HexString];
}

export function generateVisualTheme(config: ThemeComposerConfig): GeneratedVisualTheme {
    const [start, mid, end] = validColors(config.colors);
    const accent = normalizeHex(config.accent, end);
    const mood = MOOD_VALUES[config.mood];
    const intensity = Math.max(0, Math.min(1, config.intensity));
    const variation = Math.max(0, Math.floor(config.variation) % 4);
    const angle = [135, 45, 225, 315][variation];
    const presetDefinition = config.preset === 'custom' ? null : THEME_COMPOSER_PRESETS[config.preset];
    const canonical = createThemeInput(presetDefinition?.styleDNA ?? (config.brightness === 'light' ? 'soft-modern' : 'luxury-dark'), mid, accent);
    canonical.controls.mood = intensity;
    canonical.controls.accentStrength = Math.max(.08, Math.min(.5, canonical.styleDNA.accentStrength * (.65 + intensity)));
    canonical.styleDNA.accentStrength = canonical.controls.accentStrength;
    canonical.styleDNA.ambientLight = Math.max(0, Math.min(.45, canonical.styleDNA.ambientLight * (.55 + intensity)));
    canonical.colors.brightness = config.brightness;
    const resolved = resolveTheme(canonical);
    const legacyEnterprise = buildEnterpriseFromSeed(mid, config.brightness === 'light' ? 'light' : 'dark', {
        primaryGradientAngle: angle,
        glassBlur: Math.round(mood.blur * (.75 + intensity * .35)),
        surfaceOpacity: Math.max(.55, Math.min(.96, mood.surfaceOpacity - intensity * .08)),
        borderOpacity: Math.max(.18, Math.min(.8, mood.borderOpacity + intensity * .1)),
        activeGlowOpacity: Math.max(.06, Math.min(.55, mood.glow * (.7 + intensity * .5))),
    }, {
        heroStart: start, heroMid: mid, heroEnd: end,
        primary: mid, primaryDark: start, primaryLight: end, accentPink: accent,
        background: start, surface: mid, surfaceLight: end, menuBackground: start,
    } as Partial<EnterpriseTheme>);
    const enterprise = resolved.material3;
    // Custom mixes remain compatible with the legacy generator. Every named
    // Quick Design card is a complete Style DNA + color preset.
    if (config.preset === 'custom') Object.assign(enterprise, legacyEnterprise);
    const shifted = variation % 2 === 0;
        const points = shifted
        ? [{ color: start, x: .12, y: .08, radius: .72, opacity: .62 }, { color: end, x: .9, y: .78, radius: .8, opacity: .5 }, { color: mid, x: .52, y: .42, radius: .65, opacity: .28 }]
        : [{ color: end, x: .86, y: .12, radius: .75, opacity: .56 }, { color: start, x: .16, y: .82, radius: .8, opacity: .58 }, { color: mid, x: .5, y: .5, radius: .6, opacity: .24 }];
    return {
        enterprise,
        resolved,
        composer: { ...config, colors: [start, mid, end], accent },
        visuals: {
            backgroundMesh: { enabled: config.preset !== 'sawrly-noir' && intensity > .15, points },
            ambientGlows: config.preset === 'sawrly-noir'
                ? [{ color: mid, x: .5, y: .38, radius: 420, opacity: resolved.background.radialLight.opacity }]
                : [{ color: end, x: .85, y: .18, radius: 340, opacity: .08 + intensity * .1 }, { color: mid, x: .18, y: .78, radius: 380, opacity: .06 + intensity * .08 }],
            radialHighlight: { enabled: intensity > .25, color: accent, opacity: .06 + intensity * .08, radius: 280, x: .5, y: .45 },
            surfaceTint: { card: enterprise.cardBackground, header: resolved.surfaces[2], navigation: enterprise.menuBackground },
            headerStyle: resolved.components.header.style,
            noise: { enabled: intensity > .4, opacity: .01 + intensity * .02, scale: 1 },
            vignette: { enabled: resolved.background.vignette > 0, strength: resolved.background.vignette, radius: .86 },
            cta: { fill: 'gradient', glow: resolved.components.cta.glow, shadow: resolved.components.card.shadow, highlight: resolved.components.cta.accentStrength },
        },
    };
}
