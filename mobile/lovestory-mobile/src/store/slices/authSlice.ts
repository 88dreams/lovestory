import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, ApiResponse, AuthData } from '../../services/auth/authService';
import type { SocialAuthResponse } from '../../services/auth/socialAuth';
import { authApi } from '../../services/api/auth';
import { signInWithGoogle, signInWithApple } from '../../services/auth/socialAuth';

// Types
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface AuthPayload {
  email?: string;
  password?: string;
  token: string;
  user: User;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface SocialAuthPayload {
  token: string;
  provider: 'google' | 'apple';
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  isAuthenticated: false,
};

// Helper function to transform API user to our User type
const transformUser = (apiUser: any): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name || apiUser.email.split('@')[0],
  avatar: apiUser.photoUrl || apiUser.avatar,
  isEmailVerified: apiUser.isEmailVerified || false,
});

// Async thunks
export const initialize = createAsyncThunk(
  'auth/initialize',
  async () => {
    const token = await authService.getStoredToken();
    if (!token) {
      return { user: null, token: null };
    }
    const user = await authService.getCurrentUser();
    return { user: user ? transformUser(user) : null, token };
  }
);

export const loginAsync = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/loginAsync',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (!response?.token || !response?.user) {
        return rejectWithValue('Invalid credentials');
      }
      return {
        token: response.token,
        user: transformUser(response.user),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Invalid credentials');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      if (response.type === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Registration failed');
      }
      return {
        token: response.data.token,
        user: transformUser(response.data.user)
      };
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const socialAuthAsync = createAsyncThunk<AuthResponse, SocialAuthPayload>(
  'auth/socialAuthAsync',
  async ({ token, provider }, { rejectWithValue }) => {
    try {
      const response = await authApi.socialAuth({ token, provider });
      if (!response?.token || !response?.user) {
        return rejectWithValue(`Failed to sign in with ${provider}`);
      }
      return {
        token: response.token,
        user: transformUser(response.user),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to sign in with ${provider}`);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data);
      if (response.type === 'error') {
        return rejectWithValue(response.message || 'Password reset failed');
      }
      return true;
    } catch (error) {
      return rejectWithValue('Password reset failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async () => {
    await authService.logout();
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(data);
      if (response.type === 'error' || !response.isEmailSent) {
        return rejectWithValue(response.message || 'Failed to send reset email');
      }
      return true;
    } catch (error) {
      return rejectWithValue('Failed to send reset email');
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  'auth/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.requestEmailVerification();
      if (response.type === 'error' || !response.isEmailSent) {
        return rejectWithValue(response.message || 'Failed to send verification email');
      }
      return true;
    } catch (error) {
      return rejectWithValue('Failed to send verification email');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      if (response.type === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to verify email');
      }
      return {
        token: response.data.token,
        user: transformUser(response.data.user)
      };
    } catch (error) {
      return rejectWithValue('Failed to verify email');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    login: (state, action: PayloadAction<AuthPayload>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = transformUser(action.payload.user);
    },
    socialAuth: (state, action: PayloadAction<AuthPayload>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = transformUser(action.payload.user);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder.addCase(initialize.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isInitialized = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
    });
    builder.addCase(initialize.rejected, (state) => {
      state.isLoading = false;
      state.isInitialized = true;
    });

    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Social auth
    builder
      .addCase(socialAuthAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialAuthAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(socialAuthAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Social authentication failed';
      });

    // Reset password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
    });

    // Request password reset
    builder.addCase(requestPasswordReset.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(requestPasswordReset.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(requestPasswordReset.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Request email verification
    builder.addCase(requestEmailVerification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(requestEmailVerification.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(requestEmailVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify email
    builder.addCase(verifyEmail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.user) {
        state.user = { ...state.user, isEmailVerified: true };
      }
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { updateUser, clearError, login, socialAuth, logout } = authSlice.actions;
export default authSlice.reducer; 