export const APP_CONFIG = {
  passwordResetTimeout: 3600, // 1 hour in seconds
  maxPasswordResetAttempts: 3,
  minPasswordLength: 8,
  webDomain: 'app.lovestory.com', // Web domain for deep linking
} as const; 