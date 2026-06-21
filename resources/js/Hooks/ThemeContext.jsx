import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('ecvaultz-theme');
            if (stored === 'light' || stored === 'dark') return stored;
            return 'dark'; // default dark mode
        }
        return 'dark';
    });

    const applyTheme = useCallback((t) => {
        const root = document.documentElement;
        const body = document.body;
        root.setAttribute('data-theme', t);
        body.setAttribute('data-theme', t);
        // Toggle Tailwind dark class for dark: variants
        if (t === 'dark') {
            root.classList.add('dark');
            body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem('ecvaultz-theme', theme);
    }, [theme, applyTheme]);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const setTheme = useCallback((t) => {
        setThemeState(t);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
