"use client";

import NextImage from 'next/image';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

interface AdminSettingsResponse {
    homeLogoUrl: string | null;
    paymentProviderName: string | null;
    paymentApiBaseUrl: string | null;
    paymentApiKeyConfigured: boolean;
    paymentWebhookSecretConfigured: boolean;
    paymentApiKeyError?: string | null;
    paymentWebhookSecretError?: string | null;
    paymentGatewayAuthTest?: {
        ok: boolean;
        status: number | null;
        message: string;
    };
}

type ApkBuildState = 'idle' | 'running' | 'done' | 'error';

type ApkBuildStatus = {
    state: ApkBuildState;
    jobId?: string;
    startedAt?: string;
    finishedAt?: string;
    log?: string;
    apkFile?: string;
    apkUrl?: string;
    error?: string;
};

export default function AdminSettingsPage() {
    const [homeLogoUrl, setHomeLogoUrl] = useState('');
    const [paymentProviderName, setPaymentProviderName] = useState('');
    const [paymentApiBaseUrl, setPaymentApiBaseUrl] = useState('');
    const [paymentApiKey, setPaymentApiKey] = useState('');
    const [paymentApiKeyConfigured, setPaymentApiKeyConfigured] = useState(false);
    const [paymentApiKeyError, setPaymentApiKeyError] = useState<string | null>(null);
    const [clearPaymentApiKey, setClearPaymentApiKey] = useState(false);
    const [paymentWebhookSecret, setPaymentWebhookSecret] = useState('');
    const [paymentWebhookSecretConfigured, setPaymentWebhookSecretConfigured] = useState(false);
    const [paymentWebhookSecretError, setPaymentWebhookSecretError] = useState<string | null>(null);
    const [clearPaymentWebhookSecret, setClearPaymentWebhookSecret] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingGateway, setIsTestingGateway] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apkBuildStatus, setApkBuildStatus] = useState<ApkBuildStatus | null>(null);
    const [isBuildingApk, setIsBuildingApk] = useState(false);
    const [apkBuildMessage, setApkBuildMessage] = useState<string | null>(null);
    const [apkBuildError, setApkBuildError] = useState<string | null>(null);

    const displayLogo = useMemo(() => {
        if (previewUrl) return previewUrl;
        return homeLogoUrl.trim();
    }, [previewUrl, homeLogoUrl]);
    const webhookUrl = useMemo(() => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/api/payments/webhook`;
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchSettings() {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
                }

                const res = await fetch('/api/admin/settings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || 'فشل تحميل الإعدادات');
                }
                if (isMounted) {
                    const payload = data as AdminSettingsResponse;
                    setHomeLogoUrl(payload.homeLogoUrl || '');
                    setPaymentProviderName(payload.paymentProviderName || '');
                    setPaymentApiBaseUrl(payload.paymentApiBaseUrl || '');
                    setPaymentApiKeyConfigured(Boolean(payload.paymentApiKeyConfigured));
                    setPaymentWebhookSecretConfigured(Boolean(payload.paymentWebhookSecretConfigured));
                    setPaymentApiKeyError(payload.paymentApiKeyError || null);
                    setPaymentWebhookSecretError(payload.paymentWebhookSecretError || null);
                    setPaymentApiKey('');
                    setPaymentWebhookSecret('');
                    setClearPaymentApiKey(false);
                    setClearPaymentWebhookSecret(false);
                }
            } catch (e) {
                if (isMounted) {
                    setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchSettings();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchApkStatus = async (): Promise<ApkBuildStatus> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
        }
        const res = await fetch('/api/admin/builds/apk', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.error || 'فشل تحميل حالة بناء APK');
        }
        return data as ApkBuildStatus;
    };

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const status = await fetchApkStatus();
                if (!active) return;
                setApkBuildStatus(status);
                setIsBuildingApk(status.state === 'running');
            } catch {}
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isBuildingApk) return;
        let disposed = false;
        const interval = setInterval(async () => {
            if (disposed) return;
            try {
                const status = await fetchApkStatus();
                if (disposed) return;
                setApkBuildStatus(status);
                const stillRunning = status.state === 'running';
                setIsBuildingApk(stillRunning);
                if (!stillRunning && status.state === 'done' && status.apkUrl) {
                    setApkBuildMessage(`تم إنشاء APK بنجاح: ${status.apkUrl}`);
                    setApkBuildError(null);
                }
                if (!stillRunning && status.state === 'error') {
                    setApkBuildError(status.error || 'فشل بناء APK');
                }
            } catch (e) {
                setApkBuildError(e instanceof Error ? e.message : 'فشل تحميل حالة بناء APK');
            }
        }, 3000);
        return () => {
            disposed = true;
            clearInterval(interval);
        };
    }, [isBuildingApk]);

    const handleBuildApk = async () => {
        setApkBuildMessage(null);
        setApkBuildError(null);
        setIsBuildingApk(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }
            const res = await fetch('/api/admin/builds/apk', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                setIsBuildingApk(false);
                throw new Error(data?.error || 'فشل بدء بناء APK');
            }
            setApkBuildMessage('تم بدء بناء APK على السيرفر...');
            const status = await fetchApkStatus();
            setApkBuildStatus(status);
        } catch (e) {
            setIsBuildingApk(false);
            setApkBuildError(e instanceof Error ? e.message : 'فشل بدء بناء APK');
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const localPreview = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(localPreview);
        setMessage(null);
        setError(null);
    };

    const uploadFile = async (file: File, token: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData?.url) {
            throw new Error(uploadData?.error || 'فشل رفع ملف الشعار');
        }
        return uploadData.url as string;
    };

    const saveSettings = async (
        nextLogoUrl: string | null,
        paymentApiKeyUpdate?: string | null,
        paymentWebhookSecretUpdate?: string | null
    ) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
        }

        const requestBody: {
            homeLogoUrl: string | null;
            paymentProviderName: string;
            paymentApiBaseUrl: string;
            paymentApiKey?: string | null;
            paymentWebhookSecret?: string | null;
        } = {
            homeLogoUrl: nextLogoUrl,
            paymentProviderName,
            paymentApiBaseUrl,
        };
        if (paymentApiKeyUpdate !== undefined) {
            requestBody.paymentApiKey = paymentApiKeyUpdate;
        }
        if (paymentWebhookSecretUpdate !== undefined) {
            requestBody.paymentWebhookSecret = paymentWebhookSecretUpdate;
        }

        const res = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.error || 'فشل حفظ الإعدادات');
        }

        const payload = data as AdminSettingsResponse;
        setHomeLogoUrl(payload.homeLogoUrl || '');
        setPaymentProviderName(payload.paymentProviderName || '');
        setPaymentApiBaseUrl(payload.paymentApiBaseUrl || '');
        setPaymentApiKeyConfigured(Boolean(payload.paymentApiKeyConfigured));
        setPaymentWebhookSecretConfigured(Boolean(payload.paymentWebhookSecretConfigured));
        setPaymentApiKeyError(payload.paymentApiKeyError || null);
        setPaymentWebhookSecretError(payload.paymentWebhookSecretError || null);
        setPaymentApiKey('');
        setPaymentWebhookSecret('');
        setClearPaymentApiKey(false);
        setClearPaymentWebhookSecret(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }

            let nextLogoUrl = homeLogoUrl.trim() || null;
            if (selectedFile) {
                nextLogoUrl = await uploadFile(selectedFile, token);
            }

            const trimmedApiKey = paymentApiKey.trim();
            const trimmedWebhookSecret = paymentWebhookSecret.trim();
            const paymentApiKeyUpdate =
                trimmedApiKey.length > 0 ? trimmedApiKey : clearPaymentApiKey ? null : undefined;
            const paymentWebhookSecretUpdate =
                trimmedWebhookSecret.length > 0
                    ? trimmedWebhookSecret
                    : clearPaymentWebhookSecret
                        ? null
                        : undefined;

            await saveSettings(nextLogoUrl, paymentApiKeyUpdate, paymentWebhookSecretUpdate);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setSelectedFile(null);
            setPreviewUrl(null);
            setMessage('تم حفظ الإعدادات بنجاح');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveLogo = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            await saveSettings(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setSelectedFile(null);
            setPreviewUrl(null);
            setHomeLogoUrl('');
            setMessage('تمت إزالة الشعار');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePaymentApiKey = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            await saveSettings(homeLogoUrl.trim() || null, null, undefined);
            setPaymentApiKey('');
            setPaymentApiKeyError(null);
            setMessage('تم إزالة مفتاح الـ API');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePaymentWebhookSecret = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            await saveSettings(homeLogoUrl.trim() || null, undefined, null);
            setPaymentWebhookSecret('');
            setPaymentWebhookSecretError(null);
            setMessage('تم إزالة webhook secret');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestGatewayAuth = async () => {
        setIsTestingGateway(true);
        setMessage(null);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('جلسة الأدمن غير متاحة. أعد تسجيل الدخول.');
            }

            const res = await fetch('/api/admin/settings?testGatewayAuth=1', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const data = (await res.json()) as AdminSettingsResponse;
            if (!res.ok) {
                throw new Error((data as unknown as { error?: string })?.error || 'فشل اختبار بوابة الدفع');
            }

            const result = data.paymentGatewayAuthTest;
            if (!result) {
                throw new Error('لم يتم إرجاع نتيجة الاختبار');
            }

            if (result.ok) {
                setMessage(`نجح اختبار بوابة الدفع (HTTP ${result.status ?? ''}): ${result.message}`);
            } else {
                setError(`فشل اختبار بوابة الدفع (HTTP ${result.status ?? ''}): ${result.message}`);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsTestingGateway(false);
        }
    };

    const handleSaveApiKeyOnly = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            const trimmedApiKey = paymentApiKey.trim();
            if (!trimmedApiKey) {
                throw new Error('ضع مفتاح الـ API أولاً ثم اضغط حفظ.');
            }

            await saveSettings(homeLogoUrl.trim() || null, trimmedApiKey, undefined);
            setMessage('تم حفظ مفتاح الـ API بنجاح');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    const generateStrongSecret = (length: number = 48): string => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        let value = '';
        for (let i = 0; i < bytes.length; i += 1) {
            value += alphabet[bytes[i] % alphabet.length];
        }
        return value;
    };

    const handleGenerateWebhookSecret = () => {
        const nextSecret = generateStrongSecret(48);
        setPaymentWebhookSecret(nextSecret);
        setClearPaymentWebhookSecret(false);
        setMessage('تم توليد webhook secret جديد. اضغط حفظ الإعدادات لتثبيته.');
        setError(null);
    };

    const handleResetWebhookSecretField = () => {
        setPaymentWebhookSecret('');
        setClearPaymentWebhookSecret(false);
        setMessage('تمت إعادة تعيين الحقل. سيتم الإبقاء على السر المحفوظ الحالي.');
        setError(null);
    };

    const handleGenerateAndSaveWebhookSecret = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            const nextSecret = generateStrongSecret(48);
            await saveSettings(homeLogoUrl.trim() || null, undefined, nextSecret);
            setMessage('تم توليد وحفظ webhook secret جديد بنجاح');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold mb-2">إعدادات التطبيق</h2>
                <p className="text-sm text-gray-500">
                    يمكنك تغيير شعار التطبيق وإعداد بوابة الدفع من هنا.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 max-w-3xl">
                <h3 className="text-lg font-semibold border-b pb-2">إعدادات التطبيق</h3>

                {isLoading ? (
                    <p className="text-gray-500">جاري تحميل الإعدادات...</p>
                ) : (
                    <>
                        <div className="space-y-5 border-b border-gray-100 pb-6">
                            <h4 className="text-base font-semibold text-gray-800">شعار التطبيق (الموبايل)</h4>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">المعاينة الحالية</label>
                                <div className="h-20 rounded-lg border border-gray-200 bg-[#0f1725] flex items-center px-4">
                                    {displayLogo ? (
                                        <NextImage
                                            src={displayLogo}
                                            alt="Home Logo Preview"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-400">لا يوجد شعار محفوظ حالياً</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">رفع شعار جديد</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                                <p className="text-xs text-gray-500">
                                    عند اختيار صورة ثم الضغط على حفظ، سيتم رفعها واعتمادها مباشرة في التطبيق.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">أو ضع رابط شعار مباشر</label>
                                <input
                                    type="text"
                                    value={homeLogoUrl}
                                    onChange={(e) => {
                                        setHomeLogoUrl(e.target.value);
                                        setMessage(null);
                                        setError(null);
                                    }}
                                    placeholder="/uploads/status/your-logo.png"
                                    className="w-full p-2 border rounded-md text-left"
                                    dir="ltr"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleRemoveLogo}
                                    disabled={isSaving || isLoading}
                                    className="bg-red-50 text-red-600 px-5 py-2 rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-50"
                                >
                                    إزالة الشعار
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-800">إعدادات بوابة الدفع الخارجية</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    أكمل هذه الحقول لاحقاً عندما تحصل على بيانات المزود الخارجي.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">اسم المزود</label>
                                    <input
                                        type="text"
                                        value={paymentProviderName}
                                        onChange={(e) => {
                                            setPaymentProviderName(e.target.value);
                                            setMessage(null);
                                            setError(null);
                                        }}
                                        placeholder="مثال: MyFatoorah"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">رابط الـ API</label>
                                    <input
                                        type="text"
                                        value={paymentApiBaseUrl}
                                        onChange={(e) => {
                                            setPaymentApiBaseUrl(e.target.value);
                                            setMessage(null);
                                            setError(null);
                                        }}
                                        placeholder="https://api.example.com"
                                        className="w-full p-2 border rounded-md text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">مفتاح الـ API</label>
                                <input
                                    type="password"
                                    value={paymentApiKey}
                                    onChange={(e) => {
                                        setPaymentApiKey(e.target.value);
                                        setMessage(null);
                                        setError(null);
                                    }}
                                    placeholder="ضع المفتاح هنا لاحقاً"
                                    className="w-full p-2 border rounded-md text-left"
                                    dir="ltr"
                                    autoComplete="new-password"
                                />
                                <p className="text-xs text-gray-500">
                                    {paymentApiKeyConfigured
                                        ? 'المفتاح محفوظ حالياً بشكل آمن. اترك الحقل فارغاً للإبقاء عليه.'
                                        : 'لا يوجد مفتاح محفوظ حالياً.'}
                                </p>
                                {paymentApiKeyError ? (
                                    <p className="text-xs text-red-600">{paymentApiKeyError}</p>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={handleRemovePaymentApiKey}
                                    disabled={isSaving || isLoading || (!paymentApiKeyConfigured && !paymentApiKeyError)}
                                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                                >
                                    إزالة المفتاح الحالي
                                </button>
                                <div className="pt-2">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveApiKeyOnly}
                                            disabled={isSaving || isLoading}
                                            className="text-xs rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            حفظ مفتاح الـ API
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleTestGatewayAuth}
                                            disabled={isSaving || isLoading || isTestingGateway}
                                            className="text-xs rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                        >
                                            {isTestingGateway ? 'جاري الاختبار...' : 'اختبار مفتاح بوابة الدفع'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
                                <input
                                    type="password"
                                    value={paymentWebhookSecret}
                                    onChange={(e) => {
                                        setPaymentWebhookSecret(e.target.value);
                                        setMessage(null);
                                        setError(null);
                                    }}
                                    placeholder="سر webhook القادم من بوابة الدفع"
                                    className="w-full p-2 border rounded-md text-left"
                                    dir="ltr"
                                    autoComplete="new-password"
                                />
                                <p className="text-xs text-gray-500">
                                    {paymentWebhookSecretConfigured
                                        ? 'Webhook secret محفوظ حالياً. اترك الحقل فارغاً للإبقاء عليه.'
                                        : 'لا يوجد webhook secret محفوظ حالياً.'}
                                </p>
                                {paymentWebhookSecretError ? (
                                    <p className="text-xs text-red-600">{paymentWebhookSecretError}</p>
                                ) : null}
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGenerateWebhookSecret}
                                        disabled={isSaving || isLoading}
                                        className="text-xs rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        توليد سر قوي
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAndSaveWebhookSecret}
                                        disabled={isSaving || isLoading}
                                        className="text-xs rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                    >
                                        توليد وحفظ مباشرة
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetWebhookSecretField}
                                        disabled={isSaving || isLoading}
                                        className="text-xs text-gray-600 hover:underline disabled:opacity-50"
                                    >
                                        إعادة تعيين الحقل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemovePaymentWebhookSecret}
                                        disabled={
                                            isSaving ||
                                            isLoading ||
                                            (!paymentWebhookSecretConfigured && !paymentWebhookSecretError)
                                        }
                                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                                    >
                                        إزالة webhook secret الحالي
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <label className="block text-sm font-medium text-gray-700">Webhook URL (ضعه في بوابة الدفع)</label>
                                <input
                                    type="text"
                                    value={webhookUrl}
                                    readOnly
                                    className="w-full rounded-md border border-gray-200 bg-white p-2 text-left text-sm text-gray-700"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-gray-100 pt-6">
                            <div>
                                <h4 className="text-base font-semibold text-gray-800">بناء APK (السيرفر)</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    سيقوم السيرفر ببناء ملف APK ووضعه داخل /public/downloads ليصبح قابلاً للتحميل من صفحة الموقع.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleBuildApk}
                                    disabled={isLoading || isSaving || isBuildingApk}
                                    className="text-sm rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                                >
                                    {isBuildingApk ? 'جاري البناء...' : 'بناء APK الآن'}
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const status = await fetchApkStatus();
                                            setApkBuildStatus(status);
                                            setIsBuildingApk(status.state === 'running');
                                        } catch (e) {
                                            setApkBuildError(e instanceof Error ? e.message : 'فشل تحميل حالة بناء APK');
                                        }
                                    }}
                                    disabled={isLoading || isSaving}
                                    className="text-sm rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                >
                                    تحديث الحالة
                                </button>
                            </div>

                            {apkBuildMessage ? (
                                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                    {apkBuildMessage}
                                </div>
                            ) : null}

                            {apkBuildError ? (
                                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                    {apkBuildError}
                                </div>
                            ) : null}

                            {apkBuildStatus?.apkUrl ? (
                                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 break-all">
                                    <div className="font-semibold">APK URL</div>
                                    <a className="text-blue-600 hover:underline" href={apkBuildStatus.apkUrl}>
                                        {apkBuildStatus.apkUrl}
                                    </a>
                                </div>
                            ) : null}

                            {apkBuildStatus?.log ? (
                                <textarea
                                    value={apkBuildStatus.log}
                                    readOnly
                                    className="w-full h-40 rounded-md border border-gray-200 bg-white p-2 text-xs font-mono text-left"
                                    dir="ltr"
                                />
                            ) : null}
                        </div>

                        {message && (
                            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isLoading}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
