import CreatorLevelsTable from './creator-levels-table';

export default function AdminLevelsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-right">مستويات المبدعين</h2>
                <p className="text-right text-sm text-slate-600">
                    نافذة القياس: آخر 30 يوم • المستوى الاحترافي يتطلب اشتراك فعّال
                </p>
            </div>

            <div className="bg-white p-6 rounded shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-lg">🥈</div>
                            <div className="text-right font-bold">مميز</div>
                        </div>
                        <ul className="mt-3 space-y-1 text-right text-sm text-slate-700">
                            <li>≥ 3 مشاريع مكتملة (30 يوم)</li>
                            <li>≥ 50 متابع</li>
                            <li>≥ 4 ستوري (30 يوم)</li>
                            <li>≤ 3 بلاغات (30 يوم)</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-lg">🥇</div>
                            <div className="text-right font-bold">احترافي</div>
                        </div>
                        <ul className="mt-3 space-y-1 text-right text-sm text-slate-700">
                            <li>اشتراك فعّال</li>
                            <li>≥ 10 مشاريع مكتملة (30 يوم)</li>
                            <li>≥ 200 متابع</li>
                            <li>≥ 8 ستوري (30 يوم)</li>
                            <li>≤ 1 بلاغ (30 يوم)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <CreatorLevelsTable />
            </div>
        </div>
    );
}
