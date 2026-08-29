"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const ADMIN_LOCK_CSS = `
/* LÅS ADMIN-PANELENS EGNA FÄRGER (Light workspace + rosa accent)
   SÅ ATT THEME ENGINE INTE ÖVERSKRIVER DEM NÄR DEN POLLAR!
   Alla tokens som ThemeProvider skriver över låses här med !important.
   ======================================================== */
:root {
    --m3-primary: #ff4a97 !important;
    --m3-on-primary: #ffffff !important;
    --m3-primary-container: #ffd9ea !important;
    --m3-on-primary-container: #5a2e4a !important;
    --m3-primary-fixed: #ffd9ea !important;
    --m3-primary-fixed-dim: #ff8ad4 !important;
    --m3-on-primary-fixed: #4a1230 !important;
    --m3-on-primary-fixed-variant: #7c3a5a !important;
    --m3-secondary: #a35b7e !important;
    --m3-on-secondary: #ffffff !important;
    --m3-secondary-container: #ffd9ea !important;
    --m3-on-secondary-container: #5a2e4a !important;
    --m3-secondary-fixed: #ffd9ea !important;
    --m3-secondary-fixed-dim: #ffb0d8 !important;
    --m3-on-secondary-fixed: #4a1230 !important;
    --m3-on-secondary-fixed-variant: #7c3a5a !important;
    --m3-tertiary: #6b5fc4 !important;
    --m3-on-tertiary: #ffffff !important;
    --m3-tertiary-container: #e3dfff !important;
    --m3-on-tertiary-container: #1f1b5e !important;
    --m3-tertiary-fixed: #e3dfff !important;
    --m3-tertiary-fixed-dim: #c7bfff !important;
    --m3-on-tertiary-fixed: #1f1b5e !important;
    --m3-on-tertiary-fixed-variant: #4a4385 !important;
    --m3-error: #d32f2f !important;
    --m3-on-error: #ffffff !important;
    --m3-error-container: #ffdad6 !important;
    --m3-on-error-container: #410002 !important;
    --m3-success: #2e7d32 !important;
    --m3-on-success: #ffffff !important;
    --m3-success-container: #c8e6c9 !important;
    --m3-on-success-container: #003300 !important;
    --m3-warning: #ed6c02 !important;
    --m3-on-warning: #ffffff !important;
    --m3-warning-container: #ffe0b2 !important;
    --m3-on-warning-container: #3e2723 !important;
    --m3-info: #1565c0 !important;
    --m3-on-info: #ffffff !important;
    --m3-info-container: #bbdefb !important;
    --m3-on-info-container: #0d2a56 !important;
    --m3-surface: #ffffff !important;
    --m3-on-surface: #172033 !important;
    --m3-surface-dim: #e3e8f1 !important;
    --m3-surface-bright: #ffffff !important;
    --m3-surface-container-lowest: #ffffff !important;
    --m3-surface-container-low: #f8f9fc !important;
    --m3-surface-container: #ffffff !important;
    --m3-surface-container-high: #eef1f7 !important;
    --m3-surface-container-highest: #e3e8f1 !important;
    --m3-on-surface-variant: #465268 !important;
    --m3-outline: #667085 !important;
    --m3-outline-variant: #cbd3e1 !important;
    --m3-background: #f4f6fb !important;
    --m3-on-background: #172033 !important;
    --m3-inverse-surface: #172033 !important;
    --m3-inverse-on-surface: #ffffff !important;
    --m3-inverse-primary: #ff8ad4 !important;
    --m3-shadow: #000000 !important;
    --m3-scrim: #000000 !important;
    --m3-divider: #d5dce8 !important;
    --m3-splash: #ff4a97 !important;
    --m3-disabled: #e3e8f1 !important;
    --m3-on-disabled: #8a93a6 !important;
    --m3-disabled-container: #eef1f7 !important;
    --m3-card-background: #ffffff !important;
    --m3-card-border: #d5dce8 !important;
    --m3-badge: #ff4a97 !important;
    --m3-on-badge: #ffffff !important;
    --m3-snackbar-background: #172033 !important;
    --m3-snackbar-text: #ffffff !important;
    --m3-shimmer-base: #eef1f7 !important;
    --m3-shimmer-highlight: #ffffff !important;
    --m3-accent-pink: #ff4a97 !important;
    --m3-on-accent-pink: #ffffff !important;
    --m3-menu-background: #ffffff !important;
    --m3-text-primary: #172033 !important;
    --m3-text-secondary: #465268 !important;
    --m3-text-tertiary: #647188 !important;
    --m3-border: #b9c4d5 !important;
    --m3-border-light: #d5dce8 !important;
    --m3-surface-light: #eef1f7 !important;
    --m3-hero-start: #f4f6fb !important;
    --m3-hero-mid: #ffd9ea !important;
    --m3-hero-end: #ff4a97 !important;

    --color-primary: #ff4a97 !important;
    --color-primary-light: #ff8ad4 !important;
    --color-primary-dark: #c93678 !important;
    --color-background: #f4f6fb !important;
    --color-background-light: #f8f9fc !important;
    --color-surface: #ffffff !important;
    --color-surface-light: #eef1f7 !important;
    --color-text-primary: #172033 !important;
    --color-text-secondary: #465268 !important;
    --color-text-tertiary: #647188 !important;
    --color-status-success: #2e7d32 !important;
    --color-status-warning: #ed6c02 !important;
    --color-status-error: #d32f2f !important;
    --color-status-info: #1565c0 !important;
    --color-border: #b9c4d5 !important;
    --color-border-light: #d5dce8 !important;

    --accent-rgb: 255, 74, 151 !important;
    --primary-rgb: 255, 74, 151 !important;

    --hero-gradient: linear-gradient(135deg, #f4f6fb, #ffd9ea, #ff4a97) !important;
    --hero-start: #f4f6fb !important;
    --hero-mid: #ffd9ea !important;
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
             style={{ backgroundColor: '#f4f6fb', color: '#172033' }}>
            {/* Lås admin UI färger mot Theme Engine override */}
            <style dangerouslySetInnerHTML={{ __html: ADMIN_LOCK_CSS }} />

            {/* SIDEBAR — hårdkodade färger oavsett tema */}
            <aside
                className="relative z-20 flex w-64 flex-col border-l shadow-nav"
                style={{
                    backgroundColor: '#ffffff',
                    borderLeftColor: '#d5dce8',
                }}
            >
                <div
                    className="mb-4 flex items-center gap-3 border-b px-6 py-8"
                    style={{ borderBottomColor: '#d5dce8' }}
                >
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#172033' }}>
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
                                    color: isActive ? '#FFFFFF' : '#465268',
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
                    style={{ borderTopColor: '#d5dce8' }}
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
                    backgroundColor: '#f4f6fb',
                    color: '#172033',
                }}
            >
                <div className={`mx-auto w-full p-4 sm:p-6 lg:p-8 ${pathname === '/admin/theme-settings' ? 'theme-studio-main-inner h-full max-w-[100rem] overflow-hidden' : 'max-w-7xl'}`}>{children}</div>
            </main>
        </div>
    );
}
