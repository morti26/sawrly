import { NextResponse } from 'next/server';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';
import {
    buildEnterpriseFromSeed,
    type EnterpriseTheme,
    isValidHex,
    normalizeHex,
} from '@/lib/theme_engine';
import { ALL_THEME_COLOR_KEYS } from '@/app/api/admin/theme-settings/route';

export const dynamic = 'force-dynamic';

const NAV_ICON_KEYS: [string, string][] = [
    ['home', APP_SETTING_KEYS.navIconHomeUrl],
    ['search', APP_SETTING_KEYS.navIconSearchUrl],
    ['categories', APP_SETTING_KEYS.navIconCategoriesUrl],
    ['orders', APP_SETTING_KEYS.navIconOrdersUrl],
    ['profile', APP_SETTING_KEYS.navIconProfileUrl],
    ['homeActive', APP_SETTING_KEYS.navIconHomeActiveUrl],
    ['searchActive', APP_SETTING_KEYS.navIconSearchActiveUrl],
    ['categoriesActive', APP_SETTING_KEYS.navIconCategoriesActiveUrl],
    ['ordersActive', APP_SETTING_KEYS.navIconOrdersActiveUrl],
    ['profileActive', APP_SETTING_KEYS.navIconProfileActiveUrl],
];

const NAV_ICON_ID_KEYS: [string, string][] = [
    ['homeId', APP_SETTING_KEYS.navIconHomeId],
    ['searchId', APP_SETTING_KEYS.navIconSearchId],
    ['categoriesId', APP_SETTING_KEYS.navIconCategoriesId],
    ['ordersId', APP_SETTING_KEYS.navIconOrdersId],
    ['profileId', APP_SETTING_KEYS.navIconProfileId],
    ['homeActiveId', APP_SETTING_KEYS.navIconHomeActiveId],
    ['searchActiveId', APP_SETTING_KEYS.navIconSearchActiveId],
    ['categoriesActiveId', APP_SETTING_KEYS.navIconCategoriesActiveId],
    ['ordersActiveId', APP_SETTING_KEYS.navIconOrdersActiveId],
    ['profileActiveId', APP_SETTING_KEYS.navIconProfileActiveId],
];

const NAV_ICON_LIBRARY_KEYS: [string, string][] = [
    ['homeLibrary', APP_SETTING_KEYS.navIconHomeLibrary],
    ['searchLibrary', APP_SETTING_KEYS.navIconSearchLibrary],
    ['categoriesLibrary', APP_SETTING_KEYS.navIconCategoriesLibrary],
    ['ordersLibrary', APP_SETTING_KEYS.navIconOrdersLibrary],
    ['profileLibrary', APP_SETTING_KEYS.navIconProfileLibrary],
    ['homeActiveLibrary', APP_SETTING_KEYS.navIconHomeActiveLibrary],
    ['searchActiveLibrary', APP_SETTING_KEYS.navIconSearchActiveLibrary],
    ['categoriesActiveLibrary', APP_SETTING_KEYS.navIconCategoriesActiveLibrary],
    ['ordersActiveLibrary', APP_SETTING_KEYS.navIconOrdersActiveLibrary],
    ['profileActiveLibrary', APP_SETTING_KEYS.navIconProfileActiveLibrary],
];

