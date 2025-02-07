import React from 'react';
import { View, ViewProps } from 'react-native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface NavigationContainerProps extends ViewProps {
  children: React.ReactNode;
}

// Navigation container mock
export const mockNavigationContainer: React.FC<NavigationContainerProps> = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

// Navigation hooks mocks
export const mockNavigation: Partial<NavigationProp<any>> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
};

export const mockRoute: Partial<RouteProp<any>> = {
  key: 'mock-route-key',
  name: 'MockScreen',
  params: {},
};

interface StackNavigatorProps extends ViewProps {
  children: React.ReactNode;
}

// Stack navigator mocks
export const mockStackNavigator = {
  Navigator: (({ children, ...props }: StackNavigatorProps) => <View {...props}>{children}</View>) as React.FC<StackNavigatorProps>,
  Screen: (({ children, ...props }: StackNavigatorProps) => <View {...props}>{children}</View>) as React.FC<StackNavigatorProps>,
}; 