import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { requireRole, ADMIN_PANEL_ROLES, type TokenPayload } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

type TaskType = "BUG" | "FEATURE" | "TODO" | "REFACTOR" | "DISCUSSION";
type TaskPriority = "LOW" | "MED" | "HIGH" | "CRIT";
type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

const TASK_TYPES: readonly TaskType[] = ["BUG", "FEATURE", "TODO", "REFACTOR", "DISCUSSION"] as const;
const TASK_PRIORITIES: readonly TaskPriority[] = ["LOW", "MED", "HIGH", "CRIT"] as const;
const TASK_STATUSES: readonly TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"] as const;

type TaskAdmin = {
    id: string;
    code: string;
    title_ar: string;
    title_en: string | null;
    description_ar: string | null;
    description_en: string | null;
    type: TaskType;
    priority: TaskPriority;
    status: TaskStatus;
    tags: string[] | null;
    attachments: string[] | null;
    created_by_id: string;
    created_by_email?: string | null;
    created_by_name?: string | null;
    assigned_to_id: string | null;
    assigned_to_email?: string | null;
    assigned_to_name?: string | null;
    comment_count?: number;
    created_at: string;
    updated_at: string;
};

type TaskCommentAdmin = {
    id: string;
    task_id: string;
    user_id: string;
    user_email?: string | null;
    user_name?: string | null;
    body: string;
    attachments: string[] | null;
    created_at: string;
    updated_at: string;
};

type TasksResponse = { tasks: TaskAdmin[]; users: {id:string;email:string;name:string|null;role:string}[] };

const SETUP_SQL = `
CREATE TYPE task_type AS ENUM ('BUG', 'FEATURE', 'TODO', 'REFACTOR', 'DISCUSSION');
CREATE TYPE task_priority AS ENUM ('LOW', 'MED', 'HIGH', 'CRIT');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED');

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT,
    description_en TEXT,
    type task_type NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MED',
    status task_status NOT NULL DEFAULT 'TODO',
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) <= 10000),
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);
`;

function num(n: unknown, fallback: number): number {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
}
function inList<T extends string>(v: unknown, allowed: readonly T[], fb: T): T {
    return (typeof v === "string" && (allowed as readonly string[]).includes(v)) ? (v as T) : fb;
}
function arrOrNull(v: unknown): string[] | null {
    if (Array.isArray(v)) return v.filter(x => typeof x === "string").map(x => String(x).slice(0,30)).slice(0,20);
    if (typeof v === "string" && v.length) return v.split(",").map(s => s.trim()).filter(Boolean).slice(0,20);
    return null;
}

function arrOrNullAttachments(v: unknown): string[] | null {
    if (Array.isArray(v)) return v.filter(x => typeof x === "string").map(x => String(x).slice(0,500)).slice(0,50);
    if (typeof v === "string" && v.length) return [v.slice(0,500)];
    return null;
}

function taskFromRow(r: any): TaskAdmin {
    return {
        id: String(r.id),
        code: String(r.code),
        title_ar: String(r.title_ar),
        title_en: r.title_en ? String(r.title_en) : null,
        description_ar: r.description_ar ? String(r.description_ar) : null,
        description_en: r.description_en ? String(r.description_en) : null,
        type: r.type as TaskType,
        priority: r.priority as TaskPriority,
        status: r.status as TaskStatus,
        tags: Array.isArray(r.tags) ? (r.tags as any[]) : null,
        attachments: Array.isArray(r.attachments) ? (r.attachments as any[]) : null,
        created_by_id: String(r.created_by_id),
        created_by_email: r.creator_email ?? null,
        created_by_name: r.creator_name ?? null,
        assigned_to_id: r.assigned_to_id ? String(r.assigned_to_id) : null,
        assigned_to_email: r.assigned_email ?? null,
        assigned_to_name: r.assigned_name ?? null,
        comment_count: typeof r.comment_count_val === "number" ? Number(r.comment_count_val) : undefined,
        created_at: String(r.created_at),
        updated_at: String(r.updated_at),
    };
}

