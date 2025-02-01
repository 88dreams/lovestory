import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, Pressable } from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: IconSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const ICON_SIZES: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressable: {
      padding: theme.spacing.xs,
    },
    disabled: {
      opacity: 0.5,
    },
  });
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  style,
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useThemedStyles(t => t);

  const iconSize = ICON_SIZES[size];
  const iconColor = color || theme.colors.text.primary;

  const iconStyle: StyleProp<TextStyle> = [
    disabled && styles.disabled,
  ];

  const renderIcon = () => (
    <MaterialCommunityIcons
      name={name}
      size={iconSize}
      color={iconColor}
      style={iconStyle}
    />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.container, styles.pressable, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {renderIcon()}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.container, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {renderIcon()}
    </Pressable>
  );
};

// Example usage:
/*
import { Icon } from './components/common/Icon';

// Basic icon
<Icon name="heart" />

// Custom size and color
<Icon
  name="star"
  size="lg"
  color={theme.colors.primary[500]}
/>

// Pressable icon
<Icon
  name="close"
  onPress={() => console.log('Icon pressed')}
  accessibilityLabel="Close modal"
/>

// Disabled icon
<Icon
  name="send"
  disabled
  onPress={() => console.log('Will not trigger when disabled')}
/>

// Custom style
<Icon
  name="account"
  style={{ backgroundColor: theme.colors.background.secondary }}
/>
*/ 