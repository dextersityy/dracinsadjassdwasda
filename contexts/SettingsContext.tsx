"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Resolution = '480p' | '720p' | '1080p';

interface SettingsContextType {
    theme: Theme;
    resolution: Resolution;
    setTheme: (theme: Theme) => void;
    setResolution: (resolution: Resolution) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [resolution, setResolutionState] = useState<Resolution>('720p');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedTheme = localStorage.getItem('dracinaja_theme') as Theme;
        const savedResolution = localStorage.getItem('dracinaja_resolution') as Resolution;

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setThemeState(savedTheme);
        }

        if (savedResolution && ['480p', '720p', '1080p'].includes(savedResolution)) {
            setResolutionState(savedResolution);
        }

        setIsLoaded(true);
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!isLoaded) return;

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dracinaja_theme', theme);
    }, [theme, isLoaded]);

    // Save resolution to localStorage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('dracinaja_resolution', resolution);
    }, [resolution, isLoaded]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const setResolution = (newResolution: Resolution) => {
        setResolutionState(newResolution);
    };

    return (
        <SettingsContext.Provider value={{
            theme,
            resolution,
            setTheme,
            setResolution,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}
