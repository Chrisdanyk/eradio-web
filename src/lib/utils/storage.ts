/**
 * Storage Utilities
 *
 * Handles localStorage operations for JWT tokens.
 *
 * SOLID: Single Responsibility - Only handles storage operations
 * DRY: Reusable storage functions
 */

const TOKEN_KEY = "eradio_token";
const REFRESH_TOKEN_KEY = "eradio_refresh_token";
const USER_KEY = "eradio_user";

export const storage = {
  /**
   * Save JWT token to localStorage
   */
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Get JWT token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Save refresh token to localStorage
   */
  setRefreshToken: (refreshToken: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Remove refresh token from localStorage
   */
  removeRefreshToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * Save user data to localStorage
   */
  setUser: (user: { userId: number; username: string; email: string }): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser: (): { userId: number; username: string; email: string } | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Clear all stored data
   */
  clear: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

