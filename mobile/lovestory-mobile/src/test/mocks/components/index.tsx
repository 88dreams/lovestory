import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ViewProps, TextProps, TouchableOpacityProps, TextInputProps } from 'react-native';

// Basic component mocks
export const mockView: React.FC<ViewProps & { children?: React.ReactNode }> = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const mockText: React.FC<TextProps & { children?: React.ReactNode }> = ({ children, ...props }) => (
  <Text {...props}>{children}</Text>
);

export const mockTouchableOpacity: React.FC<TouchableOpacityProps & { children?: React.ReactNode }> = ({ children, onPress, ...props }) => (
  <TouchableOpacity onPress={onPress} {...props}>
    {children}
  </TouchableOpacity>
);

export const mockTextInput: React.FC<TextInputProps> = ({ onChangeText, ...props }) => (
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

export const mockButton: React.FC<ButtonProps> = ({ children, onPress, testID, disabled, loading, ...props }) => (
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

export const mockInput: React.FC<InputProps> = ({ label, value, onChangeText, testID, ...props }) => (
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

export const mockIcon: React.FC<IconProps> = ({ name, size, color, ...props }) => (
  <View testID={`icon-${name}`} {...props} />
);

interface ScreenProps extends ViewProps {
  children?: React.ReactNode;
}

export const mockScreen: React.FC<ScreenProps> = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

interface SpacerProps extends ViewProps {
  size?: number;
}

export const mockSpacer: React.FC<SpacerProps> = ({ size = 8, ...props }) => (
  <View style={{ height: size, width: size }} {...props} />
);

interface FormProps extends ViewProps {
  children?: React.ReactNode;
  onSubmit?: () => void;
}

export const mockForm: React.FC<FormProps> = ({ children, onSubmit, ...props }) => (
  <View {...props} onTouchEnd={onSubmit}>{children}</View>
);

interface DividerProps extends ViewProps {
  children?: React.ReactNode;
}

export const mockDivider: React.FC<DividerProps> = ({ children, ...props }) => (
  <View {...props}>
    <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
    {children && <Text>{children}</Text>}
    <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
  </View>
); 