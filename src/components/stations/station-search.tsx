/**
 * Station Search Component
 *
 * Search and display radio stations.
 *
 * SOLID: Single Responsibility - Only handles station search UI
 * Performance: Debounced search, pagination support
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useStations } from "~/lib/hooks/use-stations";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { FavoriteButton } from "./favorite-button";
import type { RadioStation, PageResponse } from "~/lib/types/api.types";

interface StationSearchProps {
  onStationSelect?: (station: RadioStation) => void;
}

export function StationSearch({ onStationSelect }: StationSearchProps) {
  const { searchStations, isLoading, error } = useStations();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    country: "",
    language: "",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when searchTerm or filters change
  useEffect(() => {
    if (searchTerm.trim() || filters.country || filters.language) {
      handleSearch(0);
    } else {
      setStations([]);
      setPagination({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      });
    }
  }, [searchTerm, filters.country, filters.language]);

  const handleSearch = useCallback(
    async (page: number) => {
      const result = await searchStations({
        name: searchTerm || undefined,
        country: filters.country || undefined,
        language: filters.language || undefined,
        page,
        size: pagination.size,
      });

      if (result) {
        setStations(result.content);
        setPagination({
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
        });
      }
    },
    [searchStations, searchTerm, filters, pagination.size],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      handleSearch(newPage);
    },
    [handleSearch],
  );

  const handleStationClick = useCallback(
    (station: RadioStation) => {
      onStationSelect?.(station);
    },
    [onStationSelect],
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card variant="elevated">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Stations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Find radio stations by name, country, or language
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by station name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <Input
              placeholder="Country (optional)"
              value={filters.country}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, country: e.target.value }))
              }
              disabled={isLoading}
            />
            <Input
              placeholder="Language (optional)"
              value={filters.language}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, language: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {error && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {isLoading && stations.length === 0 ? (
        <Card variant="default">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="text-gray-600">Searching stations...</p>
            </div>
          </div>
        </Card>
      ) : stations.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {pagination.totalElements} station
              {pagination.totalElements !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onClick={() => handleStationClick(station)}
                onFavoriteToggle={(isFavorite) => {
                  // Update local state when favorite is toggled
                  setStations((prev) =>
                    prev.map((s) =>
                      s.id === station.id ? { ...s, isFavorite } : s,
                    ),
                  );
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={
                  pagination.page >= pagination.totalPages - 1 || isLoading
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : searchTerm || filters.country || filters.language ? (
        <Card variant="default">
          <div className="py-12 text-center">
            <p className="text-gray-600">No stations found. Try different search terms.</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/**
 * Station Card Component
 *
 * Displays a single station with its information.
 * Memoized for performance.
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
  return (
    <Card
      variant="default"
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton
          station={station}
          onToggle={onFavoriteToggle}
        />
      </div>
      <div className="flex items-start gap-4">
        {station.favicon && (
          <img
            src={station.favicon}
            alt={station.name}
            className="h-16 w-16 rounded-lg object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-semibold text-gray-900 truncate">{station.name}</h3>
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
  );
};

