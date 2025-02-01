import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth-specific hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  return auth;
};

export const useAuthStatus = () => {
  const { user, token, isInitialized } = useAuth();
  return {
    isAuthenticated: Boolean(user && token),
    isInitialized,
  };
};

export const useAuthLoading = () => {
  const { isLoading } = useAuth();
  return isLoading;
};

export const useAuthError = () => {
  const { error } = useAuth();
  return error;
}; 