async function ensureTables() {
    try {
        await query(`DO $$ BEGIN
            CREATE TYPE task_type AS ENUM ('BUG', 'FEATURE', 'TODO', 'REFACTOR', 'DISCUSSION');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await query(`DO $$ BEGIN
            CREATE TYPE task_priority AS ENUM ('LOW', 'MED', 'HIGH', 'CRIT');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await query(`DO $$ BEGIN
            CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await query(SETUP_SQL.replace(/CREATE TYPE task_type[^;]+;\n/, "").replace(/CREATE TYPE task_priority[^;]+;\n/, "").replace(/CREATE TYPE task_status[^;]+;\n/, ""));
        // Add attachments column if tables exist but column missing (migration for existing)
        await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}'`);
        await query(`ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}'`);
    } catch {}
}

function debugAuthSummary(req: NextRequest, auth: any): any {
    const authHeader = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const user = auth?.user || null;
    return {
        method: req.method,
        path: new URL(req.url).pathname,
        auth_header: authHeader ? "(len=" + authHeader.length + ")" : "Saknas",
        admin_cookie: (req.headers.get("cookie")||"").indexOf("admin_token") !== -1,
        parsed_ok: user ? { role: user.role, email: user.email, uid: String(user.userId||"").slice(0,10) } : null,
        auth_error: auth?.error || null,
        auth_via: auth?.debug?.foundIn ?? null,
    };
}

/** GET /api/admin/tasks → lista med tasks + lista på admin-användare (för tilldelning) */
export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (!auth.user || auth.error) {
        console.log('[tasks GET 401]', JSON.stringify(debugAuthSummary(req, auth)));
        return NextResponse.json(
            { error: auth.error || "Unauthorized", debug: auth.debug ?? null },
            { status: auth.status ?? 401 }
        );
    }
    try {
        await ensureTables();
        const url = new URL(req.url);
        const taskId = url.searchParams.get("id");
        const action = url.searchParams.get("action");

        // ---- Endast kommentarer för en task? ----
        if (taskId && action === "comments") {
            const res = await query(`
                SELECT c.*, u.email AS u_email, u.name AS u_name
                FROM task_comments c
                LEFT JOIN users u ON u.id = c.user_id
                WHERE c.task_id = $1
                ORDER BY c.created_at ASC
            `, [taskId]);
            const comments: TaskCommentAdmin[] = res.rows.map(r => ({
                id: String(r.id), task_id: String(r.task_id), user_id: String(r.user_id),
                user_email: r.u_email ?? null, user_name: r.u_name ?? null,
                body: String(r.body),
                attachments: Array.isArray(r.attachments) ? (r.attachments as any[]) : null,
                created_at: String(r.created_at), updated_at: String(r.updated_at),
            }));
            return NextResponse.json({ comments });
        }

        // ---- En enda task med kommentarer ----
        if (taskId) {
            const tres = await query(`SELECT * FROM tasks WHERE id = $1`, [taskId]);
            if (!tres.rows.length) return NextResponse.json({ error: "Task not found" }, { status: 404 });
            const cres = await query(`
                SELECT c.*, u.email AS u_email, u.name AS u_name
                FROM task_comments c
                LEFT JOIN users u ON u.id = c.user_id
                WHERE c.task_id = $1
                ORDER BY c.created_at ASC
            `, [taskId]);
            const comments: TaskCommentAdmin[] = cres.rows.map(r => ({
                id: String(r.id), task_id: String(r.task_id), user_id: String(r.user_id),
                user_email: r.u_email ?? null, user_name: r.u_name ?? null,
                body: String(r.body),
                attachments: Array.isArray(r.attachments) ? (r.attachments as any[]) : null,
                created_at: String(r.created_at), updated_at: String(r.updated_at),
            }));
            return NextResponse.json({ task: taskFromRow(tres.rows[0]), comments });
        }

        // ---- Lista med filter ----
        const q = (url.searchParams.get("q") || "").toString().trim();
        const status = inList<TaskStatus | "ALL">(url.searchParams.get("status"), TASK_STATUSES as unknown as TaskStatus[], "ALL" as const);
        const type = inList<TaskType | "ALL">(url.searchParams.get("type"), TASK_TYPES as unknown as TaskType[], "ALL" as const);
        const priority = inList<TaskPriority | "ALL">(url.searchParams.get("priority"), TASK_PRIORITIES as unknown as TaskPriority[], "ALL" as const);
        const createdBy = url.searchParams.get("created_by") || "";
        const assignedTo = url.searchParams.get("assigned_to") || "";
        const mine = url.searchParams.get("mine") === "1";
        const limit = Math.max(1, Math.min(200, num(url.searchParams.get("limit"), 100)));

        const where: string[] = [];
        const params: any[] = [];
        let pn = 1;
        if (status !== "ALL") { where.push(`t.status = $${pn++}`); params.push(status); }
        if (type !== "ALL") { where.push(`t.type = $${pn++}`); params.push(type); }
        if (priority !== "ALL") { where.push(`t.priority = $${pn++}`); params.push(priority); }
        if (createdBy) { where.push(`t.created_by_id = $${pn++}`); params.push(createdBy); }
        if (assignedTo) { where.push(`t.assigned_to_id = $${pn++}`); params.push(assignedTo); }
        if (mine) { where.push(`(t.created_by_id = $${pn} OR t.assigned_to_id = $${pn++})`); params.push(auth.user.userId); }
        if (q.length) {
            where.push(`(to_tsvector('simple', coalesce(t.title_ar,'') || ' ' || coalesce(t.title_en,'') || ' ' || coalesce(t.description_ar,'') || ' ' || coalesce(t.description_en,'')) @@ plainto_tsquery('simple', $${pn++})
                OR coalesce(t.title_ar,'') ILIKE $${pn} OR coalesce(t.title_en,'') ILIKE $${pn++})`);
            params.push(q, `%${q}%`);
        }
        const whereSQL = where.length ? "WHERE " + where.join(" AND ") : "";

        const res = await query(`
            SELECT tasks_base.*,
                   creator.email AS creator_email, creator.name AS creator_name,
                   assigned.email AS assigned_email, assigned.name AS assigned_name,
                   comment_counts.cnt AS comment_count_val
            FROM tasks tasks_base
            LEFT JOIN users creator ON creator.id = tasks_base.created_by_id
            LEFT JOIN users assigned ON assigned.id = tasks_base.assigned_to_id
            LEFT JOIN (
                SELECT task_id, COUNT(*) AS cnt FROM task_comments GROUP BY task_id
            ) comment_counts ON comment_counts.task_id = tasks_base.id
            ${whereSQL.replace(/\bt\./g, "tasks_base.")}
            ORDER BY (CASE tasks_base.priority WHEN 'CRIT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MED' THEN 3 ELSE 4 END),
                     (CASE tasks_base.status WHEN 'DONE' THEN 2 ELSE 1 END),
                     tasks_base.created_at DESC
            LIMIT ${limit}
        `, params);
        const tasks: TaskAdmin[] = res.rows.map(taskFromRow);

        const ures = await query(`SELECT id, email, name, role FROM users WHERE role IN ('admin','moderator') ORDER BY name, email`, []);
        const users = ures.rows.map(r => ({ id: String(r.id), email: String(r.email), name: r.name ? String(r.name) : null, role: String(r.role) }));
        return NextResponse.json({ tasks, users } as TasksResponse);
    } catch (e: any) {
        console.error("[tasks GET error]", String(e?.message ?? e));
        return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
    }
}

