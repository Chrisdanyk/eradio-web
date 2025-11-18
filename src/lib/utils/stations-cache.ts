/**
 * Stations Cache Utility
 *
 * Handles caching of radio stations with expiration (1 hour).
 * Used to show stations when user logs in without saving to DB.
 *
 * SOLID: Single Responsibility - Only handles station caching
 */

import type { RadioStation } from "~/lib/types/api.types";

const CACHE_KEY = "eradio_stations_cache";
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface CachedStations {
  stations: RadioStation[];
  timestamp: number;
  searchTerm: string;
}

interface CacheStore {
  [searchTerm: string]: CachedStations;
}

/**
 * Get cached stations if they exist and are not expired
 */
export function getCachedStations(searchTerm: string = ""): RadioStation[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheStore: CacheStore = JSON.parse(cached);
    const now = Date.now();
    const cacheKey = searchTerm || "__default__";

    const data = cacheStore[cacheKey];
    if (!data) return null;

    // Check if cache is expired
    if (now - data.timestamp > CACHE_EXPIRY_MS) {
      delete cacheStore[cacheKey];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheStore));
      return null;
    }

    return data.stations;
  } catch {
    return null;
  }
}

/**
 * Cache stations with current timestamp
 */
export function setCachedStations(
  stations: RadioStation[],
  searchTerm: string = "",
): void {
  try {
    const cacheKey = searchTerm || "__default__";
    let cacheStore: CacheStore = {};

    // Load existing cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        cacheStore = JSON.parse(cached);
      } catch {
        // If parse fails, start fresh
        cacheStore = {};
      }
    }

    // Update cache for this search term
    cacheStore[cacheKey] = {
      stations,
      timestamp: Date.now(),
      searchTerm,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheStore));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Append stations to cache (for infinite scroll)
 */
export function appendCachedStations(
  newStations: RadioStation[],
  searchTerm: string = "",
): void {
  try {
    const cached = getCachedStations(searchTerm);
    if (cached) {
      // Merge and deduplicate by stationUuid
      const existingUuids = new Set(cached.map((s) => s.stationUuid ?? s.id));
      const uniqueNewStations = newStations.filter(
        (s) => !existingUuids.has(s.stationUuid ?? s.id),
      );
      setCachedStations([...cached, ...uniqueNewStations], searchTerm);
    } else {
      setCachedStations(newStations, searchTerm);
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Clear the cache
 */
export function clearStationsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Check if cache exists and is valid
 */
export function hasValidCache(searchTerm: string = ""): boolean {
  return getCachedStations(searchTerm) !== null;
}

