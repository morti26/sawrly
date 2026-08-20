"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const ADMIN_LOCK_CSS = `
/* LÅS ADMIN-PANELENS EGNA FÄRGER (Enterprise Dark Rosa)
   SÅ ATT THEME ENGINE INTE ÖVERSKRIVER DEM NÄR DEN POLLAR!
   ======================================================== */
:root {
    --m3-primary: #ff4a97 !important;
    --m3-on-primary: #ffffff !important;
    --m3-primary-container: #5a2e4a !important;
    --m3-on-primary-container: #ffd9ea !important;
    --m3-secondary: #cc89b0 !important;
    --m3-on-secondary: #2a1522 !important;
    --m3-tertiary: #a0a9ff !important;
    --m3-on-tertiary: #12142e !important;
    --m3-surface: #151923 !important;
    --m3-on-surface: #ffffff !important;
    --m3-surface-container-lowest: #08090d !important;
    --m3-surface-container-low: #12161f !important;
    --m3-surface-container: #1a1d28 !important;
    --m3-surface-container-high: #232736 !important;
    --m3-surface-container-highest: #2c3143 !important;
    --m3-outline: #636878 !important;
    --m3-outline-variant: #2d303c !important;
    --m3-background: #151923 !important;
    --m3-on-background: #ffffff !important;
    --m3-error: #ff5449 !important;
    --m3-on-error: #ffffff !important;
    --m3-success: #4ade80 !important;
    --m3-warning: #fbbf24 !important;
    --m3-info: #60a5fa !important;
    --m3-accent-pink: #ff4a97 !important;
    --m3-on-accent-pink: #ffffff !important;
    --m3-text-primary: #ffffff !important;
    --m3-text-secondary: #b6b9c3 !important;
    --m3-text-tertiary: #7e8393 !important;
    --m3-menu-background: #13151d !important;
    --m3-border: #494c5a !important;
    --m3-border-light: rgba(255, 255, 255, 0.08) !important;
    --m3-surface-light: #2c3143 !important;

    --color-primary: #ff4a97 !important;
    --color-primary-light: #ff8ad4 !important;
    --color-primary-dark: #c93678 !important;
    --color-background: #161921 !important;
    --color-background-light: #1e2028 !important;
    --color-surface: #222530 !important;
    --color-surface-light: #2d3140 !important;
    --color-text-primary: #ffffff !important;
    --color-text-secondary: #b0b0b0 !important;
    --color-text-tertiary: #707070 !important;
    --color-status-success: #22c55e !important;
    --color-status-warning: #f59e0b !important;
    --color-status-error: #ef4444 !important;
    --color-status-info: #3b82f6 !important;
    --color-border: #3d3d4d !important;
    --color-border-light: #2d2d3d !important;

    --accent-rgb: 255, 74, 151 !important;
    --primary-rgb: 255, 74, 151 !important;

    --hero-gradient: linear-gradient(135deg, #1a1d28, #5a2e7d, #ff4a97) !important;
    --hero-start: #1a1d28 !important;
    --hero-mid: #5a2e7d !important;
    --hero-end: #ff4a97 !important;
}
`;

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
        { label: 'إدارة قوالب المظهر', href: '/admin/theme-templates' },
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
        <div dir="rtl" className="flex h-screen flex-row"
             style={{ backgroundColor: '#151923', color: '#FFFFFF' }}>
            {/* Lås admin UI färger mot Theme Engine override */}
            <style dangerouslySetInnerHTML={{ __html: ADMIN_LOCK_CSS }} />

            {/* SIDEBAR — hårdkodade färger oavsett tema */}
            <aside
                className="relative z-20 flex w-64 flex-col border-l shadow-nav"
                style={{
                    backgroundColor: '#1a1d28',
                    borderLeftColor: '#2d303c',
                }}
            >
                <div
                    className="mb-4 flex items-center gap-3 border-b px-6 py-8"
                    style={{ borderBottomColor: '#2d303c' }}
                >
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#FFFFFF' }}>
                        لوحة تحكم صورلي
                    </h1>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2.5 font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'ring-2 ring-pink-400/30'
                                        : 'hover:-translate-x-1'
                                }`}
                                style={{
                                    borderRadius: '12px',
                                    backgroundColor: isActive ? '#ff4a97' : 'transparent',
                                    color: isActive ? '#FFFFFF' : '#b6b9c3',
                                    boxShadow: isActive
                                        ? '0 6px 20px rgba(255, 74, 151, 0.22)'
                                        : 'none',
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    className="mt-auto border-t p-4"
                    style={{ borderTopColor: '#2d303c' }}
                >
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-center font-medium shadow-sm transition-colors"
                        style={{
                            borderRadius: '12px',
                            backgroundColor: '#ff5449',
                            color: '#FFFFFF',
                        }}
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main
                className={`flex-1 ${pathname === '/admin/theme-settings' ? 'theme-studio-main overflow-hidden' : 'overflow-y-auto'}`}
                style={{
                    backgroundColor: '#151923',
                    color: '#FFFFFF',
                }}
            >
                <div className={`mx-auto w-full p-4 sm:p-6 lg:p-8 ${pathname === '/admin/theme-settings' ? 'theme-studio-main-inner h-full max-w-[100rem] overflow-hidden' : 'max-w-7xl'}`}>{children}</div>
            </main>
        </div>
    );
}
