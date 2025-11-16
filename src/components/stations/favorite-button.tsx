/**
 * Favorite Button Component
 *
 * Toggle favorite status for a radio station.
 *
 * SOLID: Single Responsibility - Only handles favorite toggle UI
 * Performance: Optimistic updates for instant feedback
 */

"use client";

import { useState, useCallback } from "react";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { useFavoritesStore } from "~/lib/store/favorites-store";
import { Button } from "~/components/ui/button";
import type { RadioStation } from "~/lib/types/api.types";

interface FavoriteButtonProps {
  station: RadioStation;
  onToggle?: (isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  station,
  onToggle,
  size = "sm",
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite } = useFavorites();
  const { triggerRefresh } = useFavoritesStore();
  const [isFavorite, setIsFavorite] = useState(station.isFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      const newFavoriteState = !isFavorite;

      // Optimistic update
      setIsFavorite(newFavoriteState);
      setIsLoading(true);

      try {
        if (newFavoriteState) {
          await addFavorite(station.id, station.stationUuid);
          // Trigger refresh of favorites list
          triggerRefresh();
        } else {
          await removeFavorite(station.id);
          // Trigger refresh of favorites list
          triggerRefresh();
        }
        onToggle?.(newFavoriteState);
      } catch (error) {
        // Revert on error
        setIsFavorite(!newFavoriteState);
        console.error("Failed to toggle favorite:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isFavorite, station.id, addFavorite, removeFavorite, onToggle, triggerRefresh],
  );

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className="p-2"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <svg
          className="h-5 w-5 fill-yellow-400 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </Button>
  );
}

