/**
 * Favorites List Component
 *
 * Displays user's favorite radio stations.
 *
 * SOLID: Single Responsibility - Only handles favorites display
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { useFavoritesStore } from "~/lib/store/favorites-store";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Skeleton from "~/components/ui/skeleton";
import { FavoriteButton } from "~/components/stations/favorite-button";
import { Radio, Play, Globe, Heart, Search } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";

interface FavoritesListProps {
  onStationSelect?: (station: RadioStation) => void;
  isActive?: boolean; // Whether this tab is currently active
}

export function FavoritesList({ onStationSelect, isActive = true }: FavoritesListProps) {
  const { getFavorites, isLoading, error } = useFavorites();
  const { refreshTrigger } = useFavoritesStore();
  const [favorites, setFavorites] = useState<RadioStation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasMore: true,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadFavorites = useCallback(async (page = 0, reset = false) => {
    setIsLoadingMore((prev) => {
      if (prev && !reset) return prev;
      return true;
    });

    const result = await getFavorites(page, 20);
    if (result) {
      if (reset) {
        setFavorites(result.content);
      } else {
        setFavorites((prev) => [...prev, ...result.content]);
      }
      setPagination({
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        hasMore: !result.last && result.content.length > 0,
      });
    }
    setIsLoadingMore(false);
  }, [getFavorites]);

  // Load favorites on mount and when refresh is triggered
  useEffect(() => {
    if (isActive && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      void loadFavorites(0, true);
    }
  }, [isActive, loadFavorites]);

  // Reset and reload when refresh is triggered
  useEffect(() => {
    if (isActive && refreshTrigger) {
      hasLoadedRef.current = false;
      setFavorites([]);
      setPagination({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: true,
      });
      void loadFavorites(0, true);
    }
  }, [refreshTrigger, isActive, loadFavorites]);

  // Infinite scroll observer
  useEffect(() => {
    if (!pagination.hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadFavorites(pagination.page + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [pagination.hasMore, pagination.page, isLoadingMore, isLoading, loadFavorites]);

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter((station) => {
    if (!debouncedSearchQuery.trim()) return true;
    const query = debouncedSearchQuery.toLowerCase();
    return (
      (station.name?.toLowerCase().includes(query) ?? false) ||
      (station.country?.toLowerCase().includes(query) ?? false) ||
      (station.language?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleFavoriteToggle = useCallback(
    (stationId: number, isFavorite: boolean) => {
      if (!isFavorite) {
        // Remove from list if unfavorited
        setFavorites((prev) => prev.filter((s) => s.id !== stationId));
        setPagination((prev) => ({
          ...prev,
          totalElements: Math.max(0, prev.totalElements - 1),
        }));
      } else {
        // Refresh the list to include the newly added favorite
        void loadFavorites(pagination.page);
      }
    },
    [loadFavorites, pagination.page],
  );

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <div className="mb-10">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-center">
          Your Favorites
        </h1>
        {!isLoading && favorites.length > 0 && (
          <p className="text-lg text-muted-foreground text-center mb-6">
            {pagination.totalElements} {pagination.totalElements === 1 ? "station" : "stations"} saved
          </p>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-10">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-14 text-base font-medium bg-muted/20 border-border/60 rounded-2xl transition-all duration-200 focus:bg-muted/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-4 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {isLoading && favorites.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-5">
                <Skeleton height={80} width={80} borderRadius="0.75rem" />
                <div className="flex-1 min-w-0 space-y-3">
                  <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton height={24} width={80} borderRadius="0.375rem" />
                    <Skeleton height={24} width={64} borderRadius="0.375rem" />
                    <Skeleton height={16} width={48} borderRadius="0.375rem" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton height={40} width={40} circle />
                  <Skeleton height={40} width={40} circle />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-foreground">
            {debouncedSearchQuery ? "No matches found" : "No favorites yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {debouncedSearchQuery
              ? `No favorites match "${debouncedSearchQuery}"`
              : "Start adding stations to your favorites to see them here!"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredFavorites.map((station) => (
              <FavoriteStationCard
                key={station.id}
                station={station}
                onClick={() => onStationSelect?.(station)}
                onFavoriteToggle={(isFavorite) =>
                  handleFavoriteToggle(station.id, isFavorite)
                }
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {pagination.hasMore && (
            <div ref={observerTarget} className="py-8">
              {isLoadingMore && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`loading-${index}`} className="bg-card rounded-2xl p-6 border border-border/50">
                      <div className="flex items-center gap-5">
                        <Skeleton height={80} width={80} borderRadius="0.75rem" />
                        <div className="flex-1 min-w-0 space-y-3">
                          <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                          <div className="flex flex-wrap items-center gap-3">
                            <Skeleton height={24} width={80} borderRadius="0.375rem" />
                            <Skeleton height={24} width={64} borderRadius="0.375rem" />
                            <Skeleton height={16} width={48} borderRadius="0.375rem" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Skeleton height={40} width={40} circle />
                          <Skeleton height={40} width={40} circle />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Favorite Station Card Component
 *
 * Displays a single favorite station with its information.
 * Matches the design of StationCard from station-search.tsx
 */
const FavoriteStationCard = ({
  station,
  onClick,
  onFavoriteToggle,
}: {
  station: RadioStation;
  onClick: () => void;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group bg-card rounded-2xl p-6 border border-border/50 hover-lift hover:border-primary/30 transition-smooth cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            {station.favicon && !imageError ? (
              <img
                src={station.favicon}
                alt={station.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Radio className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>
          {/* Pulse animation indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 truncate text-foreground group-hover:text-primary transition-colors">
            {station.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {station.country && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                <Globe className="w-3 h-3" />
                {station.country}
              </span>
            )}
            {station.language && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                {station.language}
              </span>
            )}
            {station.bitrate && (
              <span className="text-xs text-muted-foreground">
                {station.bitrate} kbps
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              station={station}
              onToggle={onFavoriteToggle}
            />
          </div>
          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110"
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
};


