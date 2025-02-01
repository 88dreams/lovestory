import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { isAppleSignInAvailable, signInWithApple, signInWithGoogle, SocialAuthResponse } from '../../services/auth/socialAuth';

type Props = {
  onSocialLogin: (response: SocialAuthResponse) => void;
};

export const SocialLoginButtons: React.FC<Props> = ({ onSocialLogin }) => {
  const [isLoading, setIsLoading] = React.useState<'google' | 'apple' | null>(null);
  const [showAppleButton, setShowAppleButton] = React.useState(false);

  React.useEffect(() => {
    checkAppleSignIn();
  }, []);

  const checkAppleSignIn = async () => {
    const isAvailable = await isAppleSignInAvailable();
    setShowAppleButton(isAvailable);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading('google');
      const response = await signInWithGoogle();
      onSocialLogin(response);
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading('apple');
      const response = await signInWithApple();
      onSocialLogin(response);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={isLoading !== null}
        testID="google-login-button"
      >
        {isLoading === 'google' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>

      {showAppleButton && (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleAppleLogin}
          disabled={isLoading !== null}
          testID="apple-login-button"
        >
          {isLoading === 'apple' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialLoginButtons; 