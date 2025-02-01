import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import { Body2 } from './Typography';
import type { Theme } from '../../theme/types';

interface DividerProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  text: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.text.secondary,
  },
});

export const Divider: React.FC<DividerProps> = ({ children, style }) => {
  const styles = useThemedStyles(createStyles);

  if (!children) {
    return <View style={[styles.line, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Body2 style={styles.text}>{children}</Body2>
      <View style={styles.line} />
    </View>
  );
};