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
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FavoriteButton } from "~/components/stations/favorite-button";
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
      <Card variant="default">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="default">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card variant="default">
        <div className="py-12 text-center">
          <p className="text-gray-600">No favorites yet. Start adding stations to your favorites!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Favorites</h2>
        <p className="text-sm text-gray-600">
          {pagination.totalElements} station{pagination.totalElements !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((station) => (
          <Card
            key={station.id}
            variant="default"
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative"
            onClick={() => onStationSelect?.(station)}
          >
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton
                station={station}
                onToggle={(isFavorite) =>
                  handleFavoriteToggle(station.id, isFavorite)
                }
              />
            </div>
            <div className="flex items-start gap-4">
              {station.favicon && (
                <img
                  src={station.favicon}
                  alt={station.name}
                  className="h-16 w-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-semibold text-gray-900 truncate">
                  {station.name}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  {station.country && (
                    <p className="truncate">
                      <span className="font-medium">Country:</span> {station.country}
                    </p>
                  )}
                  {station.language && (
                    <p className="truncate">
                      <span className="font-medium">Language:</span> {station.language}
                    </p>
                  )}
                  {station.bitrate && (
                    <p>
                      <span className="font-medium">Bitrate:</span> {station.bitrate} kbps
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFavorites(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
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

