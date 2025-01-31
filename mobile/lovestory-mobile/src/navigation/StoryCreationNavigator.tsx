import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type StoryCreationStackParamList = {
  TemplateSelection: undefined;
  StorySteps: undefined;
  VideoRecording: undefined;
  Preview: undefined;
  Processing: undefined;
};

const Stack = createNativeStackNavigator<StoryCreationStackParamList>();

// Placeholder screens - will be implemented later
const TemplateSelectionScreen = () => <></>;
const StoryStepsScreen = () => <></>;
const VideoRecordingScreen = () => <></>;
const PreviewScreen = () => <></>;
const ProcessingScreen = () => <></>;

const StoryCreationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#000',
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="TemplateSelection"
        component={TemplateSelectionScreen}
        options={{ title: 'Choose Template' }}
      />
      <Stack.Screen
        name="StorySteps"
        component={StoryStepsScreen}
        options={{ title: 'Story Steps' }}
      />
      <Stack.Screen
        name="VideoRecording"
        component={VideoRecordingScreen}
        options={{ title: 'Record Video' }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ title: 'Preview Story' }}
      />
      <Stack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ 
          title: 'Processing',
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default StoryCreationNavigator; 