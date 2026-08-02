/**
 * Verktyg för att FATT VARFÖR 401 inträffar.
 *
 * ANVÄND SÅ HÄR:
 *   1. I admin i Chrome → tryck F12 → fliken Console → klistra in:
 *        copy(JSON.stringify({
 *          token: localStorage.getItem("token"),
 *          user: JSON.parse(localStorage.getItem("user") || "{}"),
 *          cookies: document.cookie
 *        }, null, 2))
 *      → Sparar till urklipp. Klistra in i: /tmp/admin_auth.json  (spara som fil)
 *
 *   2. KÖR I TERMINALEN:
 *        cd /mnt/.../sawrly.com/public
 *        sudo -u morti HOME=/home/morti node scripts/debug_auth_401.js /tmp/admin_auth.json
 *
 * ELLER med token direkt:
 *        sudo -u morti HOME=/home/morti node scripts/debug_auth_401.js --token=EYJHBCWCIOi...
 */
require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const ADMIN_PANEL_ROLES = ['admin', 'moderator'];

function section(title) {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  ' + title);
  console.log('══════════════════════════════════════════════════');
}

function ok(msg) { console.log('  ✅', msg); }
function warn(msg) { console.log('  ⚠️ ', msg); }
function fail(msg) { console.log('  ❌', msg); process.exitCode = 1; }

