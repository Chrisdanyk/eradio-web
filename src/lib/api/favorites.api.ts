/**
 * Favorites API
 *
 * Handles all favorites-related API calls.
 *
 * SOLID: Single Responsibility - Only handles favorites endpoints
 */

import { apiClient } from "./client";
import type { RadioStation, PageResponse } from "~/lib/types/api.types";

export const favoritesApi = {
  /**
   * Get user's favorites
   */
  getAll: async (page = 0, size = 20): Promise<PageResponse<RadioStation>> => {
    return apiClient.get<PageResponse<RadioStation>>(
      `/api/favorites?page=${page}&size=${size}`,
    );
  },

  /**
   * Add station to favorites
   */
  add: async (stationId: number): Promise<void> => {
    return apiClient.post<void>(`/api/favorites/${stationId}`);
  },

  /**
   * Remove station from favorites
   */
  remove: async (stationId: number): Promise<void> => {
    return apiClient.delete<void>(`/api/favorites/${stationId}`);
  },
};

