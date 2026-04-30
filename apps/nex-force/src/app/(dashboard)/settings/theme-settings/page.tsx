"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
    useThemeSettings,
    useUpdateThemeSettings,
    useResetThemeSettings,
    DEFAULT_THEME,
} from "@/hooks/use-theme-settings";
import type { ThemeSettingsDto } from "@/hooks/use-theme-settings";
import { applyTheme } from "@/components/providers/theme-provider";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/routes";
import { usePageTranslation } from "@/lib/language";
import {
    PageHeader, LoadingSpinner, ui,
} from "@/components/shared/ui-components";
import {
    RotateCcw, Save, Palette, Type, Layout, SlidersHorizontal,
    Eye, Monitor, Moon, Sun, Paintbrush, Check, Download, Upload, Undo2,
} from "lucide-react";

// ── Color Picker ─────────────────────────────────────────────
function ColorPicker({ label, value, onChange, description }: {
    label: string; value: string; onChange: (v: string) => void; description?: string;
}) {
    // Normalize hex — handle 8-char hex, rgba, etc.
    const normalizeHex = (v: string) => {
        if (v.startsWith("rgba") || v.startsWith("rgb")) return "#ffffff";
        return v.length > 7 ? v.substring(0, 7) : v;
    };
    const displayValue = normalizeHex(value);

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100/50 last:border-b-0">
            <div>
                <span className="text-sm text-gray-700 font-medium">{label}</span>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono text-gray-400 uppercase">{displayValue}</span>
                <label className="relative cursor-pointer">
                    <div
                        className="w-9 h-9 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                        style={{ backgroundColor: displayValue }}
                    />
                    <input
                        type="color"
                        value={displayValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </label>
            </div>
        </div>
    );
}

// ── Toggle Switch ────────────────────────────────────────────
function ToggleSwitch({ label, description, checked, onChange, icon: Icon }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon?: any;
}) {
    return (
        <label className="flex items-center justify-between py-4 border-b border-gray-100/50 cursor-pointer group last:border-b-0">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-nv-violet-light flex items-center justify-center transition-colors">
                        <Icon className="w-4.5 h-4.5 text-gray-500 group-hover:text-nv-violet transition-colors" />
                    </div>
                )}
                <div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
            </div>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-nv-violet/30 rounded-full peer peer-checked:bg-nv-violet transition-all
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full peer-checked:after:border-white">
                </div>
            </div>
        </label>
    );
}

