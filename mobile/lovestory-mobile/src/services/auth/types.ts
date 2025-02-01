export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

export type AuthResponse = {
  type: 'success' | 'error';
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  isEmailSent?: boolean;
};

export type SocialAuthResponse = {
  type: 'success' | 'error';
  message?: string;
  data?: {
    token: string;
    user: User;
    provider: 'google' | 'apple';
  };
}; 