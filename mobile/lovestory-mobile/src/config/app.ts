// App-wide configuration
export const APP_CONFIG = {
  name: 'LoveStory',
  version: '1.0.0',
  apiBaseUrl: process.env.API_URL || 'http://localhost:8000',
  googleClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  environment: process.env.NODE_ENV || 'development',
}; 