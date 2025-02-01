import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useThemedStyles, useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const createStyles = (theme: Theme) => {
  const baseButton: ViewStyle = {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const baseLabel: TextStyle = {
    ...theme.typography.button,
  };

  return StyleSheet.create({
    // Button containers
    primaryButton: {
      ...baseButton,
      backgroundColor: theme.colors.primary[500],
      ...theme.shadows.sm,
    },
    secondaryButton: {
      ...baseButton,
      backgroundColor: theme.colors.secondary[500],
    },
    outlinedButton: {
      ...baseButton,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary[500],
    },
    textButton: {
      ...baseButton,
      backgroundColor: 'transparent',
    },

    // Button states
    disabled: {
      backgroundColor: theme.colors.action.disabledBackground,
      borderColor: theme.colors.action.disabled,
    },

    // Button sizes
    small: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      minWidth: 80,
    },
    medium: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minWidth: 120,
    },
    large: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minWidth: 160,
    },

    // Label styles
    primaryLabel: {
      ...baseLabel,
      color: theme.colors.text.inverse,
    },
    secondaryLabel: {
      ...baseLabel,
      color: theme.colors.text.inverse,
    },
    outlinedLabel: {
      ...baseLabel,
      color: theme.colors.primary[500],
    },
    textLabel: {
      ...baseLabel,
      color: theme.colors.primary[500],
    },
    disabledLabel: {
      color: theme.colors.text.disabled,
    },

    // Size-specific label styles
    smallLabel: {
      ...theme.typography.button,
      fontSize: 12,
    },
    mediumLabel: {
      ...theme.typography.button,
    },
    largeLabel: {
      ...theme.typography.button,
      fontSize: 18,
    },
  });
};

export const Button: React.FC<ButtonProps> = ({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const styles = useThemedStyles(createStyles);
  const { theme } = useTheme();

  // Determine container styles
  const containerStyles = [
    styles[`${variant}Button`],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  // Determine label styles
  const textStyles = [
    styles[`${variant}Label`],
    styles[`${size}Label`],
    disabled && styles.disabledLabel,
    labelStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={containerStyles}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outlined' || variant === 'text' 
            ? theme.colors.primary[500]
            : theme.colors.text.inverse}
          accessibilityLabel="Loading"
          accessibilityRole="progressbar"
        />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

// Example usage:
/*
import { Button } from './components/common/Button';

const MyScreen = () => {
  return (
    <>
      <Button
        label="Primary Button"
        onPress={() => {}}
        variant="primary"
        size="medium"
      />
      
      <Button
        label="Secondary Small"
        onPress={() => {}}
        variant="secondary"
        size="small"
      />
      
      <Button
        label="Outlined Large"
        onPress={() => {}}
        variant="outlined"
        size="large"
      />
      
      <Button
        label="Text Button"
        onPress={() => {}}
        variant="text"
      />
      
      <Button
        label="Loading State"
        onPress={() => {}}
        loading={true}
      />
      
      <Button
        label="Disabled State"
        onPress={() => {}}
        disabled={true}
      />
    </>
  );
};
*/ 