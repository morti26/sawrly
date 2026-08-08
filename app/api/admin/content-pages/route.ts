import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting, setAppSetting } from '@/lib/app_settings';

interface AdminContentPagesResponse {
    aboutCard1Title: string | null;
    aboutCard1Body: string | null;
    aboutCard2Title: string | null;
    aboutCard2Body: string | null;
    aboutCard3Title: string | null;
    aboutCard3Body: string | null;
    aboutPageTitle: string | null;
    aboutPageBody: string | null;
    termsBody: string | null;
    privacyBody: string | null;
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed;
}

export async function GET(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    try {
        const [
            aboutCard1Title,
            aboutCard1Body,
            aboutCard2Title,
            aboutCard2Body,
            aboutCard3Title,
            aboutCard3Body,
            aboutPageTitle,
            aboutPageBody,
            termsBody,
            privacyBody,
        ] = await Promise.all([
            getAppSetting(APP_SETTING_KEYS.aboutCard1Title),
            getAppSetting(APP_SETTING_KEYS.aboutCard1Body),
            getAppSetting(APP_SETTING_KEYS.aboutCard2Title),
            getAppSetting(APP_SETTING_KEYS.aboutCard2Body),
            getAppSetting(APP_SETTING_KEYS.aboutCard3Title),
            getAppSetting(APP_SETTING_KEYS.aboutCard3Body),
            getAppSetting(APP_SETTING_KEYS.aboutPageTitle),
            getAppSetting(APP_SETTING_KEYS.aboutPageBody),
            getAppSetting(APP_SETTING_KEYS.termsBody),
            getAppSetting(APP_SETTING_KEYS.privacyBody),
        ]);

        const response: AdminContentPagesResponse = {
            aboutCard1Title,
            aboutCard1Body,
            aboutCard2Title,
            aboutCard2Body,
            aboutCard3Title,
            aboutCard3Body,
            aboutPageTitle,
            aboutPageBody,
            termsBody,
            privacyBody,
        };
        return NextResponse.json(response);
    } catch (e) {
        console.error('Admin Content Pages GET Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    try {
        const body = await req.json().catch(() => ({}));

        const aboutCard1Title = normalizeText(body?.aboutCard1Title);
        const aboutCard1Body = normalizeText(body?.aboutCard1Body);
        const aboutCard2Title = normalizeText(body?.aboutCard2Title);
        const aboutCard2Body = normalizeText(body?.aboutCard2Body);
        const aboutCard3Title = normalizeText(body?.aboutCard3Title);
        const aboutCard3Body = normalizeText(body?.aboutCard3Body);
        const aboutPageTitle = normalizeText(body?.aboutPageTitle);
        const aboutPageBody = normalizeText(body?.aboutPageBody);
        const termsBody = normalizeText(body?.termsBody);
        const privacyBody = normalizeText(body?.privacyBody);

        await Promise.all([
            setAppSetting(APP_SETTING_KEYS.aboutCard1Title, aboutCard1Title),
            setAppSetting(APP_SETTING_KEYS.aboutCard1Body, aboutCard1Body),
            setAppSetting(APP_SETTING_KEYS.aboutCard2Title, aboutCard2Title),
            setAppSetting(APP_SETTING_KEYS.aboutCard2Body, aboutCard2Body),
            setAppSetting(APP_SETTING_KEYS.aboutCard3Title, aboutCard3Title),
            setAppSetting(APP_SETTING_KEYS.aboutCard3Body, aboutCard3Body),
            setAppSetting(APP_SETTING_KEYS.aboutPageTitle, aboutPageTitle),
            setAppSetting(APP_SETTING_KEYS.aboutPageBody, aboutPageBody),
            setAppSetting(APP_SETTING_KEYS.termsBody, termsBody),
            setAppSetting(APP_SETTING_KEYS.privacyBody, privacyBody),
        ]);

        const response: AdminContentPagesResponse = {
            aboutCard1Title,
            aboutCard1Body,
            aboutCard2Title,
            aboutCard2Body,
            aboutCard3Title,
            aboutCard3Body,
            aboutPageTitle,
            aboutPageBody,
            termsBody,
            privacyBody,
        };

        return NextResponse.json(response);
    } catch (e) {
        console.error('Admin Content Pages PUT Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
