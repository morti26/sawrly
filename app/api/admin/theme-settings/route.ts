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

export type ThemeSettingsResponse = {
    colors: AdminThemeColors;
    navIcons: AdminNavIcons;
    effects: AdminThemeEffects;
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

function _emptyEffects(): AdminThemeEffects {
    return {
        primaryGradientAngle: null, cardRadius: null, chipRadius: null, buttonRadius: null,
        navShadowOpacity: null, cardShadowOpacity: null, activeGlowOpacity: null, glassBlur: null,
        surfaceOpacity: null, borderOpacity: null,
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

/**
 * Bygg enterprise-temat från DB-värden. Om primary finns (men inte alla M3-fält),
 * appliceras smart palette-seed från primary + overrides av de fält som finns i DB.
 */
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
        ...EFFECT_KEYS.map(([, k]) => getAppSetting(k)),
    ]);
    const colors = _emptyColors();
    const navIcons = _emptyNavIcons();
    const effects = _emptyEffects();
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
    for (const [key] of EFFECT_KEYS) {
        const raw = reads[cursor];
        const parsed = raw == null || raw === '' ? null : Number(raw);
        (effects as any)[key] = parsed == null || !Number.isFinite(parsed) ? null : parsed;
        cursor += 1;
    }

    const resp: ThemeSettingsResponse = { colors, navIcons, effects };
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
            effects?: Partial<AdminThemeEffects> | null;
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
        for (const [key, dbKey] of EFFECT_KEYS) {
            const raw = (body.effects ?? {})[key as keyof AdminThemeEffects];
            const value = normalizeEffect(key, raw);
            updates.push([dbKey, value == null ? null : String(value)]);
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

/**
 * POST /api/admin/theme-settings?action=smart-palette
 * Body: { seedPrimary: "#RRGGBB", mode?: "dark"|"light", writeToDb?: boolean,
 *         effectsOverride?: {...}, overrides?: {...} }
 *
 * Endast seedPrimary krävs → returnerar hela EnterpriseTheme.
 * Om writeToDb=true (krävs) skrivs alla 85 färg-nycklar + 10 effekter till DB.
 */
export async function POST(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');

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

        return NextResponse.json({ error: 'Unknown action. Use ?action=smart-palette' }, { status: 400 });
    } catch (error) {
        console.error('Admin theme settings POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
