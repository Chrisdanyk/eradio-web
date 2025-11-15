/**
 * Authentication Store (Zustand)
 *
 * Global state management for authentication.
 *
 * SOLID: Single Responsibility - Only manages auth state
 *
 * This store provides:
 * - Global auth state
 * - Actions to update auth state
 * - Reactive state updates across components
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "~/lib/services/auth.service";
import { authService } from "~/lib/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

/**
 * Auth store with persistence
 *
 * The persist middleware saves state to localStorage,
 * so auth state survives page refreshes.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * Initialize auth state from storage
       * Call this on app startup
       */
      initialize: () => {
        const user = authService.getCurrentUser();
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

