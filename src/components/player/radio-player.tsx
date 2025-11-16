/**
 * Radio Player Component
 *
 * HTML5 audio player for radio stations.
 *
 * SOLID: Single Responsibility - Only handles audio playback
 * Performance: Efficient state management, minimal re-renders
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { RadioStation } from "~/lib/types/api.types";

interface RadioPlayerProps {
  station: RadioStation | null;
  onClose?: () => void;
}

export function RadioPlayer({ station, onClose }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Get error message from audio error
  const getErrorMessage = useCallback((audio: HTMLAudioElement): string => {
    if (!audio.error) return "Unknown error occurred";

    switch (audio.error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return "Playback was aborted. Please try again.";
      case MediaError.MEDIA_ERR_NETWORK:
        return "Network error. Check your connection and try again.";
      case MediaError.MEDIA_ERR_DECODE:
        return "Unable to decode audio. The stream format may not be supported.";
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "Stream format not supported. This station may require a different player.";
      default:
        return "Failed to play audio. The stream may be unavailable.";
    }
  }, []);

  // Try to load and play a stream URL
  const tryPlayStream = useCallback(
    async (url: string, isRetry = false): Promise<boolean> => {
      if (!audioRef.current) return false;

      const audio = audioRef.current;

      return new Promise((resolve) => {
        const cleanup = () => {
          audio.removeEventListener("canplay", handleCanPlay);
          audio.removeEventListener("error", handleError);
        };

        const handleCanPlay = async () => {
          cleanup();
          try {
            await audio.play();
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
            setRetryCount(0);
            resolve(true);
          } catch (playError: any) {
            console.error("Play error:", playError);
            // Check if it's an autoplay policy error
            if (
              playError.name === "NotAllowedError" ||
              playError.name === "NotSupportedError"
            ) {
              setError(
                "Autoplay blocked. Please click the play button to start.",
              );
            } else {
              setError(getErrorMessage(audio));
            }
            setIsLoading(false);
            resolve(false);
          }
        };

        const handleError = () => {
          cleanup();
          const errorMsg = getErrorMessage(audio);
          setError(errorMsg);
          setIsLoading(false);
          setIsPlaying(false);
          resolve(false);
        };

        audio.addEventListener("canplay", handleCanPlay, { once: true });
        audio.addEventListener("error", handleError, { once: true });

        // Set a timeout for loading
        const loadTimeout = setTimeout(() => {
          cleanup();
          setError("Stream is taking too long to load. Please try again.");
          setIsLoading(false);
          resolve(false);
        }, 15000); // 15 second timeout

        try {
          audio.src = url;
          audio.load();
          // Clear timeout when canplay fires
          audio.addEventListener(
            "canplay",
            () => clearTimeout(loadTimeout),
            { once: true },
          );
          audio.addEventListener(
            "error",
            () => clearTimeout(loadTimeout),
            { once: true },
          );
        } catch (err) {
          clearTimeout(loadTimeout);
          cleanup();
          setError("Failed to load stream URL");
          setIsLoading(false);
          resolve(false);
        }
      });
    },
    [getErrorMessage],
  );

  // Update audio source when station changes
  useEffect(() => {
    if (!station || !audioRef.current) return;

    const streamUrl = station.urlResolved || station.url;

    if (!streamUrl) {
      setError("No stream URL available for this station");
      return;
    }

    // Reset state
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setRetryCount(0);

    // Stop current playback
    const audio = audioRef.current;
    audio.pause();
    audio.src = "";

    // Try to play the stream
    tryPlayStream(streamUrl).catch((err) => {
      console.error("Stream play error:", err);
    });
  }, [station, tryPlayStream]);

  // Retry function - tries alternate URL if available
  const handleRetry = useCallback(async () => {
    if (!station || !audioRef.current) return;

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const streamUrl = station.urlResolved || station.url;
    if (!streamUrl) return;

    setError(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);

    // Try alternate URL if we have both and this is a retry
    const currentRetry = retryCount;
    const urlToTry =
      currentRetry > 0 &&
      station.urlResolved &&
      station.url &&
      station.url !== station.urlResolved
        ? station.url // Try the original URL if resolved URL failed
        : streamUrl;

    await tryPlayStream(urlToTry, true);
  }, [station, retryCount, tryPlayStream]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback error:", err);
          setError("Failed to play audio");
        });
    }
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleError = () => {
      setError("Failed to load audio stream");
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!station) {
    return null;
  }

  return (
    <Card variant="elevated" className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {station.favicon && (
              <img
                src={station.favicon}
                alt={station.name}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {station.name}
              </h3>
              {station.country && (
                <p className="text-sm text-gray-600 truncate">{station.country}</p>
              )}
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              ✕
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800 mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {/* Play/Pause Button */}
          <div className="flex items-center justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="h-16 w-16 rounded-full"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {volume === 0 ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              )}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-600 w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Time Display (for non-live streams) */}
          {duration > 0 && !isNaN(duration) && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}

          {/* Station Info */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              {station.bitrate && (
                <p>
                  <span className="font-medium">Bitrate:</span> {station.bitrate} kbps
                </p>
              )}
              {station.codec && (
                <p>
                  <span className="font-medium">Codec:</span> {station.codec}
                </p>
              )}
              {station.language && (
                <p>
                  <span className="font-medium">Language:</span> {station.language}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />
    </Card>
  );
}

