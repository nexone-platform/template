'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeData {
  theme_id?: number;
  // Brand Colors
  primary_color?: string;
  accent_color?: string;
  success_color?: string;
  danger_color?: string;
  warning_color?: string;
  // UI Element Colors
  bg_color?: string;
  card_color?: string;
  sidebar_color?: string;
  sidebar_hover?: string;
  header_color?: string;
  header_text_color?: string;
  text_primary?: string;
  text_secondary?: string;
  text_muted?: string;
  border_color?: string;
  // Typography & Layout
  font_family?: string;
  font_size_base?: string;
  header_font_size?: string;
  header_font_family?: string;
  sidebar_width?: string;
  header_height?: string;
  border_radius?: string;
  // Settings
  dark_mode_enabled?: boolean;
  compact_mode?: boolean;
  is_active?: boolean;
}

interface ThemeContextValue {
  theme: ThemeData | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
  refreshTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

/**
 * Maps theme data from the API to CSS custom properties on :root.
 * This bridges the admin "Display & Theme" settings to every app in the platform.
 */
export function applyThemeToCSS(theme: ThemeData) {
  const root = document.documentElement;

  // Helper to set a CSS variable only if the value exists
  const set = (prop: string, value?: string) => {
    if (value) root.style.setProperty(prop, value);
  };

  // ── Brand Colors ───────────────────────────────────────────────────────
  set('--color-primary', theme.primary_color);
  set('--accent-blue', theme.accent_color || theme.primary_color);
  set('--nexone-blue-500', theme.accent_color || theme.primary_color);
  set('--nexone-blue-600', theme.primary_color);
  set('--color-success', theme.success_color);
  set('--accent-green', theme.success_color);
  set('--color-warning', theme.warning_color);
  set('--accent-amber', theme.warning_color);
  set('--color-danger', theme.danger_color);
  set('--accent-red', theme.danger_color);

  // ── UI Element Colors ──────────────────────────────────────────────────
  set('--bg-page', theme.bg_color);
  set('--bg-primary', theme.bg_color);
  set('--bg-card', theme.card_color);
  set('--border-color', theme.border_color);
  set('--sidebar-bg', theme.sidebar_color);
  set('--bg-sidebar', theme.sidebar_color);
  set('--nexone-navy-800', theme.sidebar_color);
  set('--sidebar-item-hover', theme.sidebar_hover);
  if (theme.font_size_base) {
    set('--sidebar-font-size', theme.font_size_base);
  }
  
  if (theme.font_family) {
    set('--sidebar-font-family', theme.font_family);
  }
  
  set('--text-primary', theme.text_primary);
  set('--text-secondary', theme.text_secondary);
  set('--text-muted', theme.text_muted);

  // Header color can be rgba(...) or hex
  if (theme.header_color) {
    set('--bg-topbar', theme.header_color);
  }
  if (theme.header_text_color) {
    set('--topbar-text', theme.header_text_color);
    set('--topbar-text-color', theme.header_text_color);
  }
  if (theme.header_font_size) {
    set('--topbar-font-size', theme.header_font_size);
  } else if (theme.font_size_base) {
    set('--topbar-font-size', theme.font_size_base);
  }
  
  if (theme.header_font_family) {
    set('--topbar-font-family', theme.header_font_family);
  } else if (theme.font_family) {
    set('--topbar-font-family', theme.font_family);
  }

  // ── Typography & Layout ────────────────────────────────────────────────
  if (theme.font_family) {
    set('--font-family', theme.font_family);
    root.style.fontFamily = theme.font_family;
  }
  if (theme.font_size_base) {
    set('--text-base', theme.font_size_base);
    root.style.fontSize = theme.font_size_base;
  }
  if (theme.sidebar_width) {
    set('--sidebar-width', theme.sidebar_width);
  }
  if (theme.header_height) {
    set('--topbar-height', theme.header_height);
  }
  if (theme.border_radius) {
    set('--radius', theme.border_radius);
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  if (theme.dark_mode_enabled) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** The base URL for the nex-core API, e.g. "http://localhost:8101/api" */
  coreApiUrl: string;
}

export function ThemeProvider({ children, coreApiUrl }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const res = await fetch(`${coreApiUrl}/v1/themes/active`);
      if (res.ok) {
        const json = await res.json();
        const data: ThemeData = json.data || json;
        setTheme(data);
        applyThemeToCSS(data);
      }
    } catch (err) {
      console.warn('[ThemeProvider] Failed to load theme, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, [coreApiUrl]);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
