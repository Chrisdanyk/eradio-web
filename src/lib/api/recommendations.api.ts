/**
 * Recommendations API
 *
 * Handles AI-powered recommendations API calls.
 *
 * SOLID: Single Responsibility - Only handles recommendations endpoints
 */

import { apiClient } from "./client";
import type { RecommendationsResponse } from "~/lib/types/api.types";

export const recommendationsApi = {
  /**
   * Get AI-powered recommendations
   */
  getRecommendations: async (limit = 10): Promise<RecommendationsResponse> => {
    return apiClient.get<RecommendationsResponse>(
      `/api/recommendations?limit=${limit}`,
    );
  },
};

