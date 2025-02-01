import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { useThemedStyles } from '../../../theme/ThemeProvider';
import type { Theme } from '../../../theme/types';

interface CheckboxProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: 1,
    },
    disabled: {
      opacity: 0.5,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border.medium,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    checked: {
      backgroundColor: theme.colors.primary[600],
      borderColor: theme.colors.primary[600],
    },
    error: {
      borderColor: theme.colors.error[600],
    },
    checkmark: {
      width: 12,
      height: 12,
      borderColor: theme.colors.text.inverse,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      transform: [{ rotate: '45deg' }],
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
    },
    labelError: {
      color: theme.colors.error[600],
    },
    errorText: {
      ...theme.typography.caption,
      marginTop: theme.spacing.xs,
      color: theme.colors.error[600],
    },
  });
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  label,
  disabled = false,
  error,
  style,
  testID,
}) => {
  const styles = useThemedStyles(createStyles);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!checked);
    }
  };

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.container,
          disabled && styles.disabled,
        ]}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        testID={testID}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checked,
            error && styles.error,
          ]}
        >
          {checked && <View style={styles.checkmark} />}
        </View>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, error && styles.labelError]}>
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

// Example usage:
/*
import { Checkbox } from './components/common/form/Checkbox';

const MyForm = () => {
  const [isChecked, setIsChecked] = React.useState(false);

  return (
    <Checkbox
      checked={isChecked}
      onValueChange={setIsChecked}
      label="I agree to the terms and conditions"
      error={!isChecked ? 'You must accept the terms to continue' : undefined}
    />
  );
};
*/ 