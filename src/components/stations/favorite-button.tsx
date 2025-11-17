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
import { Heart } from "lucide-react";
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
        <Heart className="w-5 h-5 fill-current text-primary" />
      ) : (
        <Heart className="w-5 h-5 text-muted-foreground" />
      )}
    </Button>
  );
}

