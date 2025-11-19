/**
 * Radio Player Component
 *
 * Simplified and beautiful HTML5 audio player for radio stations.
 *
 * SOLID: Single Responsibility - Only handles audio playback
 * Performance: Efficient state management, minimal re-renders
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { FavoriteButton } from "~/components/stations/favorite-button";
import { Play, Pause, Volume2, VolumeX, X, Waves, SkipBack, SkipForward } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";
import { usePlayerStore } from "~/lib/store/player-store";

interface RadioPlayerProps {
  station: RadioStation | null;
  onClose?: () => void;
}

export function RadioPlayer({ station, onClose }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { stations, setCurrentStation, setIsPlaying: setStoreIsPlaying, isPlaying: storeIsPlaying } = usePlayerStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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
    async (url: string): Promise<boolean> => {
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
            setStoreIsPlaying(true);
            setIsLoading(false);
            setError(null);
            resolve(true);
          } catch (playError: any) {
            console.error("Play error:", playError);
            if (
              playError.name === "NotAllowedError" ||
              playError.name === "NotSupportedError"
            ) {
              setError("Autoplay blocked. Please click the play button to start.");
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

        const loadTimeout = setTimeout(() => {
          cleanup();
          setError("Stream is taking too long to load. Please try again.");
          setIsLoading(false);
          resolve(false);
        }, 15000);

        try {
          audio.src = url;
          audio.load();
          audio.addEventListener("canplay", () => clearTimeout(loadTimeout), { once: true });
          audio.addEventListener("error", () => clearTimeout(loadTimeout), { once: true });
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

  // Reset image error when station changes
  useEffect(() => {
    setImageError(false);
  }, [station?.favicon]);

  // Update audio source when station changes
  useEffect(() => {
    if (!station || !audioRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setIsPlaying(false);
        setStoreIsPlaying(false);
      }
      return;
    }

    const streamUrl = station.urlResolved || station.url;

    if (!streamUrl) {
      setError("No stream URL available for this station");
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setStoreIsPlaying(false);

    const audio = audioRef.current;
    audio.pause();
    audio.src = "";

    tryPlayStream(streamUrl).catch((err) => {
      console.error("Stream play error:", err);
    });
  }, [station, tryPlayStream, setStoreIsPlaying]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setStoreIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setStoreIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback error:", err);
          setError("Failed to play audio");
        });
    }
  }, [isPlaying, setStoreIsPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  }, [isMuted, volume]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setStoreIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setStoreIsPlaying(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError("Failed to load audio stream");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [setStoreIsPlaying]);

  // Retry function
  const handleRetry = useCallback(async () => {
    if (!station || !audioRef.current) return;

    const streamUrl = station.urlResolved || station.url;
    if (!streamUrl) return;

    setError(null);
    setIsLoading(true);
    await tryPlayStream(streamUrl);
  }, [station, tryPlayStream]);

  // Navigation functions
  const handlePrevious = useCallback(() => {
    if (!station || stations.length === 0) return;

    const currentIndex = stations.findIndex(
      (s) => (s.stationUuid ?? s.id) === (station.stationUuid ?? station.id)
    );

    if (currentIndex === -1) return;

    const previousIndex = currentIndex > 0 ? currentIndex - 1 : stations.length - 1;
    const previousStation = stations[previousIndex];
    if (previousStation) {
      setCurrentStation(previousStation);
    }
  }, [station, stations, setCurrentStation]);

  const handleNext = useCallback(() => {
    if (!station || stations.length === 0) return;

    const currentIndex = stations.findIndex(
      (s) => (s.stationUuid ?? s.id) === (station.stationUuid ?? station.id)
    );

    if (currentIndex === -1) return;

    const nextIndex = currentIndex < stations.length - 1 ? currentIndex + 1 : 0;
    const nextStation = stations[nextIndex];
    if (nextStation) {
      setCurrentStation(nextStation);
    }
  }, [station, stations, setCurrentStation]);

  if (!station) {
    return null;
  }

  // Beautiful gradient for default cover
  const defaultCoverGradient = "from-primary/20 via-primary/10 to-accent/20";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Station Cover Image */}
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shadow-lg ring-2 ring-primary/20">
              {station.favicon && !imageError ? (
                <img
                  src={station.favicon}
                  alt={station.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${defaultCoverGradient} flex items-center justify-center`}>
                  <Waves className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background animate-pulse" />
            )}
          </div>

          {/* Station Info */}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{station.name}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {station.country || station.language || "Radio Station"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            {stations.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePrevious}
                className="h-9 w-9 rounded-full hover:bg-accent transition-all hover:scale-110"
                title="Previous station"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            {/* Play/Pause Button */}
            <Button
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="h-11 w-11 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-110"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>

            {/* Next Button */}
            {stations.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNext}
                className="h-9 w-9 rounded-full hover:bg-accent transition-all hover:scale-110"
                title="Next station"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            {/* Favorite Button - Mobile */}
            <div className="md:hidden">
              <FavoriteButton station={station} size="icon" />
            </div>

            {/* Volume Control */}
            <div className="relative flex items-center">
              <div
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-9 w-9 rounded-full hover:bg-accent transition-all hover:scale-110"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                {/* Volume slider - appears on hover */}
                {showVolumeSlider && (
                  <>
                    {/* Invisible bridge to prevent gap - keeps hover active */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2" />
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-popover border border-border rounded-lg p-3 shadow-lg flex flex-col items-center gap-2 min-w-[3rem]"
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                      <div className="relative h-24 w-6 flex items-center justify-center">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="absolute w-24 h-2 -rotate-90 cursor-pointer"
                          style={{ accentColor: "#000000" }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Favorite Button - Desktop */}
            <div className="hidden md:block">
              <FavoriteButton station={station} size="icon" />
            </div>

            {/* Close Button */}
            {onClose && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-destructive font-medium flex-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
                className="h-7 text-xs border-destructive/30 hover:bg-destructive/10 text-destructive"
              >
                {isLoading ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />
    </div>
  );
}
