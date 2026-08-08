import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting, setAppSetting } from '@/lib/app_settings';
import {
    buildEnterpriseFromSeed,
    type EnterpriseTheme,
    isValidHex,
    DEFAULT_EFFECTS,
    normalizeHex,
    wcagRating,
} from '@/lib/theme_engine';
import { getThemeTemplateById } from '@/lib/theme_templates';

const THEME_COLOR_KEYS = [
    ['primary', APP_SETTING_KEYS.themePrimary] as const,
    ['primaryLight', APP_SETTING_KEYS.themePrimaryLight] as const,
    ['primaryDark', APP_SETTING_KEYS.themePrimaryDark] as const,
    ['accentPink', APP_SETTING_KEYS.themeAccentPink] as const,
    ['background', APP_SETTING_KEYS.themeBackground] as const,
    ['surface', APP_SETTING_KEYS.themeSurface] as const,
    ['surfaceLight', APP_SETTING_KEYS.themeSurfaceLight] as const,
    ['menuBackground', APP_SETTING_KEYS.themeMenuBackground] as const,
    ['textPrimary', APP_SETTING_KEYS.themeTextPrimary] as const,
    ['textSecondary', APP_SETTING_KEYS.themeTextSecondary] as const,
    ['textTertiary', APP_SETTING_KEYS.themeTextTertiary] as const,
    ['success', APP_SETTING_KEYS.themeSuccess] as const,
    ['warning', APP_SETTING_KEYS.themeWarning] as const,
    ['error', APP_SETTING_KEYS.themeError] as const,
    ['info', APP_SETTING_KEYS.themeInfo] as const,
    ['border', APP_SETTING_KEYS.themeBorder] as const,
    ['borderLight', APP_SETTING_KEYS.themeBorderLight] as const,
] as const;

