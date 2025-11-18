/**
 * Recommendations Section Component
 *
 * Displays AI-powered radio station recommendations.
 *
 * SOLID: Single Responsibility - Only handles recommendations display
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { recommendationsApi } from "~/lib/api/recommendations.api";
import { FavoriteButton } from "~/components/stations/favorite-button";
import { Button } from "~/components/ui/button";
import Skeleton from "~/components/ui/skeleton";
import { Radio, Play, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";
import { usePlayerStore } from "~/lib/store/player-store";
import { extractErrorMessage } from "~/lib/utils/error-handler";

interface RecommendationsSectionProps {
  onStationSelect?: (station: RadioStation) => void;
}

export function RecommendationsSection({ onStationSelect }: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<RadioStation[]>([]);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setStations: setPlayerStations } = usePlayerStore();

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationsApi.getRecommendations(10);
      setRecommendations(response.recommendations);
      setReason(response.reason);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      setRecommendations([]);
      setReason("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecommendations();
  }, [fetchRecommendations]);

  const handleStationClick = useCallback(
    (station: RadioStation) => {
      setPlayerStations(recommendations);
      onStationSelect?.(station);
    },
    [onStationSelect, recommendations, setPlayerStations],
  );

  if (isLoading && recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-semibold">Recommendations for You</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-5">
                <Skeleton height={80} width={80} borderRadius="0.75rem" />
                <div className="flex-1 min-w-0 space-y-3">
                  <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                  <Skeleton height={20} width="50%" borderRadius="0.375rem" />
                </div>
                <Skeleton height={40} width={40} circle />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-semibold">Recommendations for You</h2>
        </div>
        <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRecommendations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-semibold">Recommendations for You</h2>
        </div>
        <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Add some stations to your favorites to get personalized recommendations!
          </p>
          <Button onClick={fetchRecommendations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-semibold">Recommendations for You</h2>
        </div>
        <Button
          onClick={fetchRecommendations}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {reason && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-foreground/80">{reason}</p>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((station) => (
          <StationCard
            key={station.stationUuid ?? station.id}
            station={station}
            onClick={() => handleStationClick(station)}
            onFavoriteToggle={(isFavorite) => {
              setRecommendations((prev) =>
                prev.map((s) =>
                  (s.stationUuid ?? s.id) === (station.stationUuid ?? station.id)
                    ? { ...s, isFavorite }
                    : s,
                ),
              );
            }}
          />
        ))}
      </div>

      {isLoading && recommendations.length > 0 && (
        <div className="space-y-3 mt-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`loading-${index}`} className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-5">
                <Skeleton height={80} width={80} borderRadius="0.75rem" />
                <div className="flex-1 min-w-0 space-y-3">
                  <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                  <Skeleton height={20} width="50%" borderRadius="0.375rem" />
                </div>
                <Skeleton height={40} width={40} circle />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Station Card Component
 *
 * Displays a single recommended station.
 */
const StationCard = ({
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
                {station.country}
              </span>
            )}
            {station.language && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                {station.language}
              </span>
            )}
            {station.tags && (
              <span className="text-xs text-muted-foreground truncate max-w-xs">
                {station.tags.split(",").slice(0, 2).join(", ")}
              </span>
            )}
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
};

