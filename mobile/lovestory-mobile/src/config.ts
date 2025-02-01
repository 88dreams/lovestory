// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Other configuration constants can be added here as needed
export const APP_CONFIG = {
  passwordResetTimeout: 3600, // 1 hour in seconds
  maxPasswordResetAttempts: 3,
  minPasswordLength: 8,
}; 