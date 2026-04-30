"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Language Context — optimized for Next.js
//
// Strategy:
//   1. Language list fetched from API: POST /translations/getLanguages
//   2. On first load / language change → batch-fetch ALL translations via
//      POST /translations/labelList { LanguageCode }
//   3. changeLang() always fetches fresh translations for instant switch
//   4. Cache in localStorage with TTL (survives refresh, no FOUC)
//   5. Per-page hook reads from cache — zero extra API calls on navigate
// ---------------------------------------------------------------------------

interface LangConfig {
    code: string;
    name: string;
    flag: string;
}

// Hardcoded fallback (used while API is loading)
const FALLBACK_LANGUAGES: LangConfig[] = [
    { code: "en", name: "English", flag: "/flags/us.png" },
    { code: "th", name: "Thai", flag: "/flags/th.png" },
];

const FLAG_MAP: Record<string, string> = {
    en: "/flags/us.png",
    th: "/flags/th.png",
    ja: "/flags/jp.png",
    zh: "/flags/cn.png",
    ko: "/flags/kr.png",
};

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ──────── localStorage helpers ────────
function getCachedTranslations(lang: string): Record<string, Record<string, string>> | null {
    if (typeof window === "undefined") return null;
    try {
        const ts = localStorage.getItem(`i18n:${lang}:ts`);
        if (!ts || Date.now() - Number(ts) > CACHE_TTL_MS) return null;
        const raw = localStorage.getItem(`i18n:${lang}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setCachedTranslations(lang: string, data: Record<string, Record<string, string>>) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(`i18n:${lang}`, JSON.stringify(data));
        localStorage.setItem(`i18n:${lang}:ts`, String(Date.now()));
    } catch {
        // localStorage full — fail silently
    }
}

function clearCachedTranslations(lang?: string) {
    if (typeof window === "undefined") return;
    if (lang) {
        localStorage.removeItem(`i18n:${lang}`);
        localStorage.removeItem(`i18n:${lang}:ts`);
    } else {
        // Clear all language caches
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith("i18n:")) localStorage.removeItem(k);
        });
    }
}

// ──────── pageKey derivation (fallback if sidebar didn't set it) ────────
function derivePageKey(pathname: string): string {
    const segments = pathname.split("/").filter(Boolean);
    // Filter out UUIDs (8+ hex chars) AND pure numeric IDs (e.g. "0", "123")
    const clean = segments.filter(s => !s.match(/^[0-9a-f-]{8,}$/i) && !s.match(/^\d+$/));
    if (clean.length >= 2) return clean[clean.length - 1];
    if (clean.length === 1) return clean[0];
    return "dashboard";
}

// ──────── Fetch language list from API ────────
async function fetchLanguages(): Promise<LangConfig[]> {
    try {
        const { data } = await apiClient.post("translations/getLanguages");
        const rows: { languageCode: string; languageName: string }[] = data?.data || [];
        if (rows.length === 0) return FALLBACK_LANGUAGES;
        return rows.map(r => ({
            code: r.languageCode,
            name: r.languageName,
            flag: FLAG_MAP[r.languageCode] || `/flags/${r.languageCode}.png`,
        }));
    } catch {
        return FALLBACK_LANGUAGES;
    }
}

// ──────── batch fetch → group by pageKey ────────
async function fetchAllTranslations(lang: string): Promise<Record<string, Record<string, string>>> {
    try {
        const { data } = await apiClient.post("translations/labelList", {
            LanguageCode: lang,
        });

        const rows: { pageKey: string; labelKey: string; labelValue: string }[] = data?.data || [];

        // Group: { "common": { "Dashboard": "หน้าหลัก", ... }, "employee-page": { ... } }
        const grouped: Record<string, Record<string, string>> = {};
        for (const row of rows) {
            const pk = row.pageKey || "common";
            if (!grouped[pk]) grouped[pk] = {};
            grouped[pk][row.labelKey] = row.labelValue;
        }

        return grouped;
    } catch {
        return {};
    }
}

// ──────── Context ────────
interface LanguageContextType {
    currentLang: string;
    changeLang: (lang: string) => void;
    t: (key: string, fallback?: string) => string;
    isLoading: boolean;
    languages: LangConfig[];
    pageKey: string;
    allTranslations: Record<string, Record<string, string>>;
    refreshTranslations: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
    currentLang: "en",
    changeLang: () => {},
    t: (key, fallback) => fallback || key,
    isLoading: false,
    languages: FALLBACK_LANGUAGES,
    pageKey: "dashboard",
    allTranslations: {},
    refreshTranslations: () => {},
});

export function useLanguage() {
    return useContext(LanguageContext);
}

/**
 * Hook for page-level translations.
 * Reads from the pre-loaded translation cache — NO extra API calls.
 */
export function usePageTranslation(overridePageKey?: string) {
    const ctx = useContext(LanguageContext);
    const effectivePageKey = overridePageKey || ctx.pageKey;

    const t = useCallback(
        (key: string, fallback?: string): string => {
            // Helper: normalize key for fuzzy matching (remove spaces, hyphens, lowercase)
            const normalize = (k: string) => k.replace(/[\s\-_.]/g, '').toLowerCase();

            // Helper: lookup in a translation record with exact then fuzzy match
            const lookup = (trans: Record<string, string> | undefined): string | undefined => {
                if (!trans) return undefined;
                // 1. Exact match
                if (trans[key]) return trans[key];
                // 2. Fuzzy match: normalize both sides
                const nk = normalize(key);
                for (const [tk, tv] of Object.entries(trans)) {
                    if (normalize(tk) === nk) return tv;
                }
                return undefined;
            };

            // Priority: page-specific → common → header → fallback → key
            const pageResult = lookup(ctx.allTranslations[effectivePageKey]);
            if (pageResult) return pageResult;

            const commonResult = lookup(ctx.allTranslations["common"]);
            if (commonResult) return commonResult;

            const headerResult = lookup(ctx.allTranslations["header"]);
            if (headerResult) return headerResult;

            return fallback || key;
        },
        [ctx.allTranslations, effectivePageKey]
    );

    return {
        t,
        currentLang: ctx.currentLang,
        changeLang: ctx.changeLang,
        isLoading: ctx.isLoading,
    };
}

// ──────── Provider ────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // ★ Always start with deterministic defaults for SSR hydration match.
    //   After mount, sync from localStorage (useEffect).
    const [currentLang, setCurrentLang] = useState("en");
    const [allTranslations, setAllTranslations] = useState<Record<string, Record<string, string>>>({});
    const [languages, setLanguages] = useState<LangConfig[]>(FALLBACK_LANGUAGES);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fetchingRef = useRef<string>("");

    // pageKey: read from localStorage only after mount
    const [pageKey, setPageKeyState] = useState(() => derivePageKey(pathname));

    // Update pageKey when pathname changes
    useEffect(() => {
        const stored = localStorage.getItem("pageKey");
        setPageKeyState(stored || derivePageKey(pathname));
    }, [pathname]);

    // ★ Mount effect: sync language from localStorage, load cached translations
    useEffect(() => {
        const savedLang = localStorage.getItem("lang") || "en";
        const cached = getCachedTranslations(savedLang);

        setCurrentLang(savedLang);
        if (cached && Object.keys(cached).length > 0) {
            setAllTranslations(cached);
        } else {
            // Fetch from API if no cache
            fetchingRef.current = savedLang;
            setIsLoading(true);
            fetchAllTranslations(savedLang)
                .then((grouped) => {
                    setAllTranslations(grouped);
                    if (Object.keys(grouped).length > 0) {
                        setCachedTranslations(savedLang, grouped);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                    fetchingRef.current = "";
                });
        }

        setMounted(true);
    }, []);

    // Fetch language list from API (once)
    useEffect(() => {
        fetchLanguages().then(setLanguages);
    }, []);

    // changeLang: always fetch fresh translations for instant switch
    const changeLang = useCallback((lang: string) => {
        if (lang === currentLang) return;

        setCurrentLang(lang);
        localStorage.setItem("lang", lang);

        // Clear old cache for this language to always get fresh data
        clearCachedTranslations(lang);

        // Immediately fetch new translations
        fetchingRef.current = lang;
        setIsLoading(true);

        fetchAllTranslations(lang)
            .then((grouped) => {
                setAllTranslations(grouped);
                if (Object.keys(grouped).length > 0) {
                    setCachedTranslations(lang, grouped);
                }
            })
            .finally(() => {
                setIsLoading(false);
                fetchingRef.current = "";
            });
    }, [currentLang]);

    const refreshTranslations = useCallback(() => {
        clearCachedTranslations(currentLang);
        fetchingRef.current = "";
        setIsLoading(true);
        fetchAllTranslations(currentLang)
            .then((grouped) => {
                setAllTranslations(grouped);
                if (Object.keys(grouped).length > 0) {
                    setCachedTranslations(currentLang, grouped);
                }
            })
            .finally(() => setIsLoading(false));
    }, [currentLang]);

    const t = useCallback(
        (key: string, fallback?: string): string => {
            // Before mount, always return fallback (English) to match SSR
            if (!mounted) return fallback || key;

            // Global lookup: common → header → fallback → key
            const commonTrans = allTranslations["common"];
            if (commonTrans?.[key]) return commonTrans[key];

            const headerTrans = allTranslations["header"];
            if (headerTrans?.[key]) return headerTrans[key];

            return fallback || key;
        },
        [allTranslations, mounted]
    );

    return (
        <LanguageContext.Provider
            value={{
                currentLang,
                changeLang,
                t,
                isLoading,
                languages,
                pageKey,
                allTranslations,
                refreshTranslations,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}
