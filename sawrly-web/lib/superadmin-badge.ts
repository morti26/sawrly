import { isSuperAdminUser, type AppRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting } from '@/lib/app_settings';

type SuperadminBadgeInput = {
    userId: string;
    email: string;
    role: AppRole;
};

function getEnvValue(key: string): string | null {
    const value = process.env[key]?.trim();
    return value ? value : null;
}

export async function getSuperadminBadge(user: SuperadminBadgeInput) {
    const isSuperadmin = isSuperAdminUser(user);
    if (!isSuperadmin) {
        return {
            isSuperadmin: false,
            label: null,
            iconUrl: null,
        };
    }

    const storedIconUrl = await getAppSetting(APP_SETTING_KEYS.superAdminIconUrl);
    return {
        isSuperadmin: true,
        label: getEnvValue('SUPERADMIN_BADGE_LABEL') ?? 'سوبر أدمن',
        iconUrl: getEnvValue('SUPERADMIN_BADGE_ICON_URL') ?? storedIconUrl,
    };
}
