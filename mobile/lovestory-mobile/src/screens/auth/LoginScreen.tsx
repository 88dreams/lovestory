import React, { useEffect } from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { loginAsync, socialAuthAsync } from '../../store/slices/authSlice';
import { isAppleSignInAvailable } from '../../services/auth/socialAuth';
import { authApi } from '../../services/api/auth';
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

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

interface SocialAuthResponse {
  token: string;
  provider: 'google' | 'apple';
}

interface AuthPayload {
  email?: string;
  password?: string;
  token: string;
  user: {
    id: number;
    email: string;
  };
}

interface FormProps {
  style?: ViewStyle;
  onSubmit?: () => void | Promise<void>;
  children: React.ReactNode;
}

interface ButtonProps {
  testID?: string;
  children: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  loadingTestID?: string;
  iconName?: string;
}

interface InputProps {
  testID?: string;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  editable?: boolean;
  rightIcon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  rightIconTestID?: string;
}

interface DividerProps {
  children: React.ReactNode;
}

const AUTH_TOKEN_KEY = '@auth_token';

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
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = React.useState(false);

  const isValidPassword = (password: string) => password.length >= 6;
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    checkStoredToken();
    checkAppleSignIn();
  }, []);

  const checkStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const response = await authApi.validateToken(token);
        if (response.valid && response.user) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
          navigation.navigate('Home' as never);
        } else {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (err) {
      console.error('Token validation failed:', err);
    }
  };

  const checkAppleSignIn = async () => {
    try {
      const available = await isAppleSignInAvailable();
      setIsAppleAvailable(available);
    } catch {
      setIsAppleAvailable(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await dispatch(loginAsync({ email, password })).unwrap();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
      navigation.navigate('Home' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    try {
      setError(null);
      setLoading(true);
      const result = await dispatch(socialAuthAsync(provider)).unwrap();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
      navigation.navigate('Home' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} authentication failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header} testID="welcome-header">
        <H1 testID="welcome-text">Welcome Back</H1>
        <Body1 testID="subtitle-text">Sign in to continue</Body1>
      </View>

      <Form style={styles.form} onSubmit={handleLogin}>
        <Input
          testID="email-input"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />
        <Spacer size="md" />
        <Input
          testID="password-input"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!loading}
          rightIcon={
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          rightIconTestID="password-visibility-toggle"
        />

        {error && (
          <View testID="form-error">
            <Spacer size="sm" />
            <Caption color="error">{error}</Caption>
          </View>
        )}

        <Spacer size="lg" />
        <Button
          testID="sign-in-button"
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password || !isValidPassword(password) || !isValidEmail(email) || loading}
          loadingTestID="sign-in-button-loading"
        >
          Sign In
        </Button>

        <Button
          testID="forgot-password-button"
          variant="text"
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          disabled={loading}
        >
          Forgot Password?
        </Button>

        <Divider>or</Divider>

        <Button
          testID="google-auth-button"
          variant="outlined"
          onPress={() => handleSocialAuth('google')}
          disabled={loading}
          iconName="google"
        >
          Continue with Google
        </Button>

        {isAppleAvailable && (
          <Button
            testID="apple-auth-button"
            variant="outlined"
            onPress={() => handleSocialAuth('apple')}
            disabled={loading}
            iconName="apple"
          >
            Continue with Apple
          </Button>
        )}

        <Spacer size="xl" />
        <Button
          testID="sign-up-button"
          variant="text"
          onPress={() => navigation.navigate('Register' as never)}
          disabled={loading}
        >
          Don't have an account? Sign Up
        </Button>
      </Form>
    </Screen>
  );
}; 