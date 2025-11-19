/**
 * Station Card Component
 *
 * Reusable card component for displaying radio stations.
 * Used across recommendations, search, and favorites pages.
 *
 * SOLID: Single Responsibility - Only handles station card rendering
 */

"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FavoriteButton } from "~/components/stations/favorite-button";
import { Radio, Play, Pause, MapPin, Activity } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";
import { usePlayerStore } from "~/lib/store/player-store";

export interface StationCardProps {
  station: RadioStation;
  onClick: () => void;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  /**
   * Show tags instead of bitrate (for recommendations)
   */
  showTags?: boolean;
  /**
   * Show globe icon with country (for search/favorites)
   */
  showGlobeIcon?: boolean;
}

export function StationCard({
  station,
  onClick,
  onFavoriteToggle,
  showTags = false,
  showGlobeIcon = true,
}: StationCardProps) {
  const [imageError, setImageError] = useState(false);
  const { currentStation, isPlaying } = usePlayerStore();
  const isCurrentlyPlaying =
    currentStation &&
    (currentStation.stationUuid ?? currentStation.id) ===
      (station.stationUuid ?? station.id) &&
    isPlaying;

  return (
    <div
      className="group relative bg-card hover:bg-accent/50 border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shadow-md ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300">
            {station.favicon && !imageError ? (
              <img
                src={station.favicon}
                alt={station.name}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Radio className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {station.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {station.country && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{station.country}</span>
              </div>
            )}
            {station.language && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
                  {station.language}
                </span>
              </div>
            )}
            {showTags && station.tags ? (
              <span className="text-xs truncate max-w-xs">
                {station.tags.split(",").slice(0, 2).join(", ")}
              </span>
            ) : station.bitrate ? (
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span className="font-medium">{station.bitrate} kbps</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton station={station} onToggle={onFavoriteToggle} size="sm" />
          </div>
          <Button
            size="icon"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onClick();
            }}
            className={`h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110 transition-all duration-300 ${
              isCurrentlyPlaying ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

