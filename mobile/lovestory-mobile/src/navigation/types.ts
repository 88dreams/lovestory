import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { token?: string };
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type StoryCreationStackParamList = {
  CreateStory: undefined;
  AddPhotos: undefined;
  Preview: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  StoryCreation: NavigatorScreenParams<StoryCreationStackParamList>;
};

// Extend the @react-navigation namespace
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 