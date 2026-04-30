import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface ThemeSettingsDto {
    themeId?: number;

    // Brand Colors
    primaryColor: string;
    primaryDark: string;
    primaryLight: string;
    accentColor: string;
    accentLight: string;

    // Status Colors
    successColor: string;
    dangerColor: string;
    warningColor: string;

    // Background & Surface
    bgColor: string;
    cardColor: string;
    sidebarColor: string;
    sidebarHover: string;
    sidebarTextColor: string;
    headerColor: string;

    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Border Colors
    borderColor: string;
    borderLight: string;

    // Typography
    fontFamily: string;
    fontSizeBase: string;
    headingFontFamily: string;

    // Layout
    sidebarWidth: string;
    sidebarCollapsedWidth: string;
    headerHeight: string;
    borderRadius: string;

    // Features
    darkModeEnabled: boolean;
    rtlEnabled: boolean;
    compactMode: boolean;

    // Custom CSS
    customCss: string;
}

export const DEFAULT_THEME: ThemeSettingsDto = {
    primaryColor: "#6C5CE7",
    primaryDark: "#5A4BD1",
    primaryLight: "#F0EEFF",
    accentColor: "#00B4D8",
    accentLight: "#E0F7FA",
    successColor: "#059669",
    dangerColor: "#DC2626",
    warningColor: "#D97706",
    bgColor: "#D5D8E0",
    cardColor: "#FFFFFF",
    sidebarColor: "#111113",
    sidebarHover: "#1C1C1F",
    sidebarTextColor: "#FFFFFF",
    headerColor: "rgba(248,249,252,0.92)",
    textPrimary: "#1A1A2E",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    borderColor: "#D8DAE0",
    borderLight: "#E8EAF0",
    fontFamily: "Inter, sans-serif",
    fontSizeBase: "14px",
    headingFontFamily: "Inter, sans-serif",
    sidebarWidth: "260px",
    sidebarCollapsedWidth: "70px",
    headerHeight: "64px",
    borderRadius: "12px",
    darkModeEnabled: false,
    rtlEnabled: false,
    compactMode: false,
    customCss: "",
};

export function useThemeSettings() {
    return useQuery<ThemeSettingsDto>({
        queryKey: ["themeSettings"],
        queryFn: async () => {
            const { data } = await apiClient.get<ThemeSettingsDto>("themesettings");
            return data;
        },
        staleTime: 5 * 60_000,
    });
}

export function useUpdateThemeSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dto: ThemeSettingsDto) => {
            const { data } = await apiClient.put("themesettings", dto);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["themeSettings"] });
        },
    });
}

export function useResetThemeSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post("themesettings/reset");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["themeSettings"] });
        },
    });
}
