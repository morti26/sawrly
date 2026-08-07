"use client";

/**
 * components/theme-provider.tsx
 * ------------------------------------------------------
 * React Context + Client Component provider för Enterprise Theme.
 *
 * Hur det fungerar:
 *  1. Första render (SSR + hydration): DEFAULT_CLIENT_THEME appliceras
 *     SYNCRONT innan useEffect ens körs → ingen "färg-flash".
 *  2. useEffect (endast client): FETCHAR /api/config/public → extraherar
 *     enterprise theme → applyEnterpriseThemeToDom() skriver över ALLA CSS variabler.
 *  3. Pollar var 30:e sekund (version-hash kontroll) → OM tema ändrats i admin
 *     → broadcastar state + uppdaterar CSS variabler (ingen omstart).
 *  4. Exponerar useTheme() hook med currentTheme + isLoading + lastFetchedAt.
 *
 * Användning (layout.tsx):
 *   import { ThemeProvider } from "@/components/theme-provider";
 *   <html suppressHydrationWarning> ... <body><ThemeProvider>{children}</ThemeProvider></body></html>
 */

import * as React from "react";
import type { EnterpriseTheme } from "@/lib/theme_engine";
import {
    DEFAULT_CLIENT_THEME,
    applyEnterpriseThemeToDom,
    fetchPublicConfig,
    type PublicConfigResponse,
} from "@/lib/theme_client";

/* =========================================================
   Context type
   ========================================================= */

interface ThemeContextValue {
    currentTheme: EnterpriseTheme;
    publicConfig: PublicConfigResponse | null;
    isLoading: boolean;
    lastFetchedAt: Date | null;
    themeVersion: string;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
    const ctx = React.useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme måste användas inuti <ThemeProvider>");
    }
    return ctx;
}

/* =========================================================
   Provider
   ========================================================= */

interface ThemeProviderProps {
    children: React.ReactNode;
    /**
     * SSR-prefetchat enterprise theme (från layout/server components).
     * Om detta sätts använder vi detta direkt istället för DEFAULT_CLIENT_THEME
     * under hydration → perfekt match mellan server och client.
     */
    initialTheme?: EnterpriseTheme | null;
    /** Hur ofta polla efter temaändringar (ms). Default 30 000 ms = 30 s. */
    pollIntervalMs?: number;
}

export function ThemeProvider({
    children,
    initialTheme = null,
    pollIntervalMs = 30_000,
}: ThemeProviderProps): React.ReactElement {
    const initialThemeRef = React.useRef<EnterpriseTheme>(
        initialTheme ?? DEFAULT_CLIENT_THEME,
    );

    const [currentTheme, setCurrentTheme] = React.useState<EnterpriseTheme>(initialThemeRef.current);
    const [publicConfig, setPublicConfig] = React.useState<PublicConfigResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [lastFetchedAt, setLastFetchedAt] = React.useState<Date | null>(null);
    const [themeVersion, setThemeVersion] = React.useState<string>(initialThemeRef.current.version);

    const lastAppliedVersionRef = React.useRef<string | null>(null);

    /* ---------- Applicera tema på DOM sync ---------- */
    const applyTheme = React.useCallback((t: EnterpriseTheme) => {
        if (typeof document === "undefined") return;
        if (t.version && t.version === lastAppliedVersionRef.current) return;
        lastAppliedVersionRef.current = t.version || null;
        applyEnterpriseThemeToDom(t);
    }, []);

    /* ---------- Initial apply (hydration) ---------- */
    React.useMemo(() => {
        // Körs EN gång (sync) för att undvika FOUC / färgflimmer
        if (typeof document !== "undefined") {
            applyTheme(initialThemeRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Hämta från API och refresh ---------- */
    const refreshTheme = React.useCallback(async (): Promise<void> => {
        if (typeof window === "undefined") return;
        const controller = new AbortController();
        setIsLoading(true);
        try {
            const cfg = await fetchPublicConfig(controller.signal);
            setPublicConfig(cfg || null);
            const newTheme: EnterpriseTheme = cfg?.enterprise ?? initialThemeRef.current;
            if (newTheme && typeof (newTheme as any).version === "string") {
                const v = (newTheme as any).version as string;
                if (v !== lastAppliedVersionRef.current) {
                    setCurrentTheme(newTheme);
                    setThemeVersion(v);
                    applyTheme(newTheme);
                }
            }
            setLastFetchedAt(new Date());
        } finally {
            setIsLoading(false);
        }
    }, [applyTheme]);

    /* ---------- Första fetch (client) ---------- */
    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            if (cancelled) return;
            await refreshTheme();
        })();
        return () => { cancelled = true; };
    }, [refreshTheme]);

    /* ---------- Periodisk polling ---------- */
    React.useEffect(() => {
        if (pollIntervalMs <= 0) return undefined;
        const id = window.setInterval(() => {
            void refreshTheme();
        }, pollIntervalMs);
        return () => window.clearInterval(id);
    }, [pollIntervalMs, refreshTheme]);

    const value: ThemeContextValue = {
        currentTheme,
        publicConfig,
        isLoading,
        lastFetchedAt,
        themeVersion,
        refreshTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <ThemeCssVariablesInHead />
            {children}
        </ThemeContext.Provider>
    );
}

/* =========================================================
   Inject fallback CSS-vars som <style> i head (för FOUC).
   Körs enbart i provider (ingen extra kostnad).
   ========================================================= */

function ThemeCssVariablesInHead(): React.ReactElement | null {
    React.useInsertionEffect(() => {
        if (typeof document === "undefined") return;
        // Säkerställ att fallback värden är satta direkt (FALLBACK)
        // om inte applyThemeThemeToDom körts ännu.
        const styleId = "sawrly-theme-fallback";
        if (document.getElementById(styleId)) return;
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.setAttribute("data-theme-style", "true");
        styleEl.innerHTML = `
            :root {
                --_sawrly-theme-loaded: 1;
            }
            /* Säkerställer <body> bakgrund alltid använder --m3 variabler */
            body {
                background-color: var(--m3-background, #151923) !important;
            }
        `;
        document.head.appendChild(styleEl);
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);
    return null;
}

export default ThemeProvider;
