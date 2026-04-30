'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
    lang: string;
    setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'th',
    setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLangState] = useState('th');

    useEffect(() => {
        const saved = localStorage.getItem('nexone_lang');
        if (saved) setLangState(saved.toLowerCase());

        // fallback for other tabs/components that still use dispatch
        const handleLangChange = (e: any) => {
            if (e.detail && e.detail.code) {
                setLangState(e.detail.code.toLowerCase());
            }
        };
        window.addEventListener('nexone:lang_changed', handleLangChange);
        return () => window.removeEventListener('nexone:lang_changed', handleLangChange);
    }, []);

    const setLang = (newLang: string) => {
        setLangState(newLang.toLowerCase());
        localStorage.setItem('nexone_lang', newLang.toLowerCase());
        window.dispatchEvent(new CustomEvent('nexone:lang_changed', { detail: { code: newLang.toLowerCase() } }));
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
