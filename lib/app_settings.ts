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
