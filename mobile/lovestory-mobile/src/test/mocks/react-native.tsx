import React from 'react';

const createMockComponent = (name: string) => {
  const Component: React.FC<any> = ({ children, testID, style, onPress, onChangeText, value, disabled, editable, secureTextEntry, ...props }) => {
    const elementProps = {
      testID,
      style,
      disabled,
      editable,
      secureTextEntry,
      value,
      onPress,
      onChangeText,
      ...props,
    };

    // Special handling for TextInput to ensure it works with fireEvent.changeText
    if (name === 'TextInput') {
      return React.createElement(
        'RCTTextInput',
        {
          ...elementProps,
          onChange: (e: any) => onChangeText?.(e.target.value),
          onChangeText: (text: string) => onChangeText?.(text),
        },
        children
      );
    }

    // Special handling for TouchableOpacity to ensure it works with fireEvent.press
    if (name === 'TouchableOpacity') {
      return React.createElement(
        'RCTTouchableOpacity',
        {
          ...elementProps,
          onClick: onPress,
          onPress,
        },
        children
      );
    }

    return React.createElement(
      name === 'Text' ? 'RCTText' : 'RCTView',
      elementProps,
      children
    );
  };
  Component.displayName = name;
  return Component;
};

export const mockReactNative = {
  View: createMockComponent('View'),
  Text: createMockComponent('Text'),
  TouchableOpacity: createMockComponent('TouchableOpacity'),
  TextInput: createMockComponent('TextInput'),
  Platform: {
    OS: 'ios',
    select: (obj: any) => obj.ios,
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  ScrollView: createMockComponent('ScrollView'),
  SafeAreaView: createMockComponent('SafeAreaView'),
  KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
  Modal: createMockComponent('Modal'),
  ActivityIndicator: createMockComponent('ActivityIndicator'),
  Image: createMockComponent('Image'),
  Pressable: createMockComponent('Pressable'),
}; 