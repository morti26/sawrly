"use client";

import { useCallback, useEffect, useState } from 'react';

interface OpsErrorRow {
    id: string;
    source: string;
    level: 'error' | 'warn';
    message: string;
    request_path: string | null;
    details: unknown;
    created_at: string;
}

const levelStyle: Record<OpsErrorRow['level'], string> = {
    error: 'bg-red-100 text-red-700',
    warn: 'bg-amber-100 text-amber-700',
};

export default function OpsErrorsPage() {
    const [items, setItems] = useState<OpsErrorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/ops-errors?limit=200', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'تعذر تحميل سجل الأخطاء');
            }
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchItems();
    }, [fetchItems]);

    return (
        <div dir="rtl" className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-m3-on-surface">سجل أخطاء التشغيل</h1>
                <button
                    type="button"
                    onClick={() => void fetchItems()}
                    className="rounded-lg bg-m3-on-surface px-4 py-2 text-m3-on-surface hover:bg-m3-surface-container-high"
                >
                    تحديث
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-lg border border-m3-outline-variant/60 bg-surface-card p-8 text-center text-m3-on-surface-variant">
                    جاري تحميل السجل...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-m3-outline-variant/60 shadow-sm">
                    <table className="min-w-full bg-surface-card text-sm">
                        <thead>
                            <tr className="border-b border-m3-outline-variant/60 bg-m3-background">
                                <th className="px-4 py-3 text-right font-semibold text-m3-on-surface-variant">المصدر</th>
                                <th className="px-4 py-3 text-right font-semibold text-m3-on-surface-variant">المستوى</th>
                                <th className="px-4 py-3 text-right font-semibold text-m3-on-surface-variant">الرسالة</th>
                                <th className="px-4 py-3 text-right font-semibold text-m3-on-surface-variant">المسار</th>
                                <th className="px-4 py-3 text-right font-semibold text-m3-on-surface-variant">الوقت</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-m3-background">
                                    <td className="px-4 py-3 font-mono text-xs text-m3-on-surface">{item.source}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${levelStyle[item.level]}`}>
                                            {item.level === 'error' ? 'خطأ' : 'تحذير'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-m3-on-surface">{item.message}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-m3-on-surface-variant" dir="ltr">
                                        {item.request_path || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-m3-on-surface-variant">
                                        {new Date(item.created_at).toLocaleString('ar-IQ')}
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-m3-on-surface-variant">
                                        لا توجد أخطاء مسجلة حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
