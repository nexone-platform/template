"use client";

import { useEffect } from "react";
import { useThemeSettings } from "@/hooks/use-theme-settings";
import type { ThemeSettingsDto } from "@/hooks/use-theme-settings";

/** Convert CSS font-family to Google Fonts URL name */
function toGoogleFontName(css?: string): string | null {
    if (!css) return null;
    // Extract first family name from value like "'Kanit', sans-serif"
    const name = css.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    // Skip system / generic fonts
    const skip = ["Inter", "Arial", "Segoe UI", "system-ui", "Georgia", "Times New Roman", "sans-serif", "serif", "monospace"];
    if (skip.includes(name)) return null;
    return name;
}

/** Dynamically load Google Fonts via a single <link> tag */
function loadGoogleFonts(families: (string | undefined)[]) {
    const names = families.map(toGoogleFontName).filter(Boolean) as string[];
    if (names.length === 0) return;
    const unique = [...new Set(names)];
    const param = unique.map(n => `family=${n.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
    const href = `https://fonts.googleapis.com/css2?${param}&display=swap`;

    let link = document.getElementById("nv-google-fonts") as HTMLLinkElement | null;
    if (link) {
        if (link.href === href) return; // already loaded
        link.href = href;
    } else {
        link = document.createElement("link");
        link.id = "nv-google-fonts";
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }
}

// ── Color shade helpers ──────────────────────────────────────────
/** Parse hex color to RGB */
function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "").replace(/ff$/i, ""); // strip trailing alpha if 8-char
    const clean = h.length > 6 ? h.substring(0, 6) : h;
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    return [
        parseInt(full.substring(0, 2), 16),
        parseInt(full.substring(2, 4), 16),
        parseInt(full.substring(4, 6), 16),
    ];
}

