import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'eye-comfort';

interface ThemeContextValue {
    mode: ThemeMode;
    toggleMode: () => void;
    setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    mode: 'light',
    toggleMode: () => {},
    setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('bo-theme');
        if (saved === 'dark' || saved === 'eye-comfort') return saved;
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('bo-theme', mode);
    }, [mode]);

    const toggleMode = () => setModeState(m => {
        if (m === 'light') return 'dark';
        if (m === 'dark') return 'eye-comfort';
        return 'light';
    });
    const setMode = (m: ThemeMode) => setModeState(m);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

