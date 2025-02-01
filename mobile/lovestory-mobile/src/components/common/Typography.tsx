import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';

interface TypographyProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  accessibilityRole?: 
    | 'header'
    | 'text'
    | 'link'
    | 'button'
    | 'search'
    | 'image'
    | 'keyboardkey'
    | 'summary'
    | 'alert'
    | 'none';
  accessibilityLabel?: string;
  onPress?: () => void;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    h1: theme.typography.h1,
    h2: theme.typography.h2,
    h3: theme.typography.h3,
    h4: theme.typography.h4,
    subtitle1: theme.typography.subtitle1,
    subtitle2: theme.typography.subtitle2,
    body1: theme.typography.body1,
    body2: theme.typography.body2,
    button: theme.typography.button,
    caption: theme.typography.caption,
    overline: theme.typography.overline,
  });
};

const createTypographyComponent = (variant: keyof ReturnType<typeof createStyles>) => {
  return React.forwardRef<Text, TypographyProps>(({
    children,
    style,
    color,
    align,
    accessibilityRole = 'text',
    accessibilityLabel,
    onPress,
    ...props
  }, ref) => {
    const styles = useThemedStyles(createStyles);
    
    const textStyle = [
      styles[variant],
      align && { textAlign: align },
      color && { color },
      style,
    ];

    return (
      <Text
        ref={ref}
        style={textStyle}
        accessibilityRole={variant.startsWith('h') ? 'header' : accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        {...props}
      >
        {children}
      </Text>
    );
  });
};

export const H1 = createTypographyComponent('h1');
export const H2 = createTypographyComponent('h2');
export const H3 = createTypographyComponent('h3');
export const H4 = createTypographyComponent('h4');
export const Subtitle1 = createTypographyComponent('subtitle1');
export const Subtitle2 = createTypographyComponent('subtitle2');
export const Body1 = createTypographyComponent('body1');
export const Body2 = createTypographyComponent('body2');
export const ButtonText = createTypographyComponent('button');
export const Caption = createTypographyComponent('caption');
export const Overline = createTypographyComponent('overline');

// Add display names for debugging
H1.displayName = 'Typography.H1';
H2.displayName = 'Typography.H2';
H3.displayName = 'Typography.H3';
H4.displayName = 'Typography.H4';
Subtitle1.displayName = 'Typography.Subtitle1';
Subtitle2.displayName = 'Typography.Subtitle2';
Body1.displayName = 'Typography.Body1';
Body2.displayName = 'Typography.Body2';
ButtonText.displayName = 'Typography.ButtonText';
Caption.displayName = 'Typography.Caption';
Overline.displayName = 'Typography.Overline';

// Example usage:
/*
import { H1, Body1, Caption } from './components/common/Typography';

const MyScreen = () => {
  return (
    <>
      <H1>Welcome to LoveStory</H1>
      
      <Body1>
        This is the main content of your app, using the standard body text style.
        It will automatically use the correct color and typography settings from
        your theme.
      </Body1>
      
      <Caption color={theme.colors.text.secondary}>
        Last updated: 2 hours ago
      </Caption>
      
      <Body2 align="center">
        Centered text with body2 style
      </Body2>
      
      <ButtonText onPress={() => console.log('pressed')}>
        CLICK ME
      </ButtonText>
    </>
  );
};
*/ 