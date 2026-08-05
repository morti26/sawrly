import { NextResponse } from 'next/server';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';

export const dynamic = 'force-dynamic';

export type PublicThemeEffects = {
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

export type PublicThemeConfig = {
    colors: {
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
    navIcons: {
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
    effects: PublicThemeEffects;
};

const COLOR_KEYS = [
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

const EFFECT_KEYS: [keyof PublicThemeEffects, string][] = [
    ['primaryGradientAngle', APP_SETTING_KEYS.effPrimaryGradientAngle],
    ['cardRadius', APP_SETTING_KEYS.effCardRadius],
    ['chipRadius', APP_SETTING_KEYS.effChipRadius],
    ['buttonRadius', APP_SETTING_KEYS.effButtonRadius],
    ['navShadowOpacity', APP_SETTING_KEYS.effNavShadowOpacity],
    ['cardShadowOpacity', APP_SETTING_KEYS.effCardShadowOpacity],
    ['activeGlowOpacity', APP_SETTING_KEYS.effActiveGlowOpacity],
    ['glassBlur', APP_SETTING_KEYS.effGlassBlur],
    ['surfaceOpacity', APP_SETTING_KEYS.effSurfaceOpacity],
    ['borderOpacity', APP_SETTING_KEYS.effBorderOpacity],
];

function emptyTheme(): PublicThemeConfig {
    const colors: PublicThemeConfig['colors'] = {
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
    const navIcons: PublicThemeConfig['navIcons'] = {
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
    const effects: PublicThemeEffects = {
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
    return { colors, navIcons, effects };
}

function isValidHexColor(value: string | null): value is string {
    if (typeof value !== 'string') return false;
    const t = value.trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(t);
}

function parseEffect(raw: string | null): number | null {
    if (raw == null) return null;
    const t = typeof raw === 'string' ? raw.trim() : String(raw);
    if (t.length === 0) return null;
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return n;
}

export async function GET() {
    const adminWhatsApp = process.env.ADMIN_WHATSAPP_E164;
    let homeLogoUrl: string | null = null;
    let femaleProfileIconUrl: string | null = null;
    let maleProfileIconUrl: string | null = null;
    let superAdminIconUrl: string | null = null;
    let limitedMonthlySubscriptionIconUrl: string | null = null;
    let unlimitedMonthlySubscriptionIconUrl: string | null = null;
    let unlimitedYearlySubscriptionIconUrl: string | null = null;

    const theme = emptyTheme();

    try {
        const reads = await Promise.all([
            getAppSetting(APP_SETTING_KEYS.homeLogoUrl),
            getAppSetting(APP_SETTING_KEYS.femaleProfileIconUrl),
            getAppSetting(APP_SETTING_KEYS.maleProfileIconUrl),
            getAppSetting(APP_SETTING_KEYS.superAdminIconUrl),
            getAppSetting(APP_SETTING_KEYS.limitedMonthlySubscriptionIconUrl),
            getAppSetting(APP_SETTING_KEYS.unlimitedMonthlySubscriptionIconUrl),
            getAppSetting(APP_SETTING_KEYS.unlimitedYearlySubscriptionIconUrl),
            ...COLOR_KEYS.map(([, k]) => getAppSetting(k)),
            ...NAV_ICON_KEYS.map(([, k]) => getAppSetting(k)),
            ...NAV_ICON_ID_KEYS.map(([, k]) => getAppSetting(k)),
            ...EFFECT_KEYS.map(([, k]) => getAppSetting(k)),
        ]);
        homeLogoUrl = reads[0];
        femaleProfileIconUrl = reads[1];
        maleProfileIconUrl = reads[2];
        superAdminIconUrl = reads[3];
        limitedMonthlySubscriptionIconUrl = reads[4];
        unlimitedMonthlySubscriptionIconUrl = reads[5];
        unlimitedYearlySubscriptionIconUrl = reads[6];
        let cursor = 7;
        for (const [key] of COLOR_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            (theme.colors as any)[key] = isValidHexColor(raw) ? raw!.trim() : null;
        }
        for (const [key] of NAV_ICON_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            const t = typeof raw === 'string' ? raw.trim() : '';
            const ok = t.length === 0 ? false : t.startsWith('/') || /^https?:\/\//i.test(t);
            (theme.navIcons as any)[key] = ok ? t : null;
        }
        for (const [key] of NAV_ICON_ID_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            const t = typeof raw === 'string' ? raw.trim() : '';
            const ok = t.length > 0 && /^[a-z0-9_.-]{1,80}$/i.test(t);
            (theme.navIcons as any)[key] = ok ? t.toLowerCase() : null;
        }
        for (const [key] of EFFECT_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            (theme.effects as any)[key] = parseEffect(raw);
        }
    } catch (e) {
        // Keep this endpoint available even if settings storage fails.
        console.error('Public Config: failed to read app settings', e);
    }

    if (!adminWhatsApp) {
        console.warn('ADMIN_WHATSAPP_E164 is not set');
    }

    return NextResponse.json({
        adminWhatsAppE164: adminWhatsApp,
        homeLogoUrl,
        femaleProfileIconUrl,
        maleProfileIconUrl,
        superAdminIconUrl,
        limitedMonthlySubscriptionIconUrl,
        unlimitedMonthlySubscriptionIconUrl,
        unlimitedYearlySubscriptionIconUrl,
        theme,
    });
}
