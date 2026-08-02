"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = {
    id: string;
    code: string;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    price_monthly: string;
    price_yearly: string;
    currency: string;
    sort_order: number;
    max_offers: number | null;
    max_team: number | null;
    is_active: boolean;
    is_popular: boolean;
    is_enterprise: boolean;
    features: Record<string, boolean>;
};

type FeatureDef = {
    key: string;
    label: string;
    label_ar: string;
    desc_ar: string;
    defaults: { free: string; pro: string; studio: string; enterprise: string };
};

const FEATURES: FeatureDef[] = [
    {
        key: "searchPriority",
        label: "Search Priority",
        label_ar: "بحث ذو أولوية",
        desc_ar: "يظهر إعلانك وحسابك أولاً في نتائج البحث (مستوى الأولوية يزداد بالخطط الأعلى).",
        defaults: { free: "❌ لا", pro: "✅ نعم", studio: "🏆 أعلى أولوية", enterprise: "🏆 أولاً دائماً" },
    },
    {
        key: "hideAds",
        label: "Hide Advertisements",
        label_ar: "إخفاء الإعلانات",
        desc_ar: "عدم ظهور الإعلانات الترويجية للتطبيق أثناء استخدامك للحساب.",
        defaults: { free: "❌ مع إعلانات", pro: "✅ بدون إعلانات", studio: "✅ بدون إعلانات", enterprise: "✅ بدون إعلانات" },
    },
    {
        key: "verifiedBadge",
        label: "Verified Checkmark",
        label_ar: "شارة التحقق (✓)",
        desc_ar: "علامة ✓ زرقاء بجانب اسم المستخدم في الملف الشخصي ونتائج البحث تبن ثقة أكبر.",
        defaults: { free: "❌ لا", pro: "✅ ✓ نعم", studio: "✅ ✓ نعم", enterprise: "✅ ✓ نعم" },
    },
    {
        key: "videoPortfolio",
        label: "Video in Portfolio",
        label_ar: "فيديو في المعرض",
        desc_ar: "إمكانية رفع فيديوهات قصيرة إلى معرض أعمالك (ليس فقط الصور).",
        defaults: { free: "❌ صور فقط", pro: "✅ فيديو + صور", studio: "✅ فيديو + صور", enterprise: "✅ مساحة فيديو غير محدودة" },
    },
    {
        key: "customWatermark",
        label: "Custom Watermark",
        label_ar: "علامة مائية مخصصة",
        desc_ar: "إزالة علامة sawrly المائية الافتراضية ورفع علامتك الخاصة على الصور/الفيديوهات.",
        defaults: { free: "❌ علامة sawrly", pro: "✅ علامتي الخاصة", studio: "✅ علامتي الخاصة", enterprise: "✅ بدون علامة (اختياري)" },
    },
    {
        key: "directBooking",
        label: "Direct Booking",
        label_ar: "الحجز المباشر",
        desc_ar: "العملاء يحجزون ويدفعون مباشرة من حسابك دون الحاجة إلى محادثة أولاً (يزيد التحويلات بشكل كبير).",
        defaults: { free: "❌ فقط محادثة", pro: "✅ حجز مباشر", studio: "✅ حجز مباشر", enterprise: "✅ حجز مباشر + طلبات مخصصة" },
    },
    {
        key: "advancedAnalytics",
        label: "Advanced Analytics",
        label_ar: "تحليلات متقدمة",
        desc_ar: "لوحة بيانات تشمل: عدد الزيارات لكل إعلان، جغرافية الزوار، معدل التحويل، تصدير CSV.",
        defaults: { free: "📊 أساسي", pro: "📊 أساسي", studio: "📈 متقدم + تصدير", enterprise: "📈 كامل + تقارير شهرية" },
    },
    {
        key: "prioritySupport",
        label: "Priority Support",
        label_ar: "دعم ذو أولوية",
        desc_ar: "رد أسرع من فريق الدعم (خطة Studio = خلال 24 ساعة / Enterprise = مدير حساب مخصص).",
        defaults: { free: "💬 ٥ أيام عمل", pro: "💬 ٢-٣ أيام", studio: "⚡ خلال 24 ساعة", enterprise: "👤 مدير حساب مخصص" },
    },
    {
        key: "customProfileUrl",
        label: "Custom Profile URL",
        label_ar: "رابط ملف شخصي مخصص",
        desc_ar: "رابط مختصر وجميل لملفك الشخصي مثل sawrly.com/u/اسمك (بدلاً من الرقم الطويل) – مثالي للمشاركة على إنستغرام.",
        defaults: { free: "❌ رابط طويل", pro: "✅ رابط مخصص", studio: "✅ رابط مخصص", enterprise: "✅ نطاق فرعي خاص بك" },
    },
    {
        key: "portfolioSizeLarge",
        label: "Large Portfolio Storage",
        label_ar: "سعة معرض إضافية",
        desc_ar: "مساحة تخزين أكبر لصور وأعمالك (مقاسة حسب الخطة: مجاني 50 ميجا، Enterprise غير محدود).",
        defaults: { free: "💾 50 ميجا", pro: "💾 500 ميجا", studio: "💾 5000 ميجا", enterprise: "∞ غير محدود" },
    },
];

