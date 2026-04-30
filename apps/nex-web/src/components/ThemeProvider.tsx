'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

const THEME_API = `${API_BASE_URL}/theme`;

interface ThemeData {
    brand: {
        primary: string;
        primaryDark: string;
        primaryLight: string;
        secondary: string;
        secondaryDark: string;
        accent: string;
    };
    sections: Record<string, Record<string, string>>;
    fonts: {
        primary?: string;
        headingWeight?: string;
        bodyWeight?: string;
    };
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadTheme() {
            try {
                const res = await fetch(THEME_API, { cache: 'no-store' });
                if (!res.ok) return;
                const theme: ThemeData = await res.json();
                applyTheme(theme);
            } catch (err) {
                console.warn('ThemeProvider: Could not load theme, using defaults', err);
            } finally {
                setLoaded(true);
            }
        }
        loadTheme();
    }, []);

    return (
        <div
            style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.15s ease-in',
            }}
        >
            {children}
        </div>
    );
}

function applyTheme(theme: ThemeData) {
    const root = document.documentElement;
    if (!root) return;

    // ── Brand colors as CSS custom properties ──
    if (theme.brand) {
        root.style.setProperty('--theme-primary', theme.brand.primary);
        root.style.setProperty('--theme-primary-dark', theme.brand.primaryDark);
        root.style.setProperty('--theme-primary-light', theme.brand.primaryLight);
        root.style.setProperty('--theme-secondary', theme.brand.secondary);
        root.style.setProperty('--theme-secondary-dark', theme.brand.secondaryDark);
        root.style.setProperty('--theme-accent', theme.brand.accent);

        // Gradient shorthand
        root.style.setProperty(
            '--theme-gradient',
            `linear-gradient(135deg, ${theme.brand.primary} 0%, ${theme.brand.secondary} 100%)`
        );
    }

    // ── Section-specific colors ──
    if (theme.sections) {
        for (const [section, colors] of Object.entries(theme.sections)) {
            for (const [prop, value] of Object.entries(colors)) {
                if (value) {
                    root.style.setProperty(`--theme-${section}-${camelToKebab(prop)}`, value);
                }
            }
        }
    }

    // ── Fonts ──
    if (theme.fonts) {
        if (theme.fonts.primary) {
            root.style.setProperty('--theme-font-primary', theme.fonts.primary);
            // Also map to the variables used by globals.css
            root.style.setProperty('--font-primary', theme.fonts.primary);
            root.style.setProperty('--font-display', theme.fonts.primary);

            // Dynamically load Google Font if not system font
            const fontName = theme.fonts.primary.match(/'([^']+)'/)?.[1];
            if (fontName && !fontName.includes('system') && !fontName.includes('Segoe')) {
                const linkId = 'theme-google-font';
                let link = document.getElementById(linkId) as HTMLLinkElement | null;
                const href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
                if (!link) {
                    link = document.createElement('link');
                    link.id = linkId;
                    link.rel = 'stylesheet';
                    link.href = href;
                    document.head.appendChild(link);
                } else if (link.href !== href) {
                    link.href = href;
                }
            }
        }
        if (theme.fonts.headingWeight) {
            root.style.setProperty('--theme-font-heading-weight', theme.fonts.headingWeight);
        }
        if (theme.fonts.bodyWeight) {
            root.style.setProperty('--theme-font-body-weight', theme.fonts.bodyWeight);
        }
    }
}

// Convert camelCase to kebab-case
function camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}
