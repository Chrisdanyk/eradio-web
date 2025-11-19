"use client";

import { RecommendationsSection } from "~/components/recommendations/recommendations-section";
import { Navbar } from "~/components/layout/navbar";
import { useAuthStore } from "~/lib/store/auth-store";
import { usePlayerStore } from "~/lib/store/player-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RadioStation } from "~/lib/types/api.types";

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const { setCurrentStation, showPlayer } = usePlayerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Wait for auth state to be loaded from localStorage before redirecting
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleStationSelect = (station: RadioStation) => {
    setCurrentStation(station);
    showPlayer();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (after loading is complete)
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-32 px-6">
        <RecommendationsSection onStationSelect={handleStationSelect} />
      </main>
    </div>
  );
}

