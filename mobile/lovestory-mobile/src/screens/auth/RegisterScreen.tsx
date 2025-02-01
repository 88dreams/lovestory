import React from 'react';
import { View, ViewStyle, FlexStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { register } from '../../store/slices/authSlice';
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
  footer: {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    justifyContent: 'center' as FlexStyle['justifyContent'],
    marginTop: theme.spacing.xl,
  } as ViewStyle,
});

export const RegisterScreen = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
  });

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(register(formData)).unwrap();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    // TODO: Implement social auth
    console.log('Social auth with provider:', provider);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <Screen>
      <View style={styles.container} accessible={true} accessibilityRole="none">
        <View style={styles.header} accessible={true} accessibilityRole="header">
          <H1 accessibilityRole="header">Create Account</H1>
          <Spacer size="xs" />
          <Body1 color="textSecondary" accessibilityRole="text">
            Join our community and start sharing your love story
          </Body1>
        </View>

        <Form style={styles.form} onSubmit={handleRegister}>
          <Input
            label="Name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            value={formData.name}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, name: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="Name input field"
            accessibilityHint="Enter your full name"
            accessibilityRole="text"
          />
          <Spacer size="md" />
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
            accessibilityHint="Enter your email address"
            accessibilityRole="text"
          />
          <Spacer size="md" />
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (error) setError(null);
            }}
            accessibilityLabel="Password input field"
            accessibilityHint="Create a secure password for your account"
            accessibilityRole="text"
          />

          <Spacer size="lg" />

          <Button
            label="Create Account"
            variant="primary"
            loading={loading}
            disabled={loading}
            onPress={handleRegister}
            accessibilityLabel={`Create account button${loading ? ', loading' : ''}`}
            accessibilityHint="Create your new account"
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

        <View style={styles.socialButton} accessible={true} accessibilityRole="none">
          <Icon 
            name="google" 
            size="md" 
            style={styles.socialIcon}
            accessibilityLabel="Google icon"
          />
          <Button
            label="Continue with Google"
            variant="outlined"
            onPress={() => handleSocialAuth('google')}
            accessibilityLabel="Sign up with Google button"
            accessibilityHint="Create account using your Google account"
          />
        </View>

        <Spacer size="md" />

        <View style={styles.socialButton} accessible={true} accessibilityRole="none">
          <Icon 
            name="apple" 
            size="md" 
            style={styles.socialIcon}
            accessibilityLabel="Apple icon"
          />
          <Button
            label="Continue with Apple"
            variant="outlined"
            onPress={() => handleSocialAuth('apple')}
            accessibilityLabel="Sign up with Apple button"
            accessibilityHint="Create account using your Apple account"
          />
        </View>

        <View style={styles.footer} accessible={true} accessibilityRole="none">
          <Body2 
            color="textSecondary"
            accessibilityRole="text"
          >
            Already have an account?{' '}
          </Body2>
          <Button
            label="Sign In"
            variant="text"
            onPress={navigateToLogin}
            accessibilityLabel="Sign in button"
            accessibilityHint="Navigate to login screen"
          />
        </View>
      </View>
    </Screen>
  );
}; 