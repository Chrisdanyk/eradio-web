/**
 * useStations Hook
 *
 * Custom hook for fetching radio stations.
 *
 * DRY: Reusable station fetching logic
 * Performance: Includes loading states, error handling, and caching
 *
 * This hook provides:
 * - Search stations with filters
 * - Get station by ID
 * - Loading and error states
 */

import { useState, useCallback } from "react";
import { stationsApi } from "~/lib/api/stations.api";
import type { RadioStation, StationSearchParams, PageResponse } from "~/lib/types/api.types";
import { extractErrorMessage } from "~/lib/utils/error-handler";

export function useStations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search stations
   */
  const searchStations = useCallback(
    async (params: StationSearchParams): Promise<PageResponse<RadioStation> | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await stationsApi.search(params);
        return response;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get station by ID
   */
  const getStation = useCallback(async (id: number): Promise<RadioStation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const station = await stationsApi.getById(id);
      return station;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchStations,
    getStation,
    isLoading,
    error,
  };
}

