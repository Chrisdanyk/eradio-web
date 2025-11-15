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
   * Performance: Could implement optimistic updates here
   */
  const addFavorite = useCallback(async (stationId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await favoritesApi.add(stationId);
      return true;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
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

