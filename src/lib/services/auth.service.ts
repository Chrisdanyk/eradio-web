/**
 * Authentication Service
 *
 * Business logic layer for authentication.
 * Separates API calls from business logic.
 *
 * SOLID:
 * - Single Responsibility: Only handles auth business logic
 * - Dependency Inversion: Depends on API abstraction, not concrete implementation
 *
 * This service adds business logic on top of API calls:
 * - Token storage
 * - User data management
 * - Logout logic
 */

import { authApi } from "~/lib/api/auth.api";
import { storage } from "~/lib/utils/storage";
import type { LoginRequest, RegisterRequest, AuthResponse } from "~/lib/types/api.types";

export interface User {
  userId: number;
  username: string;
  email: string;
}

export const authService = {
  /**
   * Register a new user
   *
   * Business logic: After registration, automatically store token and user data
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await authApi.register(data);
    this.setAuthData(response);
    return response;
  },

  /**
   * Login user
   *
   * Business logic: After login, automatically store token and user data
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.login(data);
    this.setAuthData(response);
    return response;
  },

  /**
   * Set authentication data (token + refresh token + user info)
   *
   * This is a private helper method that encapsulates
   * the logic of storing auth data.
   */
  setAuthData(response: AuthResponse): void {
    storage.setToken(response.token);
    if (response.refreshToken) {
      storage.setRefreshToken(response.refreshToken);
    }
    storage.setUser({
      userId: response.userId,
      username: response.username,
      email: response.email,
    });
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await authApi.refresh({ refreshToken });
    this.setAuthData(response);
    return response;
  },

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    return storage.getUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return storage.getToken() !== null;
  },

  /**
   * Logout user
   *
   * Business logic: Clear all stored auth data
   */
  logout(): void {
    storage.clear();
  },
};