(async () => {
  // =========================== STEG 1: Läs input ===========================
  section('STEG 1: Läs input-token');
  let token = null; let browserUser = null; let browserCookies = null; let source = '';

  const argFile = process.argv.find(a => !a.startsWith('-') && a.endsWith('.json'));
  const argToken = (process.argv.find(a => a.startsWith('--token=')) || '').slice(8);

  if (argFile && fs.existsSync(argFile)) {
    const raw = JSON.parse(fs.readFileSync(argFile, 'utf8'));
    token = raw.token; browserUser = raw.user; browserCookies = raw.cookies; source = `fil ${argFile}`;
  } else if (argToken) {
    token = argToken; source = `--token= CLI flagga`;
  }

  if (!token) {
    fail('Ingen token hittades. Se instruktioner högst upp i filen (copy JSON från webbläsaren).');
    console.log('\nFörsök igen enligt instruktionerna. Avslutar.');
    return;
  }
  ok(`Token inläst från ${source} (längd=${token.length}).`);

  // =========================== STEG 2: Dekodera JWT utan signatur ===========================
  section('STEG 2: Dekodera JWT-HEAD + PAYLOAD (utan verifiering)');
  let headB64 = null, payB64 = null, head = null, pay = null, jwtPartsCount = 0;
  try {
    const parts = token.split('.'); jwtPartsCount = parts.length;
    if (parts.length === 3) {
      headB64 = parts[0]; payB64 = parts[1];
      const fromB64 = s => JSON.parse(Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('utf8'));
      head = fromB64(headB64); pay = fromB64(payB64);
      console.log('  Header  =', JSON.stringify(head));
      console.log('  Payload =', JSON.stringify({ ...pay, userId: String(pay.userId||'').slice(0,12)+'…' }, null, 2).replace(/\n/g,'\n    '));
      ok(`JWT har rätt format (3 delar). Algoritm: ${head?.alg ?? '?'}.`);

      const now = Math.floor(Date.now()/1000);
      if (pay?.exp) {
        const left = pay.exp - now;
        if (left <= 0) fail(`TOKEN ÄR UTGÅNGEN för ${-left}s sedan (exp=${new Date(pay.exp*1000).toISOString()}).`);
        else ok(`Token går ut om ${left}s (${Math.round(left/60)} min) — dvs ${new Date(pay.exp*1000).toISOString()}.`);
      } else warn('Token saknar utgångsdatum.');
      if (pay?.iat) {
        const age = now - pay.iat;
        ok(`Utfärdad för ${age}s sedan (${Math.round(age/60)} min).`);
      }
    } else {
      fail(`JWT har FEL format: ${parts.length} delar (ska vara 3). Klippte du token fel?`);
    }
  } catch (e) {
    fail(`Gick inte att avkoda JWT alls: ${e.message}`);
    console.log('  Är token en giltig JWT (börjar alltid med eyJhbGciOi...) ?');
  }

  // =========================== STEG 3: Verifiera signaturen mot JWT_SECRET ===========================
  section('STEG 3: Verifiera signaturen mot JWT_SECRET i .env');
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    fail('JWT_SECRET saknas i .env → kan INTE verifiera någonting.');
  } else {
    ok(`JWT_SECRET finns i .env (${secret.length} chars).`);
    let verified = null;
    try {
      verified = jwt.verify(token, secret, { algorithms: ['HS256', 'HS384', 'HS512', 'RS256'] });
      ok(`✅ JWT SIGNATUR ÄR GILTIG! (matchar JWT_SECRET)`);
      console.log('  → userId:', String(verified.userId ?? '').slice(0,16), '…');
      console.log('  → email :', verified.email);
      console.log('  → role  :', verified.role);
      console.log('  → superadmin:', verified.superadmin);
    } catch (e) {
      fail(`JWT VERIFIERING MISSLYCKADES: ${e.message}`);
      console.log('  → Detta betyder antingen:');
      console.log('    1. Token signerades MED ANNAN SECRET än vad JWT_SECRET i .env är just nu → den mest troliga!');
      console.log('    2. Token var korrumperad/ÄNDRAD.');
      console.log('    3. Algoritm mismatch (den accepterar vi: HS256/HS384/HS512/RS256).');
      console.log('  → FIX: Logga UT på admin → IN på nytt. Då genereras en NY token med nuvarande SECRET.');
    }

    // =========================== STEG 4: Jämför med users DB-rad ===========================
    section('STEG 4: Jämför JWT med ACTUELL users-rad I DB');
    try {
      if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL saknas i .env');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const emailOrId = verified?.email || pay?.email || verified?.userId || pay?.userId;
      if (!emailOrId) { console.log('  (hoppar över DB — inget email/userId i JWT.)'); }
      else {
        const q = `SELECT id, email, role, name,
                   CASE WHEN frozen_until > NOW() THEN 'JA ('||frozen_until::text||')' ELSE 'nej' END as avstängd,
                   subscription_plan, subscription_expires_at
            FROM users
           WHERE lower(trim(email)) = lower(trim($1)) OR id = $2::uuid
           LIMIT 1`;
        const { rows } = await pool.query(q, [ String(emailOrId), String(emailOrId) ]);
        if (!rows.length) {
          fail(`Användare finns INTE i DB för email/id="${emailOrId}". Borttagen?`);
        } else {
          const u = rows[0];
          console.log('  ▶ DB-rad:');
          console.log('    id            :', String(u.id).slice(0,16) + '…');
          console.log('    email         :', u.email);
          console.log('    role (DB)     :', u.role);
          console.log('    role (TOKEN)  :', verified?.role || pay?.role || '(saknas!)');
          console.log('    namn          :', u.name);
          console.log('    avstängd      :', u.avstängd);
          console.log('    sub.plan      :', u.subscription_plan ?? '-');
          console.log('    sub.utgår     :', u.subscription_expires_at ?? '-');

          if (verified && verified.role !== u.role) {
            fail(`ROLLEFEL! DB säger role=${u.role} men TOKEN innehåller role=${verified.role}. Detta är den ALLRA vanligaste orsaken till 401.`);
            console.log('  ⚠️  Varför inträffar det? Du eller någon ändrade role i DB EFTER att du loggade in.');
            console.log('  👉 FIX: Logga UT helt (lämna sidan) och logga IN på nytt.');
          } else ok(`Rollen i DB (${u.role}) matchar rollen i token. Bra!`);

          // =========================== STEG 5: Simulera requireRole ===========================
          section('STEG 5: Simulera requireRole(req, ADMIN_PANEL_ROLES) EXAKT som route.ts gör');
          if (!verified) console.log('  (går ej simulera pga ogiltig verifiering i steg 3)');
          else {
            const allowed = ADMIN_PANEL_ROLES.includes(verified.role);
            if (allowed) {
              ok(`✅ requireRole GODKÄNDE! roll=${verified.role} ingår i ${JSON.stringify(ADMIN_PANEL_ROLES)}.`);
              ok(`   DENNA TOKEN SKULL BÖRJA GÅ ATT ANVÄNDA MOT /api/admin/subscription-plans.`);
              ok(`   Om du fortfarande får 401 i webbläsaren — FEL ÄR DÄRFÖR ATT .next BYGGET INTE HAR DE NYA FILERNA!`);
              console.log('');
              console.log('   ╔══════════════════════════════════════════════════════════════════════╗');
              console.log('   ║  >>> KÖR DÄRFÖR NU IGEN: npm run build OCH sedan restart service <<< ║');
              console.log('   ╚══════════════════════════════════════════════════════════════════════╝');
            } else {
              fail(`requireRole NEKADE! roll=${verified.role} ingår EJ i ${JSON.stringify(ADMIN_PANEL_ROLES)}.`);
              console.log('  👉 FIX: I DB kör: UPDATE users SET role = \'admin\' WHERE email=\'' + (verified.email) + '\'; Sedan logga ut/in.');
            }
          }

          // Kolla om cookie admin_token verkligen skickades med (för om det är det sidan använder istället)
          section('STEG 6: Webbläsarens localStorage vs cookie (ifall ena saknas)');
          if (browserUser) {
            console.log('  localStorage "user" :', JSON.stringify(browserUser));
            const lsRole = browserUser.role;
            const tokRole = verified?.role || pay?.role;
            if (lsRole && tokRole && lsRole !== tokRole) warn(`Rollen i localStorage.user (${lsRole}) ≠ rollen i JWT (${tokRole}). Peta på localStorage.setItem("user", korrekt).`);
            else ok(`localStorage "user" matchar token roll.`);
          } else {
            console.log('  (Saknas "user" i input-JSON. lägg gärna till det i nästa körning.)');
          }
          if (browserCookies != null) {
            const m = browserCookies.match(/admin_token=([^;]+)/)?.[1]
                || browserCookies.match(/(?:^|[; ])token=([^;]+)/)?.[1];
            if (m) {
              ok(`Hittade ${m.startsWith(token.slice(0,16)) ? 'SAMMA' : 'ANNAN'} token i cookie=admin_token.`);
              if (!m.startsWith(token.slice(0,16))) warn('Det betyder localStorage ≠ cookie → den ena är utgången. Bäst: logga om.');
            } else warn('Ingen admin_token cookie hittades i document.cookie (förväntat om httpOnly).');
          }
        }
      }
      await pool.end();
    } catch (e) {
      fail(`DB-fel: ${e.message}`);
    }
  }

  section('SAMMANFATTNING & NÄSTA STEG');
  console.log('');
})().catch(e => { console.error('\nOVÄNTAT FEL:', e); process.exit(1); });