const EMPTY_PLAN: Plan = {
    id: "",
    code: "",
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    price_monthly: "0",
    price_yearly: "0",
    currency: "IQD",
    sort_order: 1,
    max_offers: null,
    max_team: null,
    is_active: true,
    is_popular: false,
    is_enterprise: false,
    features: Object.fromEntries(FEATURES.map(f => [f.key, false])) as any,
};

type Toast = { kind: "ok" | "err"; msg: string } | null;

function fmt(n: string, currency: string) {
    const num = Number(n);
    if (!Number.isFinite(num)) return n;
    if (num === 0) return "مجاني";
    const s = num.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return `${s} ${currency}`;
}

/**
 * Auth helper för subscription-plans.
 *
 * VIKTIGT (löst 401 efter analys av /api/auth/debug som fungerade via cookie):
 *   - Login-route sätter BÅDE localStorage.token (frontend) OCH cookie:admin_token (httpOnly).
 *   - Ibland blir localStorage tom (byte http↔https, clear-cache, etc.) – då får man 401 fast cookie är giltig.
 *   - Lösning: skicka ALLTID credentials (cookies) – och Authorization om token finns i LS.
 *   - Servern försöker först Authorization (via getUserFromRequest) sedan cookie.
 */
function authFetch(url: string, opts?: RequestInit): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Debug-Auth": "1",
        ...(opts?.headers as any || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers, credentials: "same-origin" });
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Plan>(EMPTY_PLAN);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast>(null);
    const [helpOpen, setHelpOpen] = useState(true);

    const sortedPlans = useMemo(
        () => [...plans].sort((a, b) => a.sort_order - b.sort_order),
        [plans]
    );

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch("/api/admin/subscription-plans");
            let j: any = null;
            try { j = await r.json(); } catch { /* noop */ }
            if (!r.ok) {
                const reason = j?.error
                    ?? (r.status === 401 ? "Behörighet saknas – prova att logga in på nytt"
                        : r.status === 403 ? "Förbjuden – fel roll (kontakta ägare)"
                            : `HTTP ${r.status}`);
                const hint = r.status === 401 || r.status === 403
                    ? `\n\n🔍 Felsök: öppna en ny flik -> /api/auth/debug`
                    : "";
                if (j?.debug) {
                    console.warn("[auth debug]", j.debug);
                }
                throw new Error(`${reason}${hint}`);
            }
            setPlans(j?.plans || []);
        } catch (e: any) {
            show("err", "Kunde inte ladda planer: " + (e?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const show = (kind: "ok" | "err", msg: string) => {
        setToast({ kind, msg });
        window.setTimeout(() => setToast(null), 3200);
    };

    const openCreate = () => {
        const nextOrder = sortedPlans.length > 0
            ? Math.max(...sortedPlans.map(p => p.sort_order)) + 1
            : 1;
        setEditing({ ...EMPTY_PLAN, sort_order: nextOrder,
            features: Object.fromEntries(FEATURES.map(f => [f.key, false])) as any });
        setDialogOpen(true);
    };

    const openEdit = (p: Plan) => {
        setEditing({ ...p,
            features: {
                ...Object.fromEntries(FEATURES.map(f => [f.key, false])),
                ...(p.features || {}),
            } as any,
        });
        setDialogOpen(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            const r = await authFetch("/api/admin/subscription-plans", {
                method: "PUT",
                body: JSON.stringify(editing),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || `Spara misslyckades (${r.status})`);
            show("ok", "Plan sparad!");
            setDialogOpen(false);
            load();
        } catch (e: any) {
            show("err", e?.message || "Misslyckades att spara");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (p: Plan) => {
        if (!confirm(`Radera plan "${p.name_ar}"? (kan ej ångras om den används)`)) return;
        setDeletingId(p.id);
        try {
            const r = await authFetch(
                `/api/admin/subscription-plans?id=${encodeURIComponent(p.id)}`,
                { method: "DELETE" }
            );
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || `Radera misslyckades (${r.status})`);
            show("ok", "Plan raderad.");
            load();
        } catch (e: any) {
            show("err", e?.message || "Misslyckades att radera");
        } finally {
            setDeletingId(null);
        }
    };

    const patch = (k: keyof Plan, v: any) => {
        setEditing(e => ({ ...e, [k]: v }));
    };

    const toggleFeature = (key: string) => {
        setEditing(e => ({
            ...e,
            features: { ...e.features, [key]: !e.features?.[key] },
        }));
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {toast && (
                <div className={`fixed left-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
                    toast.kind === "ok" ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">خطط الاشتراك</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        أنشئ خطط الأسعار والمميزات التي تظهر مباشرة في التطبيق (دون إعادة إصدار).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={load}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        تحديث ↻
                    </button>
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
                    >
                        + خطة جديدة
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white shadow-sm">
                <button
                    onClick={() => setHelpOpen(o => !o)}
                    className="flex w-full items-center justify-between px-5 py-3 text-right"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-indigo-600">
                            {helpOpen ? "▾" : "▸"}
                        </span>
                        <div className="text-right">
                            <h2 className="text-base font-bold text-indigo-900">
                                دليل التخطيط للمميزات (المرجع)
                            </h2>
                            <p className="text-[11px] text-indigo-600/80">
                                ما تعنيه كل ميزة + القيم الافتراضية لكل خطة.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white">
                        {helpOpen ? "إخفاء" : "عرض"}
                    </div>
                </button>

                {helpOpen && (
                    <div className="border-t border-indigo-100 px-4 pb-5 pt-3">
                        <div className="mb-3 rounded-xl bg-white/80 px-4 py-2 text-[11px] text-slate-600 ring-1 ring-slate-200">
                            💡 <b>ملاحظة:</b> الحقول <b>حد الإعلانات</b> و <b>أعضاء الفريق</b>
                            تعدّ من خلال حقول النص أعلى قائمة المميزات (ليست ضمن خانات الاختيار).
                            خطة Enterprise = <b>null / فارغ</b> = لا حدود.
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner" dir="rtl">
                            <table className="w-full border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700">
                                        <th className="border-b border-slate-200 px-3 py-2 text-right font-bold">اسم الميزة (يعرض في التطبيق)</th>
                                        <th className="border-b border-slate-200 px-3 py-2 text-right font-bold">شرح الميزة</th>
                                        <th className="border-b border-slate-200 px-2 py-2 text-center font-bold">تجربة مجانية</th>
                                        <th className="border-b border-slate-200 px-2 py-2 text-center font-bold bg-purple-50 text-purple-700">الإبداعي</th>
                                        <th className="border-b border-slate-200 px-2 py-2 text-center font-bold bg-sky-50 text-sky-700">الاستوديو</th>
                                        <th className="border-b border-slate-200 px-2 py-2 text-center font-bold bg-slate-900 text-white">الشركات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FEATURES.map((f, idx) => (
                                        <tr key={f.key}
                                            className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                            <td className="border-b border-slate-100 px-3 py-2 align-top">
                                                <div className="font-semibold text-slate-800">{f.label_ar}</div>
                                                <div className="text-[9px] text-slate-400 font-mono">key: {f.key}</div>
                                            </td>
                                            <td className="border-b border-slate-100 px-3 py-2 text-[10.5px] leading-relaxed text-slate-600 align-top max-w-[300px]">
                                                {f.desc_ar}
                                            </td>
                                            <td className="border-b border-slate-100 px-2 py-2 text-center text-[10px] align-top">{f.defaults.free}</td>
                                            <td className="border-b border-slate-100 px-2 py-2 text-center text-[10px] align-top bg-purple-50/40">{f.defaults.pro}</td>
                                            <td className="border-b border-slate-100 px-2 py-2 text-center text-[10px] align-top bg-sky-50/40">{f.defaults.studio}</td>
                                            <td className="border-b border-slate-100 px-2 py-2 text-center text-[10px] align-top bg-slate-900/90 text-white rounded-sm">{f.defaults.enterprise}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    جاري التحميل...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {sortedPlans.map(p => (
                        <div key={p.id} className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg ${
                            p.is_popular ? "border-purple-500 ring-2 ring-purple-200" : "border-slate-200"
                        } ${!p.is_active ? "opacity-60" : ""}`}>
                            {p.is_popular && (
                                <div className="bg-gradient-to-l from-fuchsia-500 to-purple-600 px-4 py-1 text-center text-xs font-bold text-white">
                                    الأكثر شعبية
                                </div>
                            )}
                            {!p.is_active && (
                                <div className="bg-slate-200 px-4 py-1 text-center text-xs font-bold text-slate-700">
                                    غير مفعّل
                                </div>
                            )}
                            {p.is_enterprise && (
                                <div className="absolute left-3 top-3 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    ENTERPRISE
                                </div>
                            )}
                            <div className="flex flex-col gap-2 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-mono text-slate-400">{p.code}</p>
                                        <h3 className="text-lg font-bold text-slate-800">{p.name_ar}</h3>
                                        <p className="text-xs text-slate-500">{p.name_en}</p>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">#{p.sort_order}</div>
                                </div>
                                {p.description_ar && (
                                    <p className="line-clamp-2 text-xs text-slate-500">{p.description_ar}</p>
                                )}
                                <div className="mt-2 flex items-end gap-2 border-y border-slate-100 py-3">
                                    <div>
                                        <p className="text-xs text-slate-400">شهرياً</p>
                                        <p className="text-xl font-extrabold text-purple-600">
                                            {fmt(p.price_monthly, p.currency)}
                                        </p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200" />
                                    <div>
                                        <p className="text-xs text-slate-400">سنوياً</p>
                                        <p className="text-base font-bold text-slate-700">
                                            {fmt(p.price_yearly, p.currency)}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-md bg-slate-50 p-2 text-center">
                                        <p className="text-[10px] text-slate-400">أقصى عروض</p>
                                        <p className="font-bold text-slate-700">
                                            {p.max_offers == null ? "∞" : p.max_offers}
                                        </p>
                                    </div>
                                    <div className="rounded-md bg-slate-50 p-2 text-center">
                                        <p className="text-[10px] text-slate-400">فريق</p>
                                        <p className="font-bold text-slate-700">
                                            {p.max_team == null ? "∞" : p.max_team}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 max-h-36 overflow-auto rounded-lg bg-slate-50 p-2">
                                    <p className="mb-1 text-[10px] font-semibold text-slate-500">المميزات:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {FEATURES.map(f => (
                                            p.features?.[f.key] && (
                                                <span key={f.key}
                                                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                    ✓ {f.label_ar}
                                                </span>
                                            )
                                        ))}
                                        {Object.values(p.features || {}).every(v => !v) && (
                                            <span className="text-[10px] text-slate-400">لا توجد مميزات مفعّلة</span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => remove(p)}
                                        disabled={deletingId === p.id}
                                        className="rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                                    >
                                        {deletingId === p.id ? "..." : "حذف"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {dialogOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" dir="rtl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editing.id ? "تعديل الخطة" : "خطة جديدة"}
                            </h2>
                            <button onClick={() => setDialogOpen(false)}
                                    className="text-slate-400 hover:text-slate-700">
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <Field label="الكود (فريد)" labelEn="Code (unique)">
                                <input className="input" value={editing.code}
                                       onChange={e => patch("code", e.target.value)}
                                       placeholder="ex: pro_annual" />
                            </Field>
                            <Field label="ترتيب العرض" labelEn="Display order">
                                <input type="number" className="input" value={editing.sort_order}
                                       onChange={e => patch("sort_order", Number(e.target.value))} />
                            </Field>
                            <Field label="الاسم عربي">
                                <input className="input" value={editing.name_ar}
                                       onChange={e => patch("name_ar", e.target.value)}
                                       placeholder="الإبداعى المحترف" />
                            </Field>
                            <Field label="الاسم إنجليزي">
                                <input className="input" value={editing.name_en}
                                       onChange={e => patch("name_en", e.target.value)}
                                       placeholder="Creator Pro" />
                            </Field>
                            <Field label="الوصف عربي" full>
                                <textarea rows={2} className="input" value={editing.description_ar || ""}
                                          onChange={e => patch("description_ar", e.target.value)}
                                          placeholder="مميزات هذه الخطة بشكل مبسط..." />
                            </Field>
                            <Field label="الوصف إنجليزي" full>
                                <textarea rows={2} className="input" value={editing.description_en || ""}
                                          onChange={e => patch("description_en", e.target.value)} />
                            </Field>
                            <Field label="العملة">
                                <select className="input" value={editing.currency}
                                        onChange={e => patch("currency", e.target.value)}>
                                    <option value="IQD">IQD (دينار عراقي)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="SEK">SEK (kr)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="SAR">SAR (ريال)</option>
                                    <option value="AED">AED (درهم)</option>
                                </select>
                            </Field>
                            <Field label="الحد الأقصى للعروض" labelEn="Max offers (فارغ = لا حد)">
                                <input type="number" className="input"
                                       value={editing.max_offers == null ? "" : editing.max_offers}
                                       onChange={e => patch("max_offers",
                                           e.target.value === "" ? null : Number(e.target.value))}
                                       placeholder="100" />
                            </Field>
                            <Field label="السعر شهرياً" labelEn="Price monthly">
                                <div className="flex items-center gap-2">
                                    <input type="number" className="input" dir="ltr"
                                           value={editing.price_monthly}
                                           onChange={e => patch("price_monthly", e.target.value)} />
                                    <span className="text-xs text-slate-500 font-mono">{editing.currency}</span>
                                </div>
                            </Field>
                            <Field label="السعر سنوياً" labelEn="Price yearly">
                                <div className="flex items-center gap-2">
                                    <input type="number" className="input" dir="ltr"
                                           value={editing.price_yearly}
                                           onChange={e => patch("price_yearly", e.target.value)} />
                                    <span className="text-xs text-slate-500 font-mono">{editing.currency}</span>
                                </div>
                            </Field>
                            <Field label="أعضاء الفريق" labelEn="Max team (فارغ = لا حد)">
                                <input type="number" className="input"
                                       value={editing.max_team == null ? "" : editing.max_team}
                                       onChange={e => patch("max_team",
                                           e.target.value === "" ? null : Number(e.target.value))}
                                       placeholder="5" />
                            </Field>
                        </div>

                        <div className="mx-6 mb-3 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
                            <BoolChk label="مفعّل"       checked={editing.is_active}       onChange={v => patch("is_active", v)} />
                            <BoolChk label="الأكثر شعبية" checked={editing.is_popular}      onChange={v => patch("is_popular", v)} />
                            <BoolChk label="Enterprise"   checked={editing.is_enterprise}   onChange={v => patch("is_enterprise", v)} />
                        </div>

                        <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">المميزات: Features</p>
                                    <p className="mt-0.5 text-[10.5px] text-slate-500">
                                        ✅ فقط الميزات المفعّلة هنا ستظهر للمستخدم داخل التطبيق.
                                        انظر دليل المرجع بالأعلى للقيم الافتراضية لكل خطة.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(e => ({
                                            ...e,
                                            features: Object.fromEntries(FEATURES.map(f => [f.key, true])) as any,
                                        }))}
                                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                                        ✓ تحديد الكل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(e => ({
                                            ...e,
                                            features: Object.fromEntries(FEATURES.map(f => [f.key, false])) as any,
                                        }))}
                                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                                        إلغاء الكل
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {FEATURES.map(f => (
                                    <div key={f.key} className="rounded-xl ring-1 ring-slate-200 bg-white shadow-sm p-1">
                                        <BoolChk
                                            label={f.label_ar}
                                            labelEn={f.label + `  [${f.key}]`}
                                            hint={f.desc_ar}
                                            checked={!!editing.features?.[f.key]}
                                            onChange={() => toggleFeature(f.key)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setDialogOpen(false)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                إلغاء
                            </button>
                            <button onClick={save}
                                    disabled={saving}
                                    className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-60">
                                {saving ? "جاري الحفظ..." : (editing.id ? "حفظ التغييرات" : "إنشاء الخطة")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .input {
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    background: white;
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #0f172a;
                    outline: none;
                    transition: all .15s ease;
                }
                .input:focus {
                    border-color: #9333ea;
                    box-shadow: 0 0 0 3px rgba(147,51,234,.15);
                }
            `}</style>
        </div>
    );
}

function Field({ label, labelEn, full, children }: {
    label: string; labelEn?: string; full?: boolean; children: React.ReactNode;
}) {
    return (
        <div className={full ? "md:col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
            <label className="text-xs font-semibold text-slate-600">
                {label}
                {labelEn && <span className="mr-2 text-[10px] font-normal text-slate-400">({labelEn})</span>}
            </label>
            {children}
        </div>
    );
}

function BoolChk({ label, labelEn, hint, checked, onChange }: {
    label: string; labelEn?: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="inline-flex cursor-pointer items-start gap-3 select-none rounded-lg p-2 hover:bg-slate-50 transition">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
                   className="mt-0.5 h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                {labelEn && <span className="text-[10px] font-medium text-slate-400">{labelEn}</span>}
                {hint && <span className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{hint}</span>}
            </div>
        </label>
    );
}
