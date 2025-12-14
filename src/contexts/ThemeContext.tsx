/**
 * Theme Context
 * Provides theme mode (light/dark) throughout the app
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getThemeMode, setThemeMode as saveThemeMode } from '../services/storageService';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async (): Promise<void> => {
    try {
      const savedMode = await getThemeMode();
      if (savedMode) {
        setThemeMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = (): void => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    saveThemeMode(newMode);
  };

  const setTheme = (mode: ThemeMode): void => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return <></>;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
