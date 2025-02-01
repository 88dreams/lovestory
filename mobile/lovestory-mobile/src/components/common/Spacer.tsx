import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemedStyles } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/types';

type SpacerSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface SpacerProps {
  size?: SpacerSize;
  horizontal?: boolean;
  flex?: number;
  style?: StyleProp<ViewStyle>;
}

const createStyles = (theme: Theme) => {
  const spacingStyles = Object.entries(theme.spacing).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`vertical_${key}`]: {
        height: value,
        width: 'auto',
      },
      [`horizontal_${key}`]: {
        width: value,
        height: 'auto',
      },
    }),
    {}
  );

  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    ...spacingStyles,
  });
};

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  horizontal = false,
  flex,
  style,
}) => {
  const styles = useThemedStyles(createStyles);
  const spacingKey = `${horizontal ? 'horizontal' : 'vertical'}_${size}`;

  return (
    <View
      style={[
        flex !== undefined && { flex },
        styles[spacingKey as keyof typeof styles],
        style,
      ]}
      accessibilityRole="none"
    />
  );
};

// Example usage:
/*
import { Spacer } from './components/common/Spacer';

// Vertical spacing (default)
<View>
  <Text>First element</Text>
  <Spacer size="md" />
  <Text>Second element</Text>
</View>

// Horizontal spacing
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <Spacer horizontal size="sm" />
  <Text>Right</Text>
</View>

// Flex spacing
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <Spacer flex={1} />
  <Text>Right</Text>
</View>

// Custom style
<Spacer size="lg" style={{ backgroundColor: 'transparent' }} />
*/ 