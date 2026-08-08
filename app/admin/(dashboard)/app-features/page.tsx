"use client";

/**
 * صفحة "ميزات التطبيق" - قائمة شاملة بكل ما يمكن لتطبيق Sawrly (صورلي) على الجوال فعله.
 * تُستخدم كمرجع سريع في لوحة التحكم لرؤية ما هو مُنفذ بالفعل في النسخة الحالية.
 */

type FeatureStatus = 'ready' | 'partial' | 'planned';

interface AppFeature {
    icon: string;
    title: string;
    description: string;
    status: FeatureStatus;
    releaseVersion: string;
    notes?: string;
}

interface AppFeatureGroup {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    features: AppFeature[];
}

const STATUS_META: Record<FeatureStatus, { label: string; className: string; dot: string }> = {
    ready: {
        label: 'مُنفذ وجاهز',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    partial: {
        label: 'جزئي / بحاجة لاختبار',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    planned: {
        label: 'مخطط له',
        className: 'bg-m3-surface-container-lowest text-m3-on-surface-variant border-m3-outline-variant/60',
        dot: 'bg-m3-outline-variant',
    },
};

const TOTAL_FEATURES: AppFeatureGroup[] = [
    {
        id: 'auth_profile',
        title: 'تسجيل الدخول والملف الشخصي',
        subtitle: 'إنشاء حسابات المستخدمين والمبدعين وإدارة الملف الشخصي',
        icon: '👤',
        features: [
            {
                icon: '📱',
                title: 'تسجيل دخول / إنشاء حساب (البريد+كلمة المرور)',
                description: 'يستطيع المستخدمون والمبدعون التسجيل وتسجيل الدخول عبر API مُصادق JWT.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🎨',
                title: 'صفحة تعديل الملف الشخصي (مرتبة ومفصولة)',
                description: 'حقول مقسّمة إلى أقسام: الصورة/الغلاف، الاسم والوصف، الدولة والمدينة، الجنس، كلمة المرور.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'تم تحسين المسافات بين الحقول وإضافة ظلال BoxShadow P4.',
            },
            {
                icon: '🌍',
                title: 'حقل الدولة + المدينة (مستوى المبدع)',
                description: 'عنوان خدمة "المدينة - الدولة" يظهر أسفل السيرة الذاتية في صفحة المبدع.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P6: يتضمن بائعة العراق + دول العالم.',
            },
            {
                icon: '⚧️',
                title: 'أيقونة الجنس (ذكر / أنثى) داخل صفحة الملف الشخصي',
                description: 'تظهر أيقونة بجانب اسم المستخدم/المبدع بألوان من سمة لوحة التحكم.',
                status: 'ready',
                releaseVersion: 'v1.2.1',
                notes: 'P5: تم ربط الألوان بـ AppThemeService من الإعدادات.',
            },
            {
                icon: '📷',
                title: 'رفع صورة الملف الشخصي + صورة الغلاف',
                description: 'يستطيع المبدع تحديث صورتين شخصيتين عبر الملف الشخصي.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '💬',
                title: 'السيرة الذاتية / النبذة التعريفية + مجالات الخدمة',
                description: 'نص حر لمقدمة المبدع مع عرض المنطقة الجغرافية للخدمة.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🏷️',
                title: 'شارة المستوى للمبدع حسب النقاط والاشتراك',
                description: 'مستويات المبدعين (الفضي، الذهبي، البلاتيني) مع أيقونات مخصصة من إعدادات لوحة التحكم.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
        ],
    },
    {
        id: 'creator_tools',
        title: 'أدوات المبدع (رفع المحتوى والعروض)',
        subtitle: 'كل ما يحتاجه المبدع لإدارة عمله داخل التطبيق',
        icon: '🎬',
        features: [
            {
                icon: '➕',
                title: 'زر "إضافة" في صفحة المبدع (+) للرفع السريع',
                description: 'قائمة منبثقة تحتوي على "إنشاء عرض" و"رفع صورة" و"رفع فيديو".',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
                notes: 'تم إصلاح مشكلة عدم الاستجابة بسبب Provider watch→read.',
            },
            {
                icon: '📸',
                title: 'رفع صور (حتى 8 صور لغير المشتركين)',
                description: 'حد أقصى 8 صور للمرحلة المجانية، وتتطلب زيادة العدد اشتراك شهري أو سنوي.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P9: الحد السابق كان 12 صورة.',
            },
            {
                icon: '🎥',
                title: 'رفع فيديوهات (حد أقصى 4 × 60 ثانية لغير المشتركين)',
                description: '4 مقاطع قصوى مدتها 60 ثانية لكل مقطع. يتطلب تجاوز الحد اشتراك.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P8: الحدود مفعّلة عبر MediaService.',
            },
            {
                icon: '📋',
                title: 'إنشاء عروض (حد أقصى 2 عروض لغير المشتركين)',
                description: 'كل مبدع يمكنه نشر عروض أسعار. 2 عروض في الحد المجاني، وتتطلب زيادة العدد اشتراك.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P10: رسالة توضيحية عند الوصول للحد.',
            },
            {
                icon: '⏱️',
                title: 'قائمة تقدم التحميل (صورة/فيديو/عرض)',
                description: 'نافذة منبثقة تعرض كل ملف يتم رفعه مع حالاته: "في الانتظار"، "جاري الرفع"، "تم"، "فشل" بألوان الحالة.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P7: لائحة كاملة لكل عنصر مع اسم الملف وحجمه (MB).',
            },
            {
                icon: '🏷️',
                title: 'عرض الخصم + سعر المدفوع الجزئي + كامل',
                description: 'نماذج تسعير متعددة لكل عرض: نسبة الخصم، دفعة مقدمة + المبلغ الكامل.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🗑️',
                title: 'حذف العروض التي رفعها المبدع بنفسه',
                description: 'تأكيد حذف + مخرجات تصحيح أخطاء عند فشل الحذف.',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
                notes: 'P11: إصلاح مشكلة السياق Provider التي كانت تمنع الحذف أحياناً.',
            },
            {
                icon: '📝',
                title: 'تعديل العروض التي رفعها المبدع',
                description: 'يمكن إعادة فتح صفحة إنشاء العرض لتعديل الصور والفيديو والسعر والوصف.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '📅',
                title: 'جدول مواعيد المبدع + إنشاء أحداث تقويم',
                description: 'مستخدمو التطبيق يستطيعون حجز مواعيد مع المبدع عبر صفحته.',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
            },
            {
                icon: '⚖️',
                title: 'حدود الرفع وحوار الاشتراك المطلوب',
                description: 'عند تجاوز حدود الصور/الفيديوهات/العروض تظهر نافذة ترشد لشراء باقة.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
            },
        ],
    },
    {
        id: 'client_features',
        title: 'ميزات المستخدم/العميل',
        subtitle: 'تصفح المحتوى، الحفظ، الشراء',
        icon: '🛍️',
        features: [
            {
                icon: '🔎',
                title: 'الصفحة الرئيسية + عروض مقترحة + سلايدر صور',
                description: 'عناصر مختلفة: سلايدر علوي + شبكة عروض مقترحة + فئات.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '❤️',
                title: 'حفظ العروض كمفضلة + تبويب "محفوظات"',
                description: 'تبويب خاص في ملف المستخدم العرضي يعرض كل العروض التي حفظها.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P2: يعتمد على MediaService.fetchSavedOffers().',
            },
            {
                icon: '📑',
                title: 'تبويب "مشترياتي" للعميل',
                description: 'قائمة بطلبات الشراء التي نفذها العميل سابقاً.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🛒',
                title: 'سلة التسوق + زر "شراء الآن"',
                description: 'عمليات الدفع الأساسية عبر السلة.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '💳',
                title: 'بوابة الدفع الإلكتروني (اختيارية) + الدفع اليدوي',
                description: 'دعم بوابة دفع خارجية عبر إعدادات لوحة التحكم، مع خيار الدفع اليدوي (كاش/تحويل).',
                status: 'partial',
                releaseVersion: 'v1.0.0',
                notes: 'الدعم الأساسي موجود، تفعيل البوابة يتطلب إعداد مفاتيح API من الإعدادات.',
            },
            {
                icon: '⭐',
                title: 'صفحة تفاصيل العرض + صور متعددة مع نقاط التنقل',
                description: 'عارض صور 360° مع نقاط تمييز أسفل الصور لسعر المنتج.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '👨‍🎨',
                title: 'اسم المبدع داخل تفاصيل العرض (قابل للنقر للذهاب لصفحته)',
                description: 'عنصر مُنقّل أسفل عنوان العرض: عند النقر ينتقل المستخدم إلى صفحة المبدع صاحب العرض.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P14: معامل userId جديد في CreatorProfileScreen.',
            },
            {
                icon: '🔗',
                title: 'فتح العرض من داخل صفحة المبدع (بدون تجميد أو تحطم)',
                description: 'معالجة أخطاء JSON داخل شبكة عروض المبدع وإظهار رسالة للمستخدم في حال الفشل.',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
                notes: 'P3: إضافة try-catch مع طباعة سجل الأخطاء عند الفشل.',
            },
        ],
    },
    {
        id: 'moderation',
        title: 'الإبلاغات والإشراف',
        subtitle: 'أدوات الإبلاغ لحماية المستخدمين',
        icon: '🚩',
        features: [
            {
                icon: '🚩',
                title: 'زر الإبلاغ عن كل عرض',
                description: 'زر علم (flag) داخل شريط تطبيق صفحة تفاصيل العرض. يرسل البلاغات إلى صفحة "البلاغات" في لوحة التحكم.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P1: الحقل targetType في حوار البلاغ = offer.',
            },
            {
                icon: '👤',
                title: 'زر الإبلاغ عن أي ملف شخصي (مبدع/عميل)',
                description: 'زر علم في شريط تطبيق صفحة الملف الشخصي.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P15: الحقل targetType في حوار البلاغ = profile.',
            },
            {
                icon: '📰',
                title: 'زر الإبلاغ عن كل "ستوري" / حالة',
                description: 'زر علم داخل عارض الحالة/الستوري. يرسل إلى نفس صفحة البلاغات مع targetType=story.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P13.',
            },
            {
                icon: '🧾',
                title: 'صفحة البلاغات الموحّدة في لوحة التحكم',
                description: 'تصفية حسب النوع والحالة (معلّق / قيد المراجعة / مُحلّل / مرفوض).',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
        ],
    },
    {
        id: 'stories',
        title: 'الستوريات / الحالات (Stories)',
        subtitle: 'نشر محتوى قصير الأجل',
        icon: '📰',
        features: [
            {
                icon: '🆕',
                title: 'نشر ستوري بصورة أو فيديو قصير من المبدع',
                description: 'زيادة تفاعل المبدع مع جمهوره عبر المحتوى المؤقت.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '⏰',
                title: 'عرض وقت نشر الستوري للجميع',
                description: 'وقت النشر مر أسفل شريط عارض الستوري "نُشرت منذ ساعة".',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P12.',
            },
            {
                icon: '⏳',
                title: 'مدة صلاحية 24 ساعة + إخفاء تلقائي بعد انتهاء المدة',
                description: 'فلتر TTL داخل StatusService يزيل الستوريات التي انتهت صلاحيتها أو تتجاوز 25 ساعة.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
                notes: 'P12: إصلاح أخطاء تحليل التاريخ وعرض الروابط /api/uploads.',
            },
            {
                icon: '▶️',
                title: 'عارض الستوريات مع التنقل التلقائي واليدوي',
                description: 'شرائح ألوان أعلى الصفحة تشير إلى الستوري الحالي + زر السابق/التالي.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
        ],
    },
    {
        id: 'theme_admin',
        title: 'التكامل مع سمة لوحة التحكم',
        subtitle: 'كل ما يمكن تحكمه من إعدادات لوحة التحكم وينعكس على التطبيق فوراً',
        icon: '🎨',
        features: [
            {
                icon: '🎨',
                title: 'تغيير ألوان السمة (أساسي/ثانوي/وردي/نصي...)',
                description: 'تطبيق جميع الألوان عبر AppThemeService على الصفحات الرئيسية، الملف الشخصي، تعديل الملف، إنشاء العروض.',
                status: 'ready',
                releaseVersion: 'v1.2.1',
                notes: 'تحميل من /api/config/public عند بدء التطبيق + استعادة القيم الافتراضية عند فشل الطلب.',
            },
            {
                icon: '🌀',
                title: 'تغيير اتجاه زاوية التدرج اللوني + الظلال',
                description: 'تأثيرات "الكارد" والزر (الظل، نصف قطر الزوايا) قابلة للتخصيص من الإعدادات.',
                status: 'ready',
                releaseVersion: 'v1.2.1',
            },
            {
                icon: '🔳',
                title: 'أيقونات شريط التنقل السفلي',
                description: '5 أيقونات (الرئيسية، البحث، +الإضافة، السلة، الملف) قابلة للتغيير من صفحة أيقونات الحساب والاشتراك.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🎫',
                title: 'أيقونات اشتراكات الحساب ومستويات المبدعين',
                description: 'كل مستوى/باقة لها أيقونتها الخاصة التي تعرض في الملف الشخصي وشريط التنقل.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🔄',
                title: 'تحديث فوري للسمة عند إعادة فتح التطبيق من الخلفية',
                description: 'عند العودة للتطبيق بعد أن كان في الخلفية، يتم تحديث السمة إجبارياً من السيرفر forceRefresh.',
                status: 'ready',
                releaseVersion: 'v1.2.1',
            },
        ],
    },
    {
        id: 'monetization',
        title: 'الاشتراكات والمستويات',
        subtitle: 'حزم الأعضاء ومستويات المبدعين',
        icon: '💎',
        features: [
            {
                icon: '🗓️',
                title: 'خطط الاشتراك الشهري والسنوي',
                description: 'إدارة من صفحة خطط الاشتراك في لوحة التحكم. التطبيق يقرها عند زيادة حدود الرفع.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🏅',
                title: 'مستويات المبدعين (القياس خلال 30 يوماً)',
                description: 'حساب تلقائي للمستويات بناءً على المشاريع والبلاغات والمبيعات + أيقونات مخصصة.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '♾️',
                title: 'خطة غير محدودة (الصور/الفيديوهات)',
                description: 'حدود الرفع 8/4 في الحد المجاني → غير محدودة في باقة Plus/السنوية.',
                status: 'ready',
                releaseVersion: 'v1.2.0',
            },
        ],
    },
    {
        id: 'technical',
        title: 'مستوى تقني وضمان الجودة',
        subtitle: 'أمور تحت غطاء المحرك تضمن استقرار التطبيق',
        icon: '🛠️',
        features: [
            {
                icon: '🌐',
                title: 'تطبيق URL معالج وسائط عام (normalizePublicMediaUrl)',
                description: 'تطبيق مركزي لتصحيح مسارات الملفات من الخادم. إزالة تلقائية للعبارة /api/ المتكررة.',
                status: 'ready',
                releaseVersion: 'v1.0.0-customer-ready',
                notes: 'يُستخدم الآن في OfferCard / OfferDetails / CreatorStatus / Banners.',
            },
            {
                icon: '🔧',
                title: 'تحليل JSON متوافق (camelCase + snake_case + PascalCase)',
                description: 'دعم 3 أنماط تسمية حقول API مختلفة في Offer.fromJson لتجنب مشاكل الإصدارات.',
                status: 'ready',
                releaseVersion: 'v1.0.0',
            },
            {
                icon: '🧪',
                title: 'Flutter analyze: 0 errors',
                description: 'كل ملفات المصدر تمر بدون أخطاء في مرحلة التحليل الثابت.',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
            },
            {
                icon: '🔙',
                title: 'استراتيجية Rollback متكاملة',
                description: 'نسخ احتياطية مخصصة لكل ملف + إمكانية استرجاع أي نسخة من العلامات (5 علامات حتى الآن).',
                status: 'ready',
                releaseVersion: 'v1.2.2-hotfix',
            },
            {
                icon: '📦',
                title: 'إنشاء APK مُقسّم بنجاح لكل معمارية',
                description: 'توليد app-arm64-v8a-release.apk كنسخة أساسية للعملاء.',
                status: 'ready',
                releaseVersion: 'v1.1.0-customer-release',
            },
        ],
    },
];

function StatsBar() {
    const total = TOTAL_FEATURES.reduce((s, g) => s + g.features.length, 0);
    const counts = TOTAL_FEATURES.reduce(
        (acc, group) => {
            for (const f of group.features) {
                acc[f.status] += 1;
            }
            return acc;
        },
        { ready: 0, partial: 0, planned: 0 }
    );
    const pctReady = total ? Math.round((counts.ready / total) * 100) : 0;
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-m3-outline-variant/60 bg-surface-card p-5 shadow-sm">
                <p className="text-xs font-medium text-m3-on-surface-variant">إجمالي الميزات</p>
                <p className="mt-2 text-3xl font-black text-m3-on-background">{total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <p className="text-xs font-medium text-emerald-700">مُنفّذة وجاهزة</p>
                <p className="mt-2 text-3xl font-black text-emerald-800">{counts.ready}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pctReady}%` }}
                    />
                </div>
                <p className="mt-1 text-xs text-emerald-700">{pctReady}% من الميزات</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <p className="text-xs font-medium text-amber-700">جزئي / بحاجة لاختبار</p>
                <p className="mt-2 text-3xl font-black text-amber-800">{counts.partial}</p>
            </div>
            <div className="rounded-xl border border-m3-outline-variant/60 bg-m3-background p-5 shadow-sm">
                <p className="text-xs font-medium text-m3-on-surface-variant">مخطط له (ليس بعد)</p>
                <p className="mt-2 text-3xl font-black text-m3-on-surface">{counts.planned}</p>
            </div>
        </div>
    );
}

export default function AppFeaturesPage() {
    return (
        <div dir="rtl" className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-m3-on-background">ميزات تطبيق صورلي</h1>
                    <p className="mt-1 max-w-2xl text-sm text-m3-on-surface-variant">
                        هذه قائمة بكل ما هو مُنفّذ فعلياً داخل تطبيق صورلي على الهاتف (النسخة الحالية). تُستخدم كمرجع لمراجعة ما تم إنجازه قبل إرسال النسخة للعميل.
                    </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-accent to-fuchsia-500 px-5 py-3 text-right text-m3-on-surface shadow-md shadow-glow-accent/20">
                    <p className="text-xs text-m3-on-surface/80">آخر تحديث للقائمة</p>
                    <p className="font-bold">أغسطس 2026 • v1.2.2-hotfix</p>
                </div>
            </div>

            <StatsBar />

            {TOTAL_FEATURES.map((group) => {
                const ready = group.features.filter((f) => f.status === 'ready').length;
                const pct = Math.round((ready / group.features.length) * 100);
                return (
                    <section
                        key={group.id}
                        className="overflow-hidden rounded-2xl border border-m3-outline-variant/60 bg-surface-card shadow-sm"
                    >
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-m3-surface-container-low bg-gradient-to-r from-slate-50 to-surface-card px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-2xl shadow-inner">
                                    {group.icon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-m3-on-background">{group.title}</h2>
                                    <p className="text-xs text-m3-on-surface-variant">{group.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-40 overflow-hidden rounded-full bg-m3-surface-container-lowest">
                                    <div
                                        className={`h-2 rounded-full ${pct === 100
                                            ? 'bg-emerald-500'
                                            : pct >= 75
                                            ? 'bg-accent'
                                            : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="min-w-[52px] text-right text-sm font-semibold text-m3-on-surface">
                                    {ready}/{group.features.length}
                                </span>
                            </div>
                        </header>
                        <div className="divide-y divide-slate-100">
                            {group.features.map((f) => {
                                const meta = STATUS_META[f.status];
                                return (
                                    <div
                                        key={`${group.id}-${f.title}`}
                                        className="grid grid-cols-1 items-start gap-4 px-6 py-4 md:grid-cols-12"
                                    >
                                        <div className="flex items-center gap-3 md:col-span-6">
                                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-m3-surface-container-lowest text-xl">
                                                {f.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-m3-on-background">
                                                    {f.title}
                                                </h3>
                                                <p className="mt-0.5 text-sm text-m3-on-surface-variant">
                                                    {f.description}
                                                </p>
                                                {f.notes && (
                                                    <p className="mt-1 text-xs text-m3-primary">
                                                        💡 {f.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 md:text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}
                                            >
                                                <span
                                                    className={`inline-block h-2 w-2 rounded-full ${meta.dot}`}
                                                />
                                                {meta.label}
                                            </span>
                                        </div>
                                        <div className="md:col-span-3 md:text-left">
                                            <span className="rounded-md bg-m3-surface-container-highest/5 px-2.5 py-1 font-mono text-xs font-medium text-m3-on-surface">
                                                {f.releaseVersion}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
