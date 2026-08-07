/**
 * lib/theme_client.ts
 * ------------------------------------------------------
 * Client-side helpers for Enterprise Theme Engine.
 *
 * Ansvar:
 *  1. Applicera ett EnterpriseTheme som CSS-variabler på document.documentElement
 *     (alla M3 tokens + legacy + effects + shadows)
 *  2. Default theme (fallback om API:et inte svarar)
 *  3. Hjälpfunktioner: hex → rgba(v) med opacity, hex6/alpha extraction.
 *
 * Används av: components/theme-provider.tsx
 */

import type { EnterpriseTheme } from "./theme_engine";
import { buildEnterpriseFromSeed, DEFAULT_EFFECTS, isValidHex } from "./theme_engine";

/* =========================================================
   DEFAULT FALLBACK THEME (om API:et är nere första render)
   Seed: #ff4a97 (rosa), mode: dark — matchar appens originalidentitet.
   ========================================================= */
export const DEFAULT_CLIENT_SEED = "#ff4a97";
export const DEFAULT_CLIENT_THEME: EnterpriseTheme = buildEnterpriseFromSeed(
    DEFAULT_CLIENT_SEED,
    "dark",
    DEFAULT_EFFECTS,
);

/* =========================================================
   Färg-konvertering (endast klient)
   ========================================================= */

export function _hexToRgbTuple(hex: string): [number, number, number] {
    let h = (hex || "").trim().replace("#", "");
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    if (h.length >= 6) {
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
            return [r, g, b];
        }
    }
    return [0, 0, 0];
}

export function hexRgba(hex: string, opacity: number): string {
    const [r, g, b] = _hexToRgbTuple(hex);
    const a = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 1));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function extractAlphaFromHex(hex: string): number {
    const h = (hex || "").trim().replace("#", "");
    if (h.length === 8) {
        return parseInt(h.slice(6, 8), 16) / 255;
    }
    return 1;
}

/* =========================================================
   ENTERPRISE THEME → CSS VARIABLES
   Skriv ALLA 85+ färger + effekter som CSS custom properties.
   ========================================================= */

const M3_KEYS: (keyof EnterpriseTheme)[] = [
    "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
    "primaryFixed", "primaryFixedDim", "onPrimaryFixed", "onPrimaryFixedVariant",
    "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
    "secondaryFixed", "secondaryFixedDim", "onSecondaryFixed", "onSecondaryFixedVariant",
    "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
    "tertiaryFixed", "tertiaryFixedDim", "onTertiaryFixed", "onTertiaryFixedVariant",
    "error", "onError", "errorContainer", "onErrorContainer",
    "success", "onSuccess", "successContainer", "onSuccessContainer",
    "warning", "onWarning", "warningContainer", "onWarningContainer",
    "info", "onInfo", "infoContainer", "onInfoContainer",
    "surface", "onSurface", "surfaceDim", "surfaceBright",
    "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer",
    "surfaceContainerHigh", "surfaceContainerHighest",
    "onSurfaceVariant",
    "outline", "outlineVariant",
    "background", "onBackground",
    "inverseSurface", "inverseOnSurface", "inversePrimary",
    "shadow", "scrim",
    "divider", "splash", "disabled", "onDisabled", "disabledContainer",
    "heroStart", "heroMid", "heroEnd",
    "cardBackground", "cardBorder",
    "badge", "onBadge",
    "snackbarBackground", "snackbarText",
    "shimmerBase", "shimmerHighlight",
    "accentPink", "onAccentPink",
    "menuBackground",
    "textPrimary", "textSecondary", "textTertiary",
    "border", "borderLight", "surfaceLight",
];

