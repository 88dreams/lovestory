import React from 'react';
import { mockReactNative } from './react-native';

const { View, Text, TouchableOpacity, TextInput } = mockReactNative;

interface TypographyProps {
  children: React.ReactNode;
  testID?: string;
}

// Typography Components
export const mockTypography = {
  H1: React.forwardRef<any, TypographyProps>(({ children, testID }, ref) => (
    <Text ref={ref} testID={testID} accessibilityRole="header">{children}</Text>
  )),
  Body1: React.forwardRef<any, TypographyProps>(({ children, testID }, ref) => (
    <Text ref={ref} testID={testID} accessibilityRole="text">{children}</Text>
  )),
  Body2: React.forwardRef<any, TypographyProps>(({ children, testID }, ref) => (
    <Text ref={ref} testID={testID} accessibilityRole="text">{children}</Text>
  )),
  Caption: React.forwardRef<any, TypographyProps>(({ children, testID }, ref) => (
    <Text ref={ref} testID={testID} accessibilityRole="text">{children}</Text>
  )),
};

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  icon?: React.ReactNode;
}

// Form Components
export const mockButton = {
  Button: React.forwardRef<any, ButtonProps>(({ children, onPress, testID, disabled, loading, icon }, ref) => (
    <TouchableOpacity 
      ref={ref}
      onPress={onPress} 
      testID={testID}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={{ opacity: disabled || loading ? 0.5 : 1 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text accessibilityRole="text">{children}</Text>
      </View>
    </TouchableOpacity>
  )),
};

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
  editable?: boolean;
  label?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  [key: string]: any;
}

export const mockInput = {
  Input: React.forwardRef<any, InputProps>(({ value, onChangeText, testID, editable = true, secureTextEntry, rightIcon, label, ...props }, ref) => (
    <View>
      {label && <Text accessibilityRole="text">{label}</Text>}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        testID={testID}
        editable={editable}
        secureTextEntry={secureTextEntry}
        accessibilityRole="textbox"
        accessibilityLabel={label}
        {...props}
      />
      {rightIcon && <View style={{ position: 'absolute', right: 8 }}>{rightIcon}</View>}
    </View>
  )),
};

interface IconProps {
  name: string;
  onPress?: () => void;
  testID?: string;
}

export const mockIcon = {
  Icon: React.forwardRef<any, IconProps>(({ name, onPress, testID }, ref) => (
    <TouchableOpacity ref={ref} onPress={onPress} testID={testID} accessibilityRole="button">
      <Text accessibilityRole="image">{name}</Text>
    </TouchableOpacity>
  )),
};

interface ScreenProps {
  children: React.ReactNode;
  testID?: string;
  style?: any;
}

// Layout Components
export const mockScreen = {
  Screen: React.forwardRef<any, ScreenProps>(({ children, testID, style }, ref) => (
    <View ref={ref} testID={testID} style={style} accessibilityRole="none">
      {children}
    </View>
  )),
};

interface SpacerProps {
  size?: string;
}

export const mockSpacer = {
  Spacer: React.forwardRef<any, SpacerProps>(({ size }, ref) => (
    <View ref={ref} style={{ margin: size === 'md' ? 16 : 8 }} accessibilityRole="none" />
  )),
};

interface FormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
  testID?: string;
  style?: any;
}

export const mockForm = {
  Form: React.forwardRef<any, FormProps>(({ children, testID, style, onSubmit }, ref) => (
    <View 
      ref={ref} 
      testID={testID} 
      style={style} 
      accessibilityRole="form"
      onSubmit={(e: any) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {children}
    </View>
  )),
};

interface DividerProps {
  children: React.ReactNode;
  style?: any;
}

export const mockDivider = {
  Divider: React.forwardRef<any, DividerProps>(({ children, style }, ref) => (
    <View ref={ref} style={[{ flexDirection: 'row', alignItems: 'center' }, style]} accessibilityRole="none">
      {children}
    </View>
  )),
}; 