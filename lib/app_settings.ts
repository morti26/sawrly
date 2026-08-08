import { query } from '@/lib/db';

const SETTINGS_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS app_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`;

let appSettingsTableEnsured = false;

export const APP_SETTING_KEYS = {
    homeLogoUrl: 'home_logo_url',
    femaleProfileIconUrl: 'female_profile_icon_url',
    maleProfileIconUrl: 'male_profile_icon_url',
    superAdminIconUrl: 'super_admin_icon_url',
    limitedMonthlySubscriptionIconUrl: 'limited_monthly_subscription_icon_url',
    unlimitedMonthlySubscriptionIconUrl: 'unlimited_monthly_subscription_icon_url',
    unlimitedYearlySubscriptionIconUrl: 'unlimited_yearly_subscription_icon_url',
    themePrimary: 'theme_primary',
    themePrimaryLight: 'theme_primary_light',
    themePrimaryDark: 'theme_primary_dark',
    themeAccentPink: 'theme_accent_pink',
    themeBackground: 'theme_background',
    themeSurface: 'theme_surface',
    themeSurfaceLight: 'theme_surface_light',
    themeMenuBackground: 'theme_menu_background',
    themeTextPrimary: 'theme_text_primary',
    themeTextSecondary: 'theme_text_secondary',
    themeTextTertiary: 'theme_text_tertiary',
    themeSuccess: 'theme_success',
    themeWarning: 'theme_warning',
    themeError: 'theme_error',
    themeInfo: 'theme_info',
    themeBorder: 'theme_border',
    themeBorderLight: 'theme_border_light',
    themeOnPrimary: 'theme_on_primary',
    themePrimaryContainer: 'theme_primary_container',
    themeOnPrimaryContainer: 'theme_on_primary_container',
    themePrimaryFixed: 'theme_primary_fixed',
    themePrimaryFixedDim: 'theme_primary_fixed_dim',
    themeOnPrimaryFixed: 'theme_on_primary_fixed',
    themeOnPrimaryFixedVariant: 'theme_on_primary_fixed_variant',
    themeSecondary: 'theme_secondary',
    themeOnSecondary: 'theme_on_secondary',
    themeSecondaryContainer: 'theme_secondary_container',
    themeOnSecondaryContainer: 'theme_on_secondary_container',
    themeSecondaryFixed: 'theme_secondary_fixed',
    themeSecondaryFixedDim: 'theme_secondary_fixed_dim',
    themeOnSecondaryFixed: 'theme_on_secondary_fixed',
    themeOnSecondaryFixedVariant: 'theme_on_secondary_fixed_variant',
    themeTertiary: 'theme_tertiary',
    themeOnTertiary: 'theme_on_tertiary',
    themeTertiaryContainer: 'theme_tertiary_container',
    themeOnTertiaryContainer: 'theme_on_tertiary_container',
    themeTertiaryFixed: 'theme_tertiary_fixed',
    themeTertiaryFixedDim: 'theme_tertiary_fixed_dim',
    themeOnTertiaryFixed: 'theme_on_tertiary_fixed',
    themeOnTertiaryFixedVariant: 'theme_on_tertiary_fixed_variant',
    themeOnError: 'theme_on_error',
    themeErrorContainer: 'theme_error_container',
    themeOnErrorContainer: 'theme_on_error_container',
    themeOnSurface: 'theme_on_surface',
    themeSurfaceDim: 'theme_surface_dim',
    themeSurfaceBright: 'theme_surface_bright',
    themeSurfaceContainerLowest: 'theme_surface_container_lowest',
    themeSurfaceContainerLow: 'theme_surface_container_low',
    themeSurfaceContainer: 'theme_surface_container',
    themeSurfaceContainerHigh: 'theme_surface_container_high',
    themeSurfaceContainerHighest: 'theme_surface_container_highest',
    themeOnSurfaceVariant: 'theme_on_surface_variant',
    themeOutline: 'theme_outline',
    themeOutlineVariant: 'theme_outline_variant',
    themeOnBackground: 'theme_on_background',
    themeInverseSurface: 'theme_inverse_surface',
    themeInverseOnSurface: 'theme_inverse_on_surface',
    themeInversePrimary: 'theme_inverse_primary',
    themeShadow: 'theme_shadow',
    themeScrim: 'theme_scrim',
    themeOnSuccess: 'theme_on_success',
    themeSuccessContainer: 'theme_success_container',
    themeOnSuccessContainer: 'theme_on_success_container',
    themeOnWarning: 'theme_on_warning',
    themeWarningContainer: 'theme_warning_container',
    themeOnWarningContainer: 'theme_on_warning_container',
    themeOnInfo: 'theme_on_info',
    themeInfoContainer: 'theme_info_container',
    themeOnInfoContainer: 'theme_on_info_container',
    themeDivider: 'theme_divider',
    themeSplash: 'theme_splash',
    themeDisabled: 'theme_disabled',
    themeOnDisabled: 'theme_on_disabled',
    themeDisabledContainer: 'theme_disabled_container',
    themeHeroStart: 'theme_hero_start',
    themeHeroMid: 'theme_hero_mid',
    themeHeroEnd: 'theme_hero_end',
    themeCardBackground: 'theme_card_background',
    themeCardBorder: 'theme_card_border',
    themeBadge: 'theme_badge',
    themeOnBadge: 'theme_on_badge',
    themeSnackbarBackground: 'theme_snackbar_background',
    themeSnackbarText: 'theme_snackbar_text',
    themeShimmerBase: 'theme_shimmer_base',
    themeShimmerHighlight: 'theme_shimmer_highlight',
    themeOnAccentPink: 'theme_on_accent_pink',
    navIconHomeUrl: 'nav_icon_home_url',
    navIconSearchUrl: 'nav_icon_search_url',
    navIconCategoriesUrl: 'nav_icon_categories_url',
    navIconOrdersUrl: 'nav_icon_orders_url',
    navIconProfileUrl: 'nav_icon_profile_url',
    navIconHomeActiveUrl: 'nav_icon_home_active_url',
    navIconSearchActiveUrl: 'nav_icon_search_active_url',
    navIconCategoriesActiveUrl: 'nav_icon_categories_active_url',
    navIconOrdersActiveUrl: 'nav_icon_orders_active_url',
    navIconProfileActiveUrl: 'nav_icon_profile_active_url',
    navIconHomeId: 'nav_icon_home_id',
    navIconSearchId: 'nav_icon_search_id',
    navIconCategoriesId: 'nav_icon_categories_id',
    navIconOrdersId: 'nav_icon_orders_id',
    navIconProfileId: 'nav_icon_profile_id',
    navIconHomeActiveId: 'nav_icon_home_active_id',
    navIconSearchActiveId: 'nav_icon_search_active_id',
    navIconCategoriesActiveId: 'nav_icon_categories_active_id',
    navIconOrdersActiveId: 'nav_icon_orders_active_id',
    navIconProfileActiveId: 'nav_icon_profile_active_id',
    effPrimaryGradientAngle: 'eff_primary_gradient_angle',
    effCardRadius: 'eff_card_radius',
    effChipRadius: 'eff_chip_radius',
    effButtonRadius: 'eff_button_radius',
    effNavShadowOpacity: 'eff_nav_shadow_opacity',
    effCardShadowOpacity: 'eff_card_shadow_opacity',
    effActiveGlowOpacity: 'eff_active_glow_opacity',
    effGlassBlur: 'eff_glass_blur',
    effSurfaceOpacity: 'eff_surface_opacity',
    effBorderOpacity: 'eff_border_opacity',
    themeMode: 'theme_mode',
    lightSeedPrimary: 'light_seed_primary',
    iconLibraryDefault: 'icon_library_default',
    dynamicColorEnabled: 'dynamic_color_enabled',
    animationsEnabled: 'animations_enabled',
    pageTransitionStyle: 'page_transition_style',
    activeTemplateId: 'active_template_id',
    navIconHomeLibrary: 'nav_icon_home_library',
    navIconSearchLibrary: 'nav_icon_search_library',
    navIconCategoriesLibrary: 'nav_icon_categories_library',
    navIconOrdersLibrary: 'nav_icon_orders_library',
    navIconProfileLibrary: 'nav_icon_profile_library',
    navIconHomeActiveLibrary: 'nav_icon_home_active_library',
    navIconSearchActiveLibrary: 'nav_icon_search_active_library',
    navIconCategoriesActiveLibrary: 'nav_icon_categories_active_library',
    navIconOrdersActiveLibrary: 'nav_icon_orders_active_library',
    navIconProfileActiveLibrary: 'nav_icon_profile_active_library',
    paymentProviderName: 'payment_provider_name',
    paymentApiBaseUrl: 'payment_api_base_url',
    paymentApiKey: 'payment_api_key',
    paymentWebhookSecret: 'payment_webhook_secret',
    aboutCard1Title: 'about_card_1_title',
    aboutCard1Body: 'about_card_1_body',
    aboutCard2Title: 'about_card_2_title',
    aboutCard2Body: 'about_card_2_body',
    aboutCard3Title: 'about_card_3_title',
    aboutCard3Body: 'about_card_3_body',
    aboutPageTitle: 'about_page_title',
    aboutPageBody: 'about_page_body',
    termsBody: 'terms_body',
    privacyBody: 'privacy_body',
} as const;

export async function ensureAppSettingsTable(): Promise<void> {
    if (appSettingsTableEnsured) {
        return;
    }

    try {
        await query('SELECT 1 FROM app_settings LIMIT 1');
        appSettingsTableEnsured = true;
        return;
    } catch (error: any) {
        if (error?.code !== '42P01') {
            throw error;
        }
    }

    await query(SETTINGS_TABLE_SQL);
    appSettingsTableEnsured = true;
}

export async function getAppSetting(settingKey: string): Promise<string | null> {
    await ensureAppSettingsTable();
    const res = await query(
        'SELECT setting_value FROM app_settings WHERE setting_key = $1 LIMIT 1',
        [settingKey]
    );
    return res.rows[0]?.setting_value ?? null;
}

export async function setAppSetting(settingKey: string, value: string | null): Promise<void> {
    await ensureAppSettingsTable();
    await query(
        `
        INSERT INTO app_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key)
        DO UPDATE SET
            setting_value = EXCLUDED.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `,
        [settingKey, value]
    );
}
