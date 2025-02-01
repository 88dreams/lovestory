import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface RetryState {
  attempt: number;
  isRetrying: boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000,    // 10 seconds
  backoffFactor: 2,
};

export function useRetry(config: RetryConfig = {}) {
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
  });
  const { showToast } = useToast();

  const {
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
  } = { ...DEFAULT_CONFIG, ...config };

  const calculateDelay = useCallback((attempt: number) => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  }, [initialDelay, maxDelay, backoffFactor]);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, isRetrying: true }));

    try {
      const result = await operation();
      setState({ attempt: 0, isRetrying: false });
      return result;
    } catch (error) {
      const nextAttempt = state.attempt + 1;

      if (nextAttempt >= maxAttempts) {
        setState({ attempt: 0, isRetrying: false });
        showToast(
          `${errorMessage}. Max retry attempts reached.`,
          'error'
        );
        throw error;
      }

      setState({ attempt: nextAttempt, isRetrying: true });
      showToast(
        `${errorMessage}. Retrying... (${nextAttempt}/${maxAttempts})`,
        'info'
      );

      await new Promise(resolve => 
        setTimeout(resolve, calculateDelay(nextAttempt))
      );

      return execute(operation, errorMessage);
    }
  }, [state.attempt, maxAttempts, calculateDelay, showToast]);

  return {
    execute,
    attempt: state.attempt,
    isRetrying: state.isRetrying,
    reset: () => setState({ attempt: 0, isRetrying: false }),
  };
}

// Example usage:
/*
const { execute, isRetrying } = useRetry({
  maxAttempts: 3,
  initialDelay: 1000,
});

const handleLogin = async (data: LoginFormData) => {
  try {
    const result = await execute(
      () => authService.login(data),
      'Login failed'
    );
    if (result) {
      // Handle successful login
    }
  } catch (error) {
    // Handle final failure
  }
};
*/ 