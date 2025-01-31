import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Types
export type MainTabParamList = {
  Home: undefined;
  Create: undefined;
  Library: undefined;
  Profile: undefined;
};

// Story Creation Stack Types
export type StoryCreationStackParamList = {
  TemplateSelection: undefined;
  StorySteps: { templateId: number };
  VideoRecording: { stepId: number };
  Preview: { videoUri: string };
  Processing: { uploadId: string };
};

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  StoryCreation: NavigatorScreenParams<StoryCreationStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 