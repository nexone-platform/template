import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './ThemeSettings.css';

const API = `${API_BASE_URL}/theme`;

// Convert any color value to hex for color picker (which only accepts #hex)
function toHex(val: string): string {
    if (!val) return '#000000';
    // Already a valid hex
    if (/^#[0-9a-fA-F]{6}$/.test(val)) return val;
    if (/^#[0-9a-fA-F]{3}$/.test(val)) {
        return '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
    }
    // Try to parse rgba/rgb
    const m = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
        const r = parseInt(m[1]).toString(16).padStart(2, '0');
        const g = parseInt(m[2]).toString(16).padStart(2, '0');
        const b = parseInt(m[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    return '#000000';
}

/* ── Section config for the UI ── */
/* SVG icon helper */
const SvgIcon = ({ d, size = 14 }: { d: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const SECTION_ICONS: Record<string, string> = {
    navbar: 'M3 3h18v4H3zM3 10h18v4H3z',
    hero: 'M3 3h18v18H3zM3 9h18',
    features: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    stats: 'M18 20V10M12 20V4M6 20v-6',
    testimonials: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    portfolio: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    careers: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
    cta: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    contact: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
    footer: 'M3 21h18M3 17h18M3 13h18M3 9h18',
};

const SECTION_CONFIG: {
    key: string; labelKey: string; labelDefault: string;
    fields: { key: string; labelKey: string; labelDefault: string; type: 'color' | 'text' }[];
}[] = [
        {
            key: 'navbar', labelKey: 'bo.theme.sec.navbar', labelDefault: 'Navbar',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'textColor', labelKey: 'bo.theme.field.textColor', labelDefault: 'Text Color', type: 'color' },
            ],
        },
        {
            key: 'hero', labelKey: 'bo.theme.sec.hero', labelDefault: 'Hero',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
                { key: 'subtitleColor', labelKey: 'bo.theme.field.subtitleColor', labelDefault: 'Subtitle Color', type: 'color' },
            ],
        },
        {
            key: 'features', labelKey: 'bo.theme.sec.features', labelDefault: 'Features',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
                { key: 'cardBg', labelKey: 'bo.theme.field.cardBg', labelDefault: 'Card Background', type: 'color' },
            ],
        },
        {
            key: 'stats', labelKey: 'bo.theme.sec.stats', labelDefault: 'Stats',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'labelColor', labelKey: 'bo.theme.field.labelColor', labelDefault: 'Label Color', type: 'color' },
            ],
        },
        {
            key: 'testimonials', labelKey: 'bo.theme.sec.testimonials', labelDefault: 'Testimonials',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
                { key: 'textColor', labelKey: 'bo.theme.field.textColor', labelDefault: 'Text Color', type: 'color' },
            ],
        },
        {
            key: 'portfolio', labelKey: 'bo.theme.sec.portfolio', labelDefault: 'Portfolio',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
            ],
        },
        {
            key: 'careers', labelKey: 'bo.theme.sec.careers', labelDefault: 'Careers',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
            ],
        },
        {
            key: 'cta', labelKey: 'bo.theme.sec.cta', labelDefault: 'Call to Action',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'textColor', labelKey: 'bo.theme.field.textColor', labelDefault: 'Text Color', type: 'color' },
            ],
        },
        {
            key: 'contact', labelKey: 'bo.theme.sec.contact', labelDefault: 'Contact',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'textColor', labelKey: 'bo.theme.field.textColor', labelDefault: 'Text Color', type: 'color' },
            ],
        },
        {
            key: 'footer', labelKey: 'bo.theme.sec.footer', labelDefault: 'Footer',
            fields: [
                { key: 'bg', labelKey: 'bo.theme.field.bg', labelDefault: 'Background', type: 'color' },
                { key: 'textColor', labelKey: 'bo.theme.field.textColor', labelDefault: 'Text Color', type: 'color' },
                { key: 'titleColor', labelKey: 'bo.theme.field.titleColor', labelDefault: 'Title Color', type: 'color' },
            ],
        },
    ];

/* ── Curated Color Palettes from ColorHunt ── */
interface PalettePreset {
    id: string;
    name: string;
    mode: 'light' | 'dark' | 'warm';
    colors: [string, string, string, string];
    brand: {
        primary: string;
        primaryDark: string;
        primaryLight: string;
        secondary: string;
        secondaryDark: string;
        accent: string;
    };
}

