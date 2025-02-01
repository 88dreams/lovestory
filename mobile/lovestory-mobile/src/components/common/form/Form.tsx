import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useThemedStyles } from '../../../theme/ThemeProvider';
import type { Theme } from '../../../theme/types';

interface FormProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onSubmit?: () => void;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
  });
};

export const Form: React.FC<FormProps> = ({
  children,
  style,
  contentContainerStyle,
  onSubmit,
}) => {
  const styles = useThemedStyles(createStyles);

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="none"
    >
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

// Example usage:
/*
import { Form } from './components/common/form/Form';
import { Input } from './components/common/Input';
import { Button } from './components/common/Button';

const LoginForm = () => {
  const handleSubmit = () => {
    // Handle form submission
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
      />
      <Button onPress={handleSubmit}>
        Login
      </Button>
    </Form>
  );
};
*/ 