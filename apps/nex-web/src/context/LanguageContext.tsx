'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface AvailableLanguage {
    languageCode: string;
    languageName: string;
    description?: string;
}

interface LanguageContextType {
    lang: string;
    setLang: (lang: string) => void;
    t: (key: string, fallback?: string) => string;
    isLoading: boolean;
    availableLanguages: AvailableLanguage[];
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'th',
    setLang: () => { },
    t: (key: string, fallback?: string) => fallback || key,
    isLoading: true,
    availableLanguages: [],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('lang') || 'th';
        }
        return 'th';
    });
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguage[]>([]);

    // Fetch available languages on mount
    useEffect(() => {
        fetch(`${API_BASE_URL}/translations/languages/active`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setAvailableLanguages(data);
                }
            })
            .catch(() => {
                // Fallback to default languages
                setAvailableLanguages([
                    { languageCode: 'th', languageName: 'Thai', description: 'ภาษาไทย' },
                    { languageCode: 'en', languageName: 'English', description: 'English' },
                ]);
            });
    }, []);

    // Fetch translations when language changes
    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/translations/map?lang=${lang}`)
            .then((res) => res.json())
            .then((data) => {
                setTranslations(data);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [lang]);

    const setLang = useCallback((newLang: string) => {
        setLangState(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('lang', newLang);
        }
    }, []);

    const t = useCallback(
        (key: string, fallback?: string) => {
            return translations[key] || fallback || key;
        },
        [translations]
    );

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isLoading, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

export default LanguageContext;
