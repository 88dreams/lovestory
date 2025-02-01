import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService, ApiResponse, AuthData } from '../../services/auth/authService';
import type { SocialAuthResponse } from '../../services/auth/socialAuth';

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

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const initialize = createAsyncThunk(
  'auth/initialize',
  async () => {
    const token = await authService.getStoredToken();
    if (!token) {
      return { user: null, token: null };
    }
    const user = await authService.getCurrentUser();
    return { user, token };
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.type === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Login failed');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Login failed');
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
      return response.data;
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const socialAuth = createAsyncThunk(
  'auth/socialAuth',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await authService.socialAuth(data);
      if (response.type === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Social authentication failed');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Social authentication failed');
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

export const logout = createAsyncThunk(
  'auth/logout',
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
      return response.data;
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
    });
    builder.addCase(initialize.rejected, (state) => {
      state.isLoading = false;
      state.isInitialized = true;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Social auth
    builder.addCase(socialAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(socialAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(socialAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
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
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
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

export const { updateUser, clearError } = authSlice.actions;
export default authSlice.reducer; 