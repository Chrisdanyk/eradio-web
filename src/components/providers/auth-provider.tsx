"use client";

import { useEffect } from "react";
import { useAuthStore } from "~/lib/store/auth-store";

/**
 * Auth Provider
 *
 * Initializes auth state on app startup.
 * This is a client component that can be used in the layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