const THEME_M3_COLOR_KEYS = [
    ['onPrimary', APP_SETTING_KEYS.themeOnPrimary],
    ['primaryContainer', APP_SETTING_KEYS.themePrimaryContainer],
    ['onPrimaryContainer', APP_SETTING_KEYS.themeOnPrimaryContainer],
    ['primaryFixed', APP_SETTING_KEYS.themePrimaryFixed],
    ['primaryFixedDim', APP_SETTING_KEYS.themePrimaryFixedDim],
    ['onPrimaryFixed', APP_SETTING_KEYS.themeOnPrimaryFixed],
    ['onPrimaryFixedVariant', APP_SETTING_KEYS.themeOnPrimaryFixedVariant],
    ['secondary', APP_SETTING_KEYS.themeSecondary],
    ['onSecondary', APP_SETTING_KEYS.themeOnSecondary],
    ['secondaryContainer', APP_SETTING_KEYS.themeSecondaryContainer],
    ['onSecondaryContainer', APP_SETTING_KEYS.themeOnSecondaryContainer],
    ['secondaryFixed', APP_SETTING_KEYS.themeSecondaryFixed],
    ['secondaryFixedDim', APP_SETTING_KEYS.themeSecondaryFixedDim],
    ['onSecondaryFixed', APP_SETTING_KEYS.themeOnSecondaryFixed],
    ['onSecondaryFixedVariant', APP_SETTING_KEYS.themeOnSecondaryFixedVariant],
    ['tertiary', APP_SETTING_KEYS.themeTertiary],
    ['onTertiary', APP_SETTING_KEYS.themeOnTertiary],
    ['tertiaryContainer', APP_SETTING_KEYS.themeTertiaryContainer],
    ['onTertiaryContainer', APP_SETTING_KEYS.themeOnTertiaryContainer],
    ['tertiaryFixed', APP_SETTING_KEYS.themeTertiaryFixed],
    ['tertiaryFixedDim', APP_SETTING_KEYS.themeTertiaryFixedDim],
    ['onTertiaryFixed', APP_SETTING_KEYS.themeOnTertiaryFixed],
    ['onTertiaryFixedVariant', APP_SETTING_KEYS.themeOnTertiaryFixedVariant],
    ['onError', APP_SETTING_KEYS.themeOnError],
    ['errorContainer', APP_SETTING_KEYS.themeErrorContainer],
    ['onErrorContainer', APP_SETTING_KEYS.themeOnErrorContainer],
    ['onSurface', APP_SETTING_KEYS.themeOnSurface],
    ['surfaceDim', APP_SETTING_KEYS.themeSurfaceDim],
    ['surfaceBright', APP_SETTING_KEYS.themeSurfaceBright],
    ['surfaceContainerLowest', APP_SETTING_KEYS.themeSurfaceContainerLowest],
    ['surfaceContainerLow', APP_SETTING_KEYS.themeSurfaceContainerLow],
    ['surfaceContainer', APP_SETTING_KEYS.themeSurfaceContainer],
    ['surfaceContainerHigh', APP_SETTING_KEYS.themeSurfaceContainerHigh],
    ['surfaceContainerHighest', APP_SETTING_KEYS.themeSurfaceContainerHighest],
    ['onSurfaceVariant', APP_SETTING_KEYS.themeOnSurfaceVariant],
    ['outline', APP_SETTING_KEYS.themeOutline],
    ['outlineVariant', APP_SETTING_KEYS.themeOutlineVariant],
    ['onBackground', APP_SETTING_KEYS.themeOnBackground],
    ['inverseSurface', APP_SETTING_KEYS.themeInverseSurface],
    ['inverseOnSurface', APP_SETTING_KEYS.themeInverseOnSurface],
    ['inversePrimary', APP_SETTING_KEYS.themeInversePrimary],
    ['shadow', APP_SETTING_KEYS.themeShadow],
    ['scrim', APP_SETTING_KEYS.themeScrim],
    ['onSuccess', APP_SETTING_KEYS.themeOnSuccess],
    ['successContainer', APP_SETTING_KEYS.themeSuccessContainer],
    ['onSuccessContainer', APP_SETTING_KEYS.themeOnSuccessContainer],
    ['onWarning', APP_SETTING_KEYS.themeOnWarning],
    ['warningContainer', APP_SETTING_KEYS.themeWarningContainer],
    ['onWarningContainer', APP_SETTING_KEYS.themeOnWarningContainer],
    ['onInfo', APP_SETTING_KEYS.themeOnInfo],
    ['infoContainer', APP_SETTING_KEYS.themeInfoContainer],
    ['onInfoContainer', APP_SETTING_KEYS.themeOnInfoContainer],
    ['divider', APP_SETTING_KEYS.themeDivider],
    ['splash', APP_SETTING_KEYS.themeSplash],
    ['disabled', APP_SETTING_KEYS.themeDisabled],
    ['onDisabled', APP_SETTING_KEYS.themeOnDisabled],
    ['disabledContainer', APP_SETTING_KEYS.themeDisabledContainer],
    ['heroStart', APP_SETTING_KEYS.themeHeroStart],
    ['heroMid', APP_SETTING_KEYS.themeHeroMid],
    ['heroEnd', APP_SETTING_KEYS.themeHeroEnd],
    ['cardBackground', APP_SETTING_KEYS.themeCardBackground],
    ['cardBorder', APP_SETTING_KEYS.themeCardBorder],
    ['badge', APP_SETTING_KEYS.themeBadge],
    ['onBadge', APP_SETTING_KEYS.themeOnBadge],
    ['snackbarBackground', APP_SETTING_KEYS.themeSnackbarBackground],
    ['snackbarText', APP_SETTING_KEYS.themeSnackbarText],
    ['shimmerBase', APP_SETTING_KEYS.themeShimmerBase],
    ['shimmerHighlight', APP_SETTING_KEYS.themeShimmerHighlight],
    ['onAccentPink', APP_SETTING_KEYS.themeOnAccentPink],
] as const;

export const ALL_THEME_COLOR_KEYS = [
    ...THEME_COLOR_KEYS,
    ...THEME_M3_COLOR_KEYS,
] as const;