/** PUT /api/admin/tasks – skapa/uppdatera task ELLER lägg till kommentar (action=comment) */
export async function PUT(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (!auth.user || auth.error) {
        console.log('[tasks PUT 401]', JSON.stringify(debugAuthSummary(req, auth)));
        return NextResponse.json(
            { error: auth.error || "Unauthorized", debug: auth.debug ?? null },
            { status: auth.status ?? 401 }
        );
    }
    try {
        await ensureTables();
        const url = new URL(req.url);
        let data: any = {};
        try { data = await req.json(); } catch {}
        const me = auth.user as TokenPayload;

        // ---- Lägg till kommentar ----
        if (data?.action === "comment") {
            const taskId = String(data.task_id || "").trim();
            const body = String(data.body || "").trim();
            const attachments = arrOrNullAttachments(data.attachments);
            if (!taskId || (!body && (!attachments || attachments.length === 0))) return NextResponse.json({ error: "task_id och body/attach krävs" }, { status: 400 });
            if (body.length > 10000) return NextResponse.json({ error: "body för långt (max 10000)" }, { status: 400 });
            const r = await query(`
                INSERT INTO task_comments (task_id, user_id, body, attachments) VALUES ($1,$2,$3,$4::TEXT[])
                RETURNING *
            `, [taskId, me.userId, body, attachments || []]);
            await query(`UPDATE tasks SET updated_at = NOW() WHERE id = $1`, [taskId]);
            return NextResponse.json({ ok: true, comment: {
                id: String(r.rows[0].id), task_id: String(r.rows[0].task_id), user_id: String(r.rows[0].user_id),
                user_email: me.email, user_name: (me as any).name ?? null,
                body: String(r.rows[0].body),
                attachments: Array.isArray(r.rows[0].attachments) ? (r.rows[0].attachments as any[]) : null,
                created_at: String(r.rows[0].created_at), updated_at: String(r.rows[0].updated_at),
            }});
        }

        // ---- Redigera kommentar ----
        if (data?.action === "edit_comment") {
            const cid = String(data.comment_id || "").trim();
            const body = String(data.body || "").trim();
            if (!cid || !body) return NextResponse.json({ error: "comment_id och body krävs" }, { status: 400 });
            if (body.length > 10000) return NextResponse.json({ error: "body för långt" }, { status: 400 });
            const existing = await query(`SELECT user_id FROM task_comments WHERE id = $1`, [cid]);
            if (!existing.rows.length) return NextResponse.json({ error: "Kommentar hittades inte" }, { status: 404 });
            const isAdmin = ADMIN_PANEL_ROLES.includes(me.role);
            if (existing.rows[0].user_id !== me.userId && !isAdmin) return NextResponse.json({ error: "Endast skapare eller admin får redigera kommentar" }, { status: 403 });
            await query(`UPDATE task_comments SET body = $1, updated_at = NOW() WHERE id = $2`, [body, cid]);
            return NextResponse.json({ ok: true });
        }

        // ---- Radera kommentar ----
        if (data?.action === "delete_comment") {
            const cid = String(data.comment_id || "").trim();
            if (!cid) return NextResponse.json({ error: "comment_id krävs" }, { status: 400 });
            const existing = await query(`SELECT user_id FROM task_comments WHERE id = $1`, [cid]);
            if (!existing.rows.length) return NextResponse.json({ ok: true });
            const isAdmin = ADMIN_PANEL_ROLES.includes(me.role);
            if (existing.rows[0].user_id !== me.userId && !isAdmin) return NextResponse.json({ error: "Endast skapare eller admin får radera kommentar" }, { status: 403 });
            await query(`DELETE FROM task_comments WHERE id = $1`, [cid]);
            return NextResponse.json({ ok: true });
        }

        // ---- Skapa/Uppdatera task ----
        const id = data?.id ? String(data.id).trim() : "";
        const title_ar = String(data?.title_ar ?? "").trim();
        if (!title_ar) return NextResponse.json({ error: "title_ar krävs" }, { status: 400 });
        const type: TaskType = inList<TaskType>(data?.type, TASK_TYPES, "TODO");
        const priority: TaskPriority = inList<TaskPriority>(data?.priority, TASK_PRIORITIES, "MED");
        const status: TaskStatus = inList<TaskStatus>(data?.status, TASK_STATUSES, "TODO");

        const title_en = data?.title_en ? String(data.title_en).trim() || null : null;
        const description_ar = data?.description_ar ? String(data.description_ar).trim() || null : null;
        const description_en = data?.description_en ? String(data.description_en).trim() || null : null;
        const tags = arrOrNull(data?.tags);
        const attachments = arrOrNullAttachments(data?.attachments);
        const assigned_to_id = data?.assigned_to_id ? String(data.assigned_to_id).trim() : null;

        if (id) {
            // Uppdatera
            await query(`
                UPDATE tasks SET
                    title_ar = $1, title_en = $2, description_ar = $3, description_en = $4,
                    type = $5, priority = $6, status = $7, tags = COALESCE($8::TEXT[], tasks.tags),
                    attachments = COALESCE($9::TEXT[], tasks.attachments),
                    assigned_to_id = $10,
                    updated_at = NOW()
                WHERE id = $11
            `, [title_ar, title_en, description_ar, description_en, type, priority, status, tags, attachments || null, assigned_to_id || null, id]);
            // Markera klar = sätt uppdaterad
            return NextResponse.json({ ok: true, id });
        } else {
            // Skapa – slumpa kod (TASK-XXXXX)
            let code = "";
            for (let attempt = 0; attempt < 8; attempt++) {
                code = "T-" + Math.floor(10000 + Math.random()*90000);
                const ex = await query(`SELECT id FROM tasks WHERE code = $1`, [code]);
                if (!ex.rows.length) break;
            }
            const r = await query(`
                INSERT INTO tasks
                (code, title_ar, title_en, description_ar, description_en, type, priority, status, tags, attachments, created_by_id, assigned_to_id)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::TEXT[], $10::TEXT[], $11, $12)
                RETURNING id, code
            `, [code, title_ar, title_en, description_ar, description_en, type, priority, status, tags || [], attachments || [], me.userId, assigned_to_id || null]);
            return NextResponse.json({ ok: true, id: String(r.rows[0].id), code: String(r.rows[0].code) });
        }
    } catch (e: any) {
        console.error("[tasks PUT error]", String(e?.message ?? e));
        return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
    }
}

/** DELETE /api/admin/tasks?id=... – radera task (skapare eller admin) */
export async function DELETE(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (!auth.user || auth.error) {
        console.log('[tasks DELETE 401]', JSON.stringify(debugAuthSummary(req, auth)));
        return NextResponse.json(
            { error: auth.error || "Unauthorized", debug: auth.debug ?? null },
            { status: auth.status ?? 401 }
        );
    }
    try {
        await ensureTables();
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id krävs" }, { status: 400 });
        const existing = await query(`SELECT created_by_id FROM tasks WHERE id = $1`, [id]);
        if (!existing.rows.length) return NextResponse.json({ ok: true });
        const me = auth.user as TokenPayload;
        const isAdmin = ADMIN_PANEL_ROLES.includes(me.role);
        if (existing.rows[0].created_by_id !== me.userId && !isAdmin) return NextResponse.json({ error: "Endast skapare eller admin får radera" }, { status: 403 });
        await query(`DELETE FROM tasks WHERE id = $1`, [id]);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("[tasks DELETE error]", String(e?.message ?? e));
        return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
    }
}
