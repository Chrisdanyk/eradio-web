/**
 * Base API Client
 *
 * This is the foundation of our API layer.
 * It handles all HTTP requests with:
 * - Automatic JWT token injection
 * - Error handling
 * - Type safety
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP communication
 * - Dependency Inversion: Other modules depend on this abstraction
 *
 * DRY: All API calls go through this client
 */

import { env } from "~/env";
import { storage } from "~/lib/utils/storage";
import { ApiException, handleApiError } from "~/lib/utils/error-handler";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: unknown;
  requiresAuth?: boolean;
}

/**
 * Base API client class
 *
 * This class encapsulates all HTTP request logic.
 * It's extensible (Open/Closed Principle) - you can add new methods
 * without modifying existing code.
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_URL;
  }

  /**
   * Make an HTTP request
   *
   * This is the core method that all API calls use.
   * It handles:
   * - URL construction
   * - JWT token injection
   * - Request/response transformation
   * - Error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      method = "GET",
      body,
      requiresAuth = true,
      headers = {},
      ...restOptions
    } = options;

    // Construct full URL
    const url = `${this.baseUrl}${endpoint}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add JWT token if authentication is required
    if (requiresAuth) {
      const token = storage.getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Prepare request body
    let requestBody: string | undefined;
    if (body) {
      requestBody = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        ...restOptions,
      });

      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new ApiException(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data.errors,
        );
      }

      return data as T;
    } catch (error) {
      // Transform and re-throw errors
      throw handleApiError(error);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance
// This ensures we only have one API client instance (Singleton pattern)
export const apiClient = new ApiClient();

