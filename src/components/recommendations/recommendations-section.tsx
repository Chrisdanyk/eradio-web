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
import { StationCard } from "~/components/stations/station-card";
import { Button } from "~/components/ui/button";
import { ActionButton } from "~/components/ui/auth-button";
import Skeleton from "~/components/ui/skeleton";
import { Sparkles, RefreshCw, AlertCircle, Search } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";
import { usePlayerStore } from "~/lib/store/player-store";
import { extractErrorMessage } from "~/lib/utils/error-handler";
import Link from "next/link";

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
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-semibold mb-3">Start Discovering</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            Add some stations to your favorites to get personalized AI-powered recommendations tailored to your taste!
          </p>
          <Link href="/search">
            <ActionButton fullWidth={false}>
              <Search className="w-4 h-4 mr-2" />
              Browse Stations
            </ActionButton>
          </Link>
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
            showTags={true}
            showGlobeIcon={false}
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


