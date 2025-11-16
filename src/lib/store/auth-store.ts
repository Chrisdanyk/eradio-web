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
       * This syncs Zustand's persisted state with our storage utility
       * Note: isLoading is set to false in onRehydrateStorage after rehydration completes
       */
      initialize: () => {
        const user = authService.getCurrentUser();
        // Only update if user exists and state is different
        // Don't set isLoading here - let onRehydrateStorage handle it
        set((state) => {
          if (state.user !== user) {
            return {
              user,
              isAuthenticated: user !== null,
            };
          }
          return state;
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // Called when rehydration starts
        return (state, error) => {
          // Called after rehydration completes (or fails)
          if (error) {
            console.error("Error rehydrating auth state:", error);
          }

          if (state) {
            // Sync with our storage utility to ensure consistency
            const user = authService.getCurrentUser();
            if (user) {
              // Ensure user is set if it exists in storage
              state.setUser(user);
            } else if (state.user) {
              // If Zustand has user but storage doesn't, clear it
              // (this shouldn't happen, but handle it just in case)
              if (!authService.isAuthenticated()) {
                state.setUser(null);
              }
            }
            // Mark as loaded after rehydration completes
            state.setLoading(false);
          }
        };
      },
    },
  ),
);

