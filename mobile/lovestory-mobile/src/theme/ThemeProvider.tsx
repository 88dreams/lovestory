import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, ThemeType } from './types';
import { lightColors, darkColors } from './colors';
import { spacing, typography, radius, shadows } from './base';

type ThemeContextType = {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setIsSystemTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@LoveStory:theme';
const SYSTEM_THEME_STORAGE_KEY = '@LoveStory:system_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [savedTheme, savedIsSystem] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(SYSTEM_THEME_STORAGE_KEY),
        ]);

        if (savedIsSystem !== null) {
          setIsSystemTheme(savedIsSystem === 'true');
        }

        if (savedTheme as ThemeType) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, []);

  // Update theme based on system changes
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setThemeType(systemColorScheme);
    }
  }, [isSystemTheme, systemColorScheme]);

  // Save theme preferences
  const saveThemePreferences = useCallback(async (type: ThemeType, isSystem: boolean) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(THEME_STORAGE_KEY, type),
        AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, String(isSystem)),
      ]);
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }, []);

  const handleThemeChange = useCallback((type: ThemeType) => {
    setThemeType(type);
    if (!isSystemTheme) {
      saveThemePreferences(type, false);
    }
  }, [isSystemTheme, saveThemePreferences]);

  const handleSystemThemeChange = useCallback((value: boolean) => {
    setIsSystemTheme(value);
    saveThemePreferences(value ? (systemColorScheme as ThemeType) : themeType, value);
  }, [systemColorScheme, themeType, saveThemePreferences]);

  const toggleTheme = useCallback(() => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    handleThemeChange(newTheme);
  }, [themeType, handleThemeChange]);

  const theme = useMemo((): Theme => ({
    colors: themeType === 'light' ? lightColors : darkColors,
    spacing,
    typography,
    radius,
    shadows,
    isDark: themeType === 'dark',
  }), [themeType]);

  const contextValue = useMemo(() => ({
    theme,
    themeType,
    setThemeType: handleThemeChange,
    toggleTheme,
    isSystemTheme,
    setIsSystemTheme: handleSystemThemeChange,
  }), [theme, themeType, handleThemeChange, toggleTheme, isSystemTheme, handleSystemThemeChange]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for creating themed styles
export const useThemedStyles = <T extends object>(
  styleCreator: (theme: Theme) => T
) => {
  const { theme } = useTheme();
  return useMemo(() => styleCreator(theme), [theme, styleCreator]);
}; 