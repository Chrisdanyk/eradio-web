/**
 * Station Search Component
 *
 * Search and display radio stations.
 *
 * SOLID: Single Responsibility - Only handles station search UI
 * Performance: Debounced search, pagination support
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useStations } from "~/lib/hooks/use-stations";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FavoriteButton } from "./favorite-button";
import { Search, Play, Heart, Radio, Globe } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";

interface StationSearchProps {
  onStationSelect?: (station: RadioStation) => void;
}

export function StationSearch({ onStationSelect }: StationSearchProps) {
  const { searchStations, isLoading, error } = useStations();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Debounce search input - increased to 800ms to prevent premature searches
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(query);
    }, 800); // Increased debounce time

    return () => clearTimeout(timer);
  }, [query]);

  // Debounce country filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setCountryFilter(country);
    }, 500);

    return () => clearTimeout(timer);
  }, [country]);

  const handleSearch = useCallback(
    async (page: number, term: string, countryFilter?: string) => {
      const searchParams: any = {
        page,
        size: pagination.size,
      };

      // Only include non-empty parameters
      if (term && term.trim()) {
        searchParams.name = term.trim();
      }
      if (countryFilter && countryFilter.trim()) {
        searchParams.country = countryFilter.trim();
      }

      const result = await searchStations(searchParams);

      if (result) {
        setStations(result.content);
        setPagination({
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
        });
      } else {
        // If search failed, clear results
        setStations([]);
        setPagination({
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        });
      }
    },
    [searchStations, pagination.size],
  );

  // Perform search when searchTerm or countryFilter changes
  useEffect(() => {
    const hasSearchTerm = searchTerm.trim().length > 0;
    const hasCountryFilter = countryFilter.trim().length > 0;

    if (hasSearchTerm || hasCountryFilter) {
      handleSearch(0, searchTerm, countryFilter);
    } else {
      setStations([]);
      setPagination({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      });
    }
  }, [searchTerm, countryFilter, handleSearch]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      handleSearch(newPage, searchTerm, countryFilter);
    },
    [handleSearch, searchTerm, countryFilter],
  );

  const handleStationClick = useCallback(
    (station: RadioStation) => {
      onStationSelect?.(station);
    },
    [onStationSelect],
  );

  return (
    <div className="max-w-3xl mx-auto mb-16">
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-center">
        Find your station.
      </h1>
      <p className="text-lg text-muted-foreground text-center mb-10">
        Search from thousands of stations worldwide
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            disabled={isLoading}
            className="pl-14 h-14 text-base bg-muted/20 border-border/60 rounded-2xl transition-all duration-200 focus:bg-muted/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Country (optional)..."
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
            }}
            disabled={isLoading}
            className="h-14 text-base bg-muted/20 border-border/60 rounded-2xl transition-all duration-200 focus:bg-muted/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Results count or status */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground mb-6 px-2">
            Searching stations...
          </p>
        ) : stations.length > 0 ? (
          <p className="text-sm text-muted-foreground mb-6 px-2">
            Found {pagination.totalElements} {pagination.totalElements === 1 ? "station" : "stations"}
            {(searchTerm || countryFilter) && (
              <span className="text-xs text-muted-foreground/70 ml-2">
                {searchTerm && `for "${searchTerm}"`}
                {searchTerm && countryFilter && " and "}
                {countryFilter && `in ${countryFilter}`}
              </span>
            )}
          </p>
        ) : (searchTerm || countryFilter) ? (
          <p className="text-sm text-muted-foreground mb-6 px-2">
            No stations found
            {searchTerm && ` for "${searchTerm}"`}
            {countryFilter && ` in ${countryFilter}`}
          </p>
        ) : null}

        {isLoading && stations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Search className="w-10 h-10 text-primary" />
            </div>
            {/* <p className="text-lg font-medium text-foreground mb-2">Searching stations...</p> */}
            <p className="text-sm text-muted-foreground">Please wait while we find your stations</p>
          </div>
        ) : stations.length > 0 ? (
          <>
            <div className="space-y-3">
              {stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onClick={() => handleStationClick(station)}
                  onFavoriteToggle={(isFavorite) => {
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
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
        ) : (searchTerm || countryFilter) ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-foreground">No stations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm && countryFilter
                ? `No stations found for "${searchTerm}" in ${countryFilter}`
                : searchTerm
                  ? `No stations found for "${searchTerm}"`
                  : `No stations found in ${countryFilter}`}
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Station Card Component
 *
 * Displays a single station with its information.
 * Matches v0 design.
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
