"use client";

import { useState } from "react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const submittedEmail = String(formData.get("email") ?? "").trim();
        const submittedPassword = String(formData.get("password") ?? "");

        setEmail(submittedEmail);
        setPassword(submittedPassword);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                    email: submittedEmail,
                    password: submittedPassword,
                }),
            });

            const raw = await res.text();
            let data: any = {};

            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                data = {
                    error:
                        res.status === 401
                            ? "Invalid credentials"
                            : res.status === 403
                                ? "Access denied"
                                : "Login failed",
                };
            }

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            if (!["admin", "moderator"].includes(data.user.role)) {
                throw new Error("Access denied. Admin or moderator only.");
            }

            // Also store in LS if needed for API calls
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.assign("/admin/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-m3-surface-container-lowest text-m3-on-background">
            <div className="bg-surface-card p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-m3-on-background">تسجيل دخول صورلي</h1>
                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}
                <form onSubmit={handleLogin} method="post" className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-m3-on-surface">البريد الإلكتروني</label>
                        <input
                            className="w-full p-2 border border-m3-outline-variant rounded text-right text-m3-on-background bg-surface-card"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-m3-on-surface">كلمة المرور</label>
                        <input
                            className="w-full p-2 border border-m3-outline-variant rounded text-right text-m3-on-background bg-surface-card"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-m3-on-surface text-m3-on-surface p-2 rounded hover:bg-m3-surface-container-high transition shadow-sm"
                    >
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );
}
