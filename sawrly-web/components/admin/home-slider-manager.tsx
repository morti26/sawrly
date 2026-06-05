"use client";

import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Film, Image as ImageIcon, Plus, Trash2, Upload, XCircle } from 'lucide-react';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    _previewUrl?: string;
    _file?: File;
}

interface Banner {
    id: number;
    image_url: string;
    link_url: string;
    title: string;
    is_active: boolean;
    media_items: MediaItem[];
    created_at: string;
}

type HomeSliderManagerProps = {
    heading: string;
    description?: string;
};

const MAX_MEDIA_ITEMS = 10;

export function HomeSliderManager({ heading, description }: HomeSliderManagerProps) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/banners', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch banners: ${res.status}`);
            }

            const data = await res.json();
            setBanners(data.map((banner: Banner) => ({
                ...banner,
                media_items: Array.isArray(banner.media_items) && banner.media_items.length > 0
                    ? banner.media_items
                    : banner.image_url
                        ? [{ url: banner.image_url, type: 'image' }]
                        : [],
            })));
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const homepageSlides = useMemo(() => {
        return banners
            .filter((banner) => banner.is_active)
            .flatMap((banner) =>
                (banner.media_items ?? [])
                    .filter((item) => item.url && item.type === 'image')
                    .map((item) => ({
                        ...item,
                        bannerId: banner.id,
                        bannerTitle: banner.title,
                    })),
            );
    }, [banners]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const remainingSlots = Math.max(0, MAX_MEDIA_ITEMS - mediaItems.length);
        const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots);
        const nextItems = selectedFiles.map((file) => ({
            url: '',
            type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
            _previewUrl: URL.createObjectURL(file),
            _file: file,
        }));

        setMediaItems((current) => [...current, ...nextItems]);
        e.target.value = '';
    };

    const removeMediaItem = (index: number) => {
        setMediaItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const resetForm = () => {
        setShowForm(false);
        setTitle('');
        setLinkUrl('');
        setIsActive(true);
        setMediaItems([]);
    };

    const uploadFile = async (file: File, token: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload?subDir=banners', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${await uploadRes.text()}`);
        }

        const data = await uploadRes.json();
        return data.url as string;
    };

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || mediaItems.length === 0) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token') ?? '';
            const resolvedItems: MediaItem[] = await Promise.all(
                mediaItems.map(async (item) => {
                    if (!item._file) {
                        return { url: item.url, type: item.type };
                    }

                    const url = await uploadFile(item._file, token);
                    return { url, type: item.type };
                }),
            );

            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    link_url: linkUrl,
                    is_active: isActive,
                    media_items: resolvedItems,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create slider entry');
            }

            resetForm();
            fetchBanners();
        } catch (error) {
            console.error(error);
            alert('فشل رفع الصور أو حفظ السلايدر');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleActiveStatus = async (bannerId: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: bannerId, is_active: !currentStatus }),
            });

            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Failed to update banner status', error);
        }
    };

    const deleteBanner = async (bannerId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا السلايدر؟')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/banners?id=${bannerId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Failed to delete banner', error);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
                    {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
                    <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                        <ImageIcon size={14} />
                        هذه الصور تظهر داخل أول نافذة في الصفحة الرئيسية وتتحرك كسلايدر تلقائي
                    </div>
                </div>

                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) resetForm();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_35px_rgba(219,39,119,0.28)] transition hover:bg-pink-700"
                >
                    <Plus size={18} />
                    إضافة صور للسلايدر
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">معاينة سلايدر الصفحة الرئيسية</h2>
                            <p className="text-sm text-slate-500">هذه هي الصور النشطة التي ستظهر الآن في واجهة الموقع.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {homepageSlides.length} صورة نشطة
                        </span>
                    </div>

                    <div className="grid aspect-[4/3] overflow-hidden rounded-[2rem] border border-slate-200 bg-[#151923] shadow-[0_18px_65px_rgba(255,86,170,0.12)]">
                        {homepageSlides.length > 0 ? (
                            <div className="grid h-full grid-rows-3">
                                {[0, 1, 2].map((row) => {
                                    const slide = homepageSlides[row % homepageSlides.length];
                                    return (
                                        <div key={`${slide.url}-${row}`} className="relative border-white/10 [&:not(:first-child)]:border-t">
                                            <NextImage
                                                src={slide.url}
                                                alt={slide.bannerTitle}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/35" />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid place-items-center px-6 text-center text-sm text-white/65">
                                لا توجد صور نشطة الآن. أضف صوراً جديدة وفعّلها ليظهر السلايدر في الصفحة الرئيسية.
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">ملاحظات مهمة</h2>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                        <li>الصور النشطة فقط هي التي تظهر في أول نافذة داخل الصفحة الرئيسية.</li>
                        <li>يمكنك رفع عدة صور داخل نفس السلايدر، وسيتم تدويرها تلقائياً.</li>
                        <li>الفيديو مدعوم داخل الإدارة، لكن واجهة الصفحة الرئيسية تعرض الصور فقط حالياً.</li>
                        <li>يمكنك إضافة رابط اختياري لكل سلايدر لاستخدامه لاحقاً إذا احتجنا ربط الصورة بصفحة معينة.</li>
                    </ul>
                </section>
            </div>

            {showForm ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-lg font-bold text-slate-900">إضافة سلايدر جديد للواجهة الرئيسية</h2>
                    <p className="mb-6 text-sm text-slate-500">ارفع الصور بالترتيب الذي تريده. أول الصور المرفوعة ستكون أول ما يظهر للمستخدم.</p>

                    <form onSubmit={handleCreateBanner} className="space-y-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">عنوان داخلي</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400"
                                placeholder="مثال: صور الواجهة الرئيسية لشهر مايو"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">رابط اختياري</label>
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left outline-none transition focus:border-pink-400"
                                dir="ltr"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                ملفات السلايدر - حتى {MAX_MEDIA_ITEMS} عناصر
                            </label>

                            {mediaItems.length > 0 ? (
                                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                    {mediaItems.map((item, index) => (
                                        <div key={`${item._previewUrl ?? item.url}-${index}`} className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                            {item.type === 'video' ? (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                                                    <Film size={28} />
                                                    <span className="text-xs font-semibold">فيديو</span>
                                                </div>
                                            ) : (
                                                <NextImage
                                                    src={item._previewUrl || item.url}
                                                    alt={`slide-${index + 1}`}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            )}

                                            <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeMediaItem(index)}
                                                className="absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {mediaItems.length < MAX_MEDIA_ITEMS ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50 p-8 text-center transition hover:bg-pink-100"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="text-pink-600" size={28} />
                                        <div className="text-sm font-bold text-pink-700">اضغط هنا لرفع صور السلايدر</div>
                                        <div className="text-xs text-slate-500">JPG, PNG, WEBP أو فيديوهات قصيرة إذا احتجتها لاحقاً</div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleFilesChange}
                                        className="hidden"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <input
                                id="is-active"
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-pink-600"
                            />
                            <label htmlFor="is-active" className="cursor-pointer text-sm font-medium text-slate-700">
                                تفعيل السلايدر مباشرة بعد الحفظ
                            </label>
                        </div>

                        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !title || mediaItems.length === 0}
                                className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? 'جاري الحفظ...' : 'حفظ السلايدر'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-900">كل السلايدرات المحفوظة</h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
                ) : banners.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">لا توجد أي صور أو سلايدرات محفوظة حالياً.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {banners.map((banner) => (
                            <div key={banner.id} className={`flex flex-col gap-4 p-5 lg:flex-row ${banner.is_active ? 'bg-pink-50/40' : ''}`}>
                                <div className="flex gap-2">
                                    {(banner.media_items ?? []).slice(0, 3).map((item, index) => (
                                        <div key={`${item.url}-${index}`} className="relative h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                            {item.type === 'video' ? (
                                                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                                    <Film size={18} />
                                                    <span className="text-[10px]">فيديو</span>
                                                </div>
                                            ) : (
                                                <NextImage
                                                    src={item.url}
                                                    alt={banner.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-base font-bold text-slate-900">{banner.title}</h4>
                                        {banner.is_active ? (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                نشط على الصفحة الرئيسية
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                غير نشط
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                            {(banner.media_items ?? []).length} عنصر
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                            {new Date(banner.created_at).toLocaleDateString('ar-IQ')}
                                        </span>
                                    </div>
                                    {banner.link_url ? (
                                        <a
                                            href={banner.link_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            dir="ltr"
                                            className="mt-2 block truncate text-xs text-blue-600 hover:underline"
                                        >
                                            {banner.link_url}
                                        </a>
                                    ) : null}
                                </div>

                                <div className="flex gap-2 lg:flex-col">
                                    <button
                                        onClick={() => toggleActiveStatus(banner.id, banner.is_active)}
                                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition ${banner.is_active
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <CheckCircle2 size={16} />
                                        {banner.is_active ? 'إيقاف العرض' : 'تفعيل العرض'}
                                    </button>
                                    <button
                                        onClick={() => deleteBanner(banner.id)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
