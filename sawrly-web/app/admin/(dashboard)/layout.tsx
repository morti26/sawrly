"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { label: 'لوحة القيادة', href: '/admin/dashboard' },
        { label: 'سلايدر الرئيسية', href: '/admin/home-slider' },
        { label: 'المستخدمون', href: '/admin/users' },
        { label: 'المبدعون', href: '/admin/creators' },
        { label: 'العروض', href: '/admin/offers' },
        { label: 'المشاريع', href: '/admin/projects' },
        { label: 'المدفوعات', href: '/admin/payments' },
        { label: 'الإشعارات', href: '/admin/notifications' },
        { label: 'البلاغات', href: '/admin/reports' },
        { label: 'سجل التدقيق', href: '/admin/audit-logs' },
        { label: 'سجل الأخطاء', href: '/admin/ops-errors' },
        { label: 'الدعم', href: '/admin/support' },
        { label: 'الإعلانات', href: '/admin/banners' },
        { label: 'المتجر', href: '/admin/categories' },
        { label: 'محتوى الصفحات', href: '/admin/content-pages' },
        { label: 'الإعدادات', href: '/admin/settings' },
        { label: 'جاهزية الإطلاق', href: '/admin/readiness' },
    ];

    const handleLogout = () => {
        document.cookie = 'admin_token=; path=/; max-age=0';
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    return (
        <div dir="rtl" className="flex h-screen flex-row bg-gray-50 text-gray-900">
            <aside className="relative z-20 flex w-64 flex-col bg-slate-900 shadow-2xl">
                <div className="mb-4 flex items-center gap-3 border-b border-slate-800 px-6 py-8">
                    <h1 className="text-2xl font-black tracking-tight text-white">لوحة تحكم صورلي</h1>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded-lg px-4 py-2.5 font-medium transition-all duration-200 ${isActive
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                                    : 'text-slate-300 hover:-translate-x-1 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-800 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-center font-medium text-white shadow-sm transition-colors hover:bg-red-600"
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-7xl p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