const NAV_ICON_KEYS = [
    ['home', APP_SETTING_KEYS.navIconHomeUrl] as const,
    ['search', APP_SETTING_KEYS.navIconSearchUrl] as const,
    ['categories', APP_SETTING_KEYS.navIconCategoriesUrl] as const,
    ['orders', APP_SETTING_KEYS.navIconOrdersUrl] as const,
    ['profile', APP_SETTING_KEYS.navIconProfileUrl] as const,
    ['homeActive', APP_SETTING_KEYS.navIconHomeActiveUrl] as const,
    ['searchActive', APP_SETTING_KEYS.navIconSearchActiveUrl] as const,
    ['categoriesActive', APP_SETTING_KEYS.navIconCategoriesActiveUrl] as const,
    ['ordersActive', APP_SETTING_KEYS.navIconOrdersActiveUrl] as const,
    ['profileActive', APP_SETTING_KEYS.navIconProfileActiveUrl] as const,
];

const NAV_ICON_ID_KEYS = [
    ['homeId', APP_SETTING_KEYS.navIconHomeId] as const,
    ['searchId', APP_SETTING_KEYS.navIconSearchId] as const,
    ['categoriesId', APP_SETTING_KEYS.navIconCategoriesId] as const,
    ['ordersId', APP_SETTING_KEYS.navIconOrdersId] as const,
    ['profileId', APP_SETTING_KEYS.navIconProfileId] as const,
    ['homeActiveId', APP_SETTING_KEYS.navIconHomeActiveId] as const,
    ['searchActiveId', APP_SETTING_KEYS.navIconSearchActiveId] as const,
    ['categoriesActiveId', APP_SETTING_KEYS.navIconCategoriesActiveId] as const,
    ['ordersActiveId', APP_SETTING_KEYS.navIconOrdersActiveId] as const,
    ['profileActiveId', APP_SETTING_KEYS.navIconProfileActiveId] as const,
];

const NAV_ICON_LIBRARY_KEYS = [
    ['homeLibrary', APP_SETTING_KEYS.navIconHomeLibrary] as const,
    ['searchLibrary', APP_SETTING_KEYS.navIconSearchLibrary] as const,
    ['categoriesLibrary', APP_SETTING_KEYS.navIconCategoriesLibrary] as const,
    ['ordersLibrary', APP_SETTING_KEYS.navIconOrdersLibrary] as const,
    ['profileLibrary', APP_SETTING_KEYS.navIconProfileLibrary] as const,
    ['homeActiveLibrary', APP_SETTING_KEYS.navIconHomeActiveLibrary] as const,
    ['searchActiveLibrary', APP_SETTING_KEYS.navIconSearchActiveLibrary] as const,
    ['categoriesActiveLibrary', APP_SETTING_KEYS.navIconCategoriesActiveLibrary] as const,
    ['ordersActiveLibrary', APP_SETTING_KEYS.navIconOrdersActiveLibrary] as const,
    ['profileActiveLibrary', APP_SETTING_KEYS.navIconProfileActiveLibrary] as const,
];

const EFFECT_KEYS = [
    ['primaryGradientAngle', APP_SETTING_KEYS.effPrimaryGradientAngle] as const,
    ['cardRadius', APP_SETTING_KEYS.effCardRadius] as const,
    ['chipRadius', APP_SETTING_KEYS.effChipRadius] as const,
    ['buttonRadius', APP_SETTING_KEYS.effButtonRadius] as const,
    ['navShadowOpacity', APP_SETTING_KEYS.effNavShadowOpacity] as const,
    ['cardShadowOpacity', APP_SETTING_KEYS.effCardShadowOpacity] as const,
    ['activeGlowOpacity', APP_SETTING_KEYS.effActiveGlowOpacity] as const,
    ['glassBlur', APP_SETTING_KEYS.effGlassBlur] as const,
    ['surfaceOpacity', APP_SETTING_KEYS.effSurfaceOpacity] as const,
    ['borderOpacity', APP_SETTING_KEYS.effBorderOpacity] as const,
];

const FEATURE_KEYS = [
    ['themeMode', APP_SETTING_KEYS.themeMode] as const,
    ['lightSeedPrimary', APP_SETTING_KEYS.lightSeedPrimary] as const,
    ['iconLibraryDefault', APP_SETTING_KEYS.iconLibraryDefault] as const,
    ['dynamicColorEnabled', APP_SETTING_KEYS.dynamicColorEnabled] as const,
    ['animationsEnabled', APP_SETTING_KEYS.animationsEnabled] as const,
    ['pageTransitionStyle', APP_SETTING_KEYS.pageTransitionStyle] as const,
    ['activeTemplateId', APP_SETTING_KEYS.activeTemplateId] as const,
];

