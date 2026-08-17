'use client';

import { useEffect, useRef, useState } from 'react';

type Doc = { icon: string; title: string; page: string; description: string; details: string };
const fallback: Doc[] = [
    { icon: '⌂', title: 'الرئيسية', page: 'HomeScreen', description: 'الصفحة الرئيسية لاكتشاف أحدث العروض والمحتوى.', details: 'تتضمن الصورة الرئيسية والعروض المقترحة والأقسام والخصومات.' },
    { icon: '⌕', title: 'البحث', page: 'GlobalSearchScreen', description: 'البحث عن المبدعين والعروض بسرعة.', details: 'يدعم البحث النصي وتبويبي المبدعين والعروض.' },
    { icon: '▦', title: 'المتجر والأقسام', page: 'CategoriesScreen', description: 'استعراض الأقسام والمنتجات والعروض حسب التصنيف.', details: 'تظهر أيقونة الشبكة عند فتح هذه الصفحة.' },
    { icon: '▢', title: 'طلباتي', page: 'OrdersScreen', description: 'متابعة الطلبات والحجوزات الخاصة بالمستخدم.', details: 'تعرض حالة الطلب وتفاصيله والتحديثات المرتبطة به.' },
    { icon: '♙', title: 'الملف الشخصي', page: 'ProfileScreen', description: 'إدارة الحساب والملف الشخصي والإعدادات.', details: 'تتضمن بيانات المستخدم وتعديل الملف والاشتراك والإشعارات.' },
];

export default function NavigationDocsEditor() {
    const [docs, setDocs] = useState<Doc[]>(fallback);
    const [state, setState] = useState('جاري التحميل…');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => { fetch('/api/admin/app-features').then(r => r.json()).then(x => { if (Array.isArray(x.docs)) setDocs(x.docs); setState('جاهز للتحرير'); }).catch(() => setState('تعذر التحميل')); }, []);
    const save = (next: Doc[]) => {
        setDocs(next); setState('جاري الحفظ…');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(async () => { try { const r = await fetch('/api/admin/app-features', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docs: next }) }); setState(r.ok ? 'تم الحفظ تلقائياً ✓' : 'فشل الحفظ'); } catch { setState('فشل الحفظ'); } }, 500);
    };
    const update = (i: number, key: keyof Doc, value: string) => save(docs.map((d, n) => n === i ? { ...d, [key]: value } : d));
    return <section className="rounded-2xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-m3-on-background">تحرير صفحات التنقل والتوثيق</h2><p className="text-sm text-m3-on-surface-variant">كل تعديل يُحفظ تلقائياً بعد نصف ثانية.</p></div><span className="text-xs text-m3-primary">{state}</span></div>
        <div className="grid gap-4 md:grid-cols-2">
            {docs.map((d, i) => <article key={i} className="rounded-xl border border-m3-outline-variant/60 bg-m3-surface-container-lowest p-4">
                <div className="grid grid-cols-[3rem_1fr] gap-2"><input value={d.icon} onChange={e => update(i, 'icon', e.target.value)} className="h-10 rounded-lg border border-m3-outline-variant bg-surface-card text-center" maxLength={4} /><input value={d.title} onChange={e => update(i, 'title', e.target.value)} className="h-10 rounded-lg border border-m3-outline-variant bg-surface-card px-3 text-right font-semibold" /></div>
                <input value={d.page} onChange={e => update(i, 'page', e.target.value)} className="mt-2 h-8 w-full rounded border border-m3-outline-variant bg-surface-card px-2 font-mono text-xs" placeholder="PageComponent" />
                <textarea value={d.description} onChange={e => update(i, 'description', e.target.value)} className="mt-2 min-h-16 w-full rounded-lg border border-m3-outline-variant bg-surface-card p-2 text-sm" />
                <textarea value={d.details} onChange={e => update(i, 'details', e.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-m3-outline-variant bg-surface-card p-2 text-sm" />
            </article>)}
        </div>
        <button type="button" onClick={() => save([...docs, { icon: '✦', title: 'صفحة جديدة', page: 'NewPage', description: 'وصف الصفحة الجديدة', details: 'تفاصيل ووظائف الصفحة الجديدة.' }])} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">+ إضافة صفحة جديدة</button>
    </section>;
}
