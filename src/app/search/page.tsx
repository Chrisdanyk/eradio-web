"use client";

import { StationSearch } from "~/components/stations/station-search";
import { FavoritesList } from "~/components/favorites/favorites-list";
import { useAuthStore } from "~/lib/store/auth-store";
import { usePlayerStore } from "~/lib/store/player-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Radio, Heart } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Radio className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Browse Stations</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveTab("search")}
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${activeTab === "search"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${activeTab === "favorites"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                Favorites
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-foreground/80">
              {user?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="h-9 text-foreground/80 hover:text-foreground">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
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

