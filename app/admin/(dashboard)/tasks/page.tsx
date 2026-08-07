"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
type TaskType = "BUG" | "FEATURE" | "TODO" | "REFACTOR" | "DISCUSSION";
type TaskPriority = "LOW" | "MED" | "HIGH" | "CRIT";

type Task = {
    id: string; code: string;
    title_ar: string; title_en: string | null;
    description_ar: string | null; description_en: string | null;
    type: TaskType; priority: TaskPriority; status: TaskStatus;
    tags: string[] | null;
    attachments: string[] | null;
    created_by_id: string; created_by_email?: string | null; created_by_name?: string | null;
    assigned_to_id: string | null; assigned_to_email?: string | null; assigned_to_name?: string | null;
    comment_count?: number;
    created_at: string; updated_at: string;
};
type TaskComment = {
    id: string; task_id: string;
    user_id: string; user_email?: string | null; user_name?: string | null;
    body: string;
    attachments: string[] | null;
    created_at: string; updated_at: string;
};
type User = { id: string; email: string; name: string | null; role: string };
type Toast = { kind: "ok" | "err"; msg: string } | null;

const STATUS_META: Record<TaskStatus, { label_ar: string; cls: string; dot: string }> = {
    TODO:        { label_ar: "للقيام",   cls: "bg-m3-surface-container-lowest text-m3-on-surface ring-1 ring-m3-outline-variant",    dot: "bg-m3-outline-variant" },
    IN_PROGRESS: { label_ar: "قيد التنفيذ", cls: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",  dot: "bg-amber-500" },
    REVIEW:      { label_ar: "مراجعة",   cls: "bg-sky-100 text-sky-800 ring-1 ring-sky-300",          dot: "bg-sky-500" },
    DONE:        { label_ar: "مكتمل ✅",  cls: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300", dot: "bg-emerald-500" },
    BLOCKED:     { label_ar: "محجوب",    cls: "bg-rose-100 text-rose-800 ring-1 ring-rose-300",        dot: "bg-rose-500" },
};
const TYPE_META: Record<TaskType, { label_ar: string; cls: string }> = {
    BUG:        { label_ar: "خلل 🐛",       cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
    FEATURE:    { label_ar: "ميزة جديدة ✨", cls: "bg-accent/10 text-m3-primary ring-1 ring-violet-200" },
    TODO:       { label_ar: "مهمة 📝",      cls: "bg-m3-background text-m3-on-surface ring-1 ring-m3-outline-variant/60" },
    REFACTOR:   { label_ar: "صيانة 🔧",     cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
    DISCUSSION: { label_ar: "مناقشة 💬",    cls: "bg-teal-50 text-teal-700 ring-1 ring-teal-200" },
};
const PRIO_META: Record<TaskPriority, { label_ar: string; cls: string; order: number }> = {
    LOW:  { label_ar: "منخفضة",    cls: "bg-m3-surface-container-lowest text-m3-on-surface-variant", order: 4 },
    MED:  { label_ar: "متوسطة",    cls: "bg-sky-100 text-sky-700",     order: 3 },
    HIGH: { label_ar: "عالية",     cls: "bg-amber-100 text-amber-800", order: 2 },
    CRIT: { label_ar: "حرجة 🔥",    cls: "bg-rose-100 text-rose-800",   order: 1 },
};

const STATUSES: TaskStatus[] = ["TODO","IN_PROGRESS","REVIEW","DONE","BLOCKED"];
const TYPES: TaskType[] = ["BUG","FEATURE","TODO","REFACTOR","DISCUSSION"];
const PRIOS: TaskPriority[] = ["LOW","MED","HIGH","CRIT"];

const EMPTY: Task = {
    id: "", code: "",
    title_ar: "", title_en: "",
    description_ar: "", description_en: "",
    type: "TODO", priority: "MED", status: "TODO",
    tags: [],
    attachments: [],
    created_by_id: "", assigned_to_id: null,
    created_at: "", updated_at: "",
};

function fmtAgo(iso: string): string {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `قبل ${s} ثانية`;
    if (s < 3600) return `قبل ${Math.floor(s/60)} دقيقة`;
    if (s < 86400) return `قبل ${Math.floor(s/3600)} ساعة`;
    return `قبل ${Math.floor(s/86400)} يوم`;
}
function initials(name: string|null, email: string): string {
    if (name && name.trim()) return name.trim().split(/\s+/).map(p => p[0]).slice(0,2).join("").toUpperCase();
    return email.split("@")[0].slice(0,2).toUpperCase();
}

function authFetch(url: string, opts?: RequestInit): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers: Record<string,string> = {
        "Content-Type": "application/json",
        "X-Debug-Auth": "1",
        ...(opts?.headers as any || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers, credentials: "same-origin" });
}

// Admin-uppladdning (använder FormData, därför ingen Content-Type application/json)
async function adminUploadFile(file: File, subDir: string = "tasks"): Promise<string> {
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subDir", subDir);
    const headers: Record<string,string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd, headers, credentials: "same-origin" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    return j.url;
}

function isImageUrl(url: string): boolean {
    const u = url.toLowerCase().split("?")[0];
    return /\.(jpg|jpeg|png|webp|gif)$/.test(u) || /\/uploads\/(photo|status|tasks|banners|badges|levels)\//.test(u);
}

function nUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith('/api/uploads/')) return url.replace('/api/uploads/', '/uploads/');
    const m = url.match(/^\/(api\/)?uploads\/([^/]+)\/(.+)$/);
    if (m) return `/uploads/${m[2]}/${m[3]}`;
    return url;
}

// Liten bild-modal (förhandsvisning av bifogad bild i dialog – ingen blank flik + 404)
function AttachmentLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const isImg = src ? isImageUrl(src) : false;
    useEffect(() => {
        const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-m3-on-surface/85 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-h-full max-w-[95vw]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose}
                        className="absolute -left-4 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-lg font-bold text-m3-on-surface shadow-lg hover:bg-m3-surface-container-lowest">
                    ✕
                </button>
                {isImg ? (
                    <img ref={imgRef} src={src} alt="" className="max-h-[88vh] max-w-[95vw] rounded-xl object-contain shadow-2xl" />
                ) : (
                    <div className="min-w-[420px] max-w-[900px] rounded-2xl bg-surface-card p-6 shadow-2xl">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-m3-surface-container-lowest text-3xl">📄</div>
                            <div>
                                <p className="font-bold text-m3-on-surface">مرفق</p>
                                <p className="truncate text-xs text-m3-on-surface-variant">{src}</p>
                            </div>
                        </div>
                        <a href={src} target="_blank" rel="noreferrer"
                           className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-m3-on-surface hover:bg-primary-container">
                            فتح / تحميل ↗
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast>(null);
    const [saving, setSaving] = useState(false);

    // filter
    const [q, setQ] = useState("");
    const [fStatus, setFStatus] = useState<TaskStatus | "ALL">("ALL");
    const [fType, setFType] = useState<TaskType | "ALL">("ALL");
    const [fPrio, setFPrio] = useState<TaskPriority | "ALL">("ALL");
    const [fAssigned, setFAssigned] = useState<string>("");
    const [fMine, setFMine] = useState(false);

    // dialog: detail/create
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState<Task>(EMPTY);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loadComments, setLoadComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [commentAttachments, setCommentAttachments] = useState<string[]>([]);
    const [attachBusy, setAttachBusy] = useState(false);
    const [lightbox, setLightbox] = useState<string | null>(null);

    const show = (kind: "ok" | "err", msg: string) => {
        setToast({ kind, msg });
        window.setTimeout(() => setToast(null), 3200);
    };

    const buildURL = () => {
        const p = new URLSearchParams();
        if (q) p.set("q", q);
        if (fStatus !== "ALL") p.set("status", fStatus);
        if (fType !== "ALL") p.set("type", fType);
        if (fPrio !== "ALL") p.set("priority", fPrio);
        if (fAssigned) p.set("assigned_to", fAssigned);
        if (fMine) p.set("mine", "1");
        return p.toString();
    };

    const load = async () => {
        setLoading(true);
        try {
            const qs = buildURL();
            const r = await authFetch("/api/admin/tasks" + (qs ? "?" + qs : ""));
            let j: any = null;
            try { j = await r.json(); } catch {}
            if (!r.ok) {
                const reason = j?.error ?? (r.status === 401 ? "Behörighet saknas – prova att logga in på nytt 🔍 Felsök: /api/auth/debug" : `HTTP ${r.status}`);
                throw new Error(reason);
            }
            setTasks(j?.tasks || []);
            setUsers(j?.users || []);
        } catch (e: any) {
            show("err", "تعذر التحميل: " + (e?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const counts = useMemo(() => {
        const c = { total: tasks.length, TODO:0, IN_PROGRESS:0, REVIEW:0, DONE:0, BLOCKED:0, mine:0 } as any;
        tasks.forEach(t => {
            c[t.status] = (c[t.status] || 0) + 1;
            if (t.assigned_to_email || t.created_by_email) {
                // mine räknas utan refresh av fMine – inte helt nödvändigt
            }
        });
        return c;
    }, [tasks]);

    const openNew = () => {
        setEdit({ ...EMPTY });
        setComments([]);
        setCommentAttachments([]);
        setOpen(true);
    };

    const openTask = async (t: Task) => {
        setEdit({ ...t });
        setComments([]);
        setCommentAttachments([]);
        setOpen(true);
        setLoadComments(true);
        try {
            const r = await authFetch(`/api/admin/tasks?id=${encodeURIComponent(t.id)}`);
            if (r.ok) {
                const j = await r.json();
                if (j?.task) setEdit({ ...j.task, attachments: Array.isArray(j.task.attachments) ? j.task.attachments : (t.attachments || []) });
                if (Array.isArray(j?.comments)) setComments(j.comments);
            }
        } catch {} finally {
            setLoadComments(false);
        }
    };

    const save = async () => {
        if (!edit.title_ar.trim()) { show("err", "العنوان مطلوب"); return; }
        setSaving(true);
        try {
            const r = await authFetch("/api/admin/tasks", { method: "PUT", body: JSON.stringify(edit) });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
            show("ok", edit.id ? "تم التحديث" : "تم الإنشاء");
            setOpen(false);
            load();
        } catch (e: any) {
            show("err", e?.message || "تعذر الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const patch = (k: keyof Task, v: any) => setEdit(e => ({ ...e, [k]: v }));

    const quickStatus = async (t: Task, status: TaskStatus) => {
        try {
            const r = await authFetch("/api/admin/tasks", {
                method: "PUT",
                body: JSON.stringify({ ...t, status }),
            });
            if (!r.ok) throw new Error("HTTP " + r.status);
            setTasks(list => list.map(x => x.id === t.id ? { ...x, status, updated_at: new Date().toISOString() } : x));
            show("ok", `الحالة → ${STATUS_META[status].label_ar}`);
        } catch (e: any) { show("err", e?.message || "فشل"); }
    };

    const remove = async (t: Task) => {
        if (!confirm(`حذف المهمة «${t.title_ar}»؟`)) return;
        try {
            const r = await authFetch(`/api/admin/tasks?id=${encodeURIComponent(t.id)}`, { method: "DELETE" });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
            show("ok", "تم الحذف");
            load();
        } catch (e: any) { show("err", e?.message || "فشل"); }
    };

    const addComment = async () => {
        if ((!newComment.trim() && !commentAttachments.length) || !edit.id) return;
        const body = newComment.trim();
        const sendAtts = [...commentAttachments];
        setNewComment("");
        setCommentAttachments([]);
        try {
            const r = await authFetch("/api/admin/tasks", {
                method: "PUT",
                body: JSON.stringify({ action: "comment", task_id: edit.id, body, attachments: sendAtts }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
            setComments(list => [...list, j.comment]);
            setEdit(e => ({ ...e, comment_count: (e.comment_count || 0) + 1 }));
        } catch (e: any) { show("err", e?.message || "فشل"); setNewComment(body); setCommentAttachments(sendAtts); }
    };

    const handleAttachmentUpload = async (files: FileList | File[], target: "task" | "comment") => {
        const arr = Array.from(files).filter(f => f.size > 0);
        if (!arr.length) return;
        setAttachBusy(true);
        try {
            const urls: string[] = [];
            for (const f of arr) {
                try {
                    const url = await adminUploadFile(f, "tasks");
                    urls.push(url);
                } catch (e: any) {
                    show("err", `${f.name}: ${e?.message || "فشل الرفع"}`);
                }
            }
            if (urls.length) {
                if (target === "task") {
                    patch("attachments", [...(edit.attachments || []), ...urls]);
                } else {
                    setCommentAttachments(list => [...list, ...urls]);
                }
                show("ok", `تم رفع ${urls.length}`);
            }
        } finally {
            setAttachBusy(false);
        }
    };

    const removeAttachment = (target: "task" | "comment", url: string) => {
        if (target === "task") {
            patch("attachments", (edit.attachments || []).filter(x => x !== url));
        } else {
            setCommentAttachments(list => list.filter(x => x !== url));
        }
    };

    const delComment = async (c: TaskComment) => {
        if (!confirm("حذف التعليق؟")) return;
        try {
            const r = await authFetch("/api/admin/tasks", {
                method: "PUT",
                body: JSON.stringify({ action: "delete_comment", comment_id: c.id }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
            setComments(list => list.filter(x => x.id !== c.id));
        } catch (e: any) { show("err", e?.message || "فشل"); }
    };

    const nameOfUser = (u: { assigned_to_name?: string | null; assigned_to_email?: string | null; created_by_name?: string|null; created_by_email?: string|null }, kind: "as"|"cb") => {
        if (kind === "as") return u.assigned_to_name?.trim() ? u.assigned_to_name : u.assigned_to_email;
        return u.created_by_name?.trim() ? u.created_by_name : u.created_by_email;
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {toast && (
                <div className={`fixed left-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-m3-on-surface shadow-xl ${
                    toast.kind === "ok" ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header + count chips */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-m3-on-surface">المهام والمناقشات</h1>
                    <p className="mt-1 text-sm text-m3-on-surface-variant">
                        تابع الأخطاء والميزات القادمة، وعلق مع فريق العمل. كل الحالات تُحفظ فوراً.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-m3-surface-container-highest px-3 py-1 text-xs font-semibold text-m3-on-surface">
                            الكل {counts.total}
                        </span>
                        {STATUSES.map(st => (
                            <span key={st}
                                  onClick={() => setFStatus(fStatus === st ? "ALL" : st)}
                                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${STATUS_META[st].cls} ${fStatus === st ? "ring-2 ring-offset-1 ring-m3-outline" : ""}`}>
                                {STATUS_META[st].label_ar} {counts[st] ?? 0}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={load}
                        className="rounded-lg border border-m3-outline-variant bg-surface-card px-4 py-2 text-sm font-medium text-m3-on-surface hover:bg-m3-background">
                        تحديث ↻
                    </button>
                    <button
                        onClick={openNew}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-m3-on-surface shadow-md transition hover:bg-primary-container">
                        + مهمة جديدة
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-m3-outline-variant/60 bg-surface-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-6">
                <div className="flex flex-col gap-1 lg:col-span-2">
                    <label className="text-xs font-semibold text-m3-on-surface-variant">🔎 بحث في العناوين والوصف</label>
                    <input className="input" placeholder="مثال: خطأ في تسجيل الدخول" value={q}
                           onChange={e => setQ(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-m3-on-surface-variant">الحالة</label>
                    <select className="input" value={fStatus} onChange={e => setFStatus(e.target.value as any)}>
                        <option value="ALL">الكل</option>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label_ar}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-m3-on-surface-variant">النوع</label>
                    <select className="input" value={fType} onChange={e => setFType(e.target.value as any)}>
                        <option value="ALL">الكل</option>
                        {TYPES.map(s => <option key={s} value={s}>{TYPE_META[s].label_ar}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-m3-on-surface-variant">الأولوية</label>
                    <select className="input" value={fPrio} onChange={e => setFPrio(e.target.value as any)}>
                        <option value="ALL">الكل</option>
                        {PRIOS.map(s => <option key={s} value={s}>{PRIO_META[s].label_ar}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-m3-on-surface-variant">المُعين / المكلّف</label>
                    <select className="input" value={fAssigned} onChange={e => setFAssigned(e.target.value)}>
                        <option value="">الكل</option>
                        {users.map(u => <option key={u.id} value={u.id}>
                            {u.name || u.email} ({u.role})
                        </option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2 lg:flex-row lg:items-end lg:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-m3-on-surface">
                        <input type="checkbox" checked={fMine} onChange={e => setFMine(e.target.checked)}
                               className="h-4 w-4 rounded border-m3-outline-variant text-accent" />
                        مهامي فقط (أنا أنشأتها أو تم تخصيصها لي)
                    </label>
                    <button
                        onClick={load}
                        className="rounded-lg bg-m3-surface-container-highest px-3 py-1.5 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high">
                        تطبيق التصفية
                    </button>
                </div>
            </div>

            {/* Task cards / loading */}
            {loading ? (
                <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-10 text-center text-m3-on-surface-variant">
                    جاري التحميل...
                </div>
            ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-m3-outline-variant bg-surface-card px-6 py-16 text-center">
                    <div className="text-5xl">📝</div>
                    <p className="mt-4 text-lg font-semibold text-m3-on-surface">لا توجد مهام بعد.</p>
                    <p className="mt-1 text-sm text-m3-on-surface-variant">
                        ابدأ بإنشاء أول مهمة أو خلل لتعقبه مع الفريق.
                    </p>
                    <button onClick={openNew}
                            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-m3-on-surface hover:bg-primary-container">
                        + مهمة جديدة
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {tasks.map(t => {
                        const sm = STATUS_META[t.status];
                        const tm = TYPE_META[t.type];
                        const pm = PRIO_META[t.priority];
                        return (
                            <article key={t.id}
                                     onClick={() => openTask(t)}
                                     className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-surface-card p-5 shadow-sm transition hover:shadow-lg ${
                                         t.status === "DONE" ? "border-emerald-200 opacity-85" : "border-m3-outline-variant/60 hover:-translate-y-0.5"
                                     }`}>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-m3-surface-container-highest px-2 py-0.5 text-[10px] font-mono font-bold text-m3-on-surface">
                                        {t.code}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pm.cls}`}>
                                        أولوية: {pm.label_ar}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tm.cls}`}>
                                        {tm.label_ar}
                                    </span>
                                </div>
                                <h3 className={`text-base font-bold leading-6 text-m3-on-surface ${
                                    t.status === "DONE" ? "line-through decoration-slate-400/60" : ""
                                }`}>
                                    {t.title_ar}
                                    {t.title_en && (
                                        <span className="block text-[11px] font-normal text-m3-on-surface-variant">{t.title_en}</span>
                                    )}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs text-m3-on-surface-variant">
                                    {t.description_ar || t.description_en || <em className="text-m3-outline">(بدون وصف)</em>}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {STATUSES.map(st => (
                                        <button
                                            key={st}
                                            onClick={(ev) => { ev.stopPropagation(); quickStatus(t, st); }}
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                                                t.status === st
                                                    ? STATUS_META[st].cls + " ring-2 ring-offset-1 ring-m3-outline"
                                                    : "bg-surface-card text-m3-on-surface-variant ring-1 ring-m3-outline-variant/60 hover:bg-m3-background"
                                            }`}>
                                            {STATUS_META[st].label_ar}
                                        </button>
                                    ))}
                                </div>

                                {t.tags?.length ? (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {t.tags.slice(0,6).map(tag => (
                                            <span key={tag} className="rounded bg-m3-surface-container-lowest px-2 py-0.5 text-[10px] font-medium text-m3-on-surface-variant">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                <div className="mt-4 flex items-center justify-between border-t border-m3-surface-container-low pt-3">
                                    <div className="flex -space-x-2">
                                        <div title={`أنشأ: ${nameOfUser(t,"cb")}`}
                                             className="flex h-7 w-7 items-center justify-center rounded-full bg-m3-surface-container-highest text-[10px] font-bold text-m3-on-surface ring-2 ring-m3-outline-variant">
                                            {initials(t.created_by_name ?? null, t.created_by_email ?? "??")}
                                        </div>
                                        {t.assigned_to_id && (
                                            <div title={`مُعين: ${nameOfUser(t,"as")}`}
                                                 className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-m3-on-surface ring-2 ring-m3-outline-variant">
                                                {initials(t.assigned_to_name ?? null, t.assigned_to_email ?? "??")}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-m3-on-surface-variant">
                                        {t.attachments?.length ? (
                                            <span className="flex items-center gap-1 font-semibold text-primary" title={`${t.attachments.length} مرفقات`}>
                                                📎 {t.attachments.length}
                                            </span>
                                        ) : null}
                                        <span title={new Date(t.updated_at).toLocaleString()} className="flex items-center gap-1">
                                            💬 {t.comment_count ?? 0}
                                        </span>
                                        <span title={new Date(t.created_at).toLocaleString()}>
                                            {fmtAgo(t.created_at)}
                                        </span>
                                        <button
                                            onClick={(ev) => { ev.stopPropagation(); remove(t); }}
                                            className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-semibold text-rose-600 transition hover:bg-rose-100">
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Dialog: new / edit / show */}
            {open && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-m3-surface-container-highest/50 p-4">
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-surface-card shadow-2xl" dir="rtl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-m3-surface-container-low bg-surface-card/90 px-6 py-4 backdrop-blur">
                            <div>
                                <h2 className="text-lg font-bold text-m3-on-surface">
                                    {edit.id ? `المهمة ${edit.code}` : "مهمة جديدة"}
                                </h2>
                                {edit.id && (
                                    <p className="text-xs text-m3-on-surface-variant">
                                        آخر تحديث: {new Date(edit.updated_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setOpen(false)} className="text-m3-outline hover:text-m3-on-surface">✕</button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
                            <div className="space-y-4 lg:col-span-2">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="العنوان (عربي)" full>
                                        <input className="input" value={edit.title_ar}
                                               onChange={e => patch("title_ar", e.target.value)}
                                               placeholder="مثال: خروج الخطأ ٥٠٠ عند إنشاء عرض سعر" />
                                    </Field>
                                    <Field label="العنوان إنجليزي (اختياري)">
                                        <input className="input" value={edit.title_en || ""}
                                               onChange={e => patch("title_en", e.target.value || null)} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="الوصف (عربي)" full>
                                        <textarea rows={6} className="input"
                                                  value={edit.description_ar || ""}
                                                  onChange={e => patch("description_ar", e.target.value || null)}
                                                  placeholder="اشرح التفاصيل خطوة بخطوة، ماذا يحدث؟ ومتى؟ وما الحل المتوقع؟" />
                                    </Field>
                                    <Field label="الوصف إنجليزي (اختياري)">
                                        <textarea rows={6} className="input"
                                                  value={edit.description_en || ""}
                                                  onChange={e => patch("description_en", e.target.value || null)} />
                                    </Field>
                                </div>

                                <Field label="الوسوم (مفصولة بفاصلة)" full>
                                    <input className="input"
                                           value={(edit.tags || []).join(", ")}
                                           onChange={e => patch("tags",
                                               e.target.value ? e.target.value.split(",").map(s => s.trim()).filter(Boolean) : [])}
                                           placeholder="ui, admin, arabic, auth" />
                                </Field>

                                {/* Attachments upload zone – OMRÅDET I RÖD CIRKELN */}
                                <div className="rounded-2xl border border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/50 to-surface-card p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-m3-on-surface">📎 المرفقات والصور</h3>
                                            <p className="text-[10.5px] text-m3-on-surface-variant">
                                                ارفع صوراً أو ملفات لتوضيح الخطأ أو المطلوب (JPG / PNG / WEBP / GIF حتى ١٥٠ ميجا)
                                            </p>
                                        </div>
                                        <label className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition ${
                                            attachBusy
                                                ? "border-m3-outline-variant/60 bg-m3-surface-container-lowest text-m3-outline"
                                                : "border-indigo-200 bg-primary text-m3-on-surface hover:bg-primary-container"
                                        }`}>
                                            {attachBusy ? "جاري الرفع…" : "+ إرفاق ملفات"}
                                            <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={attachBusy}
                                                   onChange={e => {
                                                       if (e.target.files && e.target.files.length) {
                                                           handleAttachmentUpload(e.target.files, "task");
                                                           e.target.value = "";
                                                       }
                                                   }} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {(edit.attachments || []).length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-m3-outline-variant/60 bg-surface-card/60 px-4 py-8 text-center">
                                                <div className="text-3xl">🖼️</div>
                                                <p className="mt-1 text-[11px] text-m3-on-surface-variant">
                                                    لا توجد مرفقات بعد — اسحب هنا أو اضغط + إرفاق ملفات
                                                </p>
                                            </div>
                                        )}
                                        {(edit.attachments || []).map((url, idx) => (
                                            <div key={url + idx} className="group relative aspect-square overflow-hidden rounded-xl border border-m3-outline-variant/60 bg-m3-background shadow-sm">
                                                {isImageUrl(url) ? (
                                                    <img onClick={() => setLightbox(nUrl(url))}
                                                         src={nUrl(url)}
                                                         alt=""
                                                         className="h-full w-full cursor-zoom-in object-contain transition group-hover:scale-[1.02]"
                                                         loading="lazy" />
                                                ) : (
                                                    <a href={nUrl(url)} target="_blank" rel="noreferrer"
                                                       className="flex h-full w-full items-center justify-center text-4xl">📄</a>
                                                )}
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                                                <button type="button"
                                                        onClick={() => isImageUrl(url) ? setLightbox(nUrl(url)) : window.open(nUrl(url), "_blank", "noopener,noreferrer")}
                                                        className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-md bg-surface-card/90 px-2 py-0.5 text-[10px] font-semibold text-m3-on-surface shadow opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                                                    {isImageUrl(url) ? "🔍 معاينة" : "فتح ↗"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment("task", url)}
                                                    className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-m3-on-surface shadow opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-rose-600">
                                                    ✕ حذف
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comments */}
                                {edit.id && (
                                    <div className="rounded-2xl border border-m3-outline-variant/60 bg-gradient-to-b from-slate-50 to-surface-card p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-m3-on-surface">💬 التعليقات والمناقشة</h3>
                                            <span className="text-[10px] text-m3-on-surface-variant">{comments.length} تعليق</span>
                                        </div>
                                        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-m3-outline-variant/60 bg-surface-card p-2 shadow-sm">
                                            <textarea
                                                className="input min-h-[72px] border-0 shadow-none focus:ring-0"
                                                placeholder="اكتب تعليقاً… (يمكن للفريق كله رؤيته) Ctrl+Enter = إرسال"
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                onKeyDown={e => {
                                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") addComment();
                                                }} />
                                            {/* attachments for comment */}
                                            {commentAttachments.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2 border-t border-m3-surface-container-low pt-2">
                                                    {commentAttachments.map((url, idx) => (
                                                        <div key={"ca-"+idx} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-m3-outline-variant/60 bg-m3-background shadow-sm">
                                                            {isImageUrl(url) ? (
                                                                <img onClick={() => setLightbox(nUrl(url))}
                                                                     src={nUrl(url)}
                                                                     alt=""
                                                                     className="h-full w-full cursor-zoom-in object-contain" />
                                                            ) : (
                                                                <a href={nUrl(url)} target="_blank" rel="noreferrer"
                                                                   className="flex h-full w-full items-center justify-center text-xl">📄</a>
                                                            )}
                                                            <button type="button"
                                                                    onClick={() => removeAttachment("comment", url)}
                                                                    className="absolute left-0 top-0 h-4 w-4 rounded-br-lg bg-rose-500 text-[9px] font-bold text-m3-on-surface hover:bg-rose-600">
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between border-t border-m3-surface-container-low pt-2">
                                                <label className={`cursor-pointer rounded-md px-2 py-1 text-[10.5px] font-semibold transition ${
                                                    attachBusy
                                                        ? "text-m3-outline"
                                                        : "text-m3-on-surface-variant hover:bg-m3-surface-container-lowest"
                                                }`}>
                                                    📎 إرفاق صورة/ملف
                                                    <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={attachBusy}
                                                           onChange={e => {
                                                               if (e.target.files && e.target.files.length) {
                                                                   handleAttachmentUpload(e.target.files, "comment");
                                                                   e.target.value = "";
                                                               }
                                                           }} />
                                                </label>
                                                <button onClick={addComment}
                                                        disabled={!newComment.trim() && !commentAttachments.length}
                                                        className="rounded-lg bg-m3-surface-container-highest px-3 py-1.5 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high disabled:opacity-50">
                                                    إرسال
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {loadComments && !comments.length && (
                                                <p className="py-3 text-center text-xs text-m3-outline">جاري تحميل التعليقات…</p>
                                            )}
                                            {!loadComments && !comments.length && (
                                                <p className="py-3 text-center text-xs text-m3-outline">لا توجد تعليقات بعد. كن أول من يعلق 👆</p>
                                            )}
                                            {comments.map(c => (
                                                <div key={c.id} className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-3 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-m3-on-surface">
                                                                {initials(c.user_name ?? null, c.user_email ?? "??")}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-m3-on-surface">
                                                                    {c.user_name?.trim() || c.user_email}
                                                                </p>
                                                                <p className="text-[10px] text-m3-on-surface-variant">
                                                                    {fmtAgo(c.created_at)} · {new Date(c.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => delComment(c)}
                                                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100">
                                                            حذف
                                                        </button>
                                                    </div>
                                                    {c.body && (
                                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-m3-on-surface">
                                                            {c.body}
                                                        </p>
                                                    )}
                                                    {c.attachments?.length ? (
                                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                                            {c.attachments.map((url, i) => (
                                                                isImageUrl(url) ? (
                                                                    <button key={i} type="button"
                                                                            onClick={() => setLightbox(nUrl(url))}
                                                                            className="group block aspect-square overflow-hidden rounded-lg border border-m3-outline-variant/60 bg-m3-background shadow-sm hover:ring-2 hover:ring-primary/70">
                                                                        <img src={nUrl(url)} alt="" className="h-full w-full cursor-zoom-in object-contain transition group-hover:scale-[1.02]" loading="lazy" />
                                                                    </button>
                                                                ) : (
                                                                    <a key={i} href={nUrl(url)} target="_blank" rel="noreferrer"
                                                                       className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-m3-outline-variant/60 bg-m3-background shadow-sm hover:ring-2 hover:ring-primary/70">
                                                                        <div className="text-3xl">📄</div>
                                                                        <div className="mt-1 text-[9px] text-m3-on-surface-variant">انقر للفتح</div>
                                                                    </a>
                                                                )
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right column: meta */}
                            <div className="space-y-3 rounded-2xl border border-m3-outline-variant/60 bg-m3-background/60 p-4 shadow-sm self-start lg:sticky lg:top-24">
                                <Field label="الحالة">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {STATUSES.map(st => (
                                            <button type="button" key={st}
                                                    onClick={() => patch("status", st)}
                                                    className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                                                        edit.status === st
                                                            ? STATUS_META[st].cls + " ring-2 ring-offset-1 ring-m3-outline"
                                                            : "bg-surface-card text-m3-on-surface-variant ring-1 ring-m3-outline-variant/60 hover:bg-m3-surface-container-lowest"
                                                    }`}>
                                                <span className={`mr-1 inline-block h-2 w-2 rounded-full align-middle ${STATUS_META[st].dot}`} />
                                                {STATUS_META[st].label_ar}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <Field label="النوع">
                                    <select className="input" value={edit.type}
                                            onChange={e => patch("type", e.target.value)}>
                                        {TYPES.map(tp => <option key={tp} value={tp}>{TYPE_META[tp].label_ar}</option>)}
                                    </select>
                                </Field>

                                <Field label="الأولوية">
                                    <select className="input" value={edit.priority}
                                            onChange={e => patch("priority", e.target.value)}>
                                        {PRIOS.map(p => <option key={p} value={p}>{PRIO_META[p].label_ar}</option>)}
                                    </select>
                                </Field>

                                <Field label="المُعين / المُكلّف">
                                    <select className="input" value={edit.assigned_to_id || ""}
                                            onChange={e => patch("assigned_to_id", e.target.value || null)}>
                                        <option value="">— غير مُحدد (مفتوح للفريق)</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name || u.email} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {edit.id && (
                                    <>
                                        <Field label="المنشئ">
                                            <div className="rounded-lg bg-surface-card px-3 py-2 text-xs ring-1 ring-m3-outline-variant/60">
                                                {edit.created_by_name?.trim() || edit.created_by_email || "—"}
                                                <span className="mr-2 text-m3-outline">{edit.created_by_email ? `(${edit.created_by_email})` : ""}</span>
                                            </div>
                                        </Field>
                                        <Field label="تاريخ الإنشاء">
                                            <div className="rounded-lg bg-surface-card px-3 py-2 text-xs ring-1 ring-m3-outline-variant/60">
                                                {new Date(edit.created_at).toLocaleString()}
                                            </div>
                                        </Field>
                                    </>
                                )}

                                <div className="mt-3 flex flex-col gap-2">
                                    <button onClick={save} disabled={saving}
                                            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-m3-on-surface shadow-md transition hover:bg-primary-container disabled:opacity-60">
                                        {saving ? "جاري الحفظ..." : (edit.id ? "حفظ التغييرات" : "إنشاء المهمة")}
                                    </button>
                                    <button onClick={() => setOpen(false)}
                                            className="rounded-lg border border-m3-outline-variant bg-surface-card px-6 py-2 text-sm font-semibold text-m3-on-surface hover:bg-m3-background">
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attachment lightbox (förhandsvisning bild/fullstorlek) – klicka på tumma / tryck ESC för stäng */}
            <AttachmentLightbox src={lightbox} onClose={() => setLightbox(null)} />
        </div>
    );
}

function Field({ label, labelEn, full, children }: {
    label: string; labelEn?: string; full?: boolean; children: React.ReactNode;
}) {
    return (
        <div className={full ? "flex flex-col gap-1" : "flex flex-col gap-1"}>
            <label className="text-xs font-semibold text-m3-on-surface-variant">
                {label}
                {labelEn && <span className="mr-2 text-[10px] font-normal text-m3-outline">({labelEn})</span>}
            </label>
            {children}
        </div>
    );
}
