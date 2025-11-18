/**
 * Authentication API
 *
 * Handles all authentication-related API calls.
 *
 * SOLID: Single Responsibility - Only handles auth endpoints
 * Interface Segregation: Small, focused API module
 */

import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, AuthResponse, UserProfileResponse, UpdateProfileRequest } from "~/lib/types/api.types";

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

  /**
   * Get user profile
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    return apiClient.get<UserProfileResponse>("/api/auth/profile");
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    return apiClient.put<UserProfileResponse>("/api/auth/profile", data);
  },
};