export function applyEnterpriseThemeToDom(theme: EnterpriseTheme, el?: HTMLElement | null): void {
    const root = el ?? (typeof document !== "undefined" ? document.documentElement : null);
    if (!root || !theme) return;

    const s = root.style;

    /* --- 1. Material 3 färger (85 nycklar) --- */
    for (const k of M3_KEYS) {
        const v = (theme as any)[k];
        if (typeof v === "string" && isValidHex(v)) {
            s.setProperty(`--m3-${kebabCase(k)}`, v.toLowerCase());
        }
    }

    /* --- 2. LEGACY VARIABLES (bakåtkompatibilitet) --- */
    // Så gamla .text-primary / bg-primary etc fortsätter fungera.
    s.setProperty("--color-primary", (theme.accentPink || theme.primary || "#ff4a97").toLowerCase());
    s.setProperty("--color-primary-light", (theme.primaryFixed || theme.primaryContainer || "#ff8ad4").toLowerCase());
    s.setProperty("--color-primary-dark", (theme.primary || "#c93678").toLowerCase());
    s.setProperty("--color-background", (theme.background || "#161921").toLowerCase());
    s.setProperty("--color-background-light", (theme.surfaceContainer || "#1E2028").toLowerCase());
    s.setProperty("--color-surface", (theme.surface || "#222530").toLowerCase());
    s.setProperty("--color-surface-light", (theme.surfaceLight || theme.surfaceContainerHigh || "#2D3140").toLowerCase());
    s.setProperty("--color-text-primary", (theme.textPrimary || theme.onSurface || "#FFFFFF").toLowerCase());
    s.setProperty("--color-text-secondary", (theme.textSecondary || theme.onSurfaceVariant || "#B0B0B0").toLowerCase());
    s.setProperty("--color-text-tertiary", (theme.textTertiary || "#707070").toLowerCase());
    s.setProperty("--color-status-success", (theme.success || "#22C55E").toLowerCase());
    s.setProperty("--color-status-warning", (theme.warning || "#F59E0B").toLowerCase());
    s.setProperty("--color-status-error", (theme.error || "#EF4444").toLowerCase());
    s.setProperty("--color-status-info", (theme.info || "#3B82F6").toLowerCase());
    s.setProperty("--color-border", (theme.border || theme.outline || "#3D3D4D").toLowerCase());
    s.setProperty("--color-border-light", (theme.borderLight || theme.outlineVariant || "#2D2D3D").toLowerCase());

    /* --- 3. EFFECTS (10 st) --- */
    const e = theme.effects ?? DEFAULT_EFFECTS;
    s.setProperty("--eff-primary-gradient-angle", String(e.primaryGradientAngle ?? 135) + "deg");
    s.setProperty("--eff-card-radius", String(e.cardRadius ?? 16) + "px");
    s.setProperty("--eff-chip-radius", String(e.chipRadius ?? 999) + "px");
    s.setProperty("--eff-button-radius", String(e.buttonRadius ?? 12) + "px");
    s.setProperty("--eff-nav-shadow-opacity", String(e.navShadowOpacity ?? 0.18));
    s.setProperty("--eff-card-shadow-opacity", String(e.cardShadowOpacity ?? 0.12));
    s.setProperty("--eff-active-glow-opacity", String(e.activeGlowOpacity ?? 0.22));
    s.setProperty("--eff-glass-blur", String(e.glassBlur ?? 14) + "px");
    s.setProperty("--eff-surface-opacity", String(e.surfaceOpacity ?? 0.85));
    s.setProperty("--eff-border-opacity", String(e.borderOpacity ?? 0.45));

    /* --- 4. State layers + shadows --- */
    const sl = theme.stateLayers ?? { hover: 0.08, focus: 0.12, pressed: 0.1, dragged: 0.16 };
    s.setProperty("--state-hover-opacity", String(sl.hover ?? 0.08));
    s.setProperty("--state-focus-opacity", String(sl.focus ?? 0.12));
    s.setProperty("--state-pressed-opacity", String(sl.pressed ?? 0.1));
    s.setProperty("--state-dragged-opacity", String(sl.dragged ?? 0.16));

    const sh = theme.shadows ?? { level1: "rgba(0,0,0,0.14)", level2: "rgba(0,0,0,0.18)", level3: "rgba(0,0,0,0.24)" };
    s.setProperty("--shadow-level-1", sh.level1 || "rgba(0,0,0,0.14)");
    s.setProperty("--shadow-level-2", sh.level2 || "rgba(0,0,0,0.18)");
    s.setProperty("--shadow-level-3", sh.level3 || "rgba(0,0,0,0.24)");

    /* --- 5. Komposita hjälp-variabler för gradienter / glow --- */
    const accent = theme.accentPink || "#ff4a97";
    s.setProperty("--accent-rgb", _hexToRgbTuple(accent).join(", "));
    const primary = theme.primary || "#7c3aed";
    s.setProperty("--primary-rgb", _hexToRgbTuple(primary).join(", "));
    const hero = [theme.heroStart, theme.heroMid, theme.heroEnd].filter(isValidHex);
    s.setProperty("--hero-gradient",
        hero.length >= 2
            ? `linear-gradient(${e.primaryGradientAngle ?? 135}deg, ${hero.join(", ")})`
            : `linear-gradient(135deg, #28144a, #5a2ead, #ff4a97)`);
    s.setProperty("--hero-start", (theme.heroStart || "#28144a").toLowerCase());
    s.setProperty("--hero-mid", (theme.heroMid || "#5a2ead").toLowerCase());
    s.setProperty("--hero-end", (theme.heroEnd || "#ff4a97").toLowerCase());

    /* --- 6. data-attribut för React/Tailwind debuggning --- */
    root.setAttribute("data-theme-mode", theme.mode || "dark");
    root.setAttribute("data-theme-version", theme.version || "0");
    root.setAttribute("data-theme-is-dark", theme.isDark ? "true" : "false");
}

function kebabCase(s: string): string {
    return s.replace(/([A-Z])/g, (m) => "-" + m.toLowerCase()).replace(/^-/, "");
}

/* =========================================================
   DATA MODEL för ThemeProvider state
   ========================================================= */

export interface PublicConfigResponse {
    adminWhatsAppE164?: string | null;
    homeLogoUrl?: string | null;
    femaleProfileIconUrl?: string | null;
    navSettingItems?: unknown[] | null;
    theme?: {
        version?: string;
        colors?: Record<string, string>;
        navIcons?: Record<string, unknown>;
        effects?: Record<string, unknown>;
    };
    enterprise?: EnterpriseTheme | null;
}

export async function fetchPublicConfig(signal?: AbortSignal): Promise<PublicConfigResponse | null> {
    try {
        const res = await fetch("/api/config/public", {
            method: "GET",
            cache: "no-store",
            signal,
            headers: { "Accept": "application/json" },
        });
        if (!res.ok) return null;
        return (await res.json()) as PublicConfigResponse;
    } catch {
        return null;
    }
}
