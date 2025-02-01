import React from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<Props> = ({
  width = '100%',
  height = 20,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
      accessible={true}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    />
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <SkeletonLoader height={50} />
      </View>
      <View style={styles.inputContainer}>
        <SkeletonLoader height={50} />
      </View>
      <SkeletonLoader height={50} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  form: {
    width: '100%',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    borderRadius: 5,
  },
}); 