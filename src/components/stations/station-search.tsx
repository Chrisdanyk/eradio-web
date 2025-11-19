/**
 * Station Search Component
 *
 * Search and display radio stations.
 *
 * SOLID: Single Responsibility - Only handles station search UI
 * Performance: Debounced search, pagination support
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStations } from "~/lib/hooks/use-stations";
import { Input } from "~/components/ui/input";
import Skeleton from "~/components/ui/skeleton";
import { StationCard } from "./station-card";
import {
  getCachedStations,
  setCachedStations,
  appendCachedStations,
  hasValidCache,
} from "~/lib/utils/stations-cache";
import { Search } from "lucide-react";
import type { RadioStation, StationSearchParams } from "~/lib/types/api.types";
import { usePlayerStore } from "~/lib/store/player-store";

interface StationSearchProps {
  onStationSelect?: (station: RadioStation) => void;
}

export function StationSearch({ onStationSelect }: StationSearchProps) {
  const { searchStations, isLoading } = useStations();
  const { setStations: setPlayerStations } = usePlayerStore();
  const [query, setQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasMore: true,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const isLoadingMoreRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(query);
    }, 800);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback(
    async (page: number, term: string, reset = false) => {
      // Prevent multiple simultaneous calls
      if (isLoadingMoreRef.current && !reset) return;

      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
      const searchParams: StationSearchParams = {
        page,
        size: 20,
      };

      // Only include non-empty parameters
      if (term?.trim()) {
        searchParams.name = term.trim();
      }

      const result = await searchStations(searchParams);

      if (result) {
        if (reset) {
          setStations(result.content);
          // Cache the results
          setCachedStations(result.content, term);
        } else {
          setStations((prev) => [...prev, ...result.content]);
          // Append to cache
          appendCachedStations(result.content, term);
        }
        setPagination({
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          hasMore: !result.last && result.content.length > 0,
        });
      } else {
        if (reset) {
          setStations([]);
          setPagination({
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            hasMore: false,
          });
        }
      }
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    },
    [searchStations],
  );

  // Load initial stations on mount (from cache or API)
  useEffect(() => {
    if (!hasLoadedRef.current && !debouncedSearchTerm) {
      const cached = getCachedStations("");
      if (cached && cached.length > 0 && hasValidCache("")) {
        // Show cached stations immediately - no network request if cache is valid
        setStations(cached);
        // Set pagination to allow infinite scroll
        setPagination({
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          hasMore: true,
        });
        hasLoadedRef.current = true;
        // No API call - cache is valid, use it
      } else {
        // No valid cache - load initial stations from API
        void handleSearch(0, "", true);
        hasLoadedRef.current = true;
      }
    }
  }, [debouncedSearchTerm, handleSearch]);

  // Perform search when searchTerm changes
  useEffect(() => {
    // Skip if this is the initial load (handled by the other effect)
    if (!hasLoadedRef.current && !debouncedSearchTerm) return;

    const hasSearchTerm = debouncedSearchTerm.trim().length > 0;

    // Reset pagination when search term changes
    setPagination({
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasMore: true,
    });

    if (hasSearchTerm) {
      // Check cache first
      const cached = getCachedStations(debouncedSearchTerm);
      if (cached && cached.length > 0 && hasValidCache(debouncedSearchTerm)) {
        // Show cached data immediately - no network request if cache is valid
        setStations(cached);
        setPagination((prev) => ({
          ...prev,
          hasMore: true, // Allow infinite scroll to load more
        }));
      } else {
        // No valid cache - fetch from API
        void handleSearch(0, debouncedSearchTerm, true);
      }
    } else {
      // No search term - load from cache or load initial stations
      const cached = getCachedStations("");
      if (cached && cached.length > 0 && hasValidCache("")) {
        // Show cached data - no network request if cache is valid
        setStations(cached);
        setPagination((prev) => ({
          ...prev,
          hasMore: true, // Allow infinite scroll to load more
        }));
      } else {
        // No valid cache - fetch from API
        void handleSearch(0, "", true);
      }
    }
  }, [debouncedSearchTerm, handleSearch]);

  // Infinite scroll observer
  useEffect(() => {
    if (!pagination.hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMoreRef.current) {
          void handleSearch(pagination.page + 1, debouncedSearchTerm, false);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [pagination.hasMore, pagination.page, isLoadingMore, isLoading, debouncedSearchTerm, handleSearch]);

  const handleStationClick = useCallback(
    (station: RadioStation) => {
      // Set stations list for navigation
      setPlayerStations(stations);
      onStationSelect?.(station);
    },
    [onStationSelect, stations, setPlayerStations],
  );

  return (
    <div className="max-w-3xl mx-auto mb-16">
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-center">
        Find your station.
      </h1>
      <p className="text-lg text-muted-foreground text-center mb-10">
        Search from thousands of stations worldwide
      </p>

      <div className="mb-10">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="pl-14 h-14 text-base font-medium bg-muted/20 border-border/60 rounded-2xl transition-all duration-200 focus:bg-muted/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {isLoading && stations.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-5">
                  <Skeleton height={80} width={80} borderRadius="0.75rem" />
                  <div className="flex-1 min-w-0 space-y-3">
                    <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                    <div className="flex flex-wrap items-center gap-3">
                      <Skeleton height={24} width={80} borderRadius="0.375rem" />
                      <Skeleton height={24} width={64} borderRadius="0.375rem" />
                      <Skeleton height={16} width={48} borderRadius="0.375rem" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton height={40} width={40} circle />
                    <Skeleton height={40} width={40} circle />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stations.length > 0 ? (
          <>
            <div className="space-y-3">
              {stations.map((station) => (
                <StationCard
                  key={station.stationUuid ?? station.id}
                  station={station}
                  onClick={() => handleStationClick(station)}
                  onFavoriteToggle={(isFavorite) => {
                    setStations((prev) =>
                      prev.map((s) =>
                        (s.stationUuid ?? s.id) === (station.stationUuid ?? station.id)
                          ? { ...s, isFavorite }
                          : s,
                      ),
                    );
                  }}
                  showGlobeIcon={true}
                />
              ))}
            </div>

            {/* Loading more skeletons - appears after existing items */}
            {isLoadingMore && (
              <div className="space-y-3 mt-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`loading-${index}`} className="bg-card rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center gap-5">
                      <Skeleton height={80} width={80} borderRadius="0.75rem" />
                      <div className="flex-1 min-w-0 space-y-3">
                        <Skeleton height={24} width="75%" borderRadius="0.375rem" />
                        <div className="flex flex-wrap items-center gap-3">
                          <Skeleton height={24} width={80} borderRadius="0.375rem" />
                          <Skeleton height={24} width={64} borderRadius="0.375rem" />
                          <Skeleton height={16} width={48} borderRadius="0.375rem" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Skeleton height={40} width={40} circle />
                        <Skeleton height={40} width={40} circle />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Infinite scroll trigger - invisible element to detect when to load more */}
            {pagination.hasMore && (
              <div ref={observerTarget} className="h-20 py-8" aria-hidden="true" />
            )}
          </>
        ) : debouncedSearchTerm ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-foreground">No stations found</h3>
            <p className="text-muted-foreground mb-4">
              No stations found for &quot;{debouncedSearchTerm}&quot;
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your search terms
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}


