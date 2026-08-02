import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

type SubscriptionPlanPublic = {
    id: string;
    code: string;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    price_monthly: string;
    price_yearly: string;
    currency: string;
    max_offers: number | null;
    max_team: number | null;
    is_popular: boolean;
    is_enterprise: boolean;
    features: Record<string, boolean>;
};

const SETUP_SQL = `
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
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
INSERT INTO subscription_plans
    (code, name_en, name_ar, description_en, description_ar,
     price_monthly, price_yearly, currency, sort_order,
     max_offers, max_team, is_active, is_popular, is_enterprise, features)
VALUES
    ('free', 'Free Trial', 'تجربة مجانية',
     '14-day free trial, limited features.',
     'تجربة مجانية لمدة 14 يوماً مع ميزات محدودة.',
     0, 0, 'IQD', 1, 5, 1, TRUE, FALSE, FALSE,
     '{"prioritySearch":false,"hideAds":false,"customDomain":false,"apiAccess":false,"customBranding":false,"dedicatedSupport":false,"sla":false,"teamCollab":false,"whiteLabel":false,"advancedAnalytics":false}'::JSONB),
    ('pro', 'Creator Pro', 'الإبداعى المحترف',
     'For professional creators. Priority search + no ads.',
     'للمبدعين المحترفين. بحث ذو أولوية وبدون إعلانات.',
     149000, 1599000, 'IQD', 2, 100, 1, TRUE, TRUE, FALSE,
     '{"prioritySearch":true,"hideAds":true,"customDomain":false,"apiAccess":false,"customBranding":false,"dedicatedSupport":false,"sla":false,"teamCollab":false,"whiteLabel":false,"advancedAnalytics":true}'::JSONB),
    ('studio', 'Studio Agency', 'الاستوديو والوكالة',
     '5 team members, custom profile, API access.',
     '5 أعضاء فريق، ملف شخصي مميز، وصول API.',
     499000, 5399000, 'IQD', 3, 500, 5, TRUE, FALSE, FALSE,
     '{"prioritySearch":true,"hideAds":true,"customDomain":false,"apiAccess":true,"customBranding":true,"dedicatedSupport":false,"sla":false,"teamCollab":true,"whiteLabel":false,"advancedAnalytics":true}'::JSONB),
    ('enterprise', 'Enterprise', 'الشركات والمؤسسات',
     'Custom pricing – contact sales for SLA, white label, on-prem.',
     'تسعير خاص – تواصل مع المبيعات لاتفاقية SLA وهوية بصرية خاصة.',
     0, 0, 'IQD', 4, NULL, NULL, TRUE, FALSE, TRUE,
     '{"prioritySearch":true,"hideAds":true,"customDomain":true,"apiAccess":true,"customBranding":true,"dedicatedSupport":true,"sla":true,"teamCollab":true,"whiteLabel":true,"advancedAnalytics":true}'::JSONB)
ON CONFLICT (code) DO NOTHING;
`;

async function ensureTables() {
    try {
        const stmts = SETUP_SQL.split(/(?<=;)/).filter(s => s.trim().length > 0);
        for (const s of stmts) {
            try {
                await query(s);
            } catch {
                // Ignorera fel vid upprepad körning (t.ex. tabell redan finns)
            }
        }
    } catch { /* noop */ }
}

export async function GET(_req: NextRequest) {
    try {
        await ensureTables();
        const res = await query(
            `SELECT id, code, name_en, name_ar, description_en, description_ar,
                    price_monthly, price_yearly, currency,
                    max_offers, max_team, is_popular, is_enterprise,
                    COALESCE(features, '{}'::jsonb) AS features
             FROM subscription_plans
             WHERE is_active = TRUE
             ORDER BY sort_order ASC, created_at ASC`
        );
        const plans: SubscriptionPlanPublic[] = res.rows.map(r => ({
            ...r,
            price_monthly: String(r.price_monthly ?? 0),
            price_yearly: String(r.price_yearly ?? 0),
            features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features ?? {}),
        }));
        return NextResponse.json({ plans });
    } catch (e: any) {
        return NextResponse.json({ plans: [], error: e?.message ?? 'Failed' }, { status: 500 });
    }
}
