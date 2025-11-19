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
import { Radio, Play, Globe } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";

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
                {showGlobeIcon && <Globe className="w-3 h-3" />}
                {station.country}
              </span>
            )}
            {station.language && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                {station.language}
              </span>
            )}
            {showTags && station.tags ? (
              <span className="text-xs text-muted-foreground truncate max-w-xs">
                {station.tags.split(",").slice(0, 2).join(", ")}
              </span>
            ) : station.bitrate ? (
              <span className="text-xs text-muted-foreground">
                {station.bitrate} kbps
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton station={station} onToggle={onFavoriteToggle} />
          </div>
          <Button
            size="icon"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
}

