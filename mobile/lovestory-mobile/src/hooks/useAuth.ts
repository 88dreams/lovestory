import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.validateToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (token: string) => {
    await authService.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await authService.clearToken();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };
}; 