const PALETTES: PalettePreset[] = [
    // ── Light Palettes ──
    { id: 'light-ocean', name: 'Ocean Breeze', mode: 'light', colors: ['#E3F2FD', '#90CAF9', '#42A5F5', '#1565C0'], brand: { primary: '#42A5F5', primaryDark: '#1565C0', primaryLight: '#90CAF9', secondary: '#1565C0', secondaryDark: '#0D47A1', accent: '#FF7043' } },
    { id: 'light-lavender', name: 'Lavender Dream', mode: 'light', colors: ['#F3E5F5', '#CE93D8', '#AB47BC', '#6A1B9A'], brand: { primary: '#AB47BC', primaryDark: '#6A1B9A', primaryLight: '#CE93D8', secondary: '#7B1FA2', secondaryDark: '#4A148C', accent: '#FFB74D' } },
    { id: 'light-mint', name: 'Fresh Mint', mode: 'light', colors: ['#E8F5E9', '#A5D6A7', '#66BB6A', '#2E7D32'], brand: { primary: '#66BB6A', primaryDark: '#2E7D32', primaryLight: '#A5D6A7', secondary: '#43A047', secondaryDark: '#1B5E20', accent: '#FFA726' } },
    { id: 'light-coral', name: 'Coral Sunset', mode: 'light', colors: ['#FBE9E7', '#FFAB91', '#FF7043', '#D84315'], brand: { primary: '#FF7043', primaryDark: '#D84315', primaryLight: '#FFAB91', secondary: '#E64A19', secondaryDark: '#BF360C', accent: '#26C6DA' } },
    { id: 'light-sky', name: 'Clear Sky', mode: 'light', colors: ['#E0F7FA', '#80DEEA', '#26C6DA', '#00838F'], brand: { primary: '#26C6DA', primaryDark: '#00838F', primaryLight: '#80DEEA', secondary: '#0097A7', secondaryDark: '#006064', accent: '#FF8A65' } },
    { id: 'light-rose', name: 'Rose Garden', mode: 'light', colors: ['#FCE4EC', '#F48FB1', '#EC407A', '#AD1457'], brand: { primary: '#EC407A', primaryDark: '#AD1457', primaryLight: '#F48FB1', secondary: '#C2185B', secondaryDark: '#880E4F', accent: '#7E57C2' } },
    // ── Dark Palettes ──
    { id: 'dark-midnight', name: 'Midnight Blue', mode: 'dark', colors: ['#0D1B2A', '#1B2838', '#415A77', '#778DA9'], brand: { primary: '#778DA9', primaryDark: '#415A77', primaryLight: '#A0B4C8', secondary: '#415A77', secondaryDark: '#1B2838', accent: '#E0E1DD' } },
    { id: 'dark-cyberpunk', name: 'Cyberpunk', mode: 'dark', colors: ['#0B0C10', '#1F2833', '#45A29E', '#66FCF1'], brand: { primary: '#66FCF1', primaryDark: '#45A29E', primaryLight: '#8BFFF7', secondary: '#45A29E', secondaryDark: '#2D6B67', accent: '#C5C6C7' } },
    { id: 'dark-aurora', name: 'Aurora', mode: 'dark', colors: ['#1A1A2E', '#16213E', '#0F3460', '#E94560'], brand: { primary: '#E94560', primaryDark: '#C23152', primaryLight: '#FF6B7F', secondary: '#0F3460', secondaryDark: '#16213E', accent: '#53DCA5' } },
    { id: 'dark-galaxy', name: 'Galaxy', mode: 'dark', colors: ['#191A19', '#1E5128', '#4E9F3D', '#D8E9A8'], brand: { primary: '#4E9F3D', primaryDark: '#1E5128', primaryLight: '#7AC26A', secondary: '#1E5128', secondaryDark: '#0D2B14', accent: '#D8E9A8' } },
    { id: 'dark-obsidian', name: 'Obsidian', mode: 'dark', colors: ['#1B1B2F', '#162447', '#1F4068', '#E43F5A'], brand: { primary: '#E43F5A', primaryDark: '#C02942', primaryLight: '#FF6B7F', secondary: '#1F4068', secondaryDark: '#162447', accent: '#F7B267' } },
    { id: 'dark-neon', name: 'Neon Glow', mode: 'dark', colors: ['#0F0E17', '#232946', '#B8C1EC', '#EEBBC3'], brand: { primary: '#EEBBC3', primaryDark: '#D4939D', primaryLight: '#FFD5DC', secondary: '#B8C1EC', secondaryDark: '#232946', accent: '#FF8906' } },
    // ── Warm / Eye-Comfort Palettes ──
    { id: 'warm-honey', name: 'Honey Gold', mode: 'warm', colors: ['#2C1810', '#6B3A2A', '#C17A50', '#E8B87D'], brand: { primary: '#C17A50', primaryDark: '#6B3A2A', primaryLight: '#E8B87D', secondary: '#8B5E3C', secondaryDark: '#4A2C1A', accent: '#F0D9A0' } },
    { id: 'warm-terracotta', name: 'Terracotta', mode: 'warm', colors: ['#2B1F1A', '#8C5E4A', '#C98B6B', '#E6C9A8'], brand: { primary: '#C98B6B', primaryDark: '#8C5E4A', primaryLight: '#E6C9A8', secondary: '#A07050', secondaryDark: '#6B4530', accent: '#D4B896' } },
    { id: 'warm-amber', name: 'Amber Flame', mode: 'warm', colors: ['#1E1A14', '#5C4033', '#B8860B', '#DAA520'], brand: { primary: '#B8860B', primaryDark: '#8B6508', primaryLight: '#DAA520', secondary: '#996515', secondaryDark: '#5C4033', accent: '#FFD700' } },
    { id: 'warm-spice', name: 'Autumn Spice', mode: 'warm', colors: ['#231709', '#6F4E37', '#C68642', '#DEB887'], brand: { primary: '#C68642', primaryDark: '#6F4E37', primaryLight: '#DEB887', secondary: '#8B6914', secondaryDark: '#4A3520', accent: '#F4A460' } },
    { id: 'warm-mocha', name: 'Mocha', mode: 'warm', colors: ['#1C140D', '#4E342E', '#795548', '#BCAAA4'], brand: { primary: '#795548', primaryDark: '#4E342E', primaryLight: '#A1887F', secondary: '#5D4037', secondaryDark: '#3E2723', accent: '#BCAAA4' } },
    { id: 'warm-sepia', name: 'Classic Sepia', mode: 'warm', colors: ['#241E16', '#5E4B3B', '#9C8365', '#C4A882'], brand: { primary: '#9C8365', primaryDark: '#5E4B3B', primaryLight: '#C4A882', secondary: '#7A6550', secondaryDark: '#3D3025', accent: '#D4B896' } },
];