const VALID_THEME_MODES = new Set(['dark', 'light', 'system']);
const VALID_ICON_LIBRARIES = new Set(['phosphor', 'material', 'fontawesome', 'lucide']);
const VALID_PAGE_TRANSITIONS = new Set(['cupertino', 'fade', 'sharedAxis', 'zoom']);

type LegacyColorKey = typeof THEME_COLOR_KEYS[number][0];
type M3ColorKey = typeof THEME_M3_COLOR_KEYS[number][0];
export type AdminThemeColors =
    & Record<LegacyColorKey, string | null>
    & Record<M3ColorKey, string | null>;

export type AdminNavIcons = {
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

export type AdminNavIconLibraries = {
    homeLibrary: string | null;
    searchLibrary: string | null;
    categoriesLibrary: string | null;
    ordersLibrary: string | null;
    profileLibrary: string | null;
    homeActiveLibrary: string | null;
    searchActiveLibrary: string | null;
    categoriesActiveLibrary: string | null;
    ordersActiveLibrary: string | null;
    profileActiveLibrary: string | null;
};

export type AdminThemeEffects = {
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

export type AdminThemeFeatures = {
    themeMode: 'dark' | 'light' | 'system' | null;
    lightSeedPrimary: string | null;
    iconLibraryDefault: 'phosphor' | 'material' | 'fontawesome' | 'lucide' | null;
    dynamicColorEnabled: boolean | null;
    animationsEnabled: boolean | null;
    pageTransitionStyle: 'cupertino' | 'fade' | 'sharedAxis' | 'zoom' | null;
    activeTemplateId: string | null;
};

export type ThemeSettingsResponse = {
    colors: AdminThemeColors;
    navIcons: AdminNavIcons;
    navIconLibraries: AdminNavIconLibraries;
    effects: AdminThemeEffects;
    features: AdminThemeFeatures;
    enterprise?: EnterpriseTheme;
    wcag?: Record<string, { ratio: number; aaNormal: boolean; aaaNormal: boolean }>;
};

function _emptyColors(): AdminThemeColors {
    const out: any = {};
    for (const [k] of ALL_THEME_COLOR_KEYS) out[k] = null;
    return out as AdminThemeColors;
}

function _emptyNavIcons(): AdminNavIcons {
    return {
        home: null, search: null, categories: null, orders: null, profile: null,
        homeActive: null, searchActive: null, categoriesActive: null,
        ordersActive: null, profileActive: null,
        homeId: null, searchId: null, categoriesId: null, ordersId: null, profileId: null,
        homeActiveId: null, searchActiveId: null, categoriesActiveId: null,
        ordersActiveId: null, profileActiveId: null,
    };
}

function _emptyNavIconLibraries(): AdminNavIconLibraries {
    return {
        homeLibrary: null, searchLibrary: null, categoriesLibrary: null, ordersLibrary: null, profileLibrary: null,
        homeActiveLibrary: null, searchActiveLibrary: null, categoriesActiveLibrary: null,
        ordersActiveLibrary: null, profileActiveLibrary: null,
    };
}

function _emptyEffects(): AdminThemeEffects {
    return {
        primaryGradientAngle: null, cardRadius: null, chipRadius: null, buttonRadius: null,
        navShadowOpacity: null, cardShadowOpacity: null, activeGlowOpacity: null, glassBlur: null,
        surfaceOpacity: null, borderOpacity: null,
    };
}

function _emptyFeatures(): AdminThemeFeatures {
    return {
        themeMode: null,
        lightSeedPrimary: null,
        iconLibraryDefault: null,
        dynamicColorEnabled: null,
        animationsEnabled: null,
        pageTransitionStyle: null,
        activeTemplateId: null,
    };
}

type EffectMeta = { min: number; max: number; step: number; integer: boolean };
const EFFECT_META: Record<string, EffectMeta> = {
    primaryGradientAngle: { min: 0, max: 360, step: 1, integer: true },
    cardRadius: { min: 0, max: 60, step: 1, integer: true },
    chipRadius: { min: 0, max: 9999, step: 1, integer: true },
    buttonRadius: { min: 0, max: 60, step: 1, integer: true },
    navShadowOpacity: { min: 0, max: 1, step: 0.01, integer: false },
    cardShadowOpacity: { min: 0, max: 1, step: 0.01, integer: false },
    activeGlowOpacity: { min: 0, max: 1, step: 0.01, integer: false },
    glassBlur: { min: 0, max: 60, step: 1, integer: true },
    surfaceOpacity: { min: 0.2, max: 1, step: 0.01, integer: false },
    borderOpacity: { min: 0, max: 1, step: 0.01, integer: false },
};

function normalizeHexColor(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
        return trimmed;
    }
    return null;
}

function normalizeUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return null;
}

