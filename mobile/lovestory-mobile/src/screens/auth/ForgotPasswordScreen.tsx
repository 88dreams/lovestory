import React from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { requestPasswordReset } from '../../store/slices/authSlice';
import { Screen } from '../../components/common/Screen';
import { H1, Body1, Caption } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Form } from '../../components/common/form/Form';
import { Input } from '../../components/common/Input';
import { Spacer } from '../../components/common/Spacer';
import type { Theme } from '../../theme/types';
import type { AppDispatch } from '../../store';

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  header: {
    alignItems: 'center' as FlexStyle['alignItems'],
    marginVertical: theme.spacing.xl,
  } as ViewStyle,
  form: {
    width: '100%',
  } as ViewStyle,
  footer: {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    justifyContent: 'center' as FlexStyle['justifyContent'],
    marginTop: theme.spacing.xl,
  } as ViewStyle,
  success: {
    alignItems: 'center' as FlexStyle['alignItems'],
    marginTop: theme.spacing.xl,
  } as ViewStyle,
});

export const ForgotPasswordScreen = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await dispatch(requestPasswordReset({ email })).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to send reset email');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  if (success) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.success}>
            <H1>Check Your Email</H1>
            <Spacer size="md" />
            <Body1 color="textSecondary" align="center">
              We've sent password reset instructions to {email}. Please check your inbox and follow the link to reset your password.
            </Body1>
            <Spacer size="xl" />
            <Button
              label="Back to Login"
              variant="primary"
              onPress={navigateToLogin}
              accessibilityLabel="Back to login button"
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <H1>Reset Password</H1>
          <Spacer size="xs" />
          <Body1 color="textSecondary" align="center">
            Enter your email address and we'll send you instructions to reset your password
          </Body1>
        </View>

        <Form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
          />

          <Spacer size="lg" />

          <Button
            label="Send Reset Link"
            variant="primary"
            loading={loading}
            disabled={loading || !email.trim()}
            onPress={handleSubmit}
            accessibilityLabel="Send password reset link button"
          />

          {error && (
            <>
              <Spacer size="md" />
              <Caption color="error">
                {error}
              </Caption>
            </>
          )}
        </Form>

        <View style={styles.footer}>
          <Button
            label="Back to Login"
            variant="text"
            onPress={navigateToLogin}
          />
        </View>
      </View>
    </Screen>
  );
}; 