const EFFECT_KEYS: [string, string][] = [
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

const LEGACY_COLOR_KEYS: [string, string][] = [
    ['primary', APP_SETTING_KEYS.themePrimary],
    ['primaryLight', APP_SETTING_KEYS.themePrimaryLight],
    ['primaryDark', APP_SETTING_KEYS.themePrimaryDark],
    ['accentPink', APP_SETTING_KEYS.themeAccentPink],
    ['background', APP_SETTING_KEYS.themeBackground],
    ['surface', APP_SETTING_KEYS.themeSurface],
    ['surfaceLight', APP_SETTING_KEYS.themeSurfaceLight],
    ['menuBackground', APP_SETTING_KEYS.themeMenuBackground],
    ['textPrimary', APP_SETTING_KEYS.themeTextPrimary],
    ['textSecondary', APP_SETTING_KEYS.themeTextSecondary],
    ['textTertiary', APP_SETTING_KEYS.themeTextTertiary],
    ['success', APP_SETTING_KEYS.themeSuccess],
    ['warning', APP_SETTING_KEYS.themeWarning],
    ['error', APP_SETTING_KEYS.themeError],
    ['info', APP_SETTING_KEYS.themeInfo],
    ['border', APP_SETTING_KEYS.themeBorder],
    ['borderLight', APP_SETTING_KEYS.themeBorderLight],
];

type LegacyColors = {
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

type Effects = {
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

type Features = {
    themeMode: 'dark' | 'light' | 'system';
    iconLibraryDefault: 'phosphor' | 'material' | 'fontawesome' | 'lucide';
    dynamicColorEnabled: boolean;
    animationsEnabled: boolean;
    pageTransitionStyle: 'cupertino' | 'fade' | 'sharedAxis' | 'zoom';
    activeTemplateId: string | null;
};

function emptyLegacyColors(): LegacyColors {
    const c: any = {};
    for (const [k] of LEGACY_COLOR_KEYS) c[k] = null;
    return c as LegacyColors;
}
function emptyNav(): NavIcons {
    const o: any = {};
    [...NAV_ICON_KEYS, ...NAV_ICON_ID_KEYS, ...NAV_ICON_LIBRARY_KEYS].forEach(([k]) => (o[k] = null));
    return o as NavIcons;
}
function emptyEffects(): Effects {
    const o: any = {};
    for (const [k] of EFFECT_KEYS) o[k] = null;
    return o as Effects;
}
function defaultFeatures(): Features {
    return {
        themeMode: 'dark',
        iconLibraryDefault: 'phosphor',
        dynamicColorEnabled: true,
        animationsEnabled: true,
        pageTransitionStyle: 'cupertino',
        activeTemplateId: null,
    };
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

const VALID_THEME_MODES = new Set(['dark', 'light', 'system']);
const VALID_ICON_LIBRARIES = new Set(['phosphor', 'material', 'fontawesome', 'lucide']);
const VALID_TRANSITIONS = new Set(['cupertino', 'fade', 'sharedAxis', 'zoom']);

function parseFeatures(raws: Record<string, string | null>): Features {
    const d = defaultFeatures();
    const mode = (raws.themeMode || '').trim().toLowerCase();
    if (VALID_THEME_MODES.has(mode)) d.themeMode = mode as Features['themeMode'];
    const lib = (raws.iconLibraryDefault || '').trim().toLowerCase();
    if (VALID_ICON_LIBRARIES.has(lib)) d.iconLibraryDefault = lib as Features['iconLibraryDefault'];
    d.dynamicColorEnabled = (raws.dynamicColorEnabled || 'true').trim().toLowerCase() !== 'false';
    d.animationsEnabled = (raws.animationsEnabled || 'true').trim().toLowerCase() !== 'false';
    const tr = (raws.pageTransitionStyle || '').trim().toLowerCase();
    if (VALID_TRANSITIONS.has(tr)) d.pageTransitionStyle = tr as Features['pageTransitionStyle'];
    const tpl = (raws.activeTemplateId || '').trim();
    d.activeTemplateId = tpl.length > 0 && tpl.length < 64 ? tpl : null;
    return d;
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

    const colors = emptyLegacyColors();
    const navIcons = emptyNav();
    const effects = emptyEffects();
    const featuresRaw: Record<string, string | null> = {};
    let lightSeedPrimary: string | null = null;

    const allColorDbOverrides: Partial<EnterpriseTheme> = {} as any;
    let seedPrimary = '#7C3AED';

    const FEATURE_KEYS: [string, string][] = [
        ['themeMode', APP_SETTING_KEYS.themeMode],
        ['lightSeedPrimary', APP_SETTING_KEYS.lightSeedPrimary],
        ['iconLibraryDefault', APP_SETTING_KEYS.iconLibraryDefault],
        ['dynamicColorEnabled', APP_SETTING_KEYS.dynamicColorEnabled],
        ['animationsEnabled', APP_SETTING_KEYS.animationsEnabled],
        ['pageTransitionStyle', APP_SETTING_KEYS.pageTransitionStyle],
        ['activeTemplateId', APP_SETTING_KEYS.activeTemplateId],
    ];

    try {
        const reads = await Promise.all([
            getAppSetting(APP_SETTING_KEYS.homeLogoUrl),
            getAppSetting(APP_SETTING_KEYS.femaleProfileIconUrl),
            getAppSetting(APP_SETTING_KEYS.maleProfileIconUrl),
            getAppSetting(APP_SETTING_KEYS.superAdminIconUrl),
            getAppSetting(APP_SETTING_KEYS.limitedMonthlySubscriptionIconUrl),
            getAppSetting(APP_SETTING_KEYS.unlimitedMonthlySubscriptionIconUrl),
            getAppSetting(APP_SETTING_KEYS.unlimitedYearlySubscriptionIconUrl),
            ...LEGACY_COLOR_KEYS.map(([, k]) => getAppSetting(k)),
            ...ALL_THEME_COLOR_KEYS.slice(LEGACY_COLOR_KEYS.length).map(([, k]) => getAppSetting(k)),
            ...NAV_ICON_KEYS.map(([, k]) => getAppSetting(k)),
            ...NAV_ICON_ID_KEYS.map(([, k]) => getAppSetting(k)),
            ...NAV_ICON_LIBRARY_KEYS.map(([, k]) => getAppSetting(k)),
            ...EFFECT_KEYS.map(([, k]) => getAppSetting(k)),
            ...FEATURE_KEYS.map(([, k]) => getAppSetting(k)),
        ]);
        homeLogoUrl = reads[0];
        femaleProfileIconUrl = reads[1];
        maleProfileIconUrl = reads[2];
        superAdminIconUrl = reads[3];
        limitedMonthlySubscriptionIconUrl = reads[4];
        unlimitedMonthlySubscriptionIconUrl = reads[5];
        unlimitedYearlySubscriptionIconUrl = reads[6];
        let cursor = 7;

        for (const [key] of LEGACY_COLOR_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            (colors as any)[key] = isValidHexColor(raw) ? raw!.trim() : null;
            if (key === 'primary' && isValidHexColor(raw)) {
                seedPrimary = raw!.trim();
            }
        }
        for (let i = LEGACY_COLOR_KEYS.length; i < ALL_THEME_COLOR_KEYS.length; i++) {
            const raw = reads[cursor];
            cursor += 1;
            const [key] = ALL_THEME_COLOR_KEYS[i];
            if (isValidHexColor(raw)) {
                (allColorDbOverrides as any)[key] = normalizeHex(raw!, raw!);
            }
        }
        for (const [key] of NAV_ICON_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            const t = typeof raw === 'string' ? raw.trim() : '';
            const ok = t.length === 0 ? false : t.startsWith('/') || /^https?:\/\//i.test(t);
            (navIcons as any)[key] = ok ? t : null;
        }
        for (const [key] of NAV_ICON_ID_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            const t = typeof raw === 'string' ? raw.trim() : '';
            const ok = t.length > 0 && /^[a-z0-9_.-]{1,80}$/i.test(t);
            (navIcons as any)[key] = ok ? t.toLowerCase() : null;
        }
        for (const [key] of NAV_ICON_LIBRARY_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            const t = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
            const ok = VALID_ICON_LIBRARIES.has(t);
            (navIcons as any)[key] = ok ? t : null;
        }
        for (const [key] of EFFECT_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            (effects as any)[key] = parseEffect(raw);
        }
        for (const [key] of FEATURE_KEYS) {
            const raw = reads[cursor];
            cursor += 1;
            featuresRaw[key] = typeof raw === 'string' ? raw.trim() : null;
            if (key === 'lightSeedPrimary' && isValidHexColor(raw)) {
                lightSeedPrimary = raw!.trim();
            }
        }
    } catch (e) {
        console.error('Public Config: failed to read app settings', e);
    }

    if (!adminWhatsApp) {
        console.warn('ADMIN_WHATSAPP_E164 is not set');
    }

    const effectsOverride: Partial<EnterpriseTheme['effects']> = {};
    for (const [k] of EFFECT_KEYS) {
        const v = (effects as any)[k];
        if (typeof v === 'number') (effectsOverride as any)[k] = v;
    }

    const features = parseFeatures(featuresRaw);

    const enterpriseDark: EnterpriseTheme = buildEnterpriseFromSeed(
        seedPrimary,
        'dark',
        effectsOverride,
        allColorDbOverrides,
    );

    const enterpriseLight: EnterpriseTheme = buildEnterpriseFromSeed(
        lightSeedPrimary && isValidHexColor(lightSeedPrimary) ? lightSeedPrimary : seedPrimary,
        'light',
        effectsOverride,
        allColorDbOverrides,
    );

    const mergedLegacy: LegacyColors = { ...colors };
    for (const [k] of LEGACY_COLOR_KEYS) {
        if ((mergedLegacy as any)[k] == null && typeof (enterpriseDark as any)[k] === 'string' && isValidHex((enterpriseDark as any)[k])) {
            (mergedLegacy as any)[k] = (enterpriseDark as any)[k];
        }
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
        theme: {
            version: enterpriseDark.version,
            colors: mergedLegacy,
            navIcons,
            effects,
        },
        features,
        enterprise: {
            version: enterpriseDark.version,
            dark: enterpriseDark,
            light: enterpriseLight,
            seed: {
                primary: seedPrimary,
                lightPrimary: lightSeedPrimary || seedPrimary,
            },
        },
    });
}
