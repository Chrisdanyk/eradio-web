/**
 * useFavorites Hook
 *
 * Custom hook for managing favorites.
 *
 * DRY: Reusable favorites logic
 * Performance: Optimistic updates for better UX
 *
 * This hook provides:
 * - Get favorites list
 * - Add/remove favorites
 * - Loading and error states
 */

import { useState, useCallback } from "react";
import { favoritesApi } from "~/lib/api/favorites.api";
import { stationsApi } from "~/lib/api/stations.api";
import type { RadioStation, PageResponse } from "~/lib/types/api.types";
import { extractErrorMessage } from "~/lib/utils/error-handler";

export function useFavorites() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get favorites list
   */
  const getFavorites = useCallback(
    async (page = 0, size = 20): Promise<PageResponse<RadioStation> | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await favoritesApi.getAll(page, size);
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
   * Add station to favorites
   *
   * Search results don't have database IDs (they're null), so we need to:
   * 1. Save the station to database first (using UUID)
   * 2. Get the saved station to get its database ID
   * 3. Add to favorites using the database ID
   *
   * Performance: Could implement optimistic updates here
   */
  const addFavorite = useCallback(async (stationId: number, stationUuid?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // If no UUID provided or ID is null/0, we can't proceed
    if (!stationUuid) {
      setError("Station UUID is required to add to favorites");
      setIsLoading(false);
      return false;
    }

    try {
      // If stationId is valid (not null/0), try adding favorite first
      // This handles the case where station was already saved
      if (stationId && stationId > 0) {
        try {
          await favoritesApi.add(stationId);
          return true;
        } catch (err: any) {
          // If it fails, continue to save-first flow
          const errorMessage = extractErrorMessage(err);
          if (!errorMessage.includes("Station not found") &&
              !errorMessage.includes("station not found") &&
              !errorMessage.includes("Please save the station first")) {
            // Different error, don't retry
            setError(errorMessage);
            return false;
          }
          // Continue to save-first flow below
        }
      }

      // Save the station first (idempotent - won't duplicate if already exists)
      await stationsApi.save([stationUuid]);

      // Get the saved station from the database to get its database ID
      // Check saved stations to find it by UUID
      let savedStation: RadioStation | undefined;

      // Check first 3 pages (300 stations) - recently saved should be near the start
      for (let page = 0; page < 3; page++) {
        const savedResult = await stationsApi.getSaved(page, 100);
        if (!savedResult || savedResult.content.length === 0) break;

        savedStation = savedResult.content.find(
          (s) => s.stationUuid === stationUuid
        );

        if (savedStation) break;
        if (savedResult.last) break; // No more pages
      }

      if (savedStation && savedStation.id) {
        // Now add favorite with the database ID
        await favoritesApi.add(savedStation.id);
        return true;
      } else {
        setError("Station saved but could not be found. Please try again.");
        return false;
      }
    } catch (saveErr) {
      const saveErrorMessage = extractErrorMessage(saveErr);
      setError(saveErrorMessage || "Failed to save station. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove station from favorites
   *
   * Performance: Could implement optimistic updates here
   */
  const removeFavorite = useCallback(async (stationId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await favoritesApi.remove(stationId);
      return true;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    isLoading,
    error,
  };
}

