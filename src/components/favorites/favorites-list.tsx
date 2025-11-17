/**
 * Favorites List Component
 *
 * Displays user's favorite radio stations.
 *
 * SOLID: Single Responsibility - Only handles favorites display
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { useFavoritesStore } from "~/lib/store/favorites-store";
import { Button } from "~/components/ui/button";
import { FavoriteButton } from "~/components/stations/favorite-button";
import { Radio, Play, Globe, Heart } from "lucide-react";
import type { RadioStation, PageResponse } from "~/lib/types/api.types";

interface FavoritesListProps {
  onStationSelect?: (station: RadioStation) => void;
  isActive?: boolean; // Whether this tab is currently active
}

export function FavoritesList({ onStationSelect, isActive = true }: FavoritesListProps) {
  const { getFavorites, isLoading, error } = useFavorites();
  const { refreshTrigger } = useFavoritesStore();
  const [favorites, setFavorites] = useState<RadioStation[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  const loadFavorites = useCallback(async (page = 0) => {
    const result = await getFavorites(page, pagination.size);
    if (result) {
      setFavorites(result.content);
      setPagination({
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      });
    }
  }, [getFavorites, pagination.size]);

  // Load favorites on mount and when refresh is triggered
  useEffect(() => {
    if (isActive) {
      loadFavorites(0);
    }
  }, [loadFavorites, isActive, refreshTrigger]);

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
        loadFavorites(pagination.page);
      }
    },
    [loadFavorites, pagination.page],
  );

  if (isLoading && favorites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">Loading favorites...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your stations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-foreground">No favorites yet</h3>
          <p className="text-muted-foreground mb-4">
            Start adding stations to your favorites to see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <div className="mb-10">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-center">
          Your Favorites
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-6">
          {pagination.totalElements} {pagination.totalElements === 1 ? "station" : "stations"} saved
        </p>
      </div>

      <div className="space-y-3">
        {favorites.map((station) => (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFavorites(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFavorites(pagination.page + 1)}
            disabled={
              pagination.page >= pagination.totalPages - 1 || isLoading
            }
          >
            Next
          </Button>
        </div>
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

