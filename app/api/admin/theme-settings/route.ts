import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting, setAppSetting } from '@/lib/app_settings';

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
];

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

export type AdminThemeColors = {
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
};

function _emptyColors(): AdminThemeColors {
    return {
        primary: null, primaryLight: null, primaryDark: null, accentPink: null,
        background: null, surface: null, surfaceLight: null, menuBackground: null,
        textPrimary: null, textSecondary: null, textTertiary: null,
        success: null, warning: null, error: null, info: null,
        border: null, borderLight: null,
    };
}

function _emptyNavIcons(): AdminNavIcons {
    return {
        home: null, search: null, categories: null, orders: null, profile: null,
        homeActive: null, searchActive: null, categoriesActive: null,
        ordersActive: null, profileActive: null,
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

async function readThemeSettings(): Promise<ThemeSettingsResponse> {
    const reads = await Promise.all([
        ...THEME_COLOR_KEYS.map(([, k]) => getAppSetting(k)),
        ...NAV_ICON_KEYS.map(([, k]) => getAppSetting(k)),
        ...EFFECT_KEYS.map(([, k]) => getAppSetting(k)),
    ]);
    const colors = _emptyColors();
    const navIcons = _emptyNavIcons();
    const effects = _emptyEffects();
    let cursor = 0;
    for (const [key] of THEME_COLOR_KEYS) {
        (colors as any)[key] = normalizeHexColor(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of NAV_ICON_KEYS) {
        (navIcons as any)[key] = normalizeUrl(reads[cursor]);
        cursor += 1;
    }
    for (const [key] of EFFECT_KEYS) {
        const raw = reads[cursor];
        const parsed = raw == null || raw === '' ? null : Number(raw);
        (effects as any)[key] = parsed == null || !Number.isFinite(parsed) ? null : parsed;
        cursor += 1;
    }
    return { colors, navIcons, effects };
}

export async function GET(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        return NextResponse.json(await readThemeSettings());
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
        for (const [key, dbKey] of THEME_COLOR_KEYS) {
            const raw = (body.colors ?? {})[key as keyof AdminThemeColors];
            updates.push([dbKey, normalizeHexColor(raw)]);
        }
        for (const [key, dbKey] of NAV_ICON_KEYS) {
            const raw = (body.navIcons ?? {})[key as keyof AdminNavIcons];
            updates.push([dbKey, normalizeUrl(raw)]);
        }
        for (const [key, dbKey] of EFFECT_KEYS) {
            const raw = (body.effects ?? {})[key as keyof AdminThemeEffects];
            const value = normalizeEffect(key, raw);
            updates.push([dbKey, value == null ? null : String(value)]);
        }

        const invalidColor = updates.find(([dbKey, v]) => {
            const isColorKey = THEME_COLOR_KEYS.some(([, k]) => k === dbKey);
            if (!isColorKey) return false;
            const fromBody = THEME_COLOR_KEYS.find(([, k]) => k === dbKey)?.[0];
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

        const invalidIcon = updates.find(([dbKey, v]) => {
            const isIconKey = NAV_ICON_KEYS.some(([, k]) => k === dbKey);
            if (!isIconKey) return false;
            const fromBody = NAV_ICON_KEYS.find(([, k]) => k === dbKey)?.[0];
            if (!fromBody) return false;
            const raw = (body.navIcons ?? {})[fromBody as keyof AdminNavIcons];
            if (raw == null) return false;
            if (typeof raw === 'string' && raw.trim().length === 0) return false;
            return v === null;
        });
        if (invalidIcon) {
            return NextResponse.json(
                { error: 'Invalid icon URL (use /path or https://host/path)' },
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
