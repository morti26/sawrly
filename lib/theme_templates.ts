import { query } from '@/lib/db';

const THEMES_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS theme_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        preset_tag TEXT,
        is_preset BOOLEAN NOT NULL DEFAULT FALSE,
        primary_preview TEXT,
        background_preview TEXT,
        colors_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        nav_icons_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        effects_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`;

let themesTableEnsured = false;

export type ThemeTemplateRecord = {
    id: string;
    name: string;
    description: string | null;
    preset_tag: string | null;
    is_preset: boolean;
    primary_preview: string | null;
    background_preview: string | null;
    colors_json: Record<string, unknown>;
    nav_icons_json: Record<string, unknown>;
    effects_json: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
};

export type ThemeTemplatePayload = {
    colors: Record<string, unknown>;
    navIcons: Record<string, unknown>;
    effects: Record<string, unknown>;
};

export async function ensureThemeTemplatesTable(): Promise<void> {
    if (themesTableEnsured) {
        return;
    }

    try {
        await query('SELECT 1 FROM theme_templates LIMIT 1');
        themesTableEnsured = true;
        return;
    } catch (error: any) {
        if (error?.code !== '42P01') {
            throw error;
        }
    }

    await query(THEMES_TABLE_SQL);
    themesTableEnsured = true;
}

function _rowToTemplate(row: any): ThemeTemplateRecord {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? null,
        preset_tag: row.preset_tag ?? null,
        is_preset: !!row.is_preset,
        primary_preview: row.primary_preview ?? null,
        background_preview: row.background_preview ?? null,
        colors_json: row.colors_json ?? {},
        nav_icons_json: row.nav_icons_json ?? {},
        effects_json: row.effects_json ?? {},
        created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
    };
}

export async function listThemeTemplates(): Promise<ThemeTemplateRecord[]> {
    await ensureThemeTemplatesTable();
    const res = await query(
        'SELECT * FROM theme_templates ORDER BY is_preset DESC, updated_at DESC'
    );
    return res.rows.map(_rowToTemplate);
}

export async function getThemeTemplateById(id: string): Promise<ThemeTemplateRecord | null> {
    await ensureThemeTemplatesTable();
    const res = await query(
        'SELECT * FROM theme_templates WHERE id = $1 LIMIT 1',
        [id]
    );
    return res.rows[0] ? _rowToTemplate(res.rows[0]) : null;
}

export async function saveThemeTemplate(input: {
    id?: string;
    name: string;
    description?: string | null;
    presetTag?: string | null;
    isPreset?: boolean;
    primaryPreview?: string | null;
    backgroundPreview?: string | null;
    payload: ThemeTemplatePayload;
}): Promise<ThemeTemplateRecord> {
    await ensureThemeTemplatesTable();
    const id = input.id ?? `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const res = await query(
        `
        INSERT INTO theme_templates (
            id, name, description, preset_tag, is_preset,
            primary_preview, background_preview,
            colors_json, nav_icons_json, effects_json,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            preset_tag = EXCLUDED.preset_tag,
            is_preset = EXCLUDED.is_preset,
            primary_preview = EXCLUDED.primary_preview,
            background_preview = EXCLUDED.background_preview,
            colors_json = EXCLUDED.colors_json,
            nav_icons_json = EXCLUDED.nav_icons_json,
            effects_json = EXCLUDED.effects_json,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [
            id,
            input.name.trim(),
            input.description ?? null,
            input.presetTag ?? null,
            input.isPreset === true,
            input.primaryPreview ?? null,
            input.backgroundPreview ?? null,
            JSON.stringify(input.payload.colors ?? {}),
            JSON.stringify(input.payload.navIcons ?? {}),
            JSON.stringify(input.payload.effects ?? {}),
        ]
    );
    return _rowToTemplate(res.rows[0]);
}

export async function deleteThemeTemplate(id: string): Promise<boolean> {
    await ensureThemeTemplatesTable();
    const res = await query(
        'DELETE FROM theme_templates WHERE id = $1 AND is_preset = FALSE RETURNING id',
        [id]
    );
    return res.rowCount != null && res.rowCount > 0;
}
