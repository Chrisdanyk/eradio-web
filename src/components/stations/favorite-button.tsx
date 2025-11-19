/**
 * Favorite Button Component
 *
 * Toggle favorite status for a radio station.
 *
 * SOLID: Single Responsibility - Only handles favorite toggle UI
 * Performance: Optimistic updates for instant feedback
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { useFavoritesStore } from "~/lib/store/favorites-store";
import { usePlayerStore } from "~/lib/store/player-store";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";
import { favoritesApi } from "~/lib/api/favorites.api";

interface FavoriteButtonProps {
  station: RadioStation;
  onToggle?: (isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg" | "icon";
}

export function FavoriteButton({
  station,
  onToggle,
  size = "sm",
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite } = useFavorites();
  const { triggerRefresh } = useFavoritesStore();
  const { currentStation, setCurrentStation } = usePlayerStore();
  const [isFavorite, setIsFavorite] = useState(station.isFavorite ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastStationId, setLastStationId] = useState<string | number | null>(null);

  useEffect(() => {
    const currentStationId = station.stationUuid ?? station.id;

    if (lastStationId !== currentStationId) {
      setLastStationId(currentStationId);
      setIsChecking(true);

      if (!station.stationUuid && (!station.id || station.id <= 0)) {
        setIsFavorite(false);
        setIsChecking(false);
        return;
      }

      const checkFavoriteStatus = async () => {
        try {
          const favorites = await favoritesApi.getAll(0, 1000);
          const isFav = favorites?.content.some(
            (fav) =>
              (station.id && fav.id === station.id) ||
              (station.stationUuid && fav.stationUuid === station.stationUuid)
          ) ?? false;
          setIsFavorite(isFav);
        } catch (error) {
          setIsFavorite(station.isFavorite ?? false);
        } finally {
          setIsChecking(false);
        }
      };

      void checkFavoriteStatus();
    }
  }, [station.id, station.stationUuid, lastStationId]);

  useEffect(() => {
    if (currentStation &&
        ((station.id && currentStation.id === station.id) ||
         (station.stationUuid && currentStation.stationUuid === station.stationUuid))) {
      if (currentStation.isFavorite !== undefined) {
        setIsFavorite(currentStation.isFavorite);
      }
    } else if (station.isFavorite !== undefined) {
      setIsFavorite(station.isFavorite);
    }
  }, [currentStation?.isFavorite, station.isFavorite, station.id, station.stationUuid]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      const newFavoriteState = !isFavorite;

      setIsLoading(true);
      setIsFavorite(newFavoriteState);

      const updatedStation = { ...station, isFavorite: newFavoriteState };

      if (currentStation &&
          ((station.id && currentStation.id === station.id) ||
           (station.stationUuid && currentStation.stationUuid === station.stationUuid))) {
        setCurrentStation({ ...currentStation, isFavorite: newFavoriteState });
      }

      onToggle?.(newFavoriteState);

      try {
        if (newFavoriteState) {
          await addFavorite(station.id, station.stationUuid);
          triggerRefresh();
        } else {
          await removeFavorite(station.id);
          triggerRefresh();
        }

        const favorites = await favoritesApi.getAll(0, 1000);
        const actualIsFav = favorites?.content.some(
          (fav) =>
            (station.id && fav.id === station.id) ||
            (station.stationUuid && fav.stationUuid === station.stationUuid)
        ) ?? false;

        setIsFavorite(actualIsFav);

        if (currentStation &&
            ((station.id && currentStation.id === station.id) ||
             (station.stationUuid && currentStation.stationUuid === station.stationUuid))) {
          setCurrentStation({ ...currentStation, isFavorite: actualIsFav });
        }

        if (actualIsFav !== newFavoriteState) {
          onToggle?.(actualIsFav);
        }
      } catch (error) {
        const revertedState = !newFavoriteState;
        setIsFavorite(revertedState);

        if (currentStation &&
            ((station.id && currentStation.id === station.id) ||
             (station.stationUuid && currentStation.stationUuid === station.stationUuid))) {
          setCurrentStation({ ...currentStation, isFavorite: revertedState });
        }

        onToggle?.(revertedState);
        console.error("Failed to toggle favorite:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isFavorite, station.id, station.stationUuid, addFavorite, removeFavorite, onToggle, triggerRefresh, currentStation, setCurrentStation],
  );

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    icon: "h-9 w-9",
  };

  return (
    <Button
      variant="ghost"
      size={size === "icon" ? "icon" : undefined}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size] || "h-10 w-10"} rounded-full hover:bg-primary/10 transition-all hover:scale-110`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isChecking ? (
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-all ${
            isFavorite
              ? "fill-red-500 text-red-500 scale-110"
              : ""
          }`}
        />
      )}
    </Button>
  );
}

