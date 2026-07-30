import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const iconKeys = [
  'super_admin_icon_url',
  'female_profile_icon_url',
  'male_profile_icon_url',
  'limited_monthly_subscription_icon_url',
  'unlimited_monthly_subscription_icon_url',
  'unlimited_yearly_subscription_icon_url',
  'home_logo_url',
];

async function main() {
  const { rows: settings } = await pool.query(
    `SELECT setting_key AS key, setting_value AS value, updated_at FROM app_settings WHERE setting_key = ANY($1) ORDER BY setting_key`,
    [iconKeys],
  );
  console.log('== APP_SETTINGS ICON KEYS ==');
  console.log(JSON.stringify(settings, null, 2));

  const { rows: users } = await pool.query(
    `SELECT id, email, name, role, is_active, is_superadmin, creator_level_key, subscription_plan, subscription_expires_at, superadmin_badge_label, superadmin_badge_icon_url
     FROM users WHERE email ILIKE $1 LIMIT 5`,
    ['%mon24%'],
  );
  console.log('\n== USERS WITH mon24 ==');
  console.log(JSON.stringify(users, null, 2));

  const u = users[0];
  if (u) {
    const { rows: raw } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [u.id],
    );
    console.log('\n== RAW USER ROW mon24 ==');
    console.log(JSON.stringify(raw[0], null, 2));
  }

  try {
    const pub = await fetch('http://127.0.0.1:3001/api/config/public').then(r => r.json());
    console.log('\n== LIVE /api/config/public ==');
    console.log(JSON.stringify(pub, null, 2));
  } catch (e) {
    console.log('\n== LIVE /api/config/public FETCH FAILED ==');
    console.error(e);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
