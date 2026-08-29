import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["200", "300", "400", "500", "700", "800", "900"]
});

export const metadata: Metadata = {
    title: "صورلي Admin",
    description: "Platform for photographers and filmmakers in Iraq",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" translate="no" suppressHydrationWarning>
            <head>
                <meta name="google" content="notranslate" />
            </head>
            <body className={tajawal.className} suppressHydrationWarning>
                <ThemeProvider pollIntervalMs={25000}>{children}</ThemeProvider>
            </body>
        </html>
    );
}
