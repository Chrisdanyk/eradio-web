/**
 * useAuth Hook
 *
 * Custom hook for authentication.
 *
 * DRY: Reusable auth logic across components
 * SOLID: Single Responsibility - Only handles auth operations
 *
 * This hook provides:
 * - Easy access to auth state
 * - Auth operations (login, register, logout)
 * - Loading and error states
 */

import { useCallback, useState } from "react";
import { useAuthStore } from "~/lib/store/auth-store";
import { authService } from "~/lib/services/auth.service";
import type { LoginRequest, RegisterRequest } from "~/lib/types/api.types";
import { extractErrorMessage } from "~/lib/utils/error-handler";

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register a new user
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register(data);
        setUser({
          userId: response.userId,
          username: response.username,
          email: response.email,
        });
        return response;
      } catch (err) {
        const errorMessage = extractErrorMessage(err, "register");
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  /**
   * Login user
   */
  const login = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(data);
        setUser({
          userId: response.userId,
          username: response.username,
          email: response.email,
        });
        return response;
      } catch (err) {
        const errorMessage = extractErrorMessage(err, "login");
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.logout();
    storeLogout();
  }, [storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
  };
}

