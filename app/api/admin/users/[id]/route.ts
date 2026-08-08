import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AppRole, hashPassword, requireRole, requireSuperAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/logic';

const ALLOWED_UPDATE_ROLES: AppRole[] = ['creator', 'client', 'admin', 'moderator'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = requireRole(req, ['admin']);
        const { error, status } = auth;
        if (error) {
            return NextResponse.json({ error }, { status: status || 401 });
        }

        const { name, phone, password, freezeDays, clearFreeze, role } = await req.json();

        const currentRes = await query(
            'SELECT id, name, email, role, phone, frozen_until, created_at FROM users WHERE id = $1',
            [id]
        );
        if (currentRes.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentUser = currentRes.rows[0];
        const nextName = typeof name === 'string' && name.trim().length > 0
            ? name.trim()
            : currentUser.name;
        if (!nextName) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const nextPhone = phone !== undefined
            ? ((typeof phone === 'string' && phone.trim().length > 0) ? phone.trim() : null)
            : currentUser.phone;

        let nextRole = currentUser.role as AppRole;
        const requestedRole =
            typeof role === 'string' ? role.trim().toLowerCase() as AppRole : null;
        const hasRoleChange = requestedRole !== null && requestedRole !== currentUser.role;
        if (requestedRole !== null) {
            if (!ALLOWED_UPDATE_ROLES.includes(requestedRole)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }
            const superAdminAuth = requireSuperAdmin(req);
            if (superAdminAuth.error) {
                return NextResponse.json(
                    { error: 'Only super admin can change admin permissions' },
                    { status: superAdminAuth.status || 403 }
                );
            }
            nextRole = requestedRole;
        }

        const hasFreezeChange = clearFreeze === true || freezeDays !== undefined;
        if (hasFreezeChange && nextRole !== 'creator') {
            return NextResponse.json({ error: 'Freeze is only available for creators' }, { status: 400 });
        }

        let nextFrozenUntil = currentUser.frozen_until;
        let normalizedFreezeDays: number | null = null;
        if (clearFreeze === true) {
            nextFrozenUntil = null;
        } else if (freezeDays !== undefined) {
            normalizedFreezeDays = Number(freezeDays);
            if (!Number.isInteger(normalizedFreezeDays) || normalizedFreezeDays <= 0 || normalizedFreezeDays > 365) {
                return NextResponse.json({ error: 'freezeDays must be an integer between 1 and 365' }, { status: 400 });
            }

            const frozenUntil = new Date();
            frozenUntil.setUTCDate(frozenUntil.getUTCDate() + normalizedFreezeDays);
            nextFrozenUntil = frozenUntil.toISOString();
        }

        const nextPassword = typeof password === 'string' ? password.trim() : '';
        const res = nextPassword
            ? await query(
                `
                        UPDATE users
                        SET name = $1, phone = $2, frozen_until = $3, password_hash = $4, role = $5
                        WHERE id = $6
                    RETURNING id, name, email, role, phone, created_at, frozen_until,
                        CASE
                            WHEN role = 'creator' AND frozen_until IS NOT NULL AND frozen_until > NOW() THEN TRUE
                            ELSE FALSE
                        END AS is_frozen
                `,
                    [nextName, nextPhone, nextFrozenUntil, await hashPassword(nextPassword), nextRole, id]
            )
            : await query(
                `
                    UPDATE users
                        SET name = $1, phone = $2, frozen_until = $3, role = $4
                        WHERE id = $5
                    RETURNING id, name, email, role, phone, created_at, frozen_until,
                        CASE
                            WHEN role = 'creator' AND frozen_until IS NOT NULL AND frozen_until > NOW() THEN TRUE
                            ELSE FALSE
                        END AS is_frozen
                `,
                    [nextName, nextPhone, nextFrozenUntil, nextRole, id]
            );

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (hasFreezeChange && auth.user && currentUser.role === 'creator') {
            if (clearFreeze === true) {
                await logAudit('user', id, 'creator_unfrozen', auth.user.userId, {});
            } else if (normalizedFreezeDays) {
                await logAudit('user', id, 'creator_frozen', auth.user.userId, {
                    freezeDays: normalizedFreezeDays,
                    frozenUntil: nextFrozenUntil,
                });
            }
        }

        if (hasRoleChange && auth.user) {
            await logAudit('user', id, 'user_role_changed', auth.user.userId, {
                previousRole: currentUser.role,
                nextRole,
            });
        }

        return NextResponse.json(res.rows[0]);
    } catch (e) {
        console.error("Update User Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error, status } = requireRole(req, ['admin']);
        if (error) {
            return NextResponse.json({ error }, { status: status || 401 });
        }

        const res = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (e) {
        console.error("Delete User Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
