import UsersTable from '@/components/admin/UsersTable';

export default function AdminCreatorsPage() {
    return (
        <div dir="rtl" className="space-y-6">
            <div className="flex justify-between items-center bg-surface-card p-6 rounded-2xl shadow-sm border border-m3-surface-container-low">
                <div>
                    <h1 className="text-3xl font-black text-m3-on-surface tracking-tight">إدارة المبدعين</h1>
                    <p className="text-m3-on-surface-variant font-medium mt-1">إضافة، تعديل، وحذف حسابات المصورين والمبدعين</p>
                </div>
            </div>
            <div className="bg-surface-card p-6 rounded-2xl shadow-sm border border-m3-surface-container-low">
                <UsersTable role="creator" />
            </div>
        </div>
    );
}
