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
 * Provides user-friendly messages for common HTTP status codes
 */
export function extractErrorMessage(error: unknown, context?: "login" | "register"): string {
  if (error instanceof ApiException) {
    // If the backend provided a message, use it
    if (error.message && !error.message.includes("HTTP error!")) {
      return error.message;
    }

    // Otherwise, provide user-friendly messages based on status code
    switch (error.statusCode) {
      case 401:
        return context === "login"
          ? "Invalid username or password. Please check your credentials and try again."
          : "Authentication failed. Please try again.";
      case 400:
        return context === "register"
          ? "Invalid registration data. Please check all fields and try again."
          : "Invalid request. Please check your input and try again.";
      case 409:
        return context === "register"
          ? "Username or email already exists. Please choose different credentials."
          : "This resource already exists.";
      case 404:
        return "The requested resource was not found.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.message || "An unexpected error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    // Check if it's a network error
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

