import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemedStyles, useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';
import { Body2 } from './Typography';

type LoadingSize = 'small' | 'medium' | 'large';
type LoadingVariant = 'default' | 'overlay' | 'inline';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.isDark 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(255, 255, 255, 0.7)',
      zIndex: 999,
    },
    inline: {
      flexDirection: 'row',
      padding: theme.spacing.sm,
    },
    message: {
      marginTop: theme.spacing.xs,
    },
    inlineMessage: {
      marginLeft: theme.spacing.sm,
    },
  });
};

const sizeMap: Record<LoadingSize, number> = {
  small: 20,
  medium: 30,
  large: 40,
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'default',
  message,
  style,
}) => {
  const styles = useThemedStyles(createStyles);
  const { theme } = useTheme();

  const containerStyle = [
    styles.container,
    variant === 'overlay' && styles.overlay,
    variant === 'inline' && styles.inline,
    style,
  ];

  const messageStyle = variant === 'inline' ? styles.inlineMessage : styles.message;

  return (
    <View 
      style={containerStyle}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message || "Loading"}
    >
      <ActivityIndicator
        size={sizeMap[size]}
        color={theme.colors.primary[500]}
      />
      {message && (
        <Body2 
          style={messageStyle}
          color={theme.colors.text.secondary}
        >
          {message}
        </Body2>
      )}
    </View>
  );
};

// Example usage:
/*
import { Loading } from './components/common/Loading';

// Default centered loading
<Loading />

// Loading with message
<Loading 
  message="Please wait..." 
  size="large"
/>

// Overlay loading (for blocking interactions)
<Loading 
  variant="overlay"
  message="Saving changes..."
/>

// Inline loading (next to content)
<Loading 
  variant="inline"
  size="small"
  message="Loading more items..."
/>

// Inside a container
<View style={{ flex: 1 }}>
  <Loading style={{ flex: 1 }} />
</View>
*/ 