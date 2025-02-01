import React from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';
import { Loading } from './Loading';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  dismissKeyboardOnTap?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    contentContainer: {
      flexGrow: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.md,
    },
    staticContent: {
      flex: 1,
      padding: theme.spacing.md,
    },
  });
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scrollable = true,
  dismissKeyboardOnTap = true,
  loading = false,
  loadingMessage,
  safeArea = true,
  keyboardAvoiding = true,
  backgroundColor,
  contentContainerStyle,
}) => {
  const styles = useThemedStyles(createStyles);

  const containerStyle = [
    styles.container,
    backgroundColor && { backgroundColor },
    style,
  ];

  const content = (
    <>
      {loading && (
        <Loading
          variant="overlay"
          message={loadingMessage}
        />
      )}
      {scrollable ? (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>
          {children}
        </View>
      )}
    </>
  );

  const wrappedContent = dismissKeyboardOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  ) : (
    content
  );

  const keyboardAvoidingContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {wrappedContent}
    </KeyboardAvoidingView>
  ) : (
    wrappedContent
  );

  return safeArea ? (
    <SafeAreaView style={containerStyle}>
      {keyboardAvoidingContent}
    </SafeAreaView>
  ) : (
    <View style={containerStyle}>
      {keyboardAvoidingContent}
    </View>
  );
};

// Example usage:
/*
import { Screen } from './components/common/Screen';

// Basic screen with scrolling and keyboard handling
const MyScreen = () => {
  return (
    <Screen>
      <Text>Screen content goes here</Text>
    </Screen>
  );
};

// Loading screen
const LoadingScreen = () => {
  return (
    <Screen loading loadingMessage="Loading data...">
      <Text>Content will be shown when loading completes</Text>
    </Screen>
  );
};

// Static screen (no scrolling)
const StaticScreen = () => {
  return (
    <Screen scrollable={false}>
      <Text>Fixed content</Text>
    </Screen>
  );
};

// Custom background color
const ColoredScreen = () => {
  return (
    <Screen backgroundColor={theme.colors.background.secondary}>
      <Text>Screen with custom background</Text>
    </Screen>
  );
};
*/ 