// ── Section Card ─────────────────────────────────────────────
function SectionCard({ title, icon: Icon, accent = "violet", children }: {
    title: string; icon?: any; accent?: "violet" | "blue" | "emerald" | "amber" | "rose" | "slate";
    children: React.ReactNode;
}) {
    const accentStyles: Record<string, { border: string; bg: string; iconBg: string; iconText: string; titleText: string }> = {
        violet: { border: "border-l-nv-violet/60", bg: "bg-gradient-to-br from-violet-50/60 to-white", iconBg: "bg-violet-100", iconText: "text-nv-violet", titleText: "text-violet-700" },
        blue:   { border: "border-l-blue-500/60", bg: "bg-gradient-to-br from-blue-50/50 to-white", iconBg: "bg-blue-100", iconText: "text-blue-600", titleText: "text-blue-700" },
        emerald: { border: "border-l-emerald-500/60", bg: "bg-gradient-to-br from-emerald-50/50 to-white", iconBg: "bg-emerald-100", iconText: "text-emerald-600", titleText: "text-emerald-700" },
        amber:  { border: "border-l-amber-500/60", bg: "bg-gradient-to-br from-amber-50/50 to-white", iconBg: "bg-amber-100", iconText: "text-amber-600", titleText: "text-amber-700" },
        rose:   { border: "border-l-rose-500/60", bg: "bg-gradient-to-br from-rose-50/50 to-white", iconBg: "bg-rose-100", iconText: "text-rose-600", titleText: "text-rose-700" },
        slate:  { border: "border-l-slate-500/60", bg: "bg-gradient-to-br from-slate-50/50 to-white", iconBg: "bg-slate-100", iconText: "text-slate-600", titleText: "text-slate-700" },
    };
    const s = accentStyles[accent] || accentStyles.violet;

    return (
        <div className={`rounded-xl border border-gray-200/80 ${s.border} border-l-[3px] ${s.bg} shadow-sm overflow-hidden`}>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2.5">
                {Icon && (
                    <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${s.iconText}`} />
                    </div>
                )}
                <h4 className={`text-xs font-bold uppercase tracking-wider ${s.titleText}`}>{title}</h4>
            </div>
            <div className="px-4 pb-4">
                {children}
            </div>
        </div>
    );
}

// ── Tab Button ────────────────────────────────────────────────
function TabButton({ active, icon: Icon, label, onClick }: {
    active: boolean; icon: any; label: string; onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${active
                ? "bg-nv-violet text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

// ── Theme Presets ─────────────────────────────────────────────
interface ThemePreset {
    name: string;
    description: string;
    colors: Partial<ThemeSettingsDto>;
    swatches: string[];   // [primary, accent, bg, sidebar]
}

const THEME_PRESETS: ThemePreset[] = [
    // Row 1
    {
        name: "Nova",
        description: "Default purple",
        swatches: ["#6C5CE7", "#00B4D8", "#D5D8E0", "#111113"],
        colors: {
            primaryColor: "#6C5CE7", accentColor: "#00B4D8",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#D97706",
            bgColor: "#D5D8E0", cardColor: "#FFFFFF", sidebarColor: "#111113", sidebarHover: "#1C1C1F", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(248,249,252,0.92)",
            textPrimary: "#1A1A2E", textSecondary: "#6B7280", textMuted: "#9CA3AF",
            borderColor: "#D8DAE0", borderLight: "#E8EAF0", darkModeEnabled: false,
        },
    },
    {
        name: "Ocean",
        description: "Navy sidebar",
        swatches: ["#2563EB", "#0891B2", "#D1DAE5", "#0C2340"],
        colors: {
            primaryColor: "#2563EB", accentColor: "#0891B2",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#D97706",
            bgColor: "#D1DAE5", cardColor: "#FFFFFF", sidebarColor: "#0C2340", sidebarHover: "#163561", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(237,242,248,0.92)",
            textPrimary: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
            borderColor: "#C0CCDB", borderLight: "#D6DEE8", darkModeEnabled: false,
        },
    },
    {
        name: "Mint",
        description: "Teal sidebar",
        swatches: ["#0D9488", "#0284C7", "#CFE8E4", "#0A3D38"],
        colors: {
            primaryColor: "#0D9488", accentColor: "#0284C7",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#B45309",
            bgColor: "#CFE8E4", cardColor: "#FFFFFF", sidebarColor: "#0A3D38", sidebarHover: "#145650", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(236,247,245,0.92)",
            textPrimary: "#134E48", textSecondary: "#4B6B68", textMuted: "#8BA5A2",
            borderColor: "#C0D6D2", borderLight: "#D4E5E2", darkModeEnabled: false,
        },
    },
    {
        name: "Sunset",
        description: "Warm cream",
        swatches: ["#C2410C", "#B45309", "#E0D9D0", "#2C1A0E"],
        colors: {
            primaryColor: "#C2410C", accentColor: "#B45309",
            successColor: "#059669", dangerColor: "#B91C1C", warningColor: "#A16207",
            bgColor: "#E0D9D0", cardColor: "#FFFFFF", sidebarColor: "#2C1A0E", sidebarHover: "#3D2A1C", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(249,244,237,0.92)",
            textPrimary: "#292524", textSecondary: "#78716C", textMuted: "#A8A29E",
            borderColor: "#CCC7C0", borderLight: "#DDD8D2", darkModeEnabled: false,
        },
    },
    {
        name: "Rose",
        description: "Plum sidebar",
        swatches: ["#BE123C", "#A21CAF", "#E0D5D8", "#2D1220"],
        colors: {
            primaryColor: "#BE123C", accentColor: "#A21CAF",
            successColor: "#059669", dangerColor: "#BE123C", warningColor: "#D97706",
            bgColor: "#E0D5D8", cardColor: "#FFFFFF", sidebarColor: "#2D1220", sidebarHover: "#451A32", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(249,240,243,0.92)",
            textPrimary: "#1C1017", textSecondary: "#6B5A62", textMuted: "#9E8F95",
            borderColor: "#D8D0D4", borderLight: "#E8E2E5", darkModeEnabled: false,
        },
    },
    {
        name: "Midnight",
        description: "Dark mode",
        swatches: ["#7C83DB", "#2DD4A8", "#121218", "#09090b"],
        colors: {
            primaryColor: "#7C83DB", accentColor: "#2DD4A8",
            successColor: "#2DD4A8", dangerColor: "#F87171", warningColor: "#FBBF24",
            bgColor: "#121218", cardColor: "#1C1C26", sidebarColor: "#09090b", sidebarHover: "#18181b", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(28,28,38,0.92)",
            textPrimary: "#E4E4E7", textSecondary: "#A1A1AA", textMuted: "#71717A",
            borderColor: "#27272a", borderLight: "#1f1f23", darkModeEnabled: true,
        },
    },
    {
        name: "Mono",
        description: "Pure grayscale",
        swatches: ["#374151", "#6B7280", "#D8DADC", "#111827"],
        colors: {
            primaryColor: "#374151", accentColor: "#6B7280",
            successColor: "#374151", dangerColor: "#7F1D1D", warningColor: "#78350F",
            bgColor: "#D8DADC", cardColor: "#FFFFFF", sidebarColor: "#111827", sidebarHover: "#1F2937", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(242,243,245,0.92)",
            textPrimary: "#111827", textSecondary: "#6B7280", textMuted: "#9CA3AF",
            borderColor: "#D5D8DC", borderLight: "#E2E4E8", darkModeEnabled: false,
        },
    },
    {
        name: "Gold",
        description: "Luxury dark",
        swatches: ["#A67C00", "#854D0E", "#0F0F0F", "#1A1500"],
        colors: {
            primaryColor: "#A67C00", accentColor: "#854D0E",
            successColor: "#4ADE80", dangerColor: "#F87171", warningColor: "#A67C00",
            bgColor: "#0F0F0F", cardColor: "#1A1A1A", sidebarColor: "#1A1500", sidebarHover: "#2A2500", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(26,21,0,0.92)",
            textPrimary: "#F5F0E0", textSecondary: "#B8A88A", textMuted: "#8A7D65",
            borderColor: "#2E2A1A", borderLight: "#222010", darkModeEnabled: true,
        },
    },
    // Row 2
    {
        name: "Arctic",
        description: "Light sidebar",
        swatches: ["#2563EB", "#0891B2", "#DCE0E8", "#E0E5EC"],
        colors: {
            primaryColor: "#2563EB", accentColor: "#0891B2",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#D97706",
            bgColor: "#DCE0E8", cardColor: "#FFFFFF", sidebarColor: "#E0E5EC", sidebarHover: "#CFD6E0", sidebarTextColor: "#1e293b",
            headerColor: "rgba(245,247,251,0.95)",
            textPrimary: "#0f172a", textSecondary: "#475569", textMuted: "#94a3b8",
            borderColor: "#C0CCDB", borderLight: "#D6DEE8", darkModeEnabled: false,
        },
    },
    {
        name: "Pastel",
        description: "Soft & gentle",
        swatches: ["#8B7EC8", "#6DAFA7", "#D9D5E2", "#2D2B3D"],
        colors: {
            primaryColor: "#8B7EC8", accentColor: "#6DAFA7",
            successColor: "#6DAF8B", dangerColor: "#C87E7E", warningColor: "#C8A96D",
            bgColor: "#D9D5E2", cardColor: "#FFFFFF", sidebarColor: "#2D2B3D", sidebarHover: "#3D3A52", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(243,240,247,0.92)",
            textPrimary: "#2D2B3D", textSecondary: "#7E7B8E", textMuted: "#A8A5B5",
            borderColor: "#D5D0DE", borderLight: "#E4E0EB", darkModeEnabled: false,
        },
    },
    {
        name: "Royal",
        description: "Purple sidebar",
        swatches: ["#7E22CE", "#C026D3", "#D8D1E5", "#3B0764"],
        colors: {
            primaryColor: "#7E22CE", accentColor: "#C026D3",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#D97706",
            bgColor: "#D8D1E5", cardColor: "#FFFFFF", sidebarColor: "#3B0764", sidebarHover: "#581C87", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(242,237,248,0.92)",
            textPrimary: "#1E0A3C", textSecondary: "#6B5A80", textMuted: "#9E8FB5",
            borderColor: "#CFC6E0", borderLight: "#E0D9EC", darkModeEnabled: false,
        },
    },
    {
        name: "Cyber",
        description: "Neon dark",
        swatches: ["#06B6D4", "#A855F7", "#0A0A0A", "#050505"],
        colors: {
            primaryColor: "#06B6D4", accentColor: "#A855F7",
            successColor: "#22D3EE", dangerColor: "#F43F5E", warningColor: "#FBBF24",
            bgColor: "#0A0A0A", cardColor: "#141414", sidebarColor: "#050505", sidebarHover: "#1A1A1A", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(10,10,10,0.95)",
            textPrimary: "#E0F2FE", textSecondary: "#7DD3FC", textMuted: "#38BDF8",
            borderColor: "#1E293B", borderLight: "#0F172A", darkModeEnabled: true,
        },
    },
    {
        name: "Cream",
        description: "Warm brown bar",
        swatches: ["#78350F", "#92400E", "#DFD7C9", "#44342A"],
        colors: {
            primaryColor: "#78350F", accentColor: "#92400E",
            successColor: "#059669", dangerColor: "#B91C1C", warningColor: "#92400E",
            bgColor: "#DFD7C9", cardColor: "#FFFFFF", sidebarColor: "#44342A", sidebarHover: "#5C483D", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(248,242,232,0.92)",
            textPrimary: "#1c1612", textSecondary: "#78716C", textMuted: "#A8A29E",
            borderColor: "#CCC5BB", borderLight: "#DDD7CE", darkModeEnabled: false,
        },
    },
    {
        name: "Sakura",
        description: "Cherry blossom",
        swatches: ["#DB2777", "#E879A8", "#E2D2D8", "#3D1526"],
        colors: {
            primaryColor: "#DB2777", accentColor: "#E879A8",
            successColor: "#059669", dangerColor: "#BE123C", warningColor: "#D97706",
            bgColor: "#E2D2D8", cardColor: "#FFFFFF", sidebarColor: "#3D1526", sidebarHover: "#571D38", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(250,240,244,0.92)",
            textPrimary: "#1C0A14", textSecondary: "#7A5A68", textMuted: "#A8909B",
            borderColor: "#DDD2D8", borderLight: "#ECE4E9", darkModeEnabled: false,
        },
    },
    {
        name: "Olive",
        description: "Military green",
        swatches: ["#4D5B2D", "#6B7F3A", "#D6D9CF", "#1A1E10"],
        colors: {
            primaryColor: "#4D5B2D", accentColor: "#6B7F3A",
            successColor: "#4D5B2D", dangerColor: "#B91C1C", warningColor: "#92400E",
            bgColor: "#D6D9CF", cardColor: "#FFFFFF", sidebarColor: "#1A1E10", sidebarHover: "#2E3420", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(241,243,235,0.92)",
            textPrimary: "#1A1E10", textSecondary: "#5C6350", textMuted: "#8E9585",
            borderColor: "#C8CEC0", borderLight: "#D8DDD0", darkModeEnabled: false,
        },
    },
    {
        name: "Glacier",
        description: "Icy cool",
        swatches: ["#1E6091", "#1A759F", "#CFDCE2", "#0B2838"],
        colors: {
            primaryColor: "#1E6091", accentColor: "#1A759F",
            successColor: "#059669", dangerColor: "#DC2626", warningColor: "#B45309",
            bgColor: "#CFDCE2", cardColor: "#FFFFFF", sidebarColor: "#0B2838", sidebarHover: "#163D52", sidebarTextColor: "#FFFFFF",
            headerColor: "rgba(236,245,249,0.92)",
            textPrimary: "#0B2838", textSecondary: "#4A6A7A", textMuted: "#8AABB8",
            borderColor: "#B8D0DB", borderLight: "#D0E2EC", darkModeEnabled: false,
        },
    },
];

export default function ThemeSettingsPage() {
    const { t } = usePageTranslation("theme-settings");
    const { showSuccess, showError, showConfirm } = useMessages();
    const { data: theme, isLoading } = useThemeSettings();
    const updateMutation = useUpdateThemeSettings();
    const resetMutation = useResetThemeSettings();

    const [activeTab, setActiveTab] = useState<"colors" | "typography" | "layout" | "features">("colors");
    const [formData, setFormData] = useState<ThemeSettingsDto>({ ...DEFAULT_THEME });
    const [livePreview, setLivePreview] = useState(true);

    // Keep a ref to original theme so we can revert on cancel
    const originalThemeRef = useRef<ThemeSettingsDto>({ ...DEFAULT_THEME });

    // Sync form when API data arrives
    useEffect(() => {
        if (theme && !updateMutation.isPending) {
            const merged = { ...DEFAULT_THEME, ...theme };
            setFormData(merged);
            originalThemeRef.current = { ...merged };
        }
    }, [theme, updateMutation.isPending]);

    const updateField = useCallback(<K extends keyof ThemeSettingsDto>(key: K, value: ThemeSettingsDto[K]) => {
        setFormData(prev => {
            const next = { ...prev, [key]: value };
            // Live preview: apply changes immediately
            if (livePreview) {
                applyTheme(next);
            }
            return next;
        });
    }, [livePreview]);

    const applyPreset = useCallback((preset: ThemePreset) => {
        setFormData(prev => {
            const next = { ...prev, ...preset.colors };
            if (livePreview) applyTheme(next);
            return next;
        });
    }, [livePreview]);

    /** Check if a preset roughly matches current formData */
    const isPresetActive = (preset: ThemePreset) => {
        const p1 = preset.colors.primaryColor?.toLowerCase();
        const f1 = formData.primaryColor?.toLowerCase();
        const p2 = preset.colors.bgColor?.toLowerCase();
        const f2 = formData.bgColor?.toLowerCase();
        const p3 = preset.colors.sidebarColor?.toLowerCase();
        const f3 = formData.sidebarColor?.toLowerCase();

        return p1 === f1 && p2 === f2 && p3 === f3;
    };

    const handleSave = () => {
        const payload = { ...formData };
        if (theme?.themeId) {
            payload.themeId = theme.themeId;
        } else {
            delete payload.themeId;
        }

        // Apply and persist
        applyTheme(payload);

        updateMutation.mutate(payload, {
            onSuccess: () => {
                originalThemeRef.current = payload;
                showSuccess("SAVE_SUCCESS", "Success!", "Theme settings saved.");
            },
            onError: (err) => {
                showError("SAVE_ERROR", "Error!", getApiErrorMessage(err, "Saved locally. API save failed."));
            },
        });
    };

    const handleReset = () => {
        showConfirm(
            "RESET_CONFIRM",
            () => {
                setFormData({ ...DEFAULT_THEME });
                applyTheme(DEFAULT_THEME);

                resetMutation.mutate(undefined, {
                    onSuccess: () => {
                        originalThemeRef.current = { ...DEFAULT_THEME };
                        showSuccess("RESET_SUCCESS", "Reset!", "Theme reset to defaults.");
                    },
                    onError: () => showError("RESET_ERROR", "Error!", "Saved locally. API reset failed."),
                });
            },
            { fallbackTitle: "Reset Theme?", fallbackMsg: "Restore all settings to defaults?" }
        );
    };

    if (isLoading) return <div className={ui.pageContainer}><LoadingSpinner /></div>;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t("Theme Settings")}
                breadcrumbs={[
                    { label: t("Dashboard"), href: ROUTES.adminDashboard },
                    { label: t("Settings") },
                    { label: t("Theme Settings") },
                ]}
                extra={
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const next = !livePreview;
                                setLivePreview(next);
                                if (next) applyTheme(formData);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                                livePreview
                                    ? "border-nv-violet/30 bg-nv-violet-light text-nv-violet"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {t("Live Preview")} {livePreview ? "ON" : "OFF"}
                        </button>

                        <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={resetMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {resetMutation.isPending ? t("Resetting...") : t("Reset")}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setFormData({ ...originalThemeRef.current });
                                if (livePreview) applyTheme(originalThemeRef.current);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <Undo2 className="w-3.5 h-3.5" />
                            {t("Cancel")}
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-nv-violet text-white shadow-sm hover:bg-nv-violet-dark transition-all disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {updateMutation.isPending ? t("Saving...") : t("Save Settings")}
                        </button>
                    </div>
                }
            />

            {/* ── Card 1: Theme Presets ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                <Paintbrush className="w-4 h-4 text-nv-violet" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">{t("Quick Presets")}</h3>
                                <span className="text-xs text-gray-400">{t("Choose a preset or customize below")}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {THEME_PRESETS.map((preset) => {
                                const active = isPresetActive(preset);
                                return (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => applyPreset(preset)}
                                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                            active
                                                ? "border-nv-violet bg-nv-violet-light/50 shadow-sm"
                                                : "border-gray-100 hover:border-gray-300 bg-white"
                                        }`}
                                    >
                                        {/* Color swatches */}
                                        <div className="flex items-center gap-0.5">
                                            {preset.swatches.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-7 rounded-sm shadow-sm transition-transform group-hover:scale-105 ${
                                                        i === 0 ? "w-5 rounded-l-md" : i === 3 ? "w-4 rounded-r-md" : "w-4"
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        {/* Label */}
                                        <div className="text-center">
                                            <p className={`text-xs font-semibold ${active ? "text-nv-violet" : "text-gray-700"}`}>
                                                {preset.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 leading-tight">{preset.description}</p>
                                        </div>
                                        {/* Active checkmark */}
                                        {active && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-nv-violet flex items-center justify-center shadow-sm">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                </div>
            </div>

            {/* ── Card 2: Tab Content ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">

                    {/* ── Tab Navigation ── */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <TabButton active={activeTab === "colors"} icon={Palette} label={t("Colors")} onClick={() => setActiveTab("colors")} />
                        <TabButton active={activeTab === "typography"} icon={Type} label={t("Typography")} onClick={() => setActiveTab("typography")} />
                        <TabButton active={activeTab === "layout"} icon={Layout} label={t("Layout")} onClick={() => setActiveTab("layout")} />
                        <TabButton active={activeTab === "features"} icon={SlidersHorizontal} label={t("Features")} onClick={() => setActiveTab("features")} />
                    </div>

                    {/* ── Colors Tab ── */}
                    {activeTab === "colors" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-5">
                                <SectionCard title={t("Brand Colors")} icon={Palette} accent="violet">
                                    <ColorPicker label="Primary Color" description="Main buttons, links, active states" value={formData.primaryColor} onChange={(v) => updateField("primaryColor", v)} />
                                    <ColorPicker label="Accent Color" description="Secondary highlights, badges" value={formData.accentColor} onChange={(v) => updateField("accentColor", v)} />
                                </SectionCard>

                                <SectionCard title={t("Status Colors")} accent="emerald">
                                    <ColorPicker label="Success" value={formData.successColor} onChange={(v) => updateField("successColor", v)} />
                                    <ColorPicker label="Danger" value={formData.dangerColor} onChange={(v) => updateField("dangerColor", v)} />
                                    <ColorPicker label="Warning" value={formData.warningColor} onChange={(v) => updateField("warningColor", v)} />
                                </SectionCard>
                            </div>

                            <div className="space-y-5">
                                <SectionCard title={t("Background & Surface")} icon={Layout} accent="blue">
                                    <ColorPicker label="Page Background" description="Main page background" value={formData.bgColor} onChange={(v) => updateField("bgColor", v)} />
                                    <ColorPicker label="Card Background" description="Cards, tables, panels" value={formData.cardColor} onChange={(v) => updateField("cardColor", v)} />
                                    <ColorPicker label="Sidebar" value={formData.sidebarColor} onChange={(v) => updateField("sidebarColor", v)} />
                                    <ColorPicker label="Sidebar Hover" value={formData.sidebarHover} onChange={(v) => updateField("sidebarHover", v)} />
                                    <ColorPicker label="Sidebar Text" description="Menu text on sidebar" value={formData.sidebarTextColor || "#FFFFFF"} onChange={(v) => updateField("sidebarTextColor", v)} />
                                    <ColorPicker label="Header Bar" value={formData.headerColor || "#FFFFFF"} onChange={(v) => updateField("headerColor", v)} />
                                </SectionCard>

                                <SectionCard title={t("Text Colors")} icon={Type} accent="slate">
                                    <ColorPicker label="Primary Text" description="Headings, body text" value={formData.textPrimary} onChange={(v) => updateField("textPrimary", v)} />
                                    <ColorPicker label="Secondary Text" description="Labels, descriptions" value={formData.textSecondary} onChange={(v) => updateField("textSecondary", v)} />
                                    <ColorPicker label="Muted Text" description="Placeholders, disabled" value={formData.textMuted} onChange={(v) => updateField("textMuted", v)} />
                                </SectionCard>

                                <SectionCard title={t("Border Colors")} accent="amber">
                                    <ColorPicker label="Border" description="Card/table borders" value={formData.borderColor} onChange={(v) => updateField("borderColor", v)} />
                                    <ColorPicker label="Border Light" description="Row dividers" value={formData.borderLight} onChange={(v) => updateField("borderLight", v)} />
                                </SectionCard>
                            </div>
                        </div>
                    )}

                    {/* ── Typography Tab ── */}
                    {activeTab === "typography" && (
                        <div className="max-w-xl space-y-5">
                            <SectionCard title={t("Body Font")} icon={Type} accent="violet">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Font Family</label>
                                        <select
                                            value={formData.fontFamily}
                                            onChange={(e) => updateField("fontFamily", e.target.value)}
                                            className={ui.select}
                                        >
                                            <optgroup label="— Thai-Ready —">
                                                <option value="Inter, sans-serif" style={{ fontFamily: 'Inter' }}>Inter</option>
                                                <option value="'Sarabun', sans-serif" style={{ fontFamily: 'Sarabun' }}>Sarabun</option>
                                                <option value="'Noto Sans Thai', sans-serif" style={{ fontFamily: 'Noto Sans Thai' }}>Noto Sans Thai</option>
                                                <option value="'IBM Plex Sans Thai', sans-serif" style={{ fontFamily: 'IBM Plex Sans Thai' }}>IBM Plex Sans Thai</option>
                                                <option value="'Prompt', sans-serif" style={{ fontFamily: 'Prompt' }}>Prompt</option>
                                                <option value="'Kanit', sans-serif" style={{ fontFamily: 'Kanit' }}>Kanit</option>
                                                <option value="'Mitr', sans-serif" style={{ fontFamily: 'Mitr' }}>Mitr</option>
                                                <option value="'K2D', sans-serif" style={{ fontFamily: 'K2D' }}>K2D</option>
                                                <option value="'Chakra Petch', sans-serif" style={{ fontFamily: 'Chakra Petch' }}>Chakra Petch</option>
                                            </optgroup>
                                            <optgroup label="— Modern Sans —">
                                                <option value="'Roboto', sans-serif" style={{ fontFamily: 'Roboto' }}>Roboto</option>
                                                <option value="'Outfit', sans-serif" style={{ fontFamily: 'Outfit' }}>Outfit</option>
                                                <option value="'Poppins', sans-serif" style={{ fontFamily: 'Poppins' }}>Poppins</option>
                                                <option value="'Nunito', sans-serif" style={{ fontFamily: 'Nunito' }}>Nunito</option>
                                                <option value="'DM Sans', sans-serif" style={{ fontFamily: 'DM Sans' }}>DM Sans</option>
                                                <option value="'Source Sans 3', sans-serif" style={{ fontFamily: 'Source Sans 3' }}>Source Sans 3</option>
                                                <option value="'Lato', sans-serif" style={{ fontFamily: 'Lato' }}>Lato</option>
                                                <option value="'Montserrat', sans-serif" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                                                <option value="'Work Sans', sans-serif" style={{ fontFamily: 'Work Sans' }}>Work Sans</option>
                                                <option value="'Manrope', sans-serif" style={{ fontFamily: 'Manrope' }}>Manrope</option>
                                                <option value="'Plus Jakarta Sans', sans-serif" style={{ fontFamily: 'Plus Jakarta Sans' }}>Plus Jakarta Sans</option>
                                                <option value="'Raleway', sans-serif" style={{ fontFamily: 'Raleway' }}>Raleway</option>
                                                <option value="'Quicksand', sans-serif" style={{ fontFamily: 'Quicksand' }}>Quicksand</option>
                                            </optgroup>
                                            <optgroup label="— Monospace —">
                                                <option value="'JetBrains Mono', monospace" style={{ fontFamily: 'JetBrains Mono' }}>JetBrains Mono</option>
                                                <option value="'Fira Code', monospace" style={{ fontFamily: 'Fira Code' }}>Fira Code</option>
                                            </optgroup>
                                            <optgroup label="— System —">
                                                <option value="Arial, sans-serif">Arial</option>
                                                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                                                <option value="system-ui, sans-serif">System Default</option>
                                                <option value="Georgia, serif">Georgia (Serif)</option>
                                                <option value="'Times New Roman', serif">Times New Roman</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Base Font Size</label>
                                        <select
                                            value={formData.fontSizeBase}
                                            onChange={(e) => updateField("fontSizeBase", e.target.value)}
                                            className={ui.select}
                                        >
                                            <option value="10px">10px — Extra Small</option>
                                            <option value="11px">11px — Compact</option>
                                            <option value="12px">12px — Small</option>
                                            <option value="13px">13px</option>
                                            <option value="14px">14px — Default</option>
                                            <option value="15px">15px</option>
                                            <option value="16px">16px — Large</option>
                                            <option value="17px">17px</option>
                                            <option value="18px">18px — Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title={t("Heading Font")} icon={Type} accent="blue">
                                <div>
                                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Heading Font Family</label>
                                    <select
                                        value={formData.headingFontFamily}
                                        onChange={(e) => updateField("headingFontFamily", e.target.value)}
                                        className={ui.select}
                                    >
                                        <option value="Inter, sans-serif">Inter (same as body)</option>
                                        <optgroup label="— Thai-Ready —">
                                            <option value="'Sarabun', sans-serif">Sarabun</option>
                                            <option value="'Prompt', sans-serif">Prompt</option>
                                            <option value="'Kanit', sans-serif">Kanit</option>
                                            <option value="'Mitr', sans-serif">Mitr</option>
                                            <option value="'K2D', sans-serif">K2D</option>
                                            <option value="'Chakra Petch', sans-serif">Chakra Petch</option>
                                            <option value="'Noto Sans Thai', sans-serif">Noto Sans Thai</option>
                                        </optgroup>
                                        <optgroup label="— Modern Sans —">
                                            <option value="'Roboto', sans-serif">Roboto</option>
                                            <option value="'Outfit', sans-serif">Outfit</option>
                                            <option value="'Poppins', sans-serif">Poppins</option>
                                            <option value="'Nunito', sans-serif">Nunito</option>
                                            <option value="'DM Sans', sans-serif">DM Sans</option>
                                            <option value="'Montserrat', sans-serif">Montserrat</option>
                                            <option value="'Manrope', sans-serif">Manrope</option>
                                            <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                                            <option value="'Raleway', sans-serif">Raleway</option>
                                            <option value="'Quicksand', sans-serif">Quicksand</option>
                                        </optgroup>
                                        <optgroup label="— Display & Serif —">
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="'Playfair Display', serif">Playfair Display</option>
                                            <option value="'Merriweather', serif">Merriweather</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </SectionCard>

                            {/* Preview */}
                            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: formData.bgColor }}>
                                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">{t("Preview")}</p>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: formData.cardColor, fontFamily: formData.fontFamily, fontSize: formData.fontSizeBase }}>
                                    <h3 className="font-bold mb-2" style={{ fontFamily: formData.headingFontFamily, color: formData.textPrimary, fontSize: '1.125em' }}>
                                        Dashboard Overview
                                    </h3>
                                    <p style={{ color: formData.textPrimary }}>
                                        The quick brown fox jumps over the lazy dog
                                    </p>
                                    <p style={{ color: formData.textSecondary }} className="mt-1">
                                        ยินดีต้อนรับสู่ระบบ NEXT-FORCE — ระบบจัดการทรัพยากรบุคคล
                                    </p>
                                    <p style={{ color: formData.textMuted }} className="mt-1 text-xs">
                                        Last updated: March 19, 2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Layout Tab ── */}
                    {activeTab === "layout" && (
                        <div className="max-w-xl space-y-5">
                            <SectionCard title={t("Dimensions")} icon={Layout} accent="emerald">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Border Radius</label>
                                        <select
                                            value={formData.borderRadius}
                                            onChange={(e) => updateField("borderRadius", e.target.value)}
                                            className={ui.select}
                                        >
                                            <option value="0px">Sharp (0px)</option>
                                            <option value="4px">Subtle (4px)</option>
                                            <option value="8px">Rounded (8px)</option>
                                            <option value="12px">Default (12px)</option>
                                            <option value="16px">More Rounded (16px)</option>
                                            <option value="24px">Pill (24px)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Sidebar Width</label>
                                        <select
                                            value={formData.sidebarWidth}
                                            onChange={(e) => updateField("sidebarWidth", e.target.value)}
                                            className={ui.select}
                                        >
                                            <option value="200px">Compact (200px)</option>
                                            <option value="220px">Narrow (220px)</option>
                                            <option value="260px">Default (260px)</option>
                                            <option value="300px">Wide (300px)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Header Height</label>
                                        <select
                                            value={formData.headerHeight}
                                            onChange={(e) => updateField("headerHeight", e.target.value)}
                                            className={ui.select}
                                        >
                                            <option value="48px">Compact (48px)</option>
                                            <option value="56px">Narrow (56px)</option>
                                            <option value="64px">Default (64px)</option>
                                            <option value="72px">Tall (72px)</option>
                                        </select>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Preview */}
                            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: formData.bgColor }}>
                                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">{t("Preview")}</p>
                                <div className="flex gap-3 flex-wrap">
                                    <div
                                        className="px-5 py-2.5 text-sm font-medium text-white shadow-sm"
                                        style={{ backgroundColor: formData.primaryColor, borderRadius: formData.borderRadius }}
                                    >
                                        Primary Button
                                    </div>
                                    <div
                                        className="px-5 py-2.5 text-sm font-medium border"
                                        style={{ borderColor: formData.borderColor, borderRadius: formData.borderRadius, color: formData.textPrimary }}
                                    >
                                        Secondary
                                    </div>
                                    <div
                                        className="px-5 py-2.5 text-sm font-medium text-white"
                                        style={{ backgroundColor: formData.dangerColor, borderRadius: formData.borderRadius }}
                                    >
                                        Delete
                                    </div>
                                </div>
                                <div className="mt-4 p-4" style={{ backgroundColor: formData.cardColor, borderRadius: formData.borderRadius, border: `1px solid ${formData.borderColor}` }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: formData.textPrimary }}>Sample Card</span>
                                        <span className="text-xs" style={{ color: formData.textSecondary }}>Detail</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Features Tab ── */}
                    {activeTab === "features" && (
                        <div className="max-w-xl space-y-5">
                            <SectionCard title={t("Display Options")} icon={SlidersHorizontal} accent="violet">
                                <ToggleSwitch
                                    icon={Moon}
                                    label={t("Dark Mode")}
                                    description={t("Dark mode description", "Switch to dark color scheme for backgrounds and text")}
                                    checked={formData.darkModeEnabled}
                                    onChange={(v) => updateField("darkModeEnabled", v)}
                                />
                                <ToggleSwitch
                                    icon={Monitor}
                                    label={t("Compact Mode")}
                                    description={t("Compact mode description", "Reduce spacing for denser table and form layout")}
                                    checked={formData.compactMode}
                                    onChange={(v) => updateField("compactMode", v)}
                                />
                                <ToggleSwitch
                                    icon={Sun}
                                    label={t("RTL Layout")}
                                    description={t("RTL description", "Right-to-left text direction (for Arabic, Hebrew)")}
                                    checked={formData.rtlEnabled}
                                    onChange={(v) => updateField("rtlEnabled", v)}
                                />
                            </SectionCard>

                            <SectionCard title={t("Custom CSS")} accent="slate">
                                <div>
                                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Additional CSS</label>
                                    <textarea
                                        value={formData.customCss || ""}
                                        onChange={(e) => updateField("customCss", e.target.value)}
                                        placeholder="/* Add custom CSS overrides here */"
                                        rows={5}
                                        className={ui.textarea + " font-mono text-xs"}
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">Advanced: Add custom CSS rules to fine-tune the appearance.</p>
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
