import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  length?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    horizontal: {
      width: '100%',
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border.light,
    },
    vertical: {
      width: StyleSheet.hairlineWidth,
      height: '100%',
      backgroundColor: theme.colors.border.light,
    },
  });
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = StyleSheet.hairlineWidth,
  length = '100%',
  style,
  color,
}) => {
  const styles = useThemedStyles(createStyles);

  const dividerStyle: StyleProp<ViewStyle> = [
    styles[orientation],
    {
      ...(orientation === 'horizontal'
        ? {
            height: thickness,
            width: length,
          }
        : {
            width: thickness,
            height: length,
          }),
    },
    color && { backgroundColor: color },
    style,
  ];

  return <View style={dividerStyle} accessibilityRole="none" />;
};

// Example usage:
/*
import { Divider } from './components/common/Divider';

// Horizontal divider (default)
<Divider />

// Custom thickness
<Divider thickness={2} />

// Vertical divider with specific height
<Divider orientation="vertical" length={24} />

// Custom color
<Divider color={theme.colors.primary[300]} />

// With custom style
<Divider style={{ marginVertical: theme.spacing.md }} />
*/ 