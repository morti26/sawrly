'use client';

import { useCallback, useEffect, useState } from 'react';

type CreatorLevelRow = {
    id: string;
    name: string;
    email: string;
    followers_count: number;
    completed_projects_30d: number;
    stories_30d: number;
    reports_30d: number | null;
    has_active_subscription: boolean;
    creator_level_key: 'basic' | 'top' | 'enterprise';
    creator_level_name: string;
    creator_level_icon: string;
};

type LevelsResponse = {
    window: '30d';
    rules: any;
    creators: CreatorLevelRow[];
};

export default function CreatorLevelsTable() {
    const [rows, setRows] = useState<CreatorLevelRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLevels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/admin/levels?limit=200', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Unauthorized. Please login again.');
                }
                throw new Error('Failed to fetch levels');
            }

            const data = (await res.json()) as LevelsResponse;
            setRows(Array.isArray(data?.creators) ? data.creators : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchLevels();
    }, [fetchLevels]);

    if (loading) {
        return <div className="text-right text-slate-600">جار التحميل...</div>;
    }

    if (error) {
        return (
            <div className="space-y-3">
                <div className="text-right text-red-600">{error}</div>
                <div className="flex justify-end">
                    <button
                        onClick={() => void fetchLevels()}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
                <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="px-4 py-3 font-semibold">المبدع</th>
                        <th className="px-4 py-3 font-semibold">المستوى</th>
                        <th className="px-4 py-3 font-semibold">مشاريع مكتملة (30d)</th>
                        <th className="px-4 py-3 font-semibold">متابعون</th>
                        <th className="px-4 py-3 font-semibold">ستوري (30d)</th>
                        <th className="px-4 py-3 font-semibold">بلاغات (30d)</th>
                        <th className="px-4 py-3 font-semibold">اشتراك</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50">
                            <td className="px-4 py-3">
                                <div className="font-semibold">{r.name}</div>
                                <div className="text-xs text-slate-500">{r.email}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold">
                                    <span>{r.creator_level_icon}</span>
                                    <span>{r.creator_level_name}</span>
                                </span>
                            </td>
                            <td className="px-4 py-3">{r.completed_projects_30d}</td>
                            <td className="px-4 py-3">{r.followers_count}</td>
                            <td className="px-4 py-3">{r.stories_30d}</td>
                            <td className="px-4 py-3">{r.reports_30d ?? '—'}</td>
                            <td className="px-4 py-3">{r.has_active_subscription ? '✅' : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

