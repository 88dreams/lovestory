import React from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { login, socialAuth } from '../../store/slices/authSlice';
import { signInWithGoogle, signInWithApple, isAppleSignInAvailable } from '../../services/auth/socialAuth';
import { Screen } from '../../components/common/Screen';
import { H1, Body1, Body2, Caption } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Form } from '../../components/common/form/Form';
import { Input } from '../../components/common/Input';
import { Spacer } from '../../components/common/Spacer';
import { Divider } from '../../components/common/Divider';
import { Icon } from '../../components/common/Icon';
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
  socialButton: {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    alignItems: 'center' as FlexStyle['alignItems'],
    justifyContent: 'center' as FlexStyle['justifyContent'],
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginVertical: theme.spacing.xs,
  } as ViewStyle,
  socialIcon: {
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  dividerContainer: {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    alignItems: 'center' as FlexStyle['alignItems'],
    marginVertical: theme.spacing.lg,
  } as ViewStyle,
  dividerText: {
    marginHorizontal: theme.spacing.sm,
  } as ViewStyle,
  forgotPassword: {
    alignSelf: 'flex-end' as FlexStyle['alignSelf'],
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  footer: {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    justifyContent: 'center' as FlexStyle['justifyContent'],
    marginTop: theme.spacing.xl,
  } as ViewStyle,
});

export const LoginScreen = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(login(formData)).unwrap();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      setError(null);

      let socialAuthResponse;
      if (provider === 'google') {
        socialAuthResponse = await signInWithGoogle();
      } else {
        // Check if Apple Sign In is available on the device
        const isAppleAvailable = await isAppleSignInAvailable();
        if (!isAppleAvailable) {
          setError('Apple Sign In is not available on this device');
          return;
        }
        socialAuthResponse = await signInWithApple();
      }

      // Handle the social auth response
      await dispatch(socialAuth(socialAuthResponse)).unwrap();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to authenticate with social provider');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  return (
    <Screen>
      <View style={styles.container} accessible={true} accessibilityRole="none">
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <H1 accessibilityRole="header" testID="welcome-text">Welcome Back</H1>
          <Spacer size="xs" />
          <Body1 color="textSecondary" accessibilityRole="text" testID="subtitle-text">
            Sign in to continue
          </Body1>
        </View>

        <Form style={styles.form} onSubmit={handleLogin}>
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={formData.email}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, email: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="Email input field"
            accessibilityHint="Enter your email address to sign in"
            accessibilityRole="text"
            testID="email-input"
          />
          <Spacer size="md" />
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="Password input field"
            accessibilityHint="Enter your password to sign in"
            accessibilityRole="text"
            testID="password-input"
          />

          <Button
            label="Forgot Password?"
            variant="text"
            style={styles.forgotPassword}
            onPress={navigateToForgotPassword}
            accessibilityLabel="Forgot password button"
            accessibilityHint="Navigate to password reset screen"
            testID="forgot-password-button"
          />

          <Spacer size="lg" />

          <Button
            label="Sign In"
            variant="primary"
            loading={loading}
            disabled={loading}
            onPress={handleLogin}
            accessibilityLabel={`Sign in button${loading ? ', loading' : ''}`}
            accessibilityHint="Sign in to your account"
            testID="sign-in-button"
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

        <View style={styles.dividerContainer} accessible={true} accessibilityRole="none">
          <Divider />
          <Body2 
            color="textSecondary" 
            style={styles.dividerText}
            accessibilityRole="text"
            accessibilityLabel="or"
          >
            OR
          </Body2>
          <Divider />
        </View>

        <Button
          label="Continue with Google"
          variant="outlined"
          onPress={() => handleSocialAuth('google')}
          accessibilityLabel="Sign in with Google button"
          accessibilityHint="Sign in using your Google account"
          testID="google-auth-button"
          style={styles.socialButton}
          icon={
            <Icon 
              name="google" 
              size="md" 
              style={styles.socialIcon}
              accessibilityLabel="Google icon"
            />
          }
        />

        <Spacer size="md" />

        <Button
          label="Continue with Apple"
          variant="outlined"
          onPress={() => handleSocialAuth('apple')}
          accessibilityLabel="Sign in with Apple button"
          accessibilityHint="Sign in using your Apple account"
          testID="apple-auth-button"
          style={styles.socialButton}
          icon={
            <Icon 
              name="apple" 
              size="md" 
              style={styles.socialIcon}
              accessibilityLabel="Apple icon"
            />
          }
        />

        <View style={styles.footer} accessible={true} accessibilityRole="none">
          <Body2 
            color="textSecondary"
            accessibilityRole="text"
          >
            Don't have an account?{' '}
          </Body2>
          <Button
            label="Sign Up"
            variant="text"
            onPress={navigateToRegister}
            accessibilityLabel="Sign up button"
            accessibilityHint="Navigate to create account screen"
            testID="sign-up-button"
          />
        </View>
      </View>
    </Screen>
  );
}; 