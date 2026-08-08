import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import {
    deleteThemeTemplate,
    listThemeTemplates,
    saveThemeTemplate,
} from '@/lib/theme_templates';

function _isValidHex(v: unknown): v is string {
    return typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const list = await listThemeTemplates();
        return NextResponse.json({
            ok: true,
            templates: list.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                presetTag: t.preset_tag,
                isPreset: t.is_preset,
                primaryPreview: t.primary_preview,
                backgroundPreview: t.background_preview,
                createdAt: t.created_at.toISOString(),
                updatedAt: t.updated_at.toISOString(),
                colors: t.colors_json,
                navIcons: t.nav_icons_json,
                effects: t.effects_json,
            })),
        });
    } catch (error) {
        console.error('Admin theme-templates GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const body = (await req.json()) as {
            id?: string;
            name?: string;
            description?: string | null;
            presetTag?: string | null;
            isPreset?: boolean;
            colors?: Record<string, unknown>;
            navIcons?: Record<string, unknown>;
            effects?: Record<string, unknown>;
        };
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (name.length < 1 || name.length > 80) {
            return NextResponse.json(
                { error: 'Name must be 1-80 characters' },
                { status: 400 }
            );
        }
        const colors = body.colors && typeof body.colors === 'object' ? body.colors : {};
        const navIcons = body.navIcons && typeof body.navIcons === 'object' ? body.navIcons : {};
        const effects = body.effects && typeof body.effects === 'object' ? body.effects : {};
        const primaryPreviewRaw = (colors as any).primary;
        const backgroundPreviewRaw = (colors as any).background;
        const saved = await saveThemeTemplate({
            id: body.id,
            name,
            description: typeof body.description === 'string' ? body.description : null,
            presetTag: typeof body.presetTag === 'string' ? body.presetTag : null,
            isPreset: body.isPreset === true,
            primaryPreview: _isValidHex(primaryPreviewRaw) ? primaryPreviewRaw : null,
            backgroundPreview: _isValidHex(backgroundPreviewRaw) ? backgroundPreviewRaw : null,
            payload: { colors, navIcons, effects },
        });
        return NextResponse.json({
            ok: true,
            template: {
                id: saved.id,
                name: saved.name,
                description: saved.description,
                presetTag: saved.preset_tag,
                isPreset: saved.is_preset,
                primaryPreview: saved.primary_preview,
                backgroundPreview: saved.background_preview,
                createdAt: saved.created_at.toISOString(),
                updatedAt: saved.updated_at.toISOString(),
                colors: saved.colors_json,
                navIcons: saved.nav_icons_json,
                effects: saved.effects_json,
            },
        });
    } catch (error) {
        console.error('Admin theme-templates POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const authCheck = requireRole(req, ADMIN_PANEL_ROLES);
    if (authCheck.error || !authCheck.user) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id || typeof id !== 'string' || id.trim().length < 1) {
            return NextResponse.json(
                { error: 'Missing or invalid template id (use ?id=...)' },
                { status: 400 }
            );
        }
        const ok = await deleteThemeTemplate(id);
        if (!ok) {
            return NextResponse.json(
                { error: 'Template not found or is a protected preset template' },
                { status: 404 }
            );
        }
        return NextResponse.json({ ok: true, deleted: id });
    } catch (error) {
        console.error('Admin theme-templates DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
