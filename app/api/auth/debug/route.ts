import { NextRequest, NextResponse } from 'next/server';
import { debugAuth, ADMIN_PANEL_ROLES } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function fmtTime(sec: number | undefined | null): string {
    if (!sec) return '-';
    const d = new Date(sec * 1000);
    const now = Date.now();
    const diff = (sec * 1000) - now;
    const suffix = diff < 0
        ? ` (för ${Math.round(-diff / 1000)}s sedan)`
        : ` (om ${Math.round(diff / 1000)}s)`;
    return d.toISOString() + suffix;
}

export async function GET(req: NextRequest) {
    const debug = debugAuth(req);
    const adminCheck = debugAuth(req, ADMIN_PANEL_ROLES);
    const out: any = {
        ok: !!debug.tokenValid,
        admin_panel_access: adminCheck.allow === true ? 'JA ✅' : 'NEJ ❌',
        admin_panel_roles_required: ADMIN_PANEL_ROLES,
        auth: {
            hittad_i: debug.foundIn === 'bearer' ? 'Authorization-header (Bearer)'
                : debug.foundIn === 'cookie' ? 'Cookie (admin_token/token/jwt)'
                : 'INGENSTANS ❌',
            finns_token: debug.tokenPresent ? 'JA' : 'NEJ',
            token_verifierad: debug.tokenValid ? 'JA ✅' : 'NEJ ❌',
        },
        token_payload: debug.tokenParsed ? {
            userId: (debug.tokenParsed as any).userId ? `${String((debug.tokenParsed as any).userId).slice(0, 10)}…` : '-',
            email: (debug.tokenParsed as any).email ?? '-',
            role: (debug.tokenParsed as any).role ?? '-',
            name: (debug.tokenParsed as any).name ?? '-',
            utfärdat: fmtTime((debug.tokenParsed as any).iat),
            går_ut: fmtTime((debug.tokenParsed as any).exp),
        } : null,
        felorsak: debug.errorReason ?? null,
        rad_till_db: null,
    };
    if (debug.tokenValid && (debug.tokenParsed as any)?.userId) {
        try {
            const uid = (debug.tokenParsed as any).userId;
            const row = await query(`
                SELECT id, email, role, name, phone,
                       CASE WHEN frozen_until > NOW() THEN true ELSE false END as frozen,
                       frozen_until, created_at, updated_at
                FROM users WHERE id = $1 LIMIT 1`, [uid]);
            if (row.rows[0]) {
                const r = row.rows[0];
                out.rad_till_db = {
                    id: String(r.id).slice(0, 10) + '…',
                    email: r.email,
                    role_i_db: r.role,
                    namn: r.name,
                    telefon: r.phone ?? '-',
                    avstängd: r.frozen ? `JA (tills ${r.frozen_until})` : 'NEJ',
                    skapad: r.created_at ? new Date(r.created_at).toISOString() : '-',
                    uppdaterad: r.updated_at ? new Date(r.updated_at).toISOString() : '-',
                };
                if (debug.role !== r.role) {
                    out.varning = `⚠️ Rollen i TOKEN (${debug.role}) STÄMMER INTE med rollen i DB (${r.role}). Detta är vanligaste orsaken till 401/403! Kör UPDATE users SET role='admin' WHERE email='${r.email}' och logga in på nytt.`;
                }
            } else {
                out.rad_till_db = `❌ Hittade INTE användare id=${uid.slice(0,10)}… i DB. Borttagen?`;
            }
        } catch (e: any) {
            out.rad_till_db = `DB-fel: ${e.message}`;
        }
    }
    out.förslag = [];
    if (!debug.tokenPresent) out.förslag.push('🔑 Logga UT på admin (den röda knappen "تسجيل الخروج") och logga IN på nytt.');
    else if (!debug.tokenValid)  out.förslag.push('⏱️ Token är OGILTIG/UTGÅNGEN. Logga UT och IN på nytt. Om felet kvarstår – kontrollera JWT_SECRET är samma i .env som när du loggade in.');
    else if (debug.role && !ADMIN_PANEL_ROLES.includes(debug.role)) out.förslag.push(`🚫 Rollen är ${debug.role}. Behöver vara ${ADMIN_PANEL_ROLES.join(' eller ')}. Kör: UPDATE users SET role='admin' WHERE email='${(debug.tokenParsed as any).email ?? ''}'`);
    else if (debug.tokenValid && out.rad_till_db && typeof out.rad_till_db === 'object' && out.rad_till_db.role_i_db !== debug.role) out.förslag.push('🔁 DB-roll ≠ token-roll. Logga UT → IN så att nytt token genereras.');
    if (out.förslag.length === 0 && adminCheck.allow) out.förslag.push('✅ Inget fel hittat. Åtkomst till admin-panel ska fungera! Om du fortfarande ser 401 → håll nere SHIFT + klicka på ladda om i Chrome (rensar cache).');
    out.hur_man_kontrollerar = {
        '1. I webbläsaren': 'Gå till /admin → klicka på تسجيل الخروج → logga in på nytt.',
        '2. I terminalen (journal)': 'sudo journalctl -u sawrly.service -n 30 --no-pager | grep requireRole',
        '3. I terminalen (DB-roll)': `psql ... -c "SELECT email, role FROM users WHERE email='${(debug.tokenParsed as any)?.email ?? 'mon24@live.se'}';"`,
    };
    return NextResponse.json(out, { status: out.ok ? 200 : 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
}
