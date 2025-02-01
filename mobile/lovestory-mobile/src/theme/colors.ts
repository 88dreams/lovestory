import type { ThemeColors } from './types';
import { getContrastRatio, isContrastValid } from '../utils/colors';

const createShade = (baseColor: string, darkMode: boolean = false): any => {
  // This is a placeholder function that would generate a proper color shade
  // In a real implementation, this would use color manipulation libraries
  // to generate proper accessible color shades
  return {
    100: baseColor + '19', // 10% opacity
    200: baseColor + '33', // 20% opacity
    300: baseColor + '4D', // 30% opacity
    400: baseColor + '66', // 40% opacity
    500: baseColor,        // base color
    600: baseColor + 'B3', // 70% opacity
    700: baseColor + 'CC', // 80% opacity
    800: baseColor + 'E6', // 90% opacity
    900: baseColor + 'FF', // 100% opacity
  };
};

export const lightColors: ThemeColors = {
  primary: createShade('#007AFF'),
  secondary: createShade('#5856D6'),
  error: createShade('#FF3B30'),
  warning: createShade('#FF9500'),
  success: createShade('#34C759'),
  info: createShade('#5856D6'),
  grey: createShade('#8E8E93'),
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#EFEFF4',
  },
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    disabled: '#8E8E93',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E5EA',
    medium: '#C7C7CC',
    dark: '#8E8E93',
  },
  action: {
    active: '#007AFF',
    hover: '#47A1FF',
    disabled: '#99A9BF',
    disabledBackground: '#F5F7FA',
  },
};

export const darkColors: ThemeColors = {
  primary: createShade('#0A84FF', true),
  secondary: createShade('#5E5CE6', true),
  error: createShade('#FF453A', true),
  warning: createShade('#FF9F0A', true),
  success: createShade('#32D74B', true),
  info: createShade('#5E5CE6', true),
  grey: createShade('#98989D', true),
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#EBEBF5',
    disabled: '#98989D',
    inverse: '#000000',
  },
  border: {
    light: '#38383A',
    medium: '#48484A',
    dark: '#98989D',
  },
  action: {
    active: '#0A84FF',
    hover: '#409CFF',
    disabled: '#6E6E73',
    disabledBackground: '#1C1C1E',
  },
};

// Validate contrast ratios
Object.entries(lightColors.text).forEach(([key, color]) => {
  const ratio = getContrastRatio(color, lightColors.background.primary);
  console.assert(
    isContrastValid(color, lightColors.background.primary),
    `Light theme text.${key} contrast ratio (${ratio}) does not meet WCAG standards`
  );
});

Object.entries(darkColors.text).forEach(([key, color]) => {
  const ratio = getContrastRatio(color, darkColors.background.primary);
  console.assert(
    isContrastValid(color, darkColors.background.primary),
    `Dark theme text.${key} contrast ratio (${ratio}) does not meet WCAG standards`
  );
}); 