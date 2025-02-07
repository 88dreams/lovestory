import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ViewProps, TextProps, TouchableOpacityProps, TextInputProps } from 'react-native';

// Basic component mocks
export const mockView = ({ children, ...props }: ViewProps & { children?: React.ReactNode }) => (
  <View {...props}>{children}</View>
);

export const mockText = ({ children, ...props }: TextProps & { children?: React.ReactNode }) => (
  <Text {...props}>{children}</Text>
);

export const mockTouchableOpacity = ({ children, onPress, ...props }: TouchableOpacityProps & { children?: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} {...props}>
    {children}
  </TouchableOpacity>
);

export const mockTextInput = ({ onChangeText, ...props }: TextInputProps) => (
  <TextInput onChangeText={onChangeText} {...props} />
);

// Typography components
export const mockTypography = {
  H1: mockText,
  H2: mockText,
  H3: mockText,
  Body1: mockText,
  Body2: mockText,
  Caption: mockText,
};

// Form components
interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const mockButton = ({ children, onPress, testID, disabled, loading, ...props }: ButtonProps) => (
  <TouchableOpacity
    testID={testID}
    onPress={onPress}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <View testID="loading-indicator" /> : children}
  </TouchableOpacity>
);

interface InputProps extends TextInputProps {
  label?: string;
  testID?: string;
}

export const mockInput = ({ label, value, onChangeText, testID, ...props }: InputProps) => (
  <View>
    {label && <Text>{label}</Text>}
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

interface IconProps extends ViewProps {
  name: string;
  size?: number;
  color?: string;
}

export const mockIcon = ({ name, size, color, ...props }: IconProps) => (
  <View testID={`icon-${name}`} {...props} />
);

interface ScreenProps extends ViewProps {
  children?: React.ReactNode;
}

export const mockScreen = ({ children, ...props }: ScreenProps) => (
  <View {...props}>{children}</View>
);

interface SpacerProps extends ViewProps {
  size?: number;
}

export const mockSpacer = ({ size = 8, ...props }: SpacerProps) => (
  <View style={{ height: size, width: size }} {...props} />
);

interface FormProps extends ViewProps {
  children?: React.ReactNode;
  onSubmit?: () => void;
}

export const mockForm = ({ children, onSubmit, ...props }: FormProps) => (
  <View {...props} onTouchEnd={onSubmit}>{children}</View>
);

interface DividerProps extends ViewProps {
  children?: React.ReactNode;
}

export const mockDivider = ({ children, ...props }: DividerProps) => (
  <View {...props}>
    <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
    {children && <Text>{children}</Text>}
    <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
  </View>
); 