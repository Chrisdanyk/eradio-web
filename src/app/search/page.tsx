"use client";

import { StationSearch } from "~/components/stations/station-search";
import { FavoritesList } from "~/components/favorites/favorites-list";
import { useAuthStore } from "~/lib/store/auth-store";
import { usePlayerStore } from "~/lib/store/player-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, initialize, logout } = useAuthStore();
  const { setCurrentStation, showPlayer } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<"search" | "favorites">("search");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Wait for auth state to be loaded from localStorage before redirecting
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleStationSelect = (station: any) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">E-Radio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "search"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "favorites"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Favorites
          </button>
        </div>

        {/* Content */}
        {activeTab === "search" ? (
          <StationSearch onStationSelect={handleStationSelect} />
        ) : (
          <FavoritesList
            onStationSelect={handleStationSelect}
            isActive={activeTab === "favorites"}
          />
        )}
      </main>
    </div>
  );
}

