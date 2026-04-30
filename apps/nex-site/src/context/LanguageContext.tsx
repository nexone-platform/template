import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../services/api';

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
    getUsedKeys: () => Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'th',
    setLang: () => { },
    t: (_key: string, fallback?: string) => fallback || _key,
    isLoading: true,
    availableLanguages: [],
    getUsedKeys: () => ({}),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<string>(() => {
        return localStorage.getItem('bo_lang') || 'th';
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
        localStorage.setItem('bo_lang', newLang);
    }, []);

    // Registry of used keys: { key: fallback }
    const usedKeysRef = useRef<Record<string, string>>({});

    const t = useCallback(
        (key: string, fallback?: string) => {
            // Record this key usage with its fallback
            if (fallback && !usedKeysRef.current[key]) {
                usedKeysRef.current[key] = fallback;
            }
            return translations[key] || fallback || key;
        },
        [translations]
    );

    const getUsedKeys = useCallback(() => {
        return { ...usedKeysRef.current };
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isLoading, availableLanguages, getUsedKeys }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

export default LanguageContext;