function normalizeIconId(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (/^[a-z0-9_.-]{1,80}$/.test(lowered)) return lowered;
    return null;
}

function normalizeIconLibrary(value: unknown): string | null {
    if (value == null) return null;
    const s = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (VALID_ICON_LIBRARIES.has(s)) return s;
    return null;
}

function normalizeThemeMode(value: unknown): 'dark' | 'light' | 'system' | null {
    if (value == null) return null;
    const s = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (s === 'dark' || s === 'light' || s === 'system') return s;
    return null;
}

function normalizePageTransition(value: unknown): 'cupertino' | 'fade' | 'sharedAxis' | 'zoom' | null {
    if (value == null) return null;
    const s = typeof value === 'string' ? value.trim() : '';
    if (VALID_PAGE_TRANSITIONS.has(s)) return s as any;
    return null;
}

function normalizeBool(value: unknown): boolean | null {
    if (value == null) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const s = value.trim().toLowerCase();
        if (s === 'true' || s === '1' || s === 'yes') return true;
        if (s === 'false' || s === '0' || s === 'no') return false;
    }
    return null;
}

function boolToDb(v: boolean | null): string | null {
    return v == null ? null : (v ? 'true' : 'false');
}

function dbToBool(raw: string | null): boolean | null {
    if (raw == null || raw === '') return null;
    return raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes';
}

function normalizeEffect(key: string, value: unknown): number | null {
    if (value == null) return null;
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
    } else if (typeof value === 'string') {
        const v = value.trim();
        if (!v) return null;
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        value = n;
    } else {
        return null;
    }
    const meta = EFFECT_META[key];
    if (!meta) return null;
    const n = meta.integer ? Math.round(value as number) : (value as number);
    if (n < meta.min || n > meta.max) return null;
    return n;
}

async function buildEnterpriseFromDb(
    colors: AdminThemeColors,
    effects: AdminThemeEffects,
): Promise<EnterpriseTheme> {
    const seed = normalizeHex(
        colors.primary || '#7C3AED',
        '#7C3AED',
    );
    const effectsOverride: Partial<EnterpriseTheme['effects']> = {};
    for (const [k] of EFFECT_KEYS) {
        const v = (effects as any)[k];
        if (typeof v === 'number') (effectsOverride as any)[k] = v;
    }
    const overrides: Partial<EnterpriseTheme> = {};
    for (const [k] of ALL_THEME_COLOR_KEYS) {
        const raw = (colors as any)[k];
        if (isValidHex(raw)) (overrides as any)[k] = normalizeHex(raw, raw);
    }
    return buildEnterpriseFromSeed(seed, 'dark', effectsOverride, overrides);
}

