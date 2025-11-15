/**
 * Authentication API
 *
 * Handles all authentication-related API calls.
 *
 * SOLID: Single Responsibility - Only handles auth endpoints
 * Interface Segregation: Small, focused API module
 */

import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, AuthResponse } from "~/lib/types/api.types";

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/api/auth/register", data, {
      requiresAuth: false,
    });
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/api/auth/login", data, {
      requiresAuth: false,
    });
  },
};

