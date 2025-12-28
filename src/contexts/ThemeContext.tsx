/**
 * Theme Context
 * Provides theme mode (light/dark) throughout the app with smooth transitions
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { getThemeMode, setThemeMode as saveThemeMode } from '../services/storageService';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ThemeMode = 'light' | 'dark';

// Custom animation config for smooth theme transitions
const THEME_ANIMATION_CONFIG = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

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
    // Animate the layout change for smooth transition
    LayoutAnimation.configureNext(THEME_ANIMATION_CONFIG);
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    saveThemeMode(newMode);
  };

  const setTheme = (mode: ThemeMode): void => {
    // Animate the layout change for smooth transition
    LayoutAnimation.configureNext(THEME_ANIMATION_CONFIG);
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
