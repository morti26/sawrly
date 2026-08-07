import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-full": "var(--hero-gradient)",
            },
            // Design tokens — Colors
            // Alla använder nu CSS custom properties från ThemeProvider!
            // Ändrar du temat i admin → ändras dessa automatiskt.
            colors: {
                primary: {
                    DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
                    light: "var(--color-primary-light)",
                    dark: "var(--color-primary-dark)",
                    container: "var(--m3-primary-container)",
                    on: "var(--m3-on-primary)",
                },
                accent: {
                    DEFAULT: "var(--m3-accent-pink)",
                    on: "var(--m3-on-accent-pink)",
                },
                background: {
                    DEFAULT: "var(--color-background)",
                    light: "var(--color-background-light)",
                },
                surface: {
                    DEFAULT: "var(--color-surface)",
                    light: "var(--color-surface-light)",
                    container: "var(--m3-surface-container)",
                    "container-high": "var(--m3-surface-container-high)",
                    "container-highest": "var(--m3-surface-container-highest)",
                    card: "var(--m3-card-background)",
                    menu: "var(--m3-menu-background)",
                    disabled: "var(--m3-disabled)",
                },
                text: {
                    primary: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    tertiary: "var(--color-text-tertiary)",
                },
                status: {
                    success: "var(--color-status-success)",
                    warning: "var(--color-status-warning)",
                    error: "var(--color-status-error)",
                    info: "var(--color-status-info)",
                },
                border: {
                    DEFAULT: "var(--color-border)",
                    light: "var(--color-border-light)",
                    outline: "var(--m3-outline)",
                    "outline-variant": "var(--m3-outline-variant)",
                },
                m3: {
                    primary: "var(--m3-primary)",
                    "on-primary": "var(--m3-on-primary)",
                    surface: "var(--m3-surface)",
                    "on-surface": "var(--m3-on-surface)",
                    background: "var(--m3-background)",
                    "on-background": "var(--m3-on-background)",
                    error: "var(--m3-error)",
                    "on-error": "var(--m3-on-error)",
                    outline: "var(--m3-outline)",
                    "outline-variant": "var(--m3-outline-variant)",
                    divider: "var(--m3-divider)",
                    hero: { start: "var(--hero-start)", mid: "var(--hero-mid)", end: "var(--hero-end)" },
                    badge: "var(--m3-badge)",
                    "on-badge": "var(--m3-on-badge)",
                    shimmer: { base: "var(--m3-shimmer-base)", highlight: "var(--m3-shimmer-highlight)" },
                },
            },
            // Design tokens - Typography
            fontFamily: {
                tajawal: ["Tajawal", "sans-serif"],
            },
            fontSize: {
                h1: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
                h2: ["24px", { lineHeight: "1.3", fontWeight: "700" }],
                h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
                h4: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
                body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                bodyLarge: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                label: ["14px", { lineHeight: "1.4", fontWeight: "500" }],
                caption: ["11px", { lineHeight: "1.3", fontWeight: "400" }],
            },
            // Design tokens - Spacing
            spacing: {
                xs: "4px",
                sm: "8px",
                md: "12px",
                lg: "16px",
                xl: "20px",
                xxl: "24px",
                xxxl: "32px",
            },
            // Design tokens - Border radius (drivna av tema-effekter)
            borderRadius: {
                sm: "8px",
                md: "12px",
                lg: "var(--eff-card-radius)",
                xl: "24px",
                card: "var(--eff-card-radius)",
                button: "var(--eff-button-radius)",
                chip: "var(--eff-chip-radius)",
            },
            // Design tokens - Shadows (drivna av tema)
            boxShadow: {
                card: "var(--shadow-card)",
                button: "var(--shadow-button)",
                modal: "var(--shadow-modal)",
                "level-1": "var(--shadow-level-1)",
                "level-2": "var(--shadow-level-2)",
                "level-3": "var(--shadow-level-3)",
                "glow-accent":
                    "0 8px 28px rgb(var(--accent-rgb) / var(--eff-active-glow-opacity))",
                "glow-primary":
                    "0 8px 28px rgb(var(--primary-rgb) / var(--eff-active-glow-opacity))",
            },
            backdropBlur: {
                glass: "var(--eff-glass-blur)",
            },
            opacity: {
                surface: "var(--eff-surface-opacity)",
                border: "var(--eff-border-opacity)",
            },
        },
    },
    plugins: [],
};
export default config;
