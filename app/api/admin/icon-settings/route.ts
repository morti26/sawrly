import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting, setAppSetting } from '@/lib/app_settings';

type IconSettingsResponse = {
    femaleProfileIconUrl: string | null;
    maleProfileIconUrl: string | null;
    superAdminIconUrl: string | null;
    limitedMonthlySubscriptionIconUrl: string | null;
    unlimitedMonthlySubscriptionIconUrl: string | null;
    unlimitedYearlySubscriptionIconUrl: string | null;
};

function normalizeUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed;
}

function isAllowedUrl(url: string): boolean {
    return url.startsWith('/') || /^https?:\/\//i.test(url);
}

async function readIconSettings(): Promise<IconSettingsResponse> {
    return {
        femaleProfileIconUrl: await getAppSetting(APP_SETTING_KEYS.femaleProfileIconUrl),
        maleProfileIconUrl: await getAppSetting(APP_SETTING_KEYS.maleProfileIconUrl),
        superAdminIconUrl: await getAppSetting(APP_SETTING_KEYS.superAdminIconUrl),
        limitedMonthlySubscriptionIconUrl: await getAppSetting(
            APP_SETTING_KEYS.limitedMonthlySubscriptionIconUrl
        ),
        unlimitedMonthlySubscriptionIconUrl: await getAppSetting(
            APP_SETTING_KEYS.unlimitedMonthlySubscriptionIconUrl
        ),
        unlimitedYearlySubscriptionIconUrl: await getAppSetting(
            APP_SETTING_KEYS.unlimitedYearlySubscriptionIconUrl
        ),
    };
}

export async function GET(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    try {
        return NextResponse.json(await readIconSettings());
    } catch (error) {
        console.error('Admin icon settings GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    try {
        const body = (await req.json()) as Partial<IconSettingsResponse>;
        const updates: Array<[string, string | null]> = [
            [APP_SETTING_KEYS.femaleProfileIconUrl, normalizeUrl(body.femaleProfileIconUrl)],
            [APP_SETTING_KEYS.maleProfileIconUrl, normalizeUrl(body.maleProfileIconUrl)],
            [APP_SETTING_KEYS.superAdminIconUrl, normalizeUrl(body.superAdminIconUrl)],
            [
                APP_SETTING_KEYS.limitedMonthlySubscriptionIconUrl,
                normalizeUrl(body.limitedMonthlySubscriptionIconUrl),
            ],
            [
                APP_SETTING_KEYS.unlimitedMonthlySubscriptionIconUrl,
                normalizeUrl(body.unlimitedMonthlySubscriptionIconUrl),
            ],
            [
                APP_SETTING_KEYS.unlimitedYearlySubscriptionIconUrl,
                normalizeUrl(body.unlimitedYearlySubscriptionIconUrl),
            ],
        ];

        for (const [, value] of updates) {
            if (value && !isAllowedUrl(value)) {
                return NextResponse.json({ error: 'Invalid icon URL' }, { status: 400 });
            }
        }

        await Promise.all(updates.map(([key, value]) => setAppSetting(key, value)));

        return NextResponse.json(await readIconSettings());
    } catch (error) {
        console.error('Admin icon settings PUT error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
