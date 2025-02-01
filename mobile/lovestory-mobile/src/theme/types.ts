import { TextStyle, ViewStyle } from 'react-native';

export type ColorShade = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type ThemeColors = {
  primary: ColorShade;
  secondary: ColorShade;
  error: ColorShade;
  warning: ColorShade;
  success: ColorShade;
  info: ColorShade;
  grey: ColorShade;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
  action: {
    active: string;
    hover: string;
    disabled: string;
    disabledBackground: string;
  };
};

export type Spacing = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type Typography = {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  subtitle1: TextStyle;
  subtitle2: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
};

export type Radius = {
  none: number;
  sm: number;
  md: number;
  lg: number;
  pill: number;
  circular: number;
};

export type ShadowProps = {
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  android: {
    elevation: number;
  };
};

export type Shadow = {
  none: ViewStyle;
  sm: ShadowProps;
  md: ShadowProps;
  lg: ShadowProps;
};

export interface Theme {
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  radius: Radius;
  shadows: Shadow;
  isDark: boolean;
}

export type ThemeType = 'light' | 'dark'; 