interface ThemeData {
    id?: string;
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

const BRAND_FIELDS = [
    { key: 'primary', labelKey: 'bo.theme.brand.primary', labelDefault: 'Primary', descKey: 'bo.theme.brand.primaryDesc', descDefault: 'Main color (buttons, links)' },
    { key: 'primaryDark', labelKey: 'bo.theme.brand.primaryDark', labelDefault: 'Primary Dark', descKey: 'bo.theme.brand.primaryDarkDesc', descDefault: 'Dark primary' },
    { key: 'primaryLight', labelKey: 'bo.theme.brand.primaryLight', labelDefault: 'Primary Light', descKey: 'bo.theme.brand.primaryLightDesc', descDefault: 'Light primary' },
    { key: 'secondary', labelKey: 'bo.theme.brand.secondary', labelDefault: 'Secondary', descKey: 'bo.theme.brand.secondaryDesc', descDefault: 'Secondary (Gradient)' },
    { key: 'secondaryDark', labelKey: 'bo.theme.brand.secondaryDark', labelDefault: 'Secondary Dark', descKey: 'bo.theme.brand.secondaryDarkDesc', descDefault: 'Dark secondary' },
    { key: 'accent', labelKey: 'bo.theme.brand.accent', labelDefault: 'Accent', descKey: 'bo.theme.brand.accentDesc', descDefault: 'Accent color' },
];

/* ── Font Family Options ── */
const FONT_OPTIONS: { value: string; label: string; category: string }[] = [
    // Thai-optimized fonts
    { value: "'Sarabun', sans-serif", label: 'Sarabun', category: 'Thai' },
    { value: "'Kanit', sans-serif", label: 'Kanit', category: 'Thai' },
    { value: "'Prompt', sans-serif", label: 'Prompt', category: 'Thai' },
    { value: "'Noto Sans Thai', sans-serif", label: 'Noto Sans Thai', category: 'Thai' },
    { value: "'IBM Plex Sans Thai', sans-serif", label: 'IBM Plex Sans Thai', category: 'Thai' },
    { value: "'Mitr', sans-serif", label: 'Mitr', category: 'Thai' },
    { value: "'Pridi', serif", label: 'Pridi', category: 'Thai' },
    { value: "'Chakra Petch', sans-serif", label: 'Chakra Petch', category: 'Thai' },
    { value: "'Bai Jamjuree', sans-serif", label: 'Bai Jamjuree', category: 'Thai' },
    { value: "'K2D', sans-serif", label: 'K2D', category: 'Thai' },
    { value: "'Itim', cursive", label: 'Itim', category: 'Thai' },
    // Latin / International
    { value: "'Inter', sans-serif", label: 'Inter', category: 'Sans-serif' },
    { value: "'Roboto', sans-serif", label: 'Roboto', category: 'Sans-serif' },
    { value: "'Open Sans', sans-serif", label: 'Open Sans', category: 'Sans-serif' },
    { value: "'Poppins', sans-serif", label: 'Poppins', category: 'Sans-serif' },
    { value: "'Outfit', sans-serif", label: 'Outfit', category: 'Sans-serif' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat', category: 'Sans-serif' },
    { value: "'Lato', sans-serif", label: 'Lato', category: 'Sans-serif' },
    { value: "'Raleway', sans-serif", label: 'Raleway', category: 'Sans-serif' },
    { value: "'DM Sans', sans-serif", label: 'DM Sans', category: 'Sans-serif' },
    { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk', category: 'Sans-serif' },
    // Serif
    { value: "'Playfair Display', serif", label: 'Playfair Display', category: 'Serif' },
    { value: "'Merriweather', serif", label: 'Merriweather', category: 'Serif' },
    { value: "'Lora', serif", label: 'Lora', category: 'Serif' },
    // Monospace
    { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono', category: 'Mono' },
    { value: "'Fira Code', monospace", label: 'Fira Code', category: 'Mono' },
    // System
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", label: 'System Default', category: 'System' },
];

export default function ThemeSettings() {
    const [theme, setTheme] = useState<ThemeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'palettes' | 'brand' | 'sections' | 'fonts'>('palettes');
    const [paletteMode, setPaletteMode] = useState<'light' | 'dark' | 'warm'>('light');
    const [expandedSection, setExpandedSection] = useState<string | null>('navbar');
    const [colorHuntUrl, setColorHuntUrl] = useState('');
    const [colorHuntError, setColorHuntError] = useState('');
    const [customPalettes, setCustomPalettes] = useState<PalettePreset[]>(() => {
        try {
            const stored = localStorage.getItem('ts-custom-palettes');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const { t } = useLanguage();
    const { showToast, showConfirm } = useToast();

    // Save custom palettes to localStorage
    useEffect(() => {
        localStorage.setItem('ts-custom-palettes', JSON.stringify(customPalettes));
    }, [customPalettes]);

    // ── Color helpers ──
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };
    const rgbToHex = (r: number, g: number, b: number) =>
        '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const darken = (hex: string, pct: number) => {
        const { r, g, b } = hexToRgb(hex);
        const f = 1 - pct / 100;
        return rgbToHex(r * f, g * f, b * f);
    };
    const lighten = (hex: string, pct: number) => {
        const { r, g, b } = hexToRgb(hex);
        const f = pct / 100;
        return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
    };

    // ── Parse ColorHunt URL ──
    const parseColorHuntUrl = () => {
        setColorHuntError('');
        const url = colorHuntUrl.trim();
        if (!url) { setColorHuntError('กรุณาวาง URL จาก ColorHunt'); return; }
        // Extract hex colors from URL path: /palette/AABBCCDDEEFF11223344
        const match = url.match(/palette\/([0-9a-fA-F]{24})/);
        if (!match) { setColorHuntError('URL ไม่ถูกต้อง — ต้องเป็น colorhunt.co/palette/... (สี 4 ตัว)'); return; }
        const hexStr = match[1];
        const c1 = '#' + hexStr.slice(0, 6);
        const c2 = '#' + hexStr.slice(6, 12);
        const c3 = '#' + hexStr.slice(12, 18);
        const c4 = '#' + hexStr.slice(18, 24);
        const colors: [string, string, string, string] = [c1, c2, c3, c4];

        // Auto-detect mode based on luminance
        const luminance = (hex: string) => {
            const { r, g, b } = hexToRgb(hex);
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        };
        const avgLum = colors.reduce((s, c) => s + luminance(c), 0) / 4;
        const isWarm = colors.some(c => {
            const { r, g, b } = hexToRgb(c);
            return r > 150 && g > 80 && g < 180 && b < 120;
        });
        const mode: 'light' | 'dark' | 'warm' = avgLum < 0.35 ? 'dark' : isWarm ? 'warm' : 'light';

        // Map colors to brand: use c3 as primary (most saturated middle), c4 as accent
        const primary = c3;
        const newPalette: PalettePreset = {
            id: 'custom-' + Date.now(),
            name: 'ColorHunt ' + c3.toUpperCase(),
            mode,
            colors,
            brand: {
                primary,
                primaryDark: darken(primary, 25),
                primaryLight: lighten(primary, 35),
                secondary: c2,
                secondaryDark: darken(c2, 25),
                accent: c4,
            },
        };

        // Check duplicate
        const exists = customPalettes.some(p => p.colors.join('') === colors.join(''));
        if (exists) { setColorHuntError('ชุดสีนี้เพิ่มไว้แล้ว'); return; }

        setCustomPalettes(prev => [...prev, newPalette]);
        setColorHuntUrl('');
        setPaletteMode(mode);
    };

    // ── Fetch theme ──
    const fetchTheme = useCallback(async () => {
        try {
            const res = await fetch(API);
            const data = await res.json();
            // Convert all section color values from rgba to hex
            if (data.sections) {
                for (const secKey of Object.keys(data.sections)) {
                    for (const fieldKey of Object.keys(data.sections[secKey])) {
                        const val = data.sections[secKey][fieldKey];
                        if (typeof val === 'string' && val.startsWith('rgba')) {
                            data.sections[secKey][fieldKey] = toHex(val);
                        }
                    }
                }
            }
            setTheme(data);
        } catch (err) {
            console.error('Failed to fetch theme:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTheme(); }, [fetchTheme]);

    // ── Save theme ──
    const handleSave = async () => {
        if (!theme) return;
        setSaving(true);
        try {
            const res = await fetch(API, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: theme.brand,
                    sections: theme.sections,
                    fonts: theme.fonts,
                }),
            });
            const data = await res.json();
            setTheme(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Failed to save theme:', err);
            showToast('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ── Reset theme ──
    const handleReset = async () => {
        const ok = await showConfirm({
            title: 'รีเซ็ตธีม',
            message: 'รีเซ็ตกลับเป็นค่าเริ่มต้น?',
            confirmText: 'รีเซ็ต',
            variant: 'warning',
        });
        if (!ok) return;
        setSaving(true);
        try {
            const res = await fetch(API + '/reset', { method: 'POST' });
            const data = await res.json();
            setTheme(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Failed to reset theme:', err);
        } finally {
            setSaving(false);
        }
    };

    // ── Update helpers ──
    const updateBrand = (key: string, value: string) => {
        if (!theme) return;
        setTheme({ ...theme, brand: { ...theme.brand, [key]: value } });
    };

    const updateSection = (section: string, key: string, value: string) => {
        if (!theme) return;
        setTheme({
            ...theme,
            sections: {
                ...theme.sections,
                [section]: { ...(theme.sections[section] || {}), [key]: value },
            },
        });
    };

    const updateFont = (key: string, value: string) => {
        if (!theme) return;
        setTheme({ ...theme, fonts: { ...theme.fonts, [key]: value } });
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="ts-loading">
                <div className="ts-spinner" />
                <p>{t('bo.analytics.loading', 'Loading...')}</p>
            </div>
        );
    }

    if (!theme) {
        return <div className="ts-error">ไม่สามารถโหลดข้อมูลธีมได้</div>;
    }

    return (
        <div className="ts-page">
            {/* ── Main Card ── */}
            <div className="ts-card">
                {/* ── Gradient Toolbar ── */}
                <div
                    className="ts-card-toolbar"
                    style={{
                        background: `linear-gradient(135deg, ${theme.brand.primary} 0%, ${theme.brand.secondary} 50%, ${theme.brand.accent} 100%)`,
                    }}
                >
                    <div className="ts-card-toolbar-left">
                        <p className="ts-card-toolbar-subtitle">{t('bo.theme.subtitle', 'เปลี่ยนเฉดสีและสีฟอนต์ในแต่ละส่วนของเว็บไซต์')}</p>
                    </div>
                    <div className="ts-card-toolbar-actions">
                        <button className="ts-btn ts-btn-toolbar-outline" onClick={handleReset} disabled={saving}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> {t('bo.theme.reset', 'Reset')}
                        </button>
                        <button className="ts-btn ts-btn-toolbar-primary" onClick={handleSave} disabled={saving}>
                            {saving ? t('bo.theme.saving', 'Saving...') : saved ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Saved!</>) : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {t('bo.settings.save', 'Save')}</>)}
                        </button>
                    </div>
                </div>
                {/* ── Preview Gradient ── */}
                <div className="ts-preview-bar">
                    <div
                        className="ts-gradient-preview"
                        style={{
                            background: `linear-gradient(135deg, ${theme.brand.primary} 0%, ${theme.brand.secondary} 50%, ${theme.brand.accent} 100%)`,
                        }}
                    >
                        <span>{t('bo.theme.gradientPreview', 'Gradient Preview')}</span>
                    </div>
                    <div className="ts-color-chips">
                        {BRAND_FIELDS.map(f => (
                            <div key={f.key} className="ts-chip">
                                <div className="ts-chip-swatch" style={{ background: (theme.brand as any)[f.key] }} />
                                <span className="ts-chip-label">{t(f.labelKey, f.labelDefault)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="ts-tabs">
                    <button className={`ts-tab ${activeTab === 'palettes' ? 'active' : ''}`} onClick={() => setActiveTab('palettes')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> {t('bo.theme.palettes', 'Palettes')}
                    </button>
                    <button className={`ts-tab ${activeTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveTab('brand')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="13.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10-2-4-4-4"/></svg> {t('bo.theme.brandColors', 'Brand Colors')}
                    </button>
                    <button className={`ts-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg> {t('bo.theme.sectionColors', 'Section Colors')}
                    </button>
                    <button className={`ts-tab ${activeTab === 'fonts' ? 'active' : ''}`} onClick={() => setActiveTab('fonts')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> {t('bo.theme.fonts', 'Fonts')}
                    </button>
                </div>

                {/* ── Palettes Tab ── */}
                {activeTab === 'palettes' && (
                    <div className="ts-panel">
                        <h2 className="ts-panel-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom', marginRight: 6 }}><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="13.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10-2-4-4-4"/></svg>{t('bo.theme.presetPalettes', 'ชุดสีสำเร็จรูป')}</h2>
                        <p className="ts-panel-desc">{t('bo.theme.presetPalettesDesc', 'เลือกชุดสีที่ชอบ แล้วสีแบรนด์จะถูกปรับอัตโนมัติ')} — <a href="https://colorhunt.co" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>ColorHunt</a></p>

                        {/* Mode Filter */}
                        <div className="ts-palette-modes">
                            {(['light', 'dark', 'warm'] as const).map(mode => (
                                <button
                                    key={mode}
                                    className={`ts-palette-mode-btn ${paletteMode === mode ? 'active' : ''}`}
                                    onClick={() => setPaletteMode(mode)}
                                >
                                    {mode === 'light' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> {t('bo.theme.modeLight', 'สว่าง')}</>}
                                    {mode === 'dark' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> {t('bo.theme.modeDark', 'มืด')}</>}
                                    {mode === 'warm' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.5 0 10-2 10-6 0-5-8-14-10-14S2 11 2 16c0 4 4.5 6 10 6z"/></svg> {t('bo.theme.modeWarm', 'ถนอมสายตา')}</>}
                                </button>
                            ))}
                        </div>

                        {/* Palette Grid */}
                        <div className="ts-palette-grid">
                            {[...PALETTES, ...customPalettes].filter(p => p.mode === paletteMode).map(palette => {
                                const isActive = theme &&
                                    theme.brand.primary === palette.brand.primary &&
                                    theme.brand.secondary === palette.brand.secondary;
                                const isCustom = palette.id.startsWith('custom-');
                                return (
                                    <button
                                        key={palette.id}
                                        className={`ts-palette-card ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            if (!theme) return;
                                            const oldPrimary = theme.brand.primary?.toLowerCase();
                                            const updatedSections = { ...theme.sections };
                                            for (const secKey of Object.keys(updatedSections)) {
                                                const sec = { ...updatedSections[secKey] };
                                                for (const fieldKey of Object.keys(sec)) {
                                                    const val = sec[fieldKey]?.toLowerCase();
                                                    if (val === oldPrimary) {
                                                        sec[fieldKey] = palette.brand.primary;
                                                    }
                                                }
                                                updatedSections[secKey] = sec;
                                            }
                                            setTheme({
                                                ...theme,
                                                brand: { ...palette.brand },
                                                sections: updatedSections,
                                            });
                                        }}
                                    >
                                        <div className="ts-palette-swatches">
                                            {palette.colors.map((color, i) => (
                                                <div key={i} className="ts-palette-swatch" style={{ background: color }} />
                                            ))}
                                        </div>
                                        <div className="ts-palette-info">
                                            <span className="ts-palette-name">{palette.name}</span>
                                            <span className="ts-palette-hex">{palette.brand.primary}</span>
                                        </div>
                                        {isActive && <span className="ts-palette-check">✓</span>}
                                        {isCustom && (
                                            <span
                                                className="ts-palette-delete"
                                                title={t('bo.theme.deletePalette', 'ลบชุดสีนี้')}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const ok = await showConfirm({
                                                        title: t('bo.theme.deletePalette', 'ลบชุดสีนี้'),
                                                        message: t('bo.theme.deletePaletteConfirm', 'ลบชุดสีนี้?'),
                                                        confirmText: 'ลบ',
                                                        variant: 'danger',
                                                    });
                                                    if (ok) {
                                                        setCustomPalettes(prev => prev.filter(p => p.id !== palette.id));
                                                    }
                                                }}
                                            >✕</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ColorHunt Import */}
                        <div className="ts-colorhunt-import">
                            <div className="ts-colorhunt-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                <span>{t('bo.theme.importFrom', 'เพิ่มชุดสีจาก')} <a href="https://colorhunt.co" target="_blank" rel="noopener noreferrer">ColorHunt</a></span>
                            </div>
                            <div className="ts-colorhunt-row">
                                <input
                                    type="text"
                                    className="ts-colorhunt-input"
                                    placeholder={t('bo.theme.importPlaceholder', 'วาง URL เช่น https://colorhunt.co/palette/...')}
                                    value={colorHuntUrl}
                                    onChange={e => { setColorHuntUrl(e.target.value); setColorHuntError(''); }}
                                    onKeyDown={e => { if (e.key === 'Enter') parseColorHuntUrl(); }}
                                />
                                <button className="ts-colorhunt-btn" onClick={parseColorHuntUrl}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    {t('bo.theme.importBtn', 'เพิ่ม')}
                                </button>
                            </div>
                            {colorHuntError && <div className="ts-colorhunt-error">{colorHuntError}</div>}
                        </div>

                        <div className="ts-palette-hint">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            {t('bo.theme.paletteHint', 'เลือกชุดสีแล้วกด Save เพื่อบันทึก — สามารถปรับแต่งเพิ่มเติมได้ในแท็บ Brand Colors')}
                        </div>
                    </div>
                )}

                {/* ── Brand Colors Tab ── */}
                {activeTab === 'brand' && (
                    <div className="ts-panel">
                        <h2 className="ts-panel-title">{t('bo.theme.brandColors', 'สีแบรนด์หลัก')}</h2>
                        <p className="ts-panel-desc">{t('bo.theme.brandDesc', 'สีเหล่านี้จะถูกใช้ทั่วทั้งเว็บไซต์')}</p>
                        <div className="ts-color-grid">
                            {BRAND_FIELDS.map(f => (
                                <div key={f.key} className="ts-color-field">
                                    <label className="ts-label">{t(f.labelKey, f.labelDefault)}</label>
                                    <p className="ts-desc">{t(f.descKey, f.descDefault)}</p>
                                    <div className="ts-color-input-row">
                                        <input
                                            type="color"
                                            value={(theme.brand as any)[f.key]}
                                            onChange={e => updateBrand(f.key, e.target.value)}
                                            className="ts-color-picker"
                                        />
                                        <input
                                            type="text"
                                            value={(theme.brand as any)[f.key]}
                                            onChange={e => updateBrand(f.key, e.target.value)}
                                            className="ts-hex-input"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Sections Tab ── */}
                {activeTab === 'sections' && (
                    <div className="ts-panel">
                        <h2 className="ts-panel-title">{t('bo.theme.sectionColors', 'สีแต่ละ Section')}</h2>
                        <p className="ts-panel-desc">{t('bo.theme.sectionDesc', 'กำหนดสีพื้นหลัง, สีข้อความ, และหัวข้อสำหรับแต่ละส่วนของเว็บ')}</p>
                        <div className="ts-sections-list">
                            {SECTION_CONFIG.map(sec => {
                                const isOpen = expandedSection === sec.key;
                                return (
                                    <div key={sec.key} className={`ts-section-card ${isOpen ? 'open' : ''}`}>
                                        <button
                                            className="ts-section-header"
                                            onClick={() => setExpandedSection(isOpen ? null : sec.key)}
                                        >
                                            <span className="ts-section-icon"><SvgIcon d={SECTION_ICONS[sec.key] || ''} /></span>
                                            <span className="ts-section-name">{t(sec.labelKey, sec.labelDefault)}</span>
                                            <span className="ts-section-arrow">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    {isOpen ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                                                </svg>
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="ts-section-body">
                                                {sec.fields.map(f => (
                                                    <div key={f.key} className="ts-color-field">
                                                        <label className="ts-label">{t(f.labelKey, f.labelDefault)}</label>
                                                        <div className="ts-color-input-row">
                                                            <input
                                                                type="color"
                                                                value={toHex(theme.sections[sec.key]?.[f.key] || '#000000')}
                                                                onChange={e => updateSection(sec.key, f.key, e.target.value)}
                                                                className="ts-color-picker"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={theme.sections[sec.key]?.[f.key] || ''}
                                                                onChange={e => updateSection(sec.key, f.key, e.target.value)}
                                                                className="ts-hex-input"
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Fonts Tab ── */}
                {activeTab === 'fonts' && (
                    <div className="ts-panel">
                        <h2 className="ts-panel-title">{t('bo.theme.fonts', 'ฟอนต์')}</h2>
                        <p className="ts-panel-desc">{t('bo.theme.fontsDesc', 'กำหนดฟอนต์หลักและน้ำหนักของตัวอักษร')}</p>
                        <div className="ts-color-grid">
                            <div className="ts-color-field">
                                <label className="ts-label">{t('bo.theme.fontFamily', 'Font Family')}</label>
                                <select
                                    value={theme.fonts.primary || ''}
                                    onChange={e => updateFont('primary', e.target.value)}
                                    className="ts-select ts-font-select"
                                >
                                    <option value="">{t('bo.theme.selectFont', '— เลือกฟอนต์ —')}</option>
                                    {(() => {
                                        const groups = FONT_OPTIONS.reduce<Record<string, typeof FONT_OPTIONS>>((acc, f) => {
                                            (acc[f.category] = acc[f.category] || []).push(f);
                                            return acc;
                                        }, {});
                                        return Object.entries(groups).map(([cat, fonts]) => (
                                            <optgroup key={cat} label={cat}>
                                                {fonts.map(f => (
                                                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                                        {f.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ));
                                    })()}
                                </select>
                                <p className="ts-desc" style={{ marginTop: '6px' }}>
                                    {theme.fonts.primary || t('bo.theme.noFontSelected', 'ยังไม่ได้เลือกฟอนต์')}
                                </p>
                            </div>
                            <div className="ts-color-field">
                                <label className="ts-label">{t('bo.theme.headingWeight', 'Heading Weight')}</label>
                                <select
                                    value={theme.fonts.headingWeight || '800'}
                                    onChange={e => updateFont('headingWeight', e.target.value)}
                                    className="ts-select"
                                >
                                    {['300', '400', '500', '600', '700', '800', '900'].map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ts-color-field">
                                <label className="ts-label">{t('bo.theme.bodyWeight', 'Body Weight')}</label>
                                <select
                                    value={theme.fonts.bodyWeight || '400'}
                                    onChange={e => updateFont('bodyWeight', e.target.value)}
                                    className="ts-select"
                                >
                                    {['300', '400', '500', '600', '700'].map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ── Font Preview ── */}
                        <div className="ts-font-preview" style={{ fontFamily: theme.fonts.primary }}>
                            <p style={{ fontWeight: Number(theme.fonts.headingWeight || 800), fontSize: '1.5rem' }}>
                                {t('bo.theme.headingPreview', 'หัวข้อตัวอย่าง — Heading Preview')}
                            </p>
                            <p style={{ fontWeight: Number(theme.fonts.bodyWeight || 400), fontSize: '1rem', color: '#64748b' }}>
                                {t('bo.theme.bodyPreview', 'ข้อความตัวอย่าง — Body text preview. Lorem ipsum dolor sit amet.')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
