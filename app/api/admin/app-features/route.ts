import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PANEL_ROLES, requireRole } from '@/lib/auth';
import { APP_SETTING_KEYS, getAppSetting, setAppSetting } from '@/lib/app_settings';

const DEFAULT_DOCS = [
    { icon: '⌂', title: 'الرئيسية', page: 'HomeScreen', description: 'الصفحة الرئيسية لاكتشاف أحدث العروض والمحتوى.', details: 'تتضمن الصورة الرئيسية، العروض المقترحة، الأقسام والخصومات.' },
    { icon: '⌕', title: 'البحث', page: 'GlobalSearchScreen', description: 'البحث عن المبدعين والعروض بسرعة.', details: 'يدعم البحث النصي وتبويبي المبدعين والعروض.' },
    { icon: '▦', title: 'المتجر والأقسام', page: 'CategoriesScreen', description: 'استعراض الأقسام والمنتجات والعروض حسب التصنيف.', details: 'تظهر أيقونة الشبكة عند فتح هذه الصفحة.' },
    { icon: '▢', title: 'طلباتي', page: 'OrdersScreen', description: 'متابعة الطلبات والحجوزات الخاصة بالمستخدم.', details: 'تعرض حالة الطلب وتفاصيله والتحديثات المرتبطة به.' },
    { icon: '♙', title: 'الملف الشخصي', page: 'ProfileScreen', description: 'إدارة الحساب والملف الشخصي والإعدادات.', details: 'تتضمن بيانات المستخدم وتعديل الملف والاشتراك والإشعارات.' },
];

function validDocs(value: unknown) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 20) return null;
    return value.map((item, index) => ({
        icon: typeof item?.icon === 'string' ? item.icon.slice(0, 4) : DEFAULT_DOCS[index].icon,
        title: typeof item?.title === 'string' ? item.title.slice(0, 120) : DEFAULT_DOCS[index].title,
        page: typeof item?.page === 'string' ? item.page.slice(0, 120) : (DEFAULT_DOCS[index]?.page || `CustomPage${index + 1}`),
        description: typeof item?.description === 'string' ? item.description.slice(0, 500) : DEFAULT_DOCS[index].description,
        details: typeof item?.details === 'string' ? item.details.slice(0, 700) : DEFAULT_DOCS[index].details,
    }));
}

export async function GET(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (auth.error || !auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    try {
        const stored = await getAppSetting(APP_SETTING_KEYS.appNavigationDocs);
        let docs = DEFAULT_DOCS;
        if (stored) {
            try { docs = validDocs(JSON.parse(stored)) || DEFAULT_DOCS; } catch { /* use defaults */ }
        }
        return NextResponse.json({ docs });
    } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
    const auth = requireRole(req, ADMIN_PANEL_ROLES);
    if (auth.error || !auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    try {
        const body = await req.json();
        const docs = validDocs(body?.docs);
        if (!docs) return NextResponse.json({ error: 'Invalid documentation payload' }, { status: 400 });
        await setAppSetting(APP_SETTING_KEYS.appNavigationDocs, JSON.stringify(docs));
        return NextResponse.json({ docs });
    } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); }
}
