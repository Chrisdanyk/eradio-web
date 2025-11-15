/**
 * Error Handler
 *
 * Centralized error handling for API responses.
 *
 * SOLID: Single Responsibility - Only handles error transformation
 * DRY: Reusable error handling logic
 */

import type { ApiError } from "~/lib/types/api.types";

export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiException";
  }
}

/**
 * Transform API error response to ApiException
 */
export function handleApiError(error: unknown): ApiException {
  if (error instanceof ApiException) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiException(error.message);
  }

  return new ApiException("An unexpected error occurred");
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

