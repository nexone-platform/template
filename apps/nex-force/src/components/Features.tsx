'use client';

import { useState, useEffect } from 'react';
import styles from './Features.module.css';
import { useLanguage } from '@/context/LanguageContext';

// Runtime CSS variable reader
function useThemeColor(varName: string, fallback: string): string {
    const [color, setColor] = useState(fallback);
    useEffect(() => {
        const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (val) setColor(val);
        // Re-read when theme changes (observer on style attribute)
        const observer = new MutationObserver(() => {
            const updated = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            if (updated) setColor(updated);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        return () => observer.disconnect();
    }, [varName]);
    return color;
}

interface FeatureItem {
    icon: string;
    title: string;
    description: string;
    detail: string;
    color: string;
    iconColor?: string;
    bgColor?: string;
    textColor?: string;
}

interface FeaturesProps {
    badge?: string;
    title?: string;
    headingGradient?: string;
    subtitle?: string;
    items?: FeatureItem[];
    columns?: number;
    hidden?: boolean;
    featureCardStyle?: 'elevated' | 'flat' | 'bordered' | 'glass';
    showDetail?: boolean;
}

// ── SVG Icon Map (matches backoffice IconPicker IDs) ──
const SVG_ICONS: Record<string, React.ReactNode> = {
    'cloud': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
    'server': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    'database': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    'cpu': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
    'code': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    'terminal': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
    'globe': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    'wifi': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    'smartphone': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    'monitor': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    'shield': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    'lock': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    'key': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    'eye': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>,
    'fingerprint': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 .7 0 1.4.1 2 .3"/><path d="M12 12c0 4-1 8-4 12"/><path d="M8 15c0 5-2 8.5-4 10"/><path d="M22 12c0 4-1.5 8-4 11"/><path d="M18 14c0 4-1 7-3 9.5"/><path d="M14 13.5c0 3.5-.8 7-2.5 10"/></svg>,
    'briefcase': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    'building': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
    'users': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'handshake': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17a4 4 0 0 1-4-4V7"/><path d="M7 7H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3"/><path d="M13 17a4 4 0 0 0 4-4V7"/><path d="M17 7h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3"/><path d="M7 7l5 5 5-5"/></svg>,
    'trophy': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    'chart-bar': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>,
    'chart-line': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    'chart-pie': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
    'trending-up': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    'target': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    'bot': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M9 15c.6.6 1.5 1 3 1s2.4-.4 3-1"/></svg>,
    'brain': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    'zap': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    'sparkles': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>,
    'lightbulb': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
    'rocket': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    'settings': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    'layers': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    'puzzle': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.611a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.611-1.611a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>,
    'refresh': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
    'check-circle': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    'star': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    'heart': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    'mail': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    'message': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    'headphones': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    'clock': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    'compass': <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
};

// Default icon order for fallback
const DEFAULT_ICON_IDS = ['cloud', 'bot', 'lock', 'chart-bar', 'zap', 'globe'];

export default function Features(props: FeaturesProps) {
    const { t } = useLanguage();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const themeColor = useThemeColor('--theme-primary', '#4a90e2');

    const toggleExpand = (index: number) => {
        setExpandedIndex(prev => prev === index ? null : index);
    };

    // Default data — used when no props from builder
    const defaultFeatures: FeatureItem[] = [
        {
            icon: 'cloud',
            title: t('features.cloud.title', 'Cloud Solutions'),
            description: t('features.cloud.desc', 'ออกแบบและนำเข้าระบบ Cloud Infrastructure ที่ปลอดภัย ยืดหยุ่น และรองรับการขยายตัวอย่างไม่มีขีดจำกัด'),
            detail: t('features.cloud.detail', '• AWS, Azure, Google Cloud\n• Infrastructure as Code (Terraform)\n• Container & Kubernetes\n• CI/CD Pipelines\n• การย้ายระบบสู่ Cloud อย่างปลอดภัย'),
            color: '',
        },
        {
            icon: 'bot',
            title: t('features.ai.title', 'AI & Automation'),
            description: t('features.ai.desc', 'พัฒนาระบบอัตโนมัติและ AI เพื่อเพิ่มประสิทธิภาพการทำงาน ลดต้นทุน และสร้างข้อได้เปรียบทางการแข่งขัน'),
            detail: t('features.ai.detail', '• Machine Learning & Deep Learning\n• Chatbot & Virtual Assistant\n• RPA (Robotic Process Automation)\n• Computer Vision & NLP\n• Predictive Analytics'),
            color: '',
        },
        {
            icon: 'lock',
            title: t('features.security.title', 'Cybersecurity'),
            description: t('features.security.desc', 'ป้องกันระบบองค์กรด้วยโซลูชั่นความมั่นคงปลอดภัยไซเบอร์ระดับสากล'),
            detail: t('features.security.detail', '• Penetration Testing\n• Security Audit & Compliance\n• SIEM & SOC Monitoring\n• Zero Trust Architecture\n• Data Encryption & DLP'),
            color: '',
        },
        {
            icon: 'chart-bar',
            title: t('features.consulting.title', 'Data Analytics'),
            description: t('features.consulting.desc', 'เปลี่ยนข้อมูลดิบให้เป็น Insight ที่ใช้งานได้จริง ด้วย Business Intelligence Dashboard'),
            detail: t('features.consulting.detail', '• Power BI / Tableau Dashboard\n• ETL & Data Pipeline\n• Real-time Analytics\n• Data Warehouse Design\n• Custom Report & KPI Tracking'),
            color: '',
        },
        {
            icon: 'zap',
            title: t('features.software.title', 'Digital Transformation'),
            description: t('features.software.desc', 'วางกลยุทธ์และดำเนินการ Digital Transformation ครบวงจร'),
            detail: t('features.software.detail', '• Digital Strategy & Roadmap\n• Legacy System Modernization\n• Process Digitization\n• Change Management\n• Digital Maturity Assessment'),
            color: '',
        },
        {
            icon: 'globe',
            title: t('features.network.title', 'Web & App Development'),
            description: t('features.network.desc', 'พัฒนาเว็บแอปพลิเคชันและ Mobile App ด้วย Technology Stack ล่าสุด'),
            detail: t('features.network.detail', '• React / Next.js / Vue.js\n• React Native / Flutter\n• Node.js / NestJS Backend\n• UI/UX Design\n• Progressive Web App (PWA)'),
            color: '',
        },
    ];

    // Use props from builder if available, otherwise use defaults
    const badge = props.badge || t('features.badge', 'Our Services');
    const heading = props.title || t('features.heading', 'โซลูชั่นไอทีครบวงจร');
    const headingGradient = props.headingGradient || t('features.headingGradient', 'สำหรับทุกธุรกิจ');
    const subtitle = props.subtitle || t('features.desc', 'เราพัฒนาและส่งมอบโซลูชั่นด้านเทคโนโลยีที่ตอบโจทย์ทุกความต้องการ ด้วยทีมผู้เชี่ยวชาญที่มีประสบการณ์มากกว่า 10 ปี');
    const rawFeatures = (props.items && props.items.length > 0) ? props.items : defaultFeatures;

    // Apply t() to CMS items so they support language switching
    // Translation keys: features.card_0.title, features.card_0.desc, features.card_0.detail
    const features = rawFeatures.map((f, i) => ({
        ...f,
        title: t(`features.card_${i}.title`, f.title),
        description: t(`features.card_${i}.desc`, f.description),
        detail: f.detail ? t(`features.card_${i}.detail`, f.detail) : '',
    }));

    // Resolve icon — look up SVG_ICONS map by ID, fallback to default
    const getIcon = (iconId: string, index: number) => {
        if (iconId && SVG_ICONS[iconId]) {
            return SVG_ICONS[iconId];
        }
        // Fallback to default icon by position
        const fallbackId = DEFAULT_ICON_IDS[index % DEFAULT_ICON_IDS.length];
        return SVG_ICONS[fallbackId] || SVG_ICONS['star'];
    };

    return (
        <section className={styles.features} id="services">
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.badge}>
                        <span>✦</span>
                        <span>{badge}</span>
                    </div>
                    <h2 className={styles.title}>
                        {heading}<br />
                        <span className={styles.titleGradient}>{headingGradient}</span>
                    </h2>
                    <p className={styles.subtitle}>
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`${styles.grid} ${props.featureCardStyle ? styles[`grid_${props.featureCardStyle}`] || '' : ''}`}
                    style={props.columns ? { gridTemplateColumns: `repeat(${props.columns}, 1fr)` } as React.CSSProperties : undefined}
                >
                    {features.map((feature, index) => {
                        // Treat old default blue (#4a90e2) as "use theme" 
                        const rawColor = feature.color;
                        const color = (!rawColor || rawColor.toLowerCase() === '#4a90e2') ? themeColor : rawColor;
                        const iconColor = feature.iconColor || color;
                        const bgColor = feature.bgColor || undefined;
                        const textColor = feature.textColor || undefined;
                        return (
                            <div
                                key={index}
                                className={`${styles.card} ${expandedIndex === index ? styles.cardExpanded : ''} ${props.featureCardStyle ? styles[`card_${props.featureCardStyle}`] || '' : ''}`}
                                style={{ animationDelay: `${index * 0.1}s`, ...(bgColor ? { background: bgColor } : {}), ...(textColor ? { color: textColor } : {}) }}
                            >
                                <div
                                    className={styles.iconWrapper}
                                    style={{ background: `${iconColor}18`, borderColor: `${iconColor}30` }}
                                >
                                    <span className={styles.icon} style={{ color: iconColor }}>{getIcon(feature.icon, index)}</span>
                                    <div
                                        className={styles.iconGlow}
                                        style={{ background: `radial-gradient(circle, ${iconColor}40 0%, transparent 70%)` }}
                                    />
                                </div>
                                <h3 className={styles.cardTitle} style={textColor ? { color: textColor } : {}}>{feature.title}</h3>
                                <p className={styles.cardDescription} style={textColor ? { color: textColor, opacity: 0.8 } : {}}>{feature.description}</p>
                                {feature.detail && (
                                    <div className={styles.cardLink} style={{ color }} onClick={() => toggleExpand(index)}>
                                        {expandedIndex === index 
                                            ? t('common.showLess', 'ย่อ') 
                                            : t('common.learnMore', 'เรียนรู้เพิ่มเติม')
                                        } <span className={expandedIndex === index ? styles.arrowUp : ''}>→</span>
                                    </div>
                                )}
                                {expandedIndex === index && feature.detail && (
                                    <div className={styles.detailPanel}>
                                        {feature.detail.split('\n').map((line, li) => (
                                            <p key={li} className={styles.detailLine}>{line}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
