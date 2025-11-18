/**
 * API Type Definitions
 *
 * These types match the backend DTOs exactly.
 * This ensures type safety between frontend and backend.
 *
 * SOLID: Single Responsibility - Types are separated from logic
 */

// ==================== Auth Types ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

// ==================== Station Types ====================

export interface RadioStation {
  id: number;
  stationUuid: string;
  name: string;
  url: string;
  urlResolved: string;
  homepage: string | null;
  favicon: string | null;
  tags: string | null;
  country: string | null;
  countryCode: string | null;
  state: string | null;
  language: string | null;
  languageCodes: string | null;
  votes: number | null;
  codec: string | null;
  bitrate: number | null;
  hls: boolean | null;
  lastCheckOk: boolean | null;
  isFavorite: boolean;
}

export interface StationSearchParams {
  name?: string;
  country?: string;
  language?: string;
  tags?: string;
  page?: number;
  size?: number;
}

// ==================== Pagination Types ====================

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ==================== Recommendations Types ====================

export interface RecommendationsResponse {
  recommendations: RadioStation[];
  reason: string;
}

// ==================== API Error Types ====================

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

