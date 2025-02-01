import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleProp,
} from 'react-native';
import { useThemedStyles, useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.subtitle2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
    },
    inputError: {
      borderColor: theme.colors.error[500],
    },
    helper: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xxs,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error[500],
      marginTop: theme.spacing.xxs,
    },
    disabled: {
      backgroundColor: theme.colors.action.disabledBackground,
      borderColor: theme.colors.border.light,
    },
  });
};

export const Input = React.forwardRef<TextInput, InputProps>(({
  label,
  error,
  helper,
  containerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  editable = true,
  testID,
  ...props
}, ref) => {
  const styles = useThemedStyles(createStyles);

  const inputStyles = [
    styles.input,
    error && styles.inputError,
    !editable && styles.disabled,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[styles.label, labelStyle]}
          accessibilityRole="text"
          accessible={true}
        >
          {label}
        </Text>
      )}
      
      <TextInput
        ref={ref}
        style={inputStyles}
        placeholderTextColor={styles.helper.color}
        editable={editable}
        accessibilityLabel={label || props.placeholder}
        accessibilityRole="text"
        accessibilityState={{
          disabled: !editable,
          // React Native doesn't support 'invalid' state,
          // we'll use error messages for accessibility instead
        }}
        testID={testID}
        nativeID={testID}
        {...props}
      />

      {(error || helper) && (
        <Text
          style={[error ? styles.error : styles.helper, helperStyle]}
          accessibilityRole={error ? "alert" : "text"}
          accessible={true}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

// Example usage:
/*
import { Input } from './components/common/Input';

const MyForm = () => {
  const [value, setValue] = useState('');
  
  return (
    <>
      <Input
        label="Email"
        placeholder="Enter your email"
        value={value}
        onChangeText={setValue}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        error="Password is required"
      />

      <Input
        label="Username"
        placeholder="Enter your username"
        helper="This will be displayed on your profile"
      />

      <Input
        label="Read Only"
        value="Cannot edit this"
        editable={false}
      />
    </>
  );
};
*/ 