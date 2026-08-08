import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export type SubscriptionPlanAdmin = {
    id: string;
    code: string;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    price_monthly: string;
    price_yearly: string;
    currency: string;
    sort_order: number;
    max_offers: number | null;
    max_team: number | null;
    is_active: boolean;
    is_popular: boolean;
    is_enterprise: boolean;
    features: Record<string, boolean>;
};

type PlanUpsert = Omit<SubscriptionPlanAdmin, 'id'> & { id?: string | null };

const FEATURE_KEYS = [
    'searchPriority', 'hideAds', 'verifiedBadge', 'videoPortfolio',
    'customWatermark', 'directBooking', 'advancedAnalytics',
    'prioritySupport', 'customProfileUrl', 'portfolioSizeLarge',
] as const;

const SETUP_SQL = `
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price_monthly DECIMAL(12, 2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IQD',
    sort_order INTEGER NOT NULL DEFAULT 0,
    max_offers INTEGER,
    max_team INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_enterprise BOOLEAN NOT NULL DEFAULT FALSE,
    features JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status subscription_status NOT NULL DEFAULT 'trialing',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IQD',
    last_payment_id UUID,
    external_subscription_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const DEFAULT_PLANS: PlanUpsert[] = [
    {
        code: 'free', name_en: 'Free Trial', name_ar: 'تجربة مجانية',
        description_en: '14-day free trial. Limited offers, watermarked.',
        description_ar: 'تجربة مجانية 14 يومًا. إعلانات، حدود في الإعلانات، علامة مائية افتراضية.',
        price_monthly: '0', price_yearly: '0', currency: 'IQD', sort_order: 1,
        max_offers: 10, max_team: 1, is_active: true, is_popular: false, is_enterprise: false,
        features: Object.fromEntries(FEATURE_KEYS.map(k => [k, false])) as any,
    },
    {
        code: 'pro', name_en: 'Creator Pro', name_ar: 'الإبداعى المحترف',
        description_en: 'For pros. Verified badge, video, no ads, priority search.',
        description_ar: 'للمحترفين: شارة تحقق، فيديو، بدون إعلانات، بحث ذو أولوية.',
        price_monthly: '149000', price_yearly: '1599000', currency: 'IQD', sort_order: 2,
        max_offers: 100, max_team: 1, is_active: true, is_popular: true, is_enterprise: false,
        features: {
            searchPriority: true, hideAds: true, verifiedBadge: true,
            videoPortfolio: true, customWatermark: true, directBooking: true,
            advancedAnalytics: false, prioritySupport: false,
            customProfileUrl: true, portfolioSizeLarge: false,
            ...Object.fromEntries(FEATURE_KEYS.map(k => [k, false]))
        } as any,
    },
    {
        code: 'studio', name_en: 'Studio Agency', name_ar: 'الاستوديو والوكالة',
        description_en: 'Studios/teams: 5 team, advanced analytics, large portfolio, priority support.',
        description_ar: 'للاستوديوهات: 5 أعضاء فريق، تحليلات متقدمة، معرض ضخم، دعم أولوية.',
        price_monthly: '499000', price_yearly: '5399000', currency: 'IQD', sort_order: 3,
        max_offers: 500, max_team: 5, is_active: true, is_popular: false, is_enterprise: false,
        features: {
            searchPriority: true, hideAds: true, verifiedBadge: true,
            videoPortfolio: true, customWatermark: true, directBooking: true,
            advancedAnalytics: true, prioritySupport: true,
            customProfileUrl: true, portfolioSizeLarge: true,
            ...Object.fromEntries(FEATURE_KEYS.map(k => [k, false]))
        } as any,
    },
    {
        code: 'enterprise', name_en: 'Enterprise', name_ar: 'الشركات والمؤسسات',
        description_en: 'Custom pricing – contact sales. Unlimited, unlimited team, full SLA.',
        description_ar: 'تسعير خاص – تواصل مع المبيعات. بدون حدود، فريق غير محدود، اتفاقية SLA كاملة.',
        price_monthly: '0', price_yearly: '0', currency: 'IQD', sort_order: 4,
        max_offers: null, max_team: null, is_active: true, is_popular: false, is_enterprise: true,
        features: Object.fromEntries(FEATURE_KEYS.map(k => [k, true])) as any,
    },
];

async function ensureTablesAndDefaults() {
    try {
        // CREATE TYPE får error om den redan finns → kör i DO-block för att fånga
        await query(`
            DO $$ BEGIN
                CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        `);
        await query(SETUP_SQL.replace(/CREATE TYPE subscription_status[^;]+;\n/, ''));
    } catch (e: any) {
        if (!String(e.message || '').includes('already exists') && !String(e.message || '').includes('duplicate')) {
            throw e;
        }
    }
    try {
        for (const p of DEFAULT_PLANS) {
            await query(
                `INSERT INTO subscription_plans
                    (code, name_en, name_ar, description_en, description_ar,
                     price_monthly, price_yearly, currency, sort_order,
                     max_offers, max_team, is_active, is_popular, is_enterprise, features)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
                 ON CONFLICT (code) DO NOTHING`,
                [
                    p.code, p.name_en, p.name_ar, p.description_en, p.description_ar,
                    p.price_monthly, p.price_yearly, p.currency, p.sort_order,
                    p.max_offers, p.max_team, p.is_active, p.is_popular, p.is_enterprise,
                    JSON.stringify(p.features),
                ]
            );
        }
    } catch { /* ignorera dubbletter vid omstart */ }
}

function debugAuthSummary(req: NextRequest, auth: any): any {
    const authHeader = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const authHeadShort = authHeader ? authHeader.slice(0, 16) + '…(len=' + authHeader.length + ')' : 'Saknas';
    const cookieNames = (req.headers.get('cookie') || '')
        .split(';').map(s => s.trim().split('=')[0]).filter(Boolean);
    const hasAdminCookie = cookieNames.includes('admin_token');
    const hasAnyCookie = cookieNames.filter(n => ['admin_token','token','jwt'].includes(n));
    const user = auth?.user || null;
    return {
        method: req.method,
        ua: (req.headers.get('user-agent') || '').slice(0, 50),
        auth_header: authHeadShort,
        cookies_present: cookieNames,
        auth_cookie_names: hasAnyCookie,
        admin_token_cookie: hasAdminCookie,
        parsed_ok: user ? {
            role: user.role,
            email: user.email,
            uid: String(user.userId || '').slice(0, 10),
        } : null,
        auth_error: auth?.error || null,
        auth_debug_reason: auth?.debug?.errorReason ?? null,
        auth_debug_foundIn: auth?.debug?.foundIn ?? null,
    };
}

export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    const debugSummary = debugAuthSummary(req, auth);
    if (!auth.user || auth.error) {
        console.log('[subscription-plans GET 401]', JSON.stringify(debugSummary));
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', debug: auth.debug || null },
            { status: auth.status || 401 }
        );
    }
    console.log('[subscription-plans GET OK]', JSON.stringify({ user: debugSummary.parsed_ok, via: auth.debug?.foundIn || '?' }));
    try {
        await ensureTablesAndDefaults();
        const res = await query(
            `SELECT id, code, name_en, name_ar, description_en, description_ar,
                    price_monthly, price_yearly, currency, sort_order,
                    max_offers, max_team, is_active, is_popular, is_enterprise,
                    COALESCE(features, '{}'::jsonb) AS features
             FROM subscription_plans ORDER BY sort_order ASC, created_at ASC`
        );
        const plans: SubscriptionPlanAdmin[] = res.rows.map(r => ({
            ...r,
            price_monthly: String(r.price_monthly ?? 0),
            price_yearly: String(r.price_yearly ?? 0),
            features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features ?? {}),
        }));
        return NextResponse.json({ plans });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? 'Failed to load plans' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    const debugSummary = debugAuthSummary(req, auth);
    if (!auth.user || auth.error) {
        console.log('[subscription-plans PUT 401]', JSON.stringify(debugSummary));
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', debug: auth.debug || null },
            { status: auth.status || 401 }
        );
    }
    console.log('[subscription-plans PUT OK]', JSON.stringify({ user: debugSummary.parsed_ok, via: auth.debug?.foundIn || '?' }));
    try {
        await ensureTablesAndDefaults();
        const data = (await req.json()) as PlanUpsert;
        if (!data.code || !data.code.trim()) return NextResponse.json({ error: 'Kod krävs (code)' }, { status: 400 });
        if (!data.name_en || !data.name_en.trim()) return NextResponse.json({ error: 'Engelskt namn krävs' }, { status: 400 });
        if (!data.name_ar || !data.name_ar.trim()) return NextResponse.json({ error: 'Arabiskt namn krävs' }, { status: 400 });

        const cleanFeatures: Record<string, boolean> = {};
        if (data.features && typeof data.features === 'object') {
            for (const k of Object.keys(data.features)) {
                cleanFeatures[k] = Boolean((data.features as any)[k]);
            }
        }

        const month = Number(data.price_monthly);
        const year = Number(data.price_yearly);
        if (!Number.isFinite(month) || month < 0) return NextResponse.json({ error: 'Ogiltigt månadspris' }, { status: 400 });
        if (!Number.isFinite(year) || year < 0) return NextResponse.json({ error: 'Ogiltigt årspris' }, { status: 400 });

        const values = [
            data.code.trim(),
            data.name_en.trim(),
            data.name_ar.trim(),
            data.description_en?.toString().trim() || null,
            data.description_ar?.toString().trim() || null,
            month,
            year,
            (data.currency || 'IQD').toString().toUpperCase(),
            Number(data.sort_order) || 0,
            (() => {
                const v = data.max_offers as unknown;
                if (v == null || v === '' || v === 'null') return null;
                const n = Math.trunc(Number(v));
                return Number.isFinite(n) && n >= 0 ? n : null;
            })(),
            (() => {
                const v = data.max_team as unknown;
                if (v == null || v === '' || v === 'null') return null;
                const n = Math.trunc(Number(v));
                return Number.isFinite(n) && n >= 0 ? n : null;
            })(),
            Boolean(data.is_active),
            Boolean(data.is_popular),
            Boolean(data.is_enterprise),
            JSON.stringify(cleanFeatures),
        ];

        let row;
        if (data.id) {
            const up = await query(
                `UPDATE subscription_plans SET
                    code=$1, name_en=$2, name_ar=$3, description_en=$4, description_ar=$5,
                    price_monthly=$6, price_yearly=$7, currency=$8, sort_order=$9,
                    max_offers=$10, max_team=$11, is_active=$12, is_popular=$13, is_enterprise=$14,
                    features=$15, updated_at=NOW()
                 WHERE id=$16 RETURNING *`,
                [...values, data.id]
            );
            row = up.rows[0];
        } else {
            const ins = await query(
                `INSERT INTO subscription_plans
                    (code, name_en, name_ar, description_en, description_ar,
                     price_monthly, price_yearly, currency, sort_order,
                     max_offers, max_team, is_active, is_popular, is_enterprise, features)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
                 ON CONFLICT (code) DO UPDATE SET
                    name_en=EXCLUDED.name_en,
                    name_ar=EXCLUDED.name_ar,
                    description_en=EXCLUDED.description_en,
                    description_ar=EXCLUDED.description_ar,
                    price_monthly=EXCLUDED.price_monthly,
                    price_yearly=EXCLUDED.price_yearly,
                    currency=EXCLUDED.currency,
                    sort_order=EXCLUDED.sort_order,
                    max_offers=EXCLUDED.max_offers,
                    max_team=EXCLUDED.max_team,
                    is_active=EXCLUDED.is_active,
                    is_popular=EXCLUDED.is_popular,
                    is_enterprise=EXCLUDED.is_enterprise,
                    features=EXCLUDED.features,
                    updated_at=NOW()
                 RETURNING *`,
                values
            );
            row = ins.rows[0];
        }
        return NextResponse.json({ ok: true, plan: row });
    } catch (e: any) {
        if (String(e?.message || '').includes('subscription_plans_code_key')) {
            return NextResponse.json({ error: 'Denna kod (code) används redan av en annan plan' }, { status: 400 });
        }
        return NextResponse.json({ error: e?.message ?? 'Failed to save plan' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    const debugSummary = debugAuthSummary(req, auth);
    if (!auth.user || auth.error) {
        console.log('[subscription-plans DELETE 401]', JSON.stringify(debugSummary));
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', debug: auth.debug || null },
            { status: auth.status || 401 }
        );
    }
    console.log('[subscription-plans DELETE OK]', JSON.stringify({ user: debugSummary.parsed_ok, via: auth.debug?.foundIn || '?' }));
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id saknas' }, { status: 400 });
        const hasSubs = await query(
            `SELECT 1 FROM user_subscriptions WHERE plan_id=$1 LIMIT 1`,
            [id]
        );
        if (hasSubs.rowCount && hasSubs.rowCount > 0) {
            return NextResponse.json(
                { error: 'Kan inte radera planen – den används av aktiva prenumeranter. Avmarkera "is_active" istället.' },
                { status: 400 }
            );
        }
        await query(`DELETE FROM subscription_plans WHERE id=$1`, [id]);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? 'Failed to delete plan' }, { status: 500 });
    }
}
