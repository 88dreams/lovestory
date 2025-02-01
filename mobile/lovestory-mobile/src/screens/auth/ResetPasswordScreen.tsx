import React from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { resetPassword } from '../../store/slices/authSlice';
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
  success: {
    alignItems: 'center' as FlexStyle['alignItems'],
    marginTop: theme.spacing.xl,
  } as ViewStyle,
});

export const ResetPasswordScreen = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    password: '',
    confirmPassword: '',
  });

  // Get token from route params
  const token = (route.params as { token: string } | undefined)?.token;

  React.useEffect(() => {
    if (!token) {
      navigation.navigate('Login' as never);
    }
  }, [token, navigation]);

  const validatePassword = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;

    try {
      setLoading(true);
      setError(null);
      await dispatch(resetPassword({ token: token!, password: formData.password })).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to reset password');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  if (success) {
    return (
      <Screen>
        <View style={styles.container} accessible={true} accessibilityRole="none">
          <View style={styles.success} accessible={true} accessibilityRole="header">
            <H1 accessibilityRole="header">Password Reset Complete</H1>
            <Spacer size="md" />
            <Body1 
              color="textSecondary" 
              align="center"
              accessibilityRole="text"
            >
              Your password has been successfully reset. You can now log in with your new password.
            </Body1>
            <Spacer size="xl" />
            <Button
              label="Back to Login"
              variant="primary"
              onPress={navigateToLogin}
              accessibilityLabel="Back to login button"
              accessibilityHint="Return to login screen with your new password"
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container} accessible={true} accessibilityRole="none">
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <H1 accessibilityRole="header">Create New Password</H1>
          <Spacer size="xs" />
          <Body1 
            color="textSecondary" 
            align="center"
            accessibilityRole="text"
          >
            Please enter your new password
          </Body1>
        </View>

        <Form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="New Password"
            placeholder="Enter your new password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="New password input field"
            accessibilityHint="Enter your new password, must be at least 8 characters"
            accessibilityRole="text"
          />
          <Spacer size="md" />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your new password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, confirmPassword: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="Confirm password input field"
            accessibilityHint="Re-enter your new password to confirm it matches"
            accessibilityRole="text"
          />

          <Spacer size="lg" />

          <Button
            label="Reset Password"
            variant="primary"
            loading={loading}
            disabled={loading || !formData.password || !formData.confirmPassword}
            onPress={handleSubmit}
            accessibilityLabel={`Reset password button${loading ? ', loading' : ''}`}
            accessibilityHint="Set your new password and complete the reset process"
          />

          {error && (
            <>
              <Spacer size="md" />
              <Caption 
                color="error"
                accessibilityRole="alert"
                accessibilityLabel={error}
              >
                {error}
              </Caption>
            </>
          )}
        </Form>
      </View>
    </Screen>
  );
}; 