async function readThemeSettings(
    includeEnterprise = true,
): Promise<ThemeSettingsResponse> {
    const reads = await Promise.all([
        ...ALL_THEME_COLOR_KEYS.map(([, k]) => getAppSetting(k)),
        ...NAV_ICON_KEYS.map(([, k]) => getAppSetting(k)),
        ...NAV_ICON_ID_KEYS.map(([, k]) => getAppSetting(k)),
        ...NAV_ICON_LIBRARY_KEYS.map(([, k]) => getAppSetting(k)),
        ...EFFECT_KEYS.map(([, k]) => getAppSetting(k)),
        ...FEATURE_KEYS.map(([, k]) => getAppSetting(k)),
    ]);
    const colors = _emptyColors();
    const navIcons = _emptyNavIcons();
    const navIconLibraries = _emptyNavIconLibraries();
    const effects = _emptyEffects();
    const features = _emptyFeatures();
    let cursor = 0;
    for (const [key] of ALL_THEME_COLOR_KEYS) {
        (colors as any)[key] = normalizeHexColor(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of NAV_ICON_KEYS) {
        (navIcons as any)[key] = normalizeUrl(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of NAV_ICON_ID_KEYS) {
        (navIcons as any)[key] = normalizeIconId(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of NAV_ICON_LIBRARY_KEYS) {
        (navIconLibraries as any)[key] = normalizeIconLibrary(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of EFFECT_KEYS) {
        const raw = reads[cursor];
        const parsed = raw == null || raw === '' ? null : Number(raw);
        (effects as any)[key] = parsed == null || !Number.isFinite(parsed) ? null : parsed;
        cursor += 1;
    }
    for (let i = 0; i < FEATURE_KEYS.length; i++) {
        const [key] = FEATURE_KEYS[i];
        const raw = reads[cursor];
        cursor += 1;
        switch (key) {
            case 'themeMode':
                features.themeMode = normalizeThemeMode(raw);
                break;
            case 'lightSeedPrimary':
                features.lightSeedPrimary = normalizeHexColor(raw);
                break;
            case 'iconLibraryDefault':
                features.iconLibraryDefault = normalizeIconLibrary(raw) as any;
                break;
            case 'dynamicColorEnabled':
                features.dynamicColorEnabled = dbToBool(raw);
                break;
            case 'animationsEnabled':
                features.animationsEnabled = dbToBool(raw);
                break;
            case 'pageTransitionStyle':
                features.pageTransitionStyle = normalizePageTransition(raw);
                break;
            case 'activeTemplateId':
                features.activeTemplateId = (typeof raw === 'string' && raw.trim()) ? raw.trim() : null;
                break;
        }
    }

    const resp: ThemeSettingsResponse = { colors, navIcons, navIconLibraries, effects, features };
    if (includeEnterprise) {
        const ent = await buildEnterpriseFromDb(colors, effects);
        resp.enterprise = ent;
        resp.wcag = {
            onPrimary: wcagRating(ent.onPrimary, ent.primary),
            onSecondary: wcagRating(ent.onSecondary, ent.secondary),
            onTertiary: wcagRating(ent.onTertiary, ent.tertiary),
            onError: wcagRating(ent.onError, ent.error),
            onSurface: wcagRating(ent.onSurface, ent.surface),
            onSuccess: wcagRating(ent.onSuccess, ent.success),
            onWarning: wcagRating(ent.onWarning, ent.warning),
            onInfo: wcagRating(ent.onInfo, ent.info),
            onAccentPink: wcagRating(ent.onAccentPink, ent.accentPink),
            textPrimaryOnSurface: wcagRating(ent.textPrimary, ent.surface),
            snackbar: wcagRating(ent.snackbarText, ent.snackbarBackground),
            badge: wcagRating(ent.onBadge, ent.badge),
        };
    }
    return resp;
}

export async function GET(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const url = new URL(req.url);
        const noEnt = url.searchParams.get('enterprise') === '0';
        return NextResponse.json(await readThemeSettings(!noEnt));
    } catch (error) {
        console.error('Admin theme settings GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const body = (await req.json()) as {
            colors?: Partial<AdminThemeColors> | null;
            navIcons?: Partial<AdminNavIcons> | null;
            navIconLibraries?: Partial<AdminNavIconLibraries> | null;
            effects?: Partial<AdminThemeEffects> | null;
            features?: Partial<AdminThemeFeatures> | null;
        };

        const updates: Array<[string, string | null]> = [];
        for (const [key, dbKey] of ALL_THEME_COLOR_KEYS) {
            const raw = (body.colors ?? {})[key as keyof AdminThemeColors];
            updates.push([dbKey, normalizeHexColor(raw)]);
        }
        for (const [key, dbKey] of NAV_ICON_KEYS) {
            const raw = (body.navIcons ?? {})[key as keyof AdminNavIcons];
            updates.push([dbKey, normalizeUrl(raw)]);
        }
        for (const [key, dbKey] of NAV_ICON_ID_KEYS) {
            const raw = (body.navIcons ?? {})[key as keyof AdminNavIcons];
            updates.push([dbKey, normalizeIconId(raw)]);
        }
        for (const [key, dbKey] of NAV_ICON_LIBRARY_KEYS) {
            const raw = (body.navIconLibraries ?? {})[key as keyof AdminNavIconLibraries];
            updates.push([dbKey, normalizeIconLibrary(raw)]);
        }
        for (const [key, dbKey] of EFFECT_KEYS) {
            const raw = (body.effects ?? {})[key as keyof AdminThemeEffects];
            const value = normalizeEffect(key, raw);
            updates.push([dbKey, value == null ? null : String(value)]);
        }
        const feats = body.features ?? {};
        for (const [key, dbKey] of FEATURE_KEYS) {
            const raw = (feats as any)[key];
            switch (key) {
                case 'themeMode': {
                    const v = normalizeThemeMode(raw);
                    updates.push([dbKey, v]);
                    break;
                }
                case 'lightSeedPrimary': {
                    updates.push([dbKey, normalizeHexColor(raw)]);
                    break;
                }
                case 'iconLibraryDefault': {
                    updates.push([dbKey, normalizeIconLibrary(raw)]);
                    break;
                }
                case 'dynamicColorEnabled':
                case 'animationsEnabled': {
                    updates.push([dbKey, boolToDb(normalizeBool(raw))]);
                    break;
                }
                case 'pageTransitionStyle': {
                    updates.push([dbKey, normalizePageTransition(raw)]);
                    break;
                }
                case 'activeTemplateId': {
                    const v = (typeof raw === 'string' && raw.trim()) ? raw.trim() : null;
                    updates.push([dbKey, v]);
                    break;
                }
            }
        }

        const invalidColor = updates.find(([dbKey, v]) => {
            const isColorKey = ALL_THEME_COLOR_KEYS.some(([, k]) => k === dbKey);
            if (!isColorKey) return false;
            const fromBody = ALL_THEME_COLOR_KEYS.find(([, k]) => k === dbKey)?.[0];
            if (!fromBody) return false;
            const raw = (body.colors ?? {})[fromBody as keyof AdminThemeColors];
            if (raw == null) return false;
            if (typeof raw === 'string' && raw.trim().length === 0) return false;
            return v === null;
        });
        if (invalidColor) {
            return NextResponse.json(
                { error: 'Invalid color hex (use #RGB / #RRGGBB / #RRGGBBAA)' },
                { status: 400 }
            );
        }

        await Promise.all(updates.map(([key, value]) => setAppSetting(key, value)));
        return NextResponse.json(await readThemeSettings());
    } catch (error) {
        console.error('Admin theme settings PUT error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function _applyTemplateToDb(templateId: string): Promise<ThemeSettingsResponse> {
    const tpl = await getThemeTemplateById(templateId);
    if (!tpl) {
        throw new Error(`TEMPLATE_NOT_FOUND:${templateId}`);
    }
    const updates: Array<[string, string | null]> = [];
    const colorsJson = tpl.colors_json ?? {};
    const navJson = tpl.nav_icons_json ?? {};
    const effectsJson = tpl.effects_json ?? {};
    for (const [key, dbKey] of ALL_THEME_COLOR_KEYS) {
        updates.push([dbKey, normalizeHexColor((colorsJson as any)[key])]);
    }
    for (const [key, dbKey] of NAV_ICON_KEYS) {
        updates.push([dbKey, normalizeUrl((navJson as any)[key])]);
    }
    for (const [key, dbKey] of NAV_ICON_ID_KEYS) {
        updates.push([dbKey, normalizeIconId((navJson as any)[key])]);
    }
    for (const [key, dbKey] of NAV_ICON_LIBRARY_KEYS) {
        updates.push([dbKey, normalizeIconLibrary((navJson as any)[key])]);
    }
    for (const [key, dbKey] of EFFECT_KEYS) {
        const val = normalizeEffect(key, (effectsJson as any)[key]);
        updates.push([dbKey, val == null ? null : String(val)]);
    }
    updates.push([APP_SETTING_KEYS.activeTemplateId, templateId]);
    await Promise.all(updates.map(([k, v]) => setAppSetting(k, v)));
    return await readThemeSettings();
}

/**
 * POST /api/admin/theme-settings?action=smart-palette
 * Body: { seedPrimary: "#RRGGBB", mode?: "dark"|"light", writeToDb?: boolean,
 *         effectsOverride?: {...}, overrides?: {...} }
 *
 * Endast seedPrimary krävs → returnerar hela EnterpriseTheme.
 * Om writeToDb=true (krävs) skrivs alla 85 färg-nycklar + 10 effekter till DB.
 *
 * ELLER:
 * POST /api/admin/theme-settings?action=apply-template
 * Body: { templateId: string }
 *   → Expanderar mallens JSON till samtliga app_settings nycklar + sätter activeTemplateId!
 */
export async function POST(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');

        if (action === 'apply-template') {
            const body = (await req.json()) as { templateId?: string };
            const templateId = typeof body?.templateId === 'string' ? body.templateId.trim() : '';
            if (!templateId) {
                return NextResponse.json(
                    { error: 'templateId is required' },
                    { status: 400 },
                );
            }
            try {
                const applied = await _applyTemplateToDb(templateId);
                return NextResponse.json({ ok: true, appliedTemplateId: templateId, ...applied });
            } catch (e: any) {
                const msg = typeof e?.message === 'string' ? e.message : String(e);
                if (msg.startsWith('TEMPLATE_NOT_FOUND:')) {
                    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
                }
                throw e;
            }
        }

        if (action === 'smart-palette') {
            const body = (await req.json()) as {
                seedPrimary: string;
                mode?: 'light' | 'dark';
                writeToDb?: boolean;
                effectsOverride?: Partial<EnterpriseTheme['effects']>;
                overrides?: Partial<EnterpriseTheme>;
            };
            const seed = normalizeHexColor(body?.seedPrimary);
            if (!seed) {
                return NextResponse.json(
                    { error: 'seedPrimary must be a valid hex color (#RRGGBB)' },
                    { status: 400 },
                );
            }
            const mode: 'light' | 'dark' = body?.mode === 'light' ? 'light' : 'dark';
            const ent = buildEnterpriseFromSeed(
                seed,
                mode,
                body?.effectsOverride ?? {},
                body?.overrides ?? {},
            );

            if (body?.writeToDb) {
                const updates: Array<[string, string | null]> = [];
                for (const [k, dbKey] of ALL_THEME_COLOR_KEYS) {
                    const v = (ent as any)[k];
                    if (typeof v === 'string' && isValidHex(v)) {
                        updates.push([dbKey, v]);
                    }
                }
                const allEffectKeys = Object.keys(DEFAULT_EFFECTS) as (keyof EnterpriseTheme['effects'])[];
                for (const k of allEffectKeys) {
                    const mapping = EFFECT_KEYS.find(([ek]) => ek === k);
                    if (!mapping) continue;
                    const v = ent.effects[k];
                    updates.push([mapping[1], typeof v === 'number' ? String(v) : null]);
                }
                await Promise.all(updates.map(([key, value]) => setAppSetting(key, value)));
                return NextResponse.json({
                    ok: true,
                    wroteColors: updates.filter(([db]) =>
                        ALL_THEME_COLOR_KEYS.some(([, k]) => k === db)
                    ).length,
                    wroteEffects: updates.filter(([db]) =>
                        EFFECT_KEYS.some(([, k]) => k === db)
                    ).length,
                    enterprise: ent,
                });
            }

            return NextResponse.json({ ok: true, enterprise: ent });
        }

        return NextResponse.json(
            { error: 'Unknown action. Use ?action=smart-palette or ?action=apply-template' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Admin theme settings POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
