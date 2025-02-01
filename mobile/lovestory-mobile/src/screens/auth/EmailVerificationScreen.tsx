import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { requestEmailVerification, verifyEmail } from '../../store/slices/authSlice';
import { Screen } from '../../components/common/Screen';
import { H1, Body1, Caption } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Spacer } from '../../components/common/Spacer';
import type { Theme } from '../../theme/types';
import type { AppDispatch, RootState } from '../../store';

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  content: {
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  message: {
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
  } as ViewStyle,
});

export const EmailVerificationScreen = () => {
  const styles = useThemedStyles(createStyles);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params as { token?: string };
  
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [verificationSent, setVerificationSent] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) return;
    
    try {
      await dispatch(verifyEmail(token)).unwrap();
      // Navigate to home or show success message
      navigation.navigate('Home' as never);
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  const handleResendVerification = async () => {
    try {
      await dispatch(requestEmailVerification()).unwrap();
      setVerificationSent(true);
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  if (token) {
    return (
      <Screen>
        <View style={styles.container} accessible={true} accessibilityRole="none">
          <View style={styles.content}>
            <H1 accessibilityRole="header">Verifying Email</H1>
            <Spacer size="lg" />
            <Body1 style={styles.message} accessibilityRole="text">
              Please wait while we verify your email address...
            </Body1>
            {error && (
              <>
                <Spacer size="lg" />
                <Caption 
                  color="error" 
                  style={styles.message}
                  accessibilityRole="alert"
                >
                  {error}
                </Caption>
                <Spacer size="lg" />
                <Button
                  label="Try Again"
                  variant="primary"
                  onPress={handleVerifyEmail}
                  loading={isLoading}
                  disabled={isLoading}
                  accessibilityLabel="Try verifying email again"
                  accessibilityHint="Attempts to verify your email address again"
                />
              </>
            )}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container} accessible={true} accessibilityRole="none">
        <View style={styles.content}>
          <H1 accessibilityRole="header">Verify Your Email</H1>
          <Spacer size="lg" />
          <Body1 style={styles.message} accessibilityRole="text">
            {verificationSent
              ? 'A new verification email has been sent. Please check your inbox and click the verification link.'
              : 'Please verify your email address to continue using all features of the app.'}
          </Body1>
          {error && (
            <>
              <Spacer size="md" />
              <Caption 
                color="error" 
                style={styles.message}
                accessibilityRole="alert"
              >
                {error}
              </Caption>
            </>
          )}
          <Spacer size="xl" />
          <Button
            label={verificationSent ? "Resend Email" : "Send Verification Email"}
            variant="primary"
            onPress={handleResendVerification}
            loading={isLoading}
            disabled={isLoading}
            accessibilityLabel={verificationSent ? "Resend verification email" : "Send verification email"}
            accessibilityHint="Sends a verification email to your registered email address"
          />
        </View>
      </View>
    </Screen>
  );
}; 