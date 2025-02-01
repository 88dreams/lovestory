import React, { useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { login as loginAsync, socialAuth as socialAuthAsync } from '../../store/slices/authSlice';
import { signInWithGoogle, signInWithApple, isAppleSignInAvailable } from '../../services/auth/socialAuth';
import { H1, Body1, Body2, Caption } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { Screen } from '../../components/common/Screen';
import { Spacer } from '../../components/common/Spacer';
import { Form } from '../../components/common/form/Form';
import { Divider } from '../../components/common/Divider';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';
import { authApi } from '../../services/api/auth';
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
}

interface DividerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AUTH_TOKEN_KEY = '@auth_token';

const createStyles = (theme: Theme): Record<string, ViewStyle> => ({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  form: {
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginVertical: theme.spacing.xs,
  },
  socialIcon: {
    marginRight: theme.spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerText: {
    marginHorizontal: theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
});

export const LoginScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const theme = useThemedStyles((theme) => theme);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

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
      setLoading(true);
      setError(null);
      const result = await dispatch(loginAsync({ email, password })).unwrap();
      if (!result?.token) {
        throw new Error('Invalid response from server');
      }
      await AsyncStorage.setItem('@auth_token', result.token);
      navigation.navigate('Home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      setError(null);
      const token = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithApple();
      
      const result = await dispatch(socialAuthAsync({ token, provider })).unwrap();
      if (!result?.token) {
        throw new Error('Invalid response from server');
      }
      await AsyncStorage.setItem('@auth_token', result.token);
      navigation.navigate('Home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(null);
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
          onChangeText={handleEmailChange}
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
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!loading}
          rightIcon={
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
              testID="password-visibility-toggle"
            />
          }
        />
        {error && (
          <>
            <Spacer size="sm" />
            <Body2 testID="error-message" style={{ color: theme.colors.error[500] }}>{error}</Body2>
          </>
        )}
        <Spacer size="lg" />
        <Button
          testID="login-button"
          onPress={handleLogin}
          disabled={loading || !isValidEmail(email) || !isValidPassword(password)}
          loading={loading}
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

        <Divider>Or continue with</Divider>

        <Button
          testID="google-auth-button"
          variant="outlined"
          onPress={() => handleSocialAuth('google')}
          disabled={loading}
          icon={<Icon name="google" />}
        >
          Sign in with Google
        </Button>

        {isAppleAvailable && (
          <>
            <Spacer size="md" />
            <Button
              testID="apple-auth-button"
              variant="outlined"
              onPress={() => handleSocialAuth('apple')}
              disabled={loading}
              icon={<Icon name="apple" />}
            >
              Sign in with Apple
            </Button>
          </>
        )}

        <View style={styles.footer}>
          <Body2>Don't have an account? </Body2>
          <Button
            testID="sign-up-button"
            variant="text"
            onPress={() => navigation.navigate('SignUp' as never)}
            disabled={loading}
          >
            Sign Up
          </Button>
        </View>
      </Form>
    </Screen>
  );
}; 