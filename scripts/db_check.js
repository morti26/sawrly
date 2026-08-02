const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL saknas i .env');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log('✅ Ansluten till DB\n');

  try {
    // 1. Kolla din användare (mon24@live.se)
    console.log('=== 1. ADMIN-ANVÄNDARE ===');
    const u = await pool.query(`
      SELECT id, email, role, name, frozen_until, created_at
      FROM users WHERE email IN ($1, $2, $3)`,
      ['mon24@live.se', 'admin@sawrly.com', 'admin@admin.com']
    );
    if (u.rows.length === 0) {
      console.log('❌ Hittade INTE admin-användaren. Letar efter alla admin/moderator:');
      const all = await pool.query(`SELECT email, role, name FROM users WHERE role IN ('admin','moderator') LIMIT 5`);
      console.log(all.rows.length === 0 ? '   Inga admins alls!' : all.rows);
    } else {
      for (const row of u.rows) {
        console.log(`   id=${row.id.slice(0,8)}…  email=${row.email}  role=${row.role}  name=${row.name}  frozen=${row.frozen_until ?? 'nej'}`);
      }
    }

    // 2. Finns subscription_plans-tabellen?
    console.log('\n=== 2. TABELLER ===');
    const tabs = await pool.query(`
      SELECT table_name FROM information_schema.tables
       WHERE table_schema='public'
         AND table_name IN ('subscription_plans','user_subscriptions','app_settings','users','payments','offers')
       ORDER BY table_name`);
    const found = new Set(tabs.rows.map(r => r.table_name));
    ['subscription_plans','user_subscriptions','app_settings','users'].forEach(t => {
      console.log(`   ${found.has(t) ? '✅' : '❌'} ${t}`);
    });

    // 3. Planer i DB
    console.log('\n=== 3. PRENUMERATIONS-PLANER I DB ===');
    try {
      const p = await pool.query(`SELECT id, code, name_ar, name_en, price_monthly, price_yearly,
        is_active, is_popular, is_enterprise, sort_order, max_offers, max_team, features
        FROM subscription_plans ORDER BY sort_order, created_at`);
      if (p.rows.length === 0) {
        console.log('   ❌ Inga planer i DB (ska finnas 4 standards).');
      } else {
        for (const r of p.rows) {
          const features = (r.features && typeof r.features === 'object')
            ? Object.entries(r.features).filter(([,v])=>v).map(([k])=>k).length
            : 0;
          const badge = [r.is_active?'A':'-', r.is_popular?'★':'-', r.is_enterprise?'E':'-'].join('');
          console.log(`   [${badge}] #${r.sort_order} ${r.code.padEnd(10)} ${r.name_ar.padEnd(20)} ${String(r.price_monthly).padStart(10)} / ${String(r.price_yearly).padStart(10)} ${r.currency ?? '?'}   max_offers=${r.max_offers ?? '∞'} team=${r.max_team ?? '∞'} features=${features}/10`);
        }
      }
    } catch (e) {
      console.log('   ❌ Fel vid läsning av plans (tabb saknas?):', e.message);
    }

    // 4. Finns APP_SETTING_KEYS för effekter?
    console.log('\n=== 4. APP_SETTINGS (tema effekter) ===');
    try {
      const ap = await pool.query(`SELECT setting_key, left(setting_value, 24) as val FROM app_settings
        WHERE setting_key LIKE 'eff_%' OR setting_key LIKE 'nav_%' OR setting_key LIKE 'theme_%'
        ORDER BY setting_key`);
      if (ap.rows.length === 0) {
        console.log('   (inga app_settings med tema/eff/nav ännu – förväntat om ej sparat)');
      } else {
        console.log(`   ${ap.rows.length} nycklar funna:`);
        ap.rows.slice(0, 12).forEach(r => console.log(`     ${r.setting_key.padEnd(28)} = ${r.val}`));
        if (ap.rows.length > 12) console.log(`     ... +${ap.rows.length - 12} till`);
      }
    } catch (e) {
      console.log('   app_settings-tabell saknas?', e.message);
    }

    console.log('\n✅ Klar.');
  } catch (e) {
    console.log('❌ FEL:', e.message);
    console.log(e.stack);
  } finally {
    await pool.end();
  }
}
main();