/** RGB to hex */
function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${[clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Darken a hex color by a percentage (0-1) */
export function darken(hex: string, amount: number): string {
    try {
        const [r, g, b] = hexToRgb(hex);
        return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
    } catch { return hex; }
}

/** Lighten a hex color toward white by a percentage (0-1) */
export function lighten(hex: string, amount: number): string {
    try {
        const [r, g, b] = hexToRgb(hex);
        return rgbToHex(
            r + (255 - r) * amount,
            g + (255 - g) * amount,
            b + (255 - b) * amount,
        );
    } catch { return hex; }
}

/** Create a very light tint (for backgrounds like violet-light) */
export function tint(hex: string): string {
    return lighten(hex, 0.9);
}

/** Create RGBA string from hex */
function toRgba(hex: string, alpha: number): string {
    try {
        const [r, g, b] = hexToRgb(hex);
        return `rgba(${r},${g},${b},${alpha})`;
    } catch { return hex; }
}

// ── Apply theme (exported so other components can call it) ────────
export function applyTheme(t: ThemeSettingsDto) {
    const root = document.documentElement;
    const s = root.style;

    // Brand — auto-generate dark/light shades from primary color
    const primary = t.primaryColor;
    const accent = t.accentColor;

    s.setProperty("--nv-violet", primary);
    s.setProperty("--nv-violet-dark", t.primaryDark || darken(primary, 0.15));
    s.setProperty("--nv-violet-light", t.primaryLight || tint(primary));
    s.setProperty("--nv-violet-glow", primary);
    s.setProperty("--nv-cyan", accent);
    s.setProperty("--nv-cyan-light", t.accentLight || tint(accent));

    // Status — also generate light variants
    s.setProperty("--nv-success", t.successColor);
    s.setProperty("--nv-success-lt", tint(t.successColor));
    s.setProperty("--nv-danger", t.dangerColor);
    s.setProperty("--nv-danger-lt", tint(t.dangerColor));
    s.setProperty("--nv-warn", t.warningColor);
    s.setProperty("--nv-warn-lt", tint(t.warningColor));

    // Background & Surface
    s.setProperty("--nv-bg", t.bgColor);
    s.setProperty("--nv-card", t.cardColor);
    s.setProperty("--nv-sidebar", t.sidebarColor);
    s.setProperty("--nv-sidebar-hover", t.sidebarHover || lighten(t.sidebarColor, 0.08));
    s.setProperty("--nv-sidebar-text", t.sidebarTextColor || "#FFFFFF");
    s.setProperty("--nv-header", t.headerColor || "rgba(255,255,255,0.8)");

    // Text
    s.setProperty("--nv-text", t.textPrimary);
    s.setProperty("--nv-text-sec", t.textSecondary);
    s.setProperty("--nv-text-dim", t.textMuted || "#9CA3AF");

    // Border
    s.setProperty("--nv-border", t.borderColor || "#E5E7EB");
    s.setProperty("--nv-border-lt", t.borderLight || "#F3F4F6");

    // Layout
    if (t.borderRadius) s.setProperty("--nv-radius", t.borderRadius);
    if (t.sidebarWidth) s.setProperty("--nv-sidebar-width", t.sidebarWidth);

    // Background / foreground
    s.setProperty("--background", t.bgColor);
    s.setProperty("--foreground", t.textPrimary);

    // Shadow colors — dynamic based on primary
    s.setProperty("--nv-violet-shadow", toRgba(primary, 0.25));
    s.setProperty("--nv-violet-shadow-hover", toRgba(primary, 0.3));

    // Typography
    if (t.fontFamily) {
        s.setProperty("--nv-font", t.fontFamily);
        document.body.style.fontFamily = t.fontFamily;
    }
    if (t.fontSizeBase) {
        s.setProperty("--nv-font-size", t.fontSizeBase);
        document.body.style.fontSize = t.fontSizeBase;
    }

    // Header height
    if (t.headerHeight) s.setProperty("--nv-header-height", t.headerHeight);

    // Heading font
    if (t.headingFontFamily) s.setProperty("--nv-heading-font", t.headingFontFamily);

    // Dynamic Google Fonts loading
    loadGoogleFonts([t.fontFamily, t.headingFontFamily]);

    // Dark Mode — just toggle class (preset colors already have correct dark values)
    if (t.darkModeEnabled) {
        root.classList.add("dark");
        // Adjust shadow for dark backgrounds
        s.setProperty("--nv-violet-shadow", toRgba(primary, 0.15));
        s.setProperty("--nv-violet-shadow-hover", toRgba(primary, 0.20));
    } else {
        root.classList.remove("dark");
    }

    // Compact Mode — shrink padding/margins via a CSS class
    if (t.compactMode) {
        root.classList.add("compact");
    } else {
        root.classList.remove("compact");
    }

    // RTL
    if (t.rtlEnabled) {
        root.dir = "rtl";
    } else {
        root.dir = "ltr";
    }

    // Custom CSS injection
    let customStyle = document.getElementById("nv-custom-css") as HTMLStyleElement | null;
    if (t.customCss) {
        if (!customStyle) {
            customStyle = document.createElement("style");
            customStyle.id = "nv-custom-css";
            document.head.appendChild(customStyle);
        }
        customStyle.textContent = t.customCss;
    } else if (customStyle) {
        customStyle.textContent = "";
    }

    // Persist to localStorage so next page load applies instantly
    try {
        localStorage.setItem("nf-theme", JSON.stringify(t));
    } catch { /* ignore */ }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { data: theme } = useThemeSettings();

    // 1) On mount: instantly apply cached theme from localStorage (no flash)
    useEffect(() => {
        try {
            const cached = localStorage.getItem("nf-theme");
            if (cached) {
                applyTheme(JSON.parse(cached));
            }
        } catch { /* ignore */ }
    }, []);

    // 2) When API data arrives: apply and cache
    useEffect(() => {
        if (theme) {
            applyTheme(theme);
        }
    }, [theme]);

    return <>{children}</>;
}
