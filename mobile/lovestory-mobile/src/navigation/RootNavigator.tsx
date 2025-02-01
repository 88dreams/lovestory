import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './stacks/AuthNavigator';
import { MainNavigator } from './stacks/MainNavigator';
import { StoryCreationNavigator } from './stacks/StoryCreationNavigator';
import { linking } from './linking';
import type { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              gestureEnabled: false, // Disable gesture for auth flow
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{
                gestureEnabled: false, // Disable gesture for main flow
              }}
            />
            <Stack.Screen
              name="StoryCreation"
              component={StoryCreationNavigator}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator; 