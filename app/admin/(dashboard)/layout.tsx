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
        { label: 'المستويات', href: '/admin/levels' },
        { label: 'أيقونات الحساب والاشتراك', href: '/admin/icon-settings' },
        { label: 'إعدادات مظهر التطبيق', href: '/admin/theme-settings' },
        { label: 'العروض', href: '/admin/offers' },
        { label: 'المشاريع', href: '/admin/projects' },
        { label: 'المدفوعات', href: '/admin/payments' },
        { label: 'خطط الاشتراك', href: '/admin/subscription-plans' },
        { label: 'المهام والمناقشات', href: '/admin/tasks' },
        { label: 'الإشعارات', href: '/admin/notifications' },
        { label: 'البلاغات', href: '/admin/reports' },
        { label: 'سجل التدقيق', href: '/admin/audit-logs' },
        { label: 'سجل الأخطاء', href: '/admin/ops-errors' },
        { label: 'الدعم', href: '/admin/support' },
        { label: 'الإعلانات', href: '/admin/banners' },
        { label: 'المتجر', href: '/admin/categories' },
        { label: 'محتوى الصفحات', href: '/admin/content-pages' },
        { label: 'الإعدادات', href: '/admin/settings' },
        { label: 'ميزات التطبيق', href: '/admin/app-features' },
        { label: 'جاهزية الإطلاق', href: '/admin/readiness' },
    ];

    const handleLogout = () => {
        document.cookie = 'admin_token=; path=/; max-age=0';
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    return (
        <div dir="rtl" className="flex h-screen flex-row bg-m3-background text-m3-on-background">
            <aside className="relative z-20 flex w-64 flex-col bg-m3-surface-container-highest shadow-nav">
                <div className="mb-4 flex items-center gap-3 border-b border-m3-outline-variant px-6 py-8">
                    <h1 className="text-2xl font-black tracking-tight text-m3-on-surface">لوحة تحكم صورلي</h1>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded-button px-4 py-2.5 font-medium transition-all duration-200 ${isActive
                                    ? 'bg-accent text-m3-on-accent shadow-button'
                                    : 'text-m3-on-surface-variant hover:-translate-x-1 hover:bg-m3-surface-container-high hover:text-m3-on-surface'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-m3-outline-variant p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-button bg-m3-error px-4 py-2.5 text-center font-medium text-m3-on-error shadow-sm transition-colors hover:bg-m3-error/90"
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-m3-background text-m3-on-surface">
                <div className="mx-auto max-w-7xl p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
