import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: 401 });
    const result: any = {};

    try {
        result.admin_users = (await query(`
            SELECT id, email, role, name,
                   CASE WHEN frozen_until > NOW() THEN true ELSE false END as frozen,
                   created_at
            FROM users
            WHERE role IN ('admin','moderator') OR email IN ('mon24@live.se','admin@sawrly.com','admin@admin.com')
            ORDER BY created_at DESC LIMIT 20
        `)).rows.map(r => ({ ...r, id: r.id.slice(0, 10) + '…' }));
    } catch (e: any) {
        result.admin_users_error = e.message;
    }

    try {
        const t = await query(`
            SELECT table_name,
                   (xpath('/row/cnt/text()', xml_count))[1]::text::bigint AS est_rows
            FROM (
                SELECT table_name,
                       query_to_xml(format('SELECT count(*) as cnt FROM %I', table_name), false, true, '') as xml_count
                FROM information_schema.tables
                WHERE table_schema='public'
                  AND table_name IN ('subscription_plans','user_subscriptions','app_settings','users','payments','offers','levels','categories','projects','quotes','creator_status')
            ) s ORDER BY table_name
        `);
        result.tables = t.rows;
    } catch (e: any) {
        result.tables_error = e.message;
    }

    try {
        result.subscription_plans = (await query(`
            SELECT id, code, name_ar, name_en,
                   price_monthly::text, price_yearly::text, currency,
                   is_active, is_popular, is_enterprise, sort_order,
                   max_offers, max_team,
                   jsonb_object_keys(features) as features_count
            FROM subscription_plans ORDER BY sort_order, created_at
        `)).rows.map(r => ({ ...r, id: r.id.slice(0, 8) + '…' }));
    } catch (e: any) {
        result.subscription_plans_error = e.message;

        // Auto-seeda tabellen om den saknas (precis som route.ts gör)
        try {
            await query(`DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('trialing','active','past_due','cancelled','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
            await query(`CREATE TABLE IF NOT EXISTS subscription_plans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code TEXT UNIQUE NOT NULL, name_en TEXT NOT NULL, name_ar TEXT NOT NULL,
                description_en TEXT, description_ar TEXT,
                price_monthly DECIMAL(12,2) NOT NULL DEFAULT 0,
                price_yearly DECIMAL(12,2) NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'IQD',
                sort_order INTEGER NOT NULL DEFAULT 0,
                max_offers INTEGER, max_team INTEGER,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                is_popular BOOLEAN NOT NULL DEFAULT FALSE,
                is_enterprise BOOLEAN NOT NULL DEFAULT FALSE,
                features JSONB NOT NULL DEFAULT '{}'::JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`);
            await query(`CREATE TABLE IF NOT EXISTS user_subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id UUID NOT NULL REFERENCES subscription_plans(id),
                status TEXT NOT NULL DEFAULT 'trialing',
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expires_at TIMESTAMPTZ, trial_ends_at TIMESTAMPTZ,
                auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
                amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'IQD',
                notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`);

            const defaults: any[] = [
                ['free','Free Trial','تجربة مجانية','14-day trial','تجربة مجانية 14 يوماً',0,0,'IQD',1,5,1,false,false,false,
                    '{"prioritySearch":false,"hideAds":false,"customDomain":false,"apiAccess":false,"customBranding":false,"dedicatedSupport":false,"sla":false,"teamCollab":false,"whiteLabel":false,"advancedAnalytics":false}'],
                ['pro','Creator Pro','الإبداعى المحترف','Professional creators','للمبدعين المحترفين',149000,1599000,'IQD',2,100,1,true,true,false,
                    '{"prioritySearch":true,"hideAds":true,"advancedAnalytics":true,"customDomain":false,"apiAccess":false,"customBranding":false,"dedicatedSupport":false,"sla":false,"teamCollab":false,"whiteLabel":false}'],
                ['studio','Studio Agency','الاستوديو والوكالة','5 team + API','5 أعضاء فريق + وصول API',499000,5399000,'IQD',3,500,5,true,false,false,
                    '{"prioritySearch":true,"hideAds":true,"apiAccess":true,"customBranding":true,"teamCollab":true,"advancedAnalytics":true,"customDomain":false,"dedicatedSupport":false,"sla":false,"whiteLabel":false}'],
                ['enterprise','Enterprise','الشركات والمؤسسات','SLA + white label','SLA + White Label',0,0,'IQD',4,null,null,true,false,true,
                    '{"prioritySearch":true,"hideAds":true,"customDomain":true,"apiAccess":true,"customBranding":true,"dedicatedSupport":true,"sla":true,"teamCollab":true,"whiteLabel":true,"advancedAnalytics":true}'],
            ];
            for (const p of defaults) {
                await query(`INSERT INTO subscription_plans
                    (code,name_en,name_ar,description_en,description_ar,
                     price_monthly,price_yearly,currency,sort_order,max_offers,max_team,
                     is_active,is_popular,is_enterprise,features)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
                    ON CONFLICT (code) DO NOTHING`, p);
            }
            result.auto_seeded = true;
            result.subscription_plans = (await query(`
                SELECT id, code, name_ar, name_en, price_monthly::text, price_yearly::text,
                       is_active, is_popular, is_enterprise, sort_order
                FROM subscription_plans ORDER BY sort_order
            `)).rows.map(r => ({ ...r, id: r.id.slice(0, 8) + '…' }));
        } catch (e2: any) {
            result.seed_error = e2.message;
        }
    }

    try {
        result.theme_settings = (await query(`
            SELECT setting_key, left(setting_value, 30) as setting_value_snippet
            FROM app_settings
            WHERE setting_key LIKE 'eff_%' OR setting_key LIKE 'theme_%' OR setting_key LIKE 'nav_%'
            ORDER BY setting_key
        `)).rows;
    } catch (e: any) {
        result.theme_settings_error = e.message;
    }

    return NextResponse.json({ ok: true, ...result });
}
