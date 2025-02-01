import { API_BASE_URL } from '../../config';

interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface TokenValidationResponse {
  valid: boolean;
  user?: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SocialAuthCredentials {
  token: string;
  provider: 'google' | 'apple';
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  async socialAuth(credentials: SocialAuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Social authentication failed');
    }

    return response.json();
  },

  async validateToken(token: string): Promise<TokenValidationResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { valid: false };
    }

    return response.json();
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },
}; 