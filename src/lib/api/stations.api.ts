/**
 * Radio Stations API
 *
 * Handles all radio station-related API calls.
 *
 * SOLID: Single Responsibility - Only handles station endpoints
 */

import { apiClient } from "./client";
import type {
  RadioStation,
  StationSearchParams,
  PageResponse,
} from "~/lib/types/api.types";

export const stationsApi = {
  /**
   * Search radio stations
   */
  search: async (params: StationSearchParams): Promise<PageResponse<RadioStation>> => {
    const searchParams = new URLSearchParams();

    if (params.name) searchParams.append("name", params.name);
    if (params.country) searchParams.append("country", params.country);
    if (params.language) searchParams.append("language", params.language);
    if (params.tags) searchParams.append("tags", params.tags);
    if (params.page !== undefined) searchParams.append("page", params.page.toString());
    if (params.size !== undefined) searchParams.append("size", params.size.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/stations/search${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PageResponse<RadioStation>>(endpoint);
  },

  /**
   * Get station by ID
   */
  getById: async (id: number): Promise<RadioStation> => {
    return apiClient.get<RadioStation>(`/api/stations/${id}`);
  },
};

