/**
 * Radio Player Component
 *
 * HTML5 audio player for radio stations with drag functionality.
 *
 * SOLID: Single Responsibility - Only handles audio playback
 * Performance: Efficient state management, minimal re-renders
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Play, Pause, Volume2, VolumeX, X, GripVertical, Radio } from "lucide-react";
import type { RadioStation } from "~/lib/types/api.types";

interface RadioPlayerProps {
  station: RadioStation | null;
  onClose?: () => void;
}

export function RadioPlayer({ station, onClose }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dominantColors, setDominantColors] = useState<string[]>([]);

  // Extract dominant colors from image (Windows taskbar style)
  const extractColors = useCallback((image: HTMLImageElement) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Use larger canvas for better color accuracy
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(image, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // Collect all colors with their frequencies
      const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

      // Sample every 4th pixel for performance
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const a = data[i + 3]!;

        // Only process opaque pixels with reasonable brightness
        if (a > 200) {
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          // Filter out too dark or too light colors (like Windows does)
          if (brightness > 30 && brightness < 240) {
            // Quantize colors to reduce noise
            const qr = Math.floor(r / 8) * 8;
            const qg = Math.floor(g / 8) * 8;
            const qb = Math.floor(b / 8) * 8;
            const key = `${qr}-${qg}-${qb}`;

            if (colorBuckets.has(key)) {
              const existing = colorBuckets.get(key)!;
              existing.count++;
              existing.r = (existing.r + r) / 2;
              existing.g = (existing.g + g) / 2;
              existing.b = (existing.b + b) / 2;
            } else {
              colorBuckets.set(key, { r, g, b, count: 1 });
            }
          }
        }
      }

      // Get top 2 most frequent colors
      const sortedColors = Array.from(colorBuckets.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 2);

      const colors: string[] = [];

      if (sortedColors.length >= 2) {
        // Use the two most dominant colors
        const c1 = sortedColors[0]!;
        const c2 = sortedColors[1]!;
        colors.push(
          `${Math.round(c1.r)}, ${Math.round(c1.g)}, ${Math.round(c1.b)}`,
          `${Math.round(c2.r)}, ${Math.round(c2.g)}, ${Math.round(c2.b)}`
        );
      } else if (sortedColors.length === 1) {
        // Create a variation of the single color
        const color = sortedColors[0]!;
        colors.push(
          `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`,
          `${Math.round(color.r * 0.8)}, ${Math.round(color.g * 0.8)}, ${Math.round(color.b * 0.8)}`
        );
      } else {
        // Fallback to primary colors
        colors.push("0, 122, 255", "10, 132, 255");
      }

      setDominantColors(colors);
    } catch (err) {
      console.error("Color extraction failed:", err);
      setDominantColors(["0, 122, 255", "10, 132, 255"]);
    }
  }, []);

  // Load image and extract colors
  useEffect(() => {
    if (!station?.favicon) {
      setDominantColors(["0, 122, 255", "10, 132, 255"]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      extractColors(img);
    };
    img.onerror = () => {
      setDominantColors(["0, 122, 255", "10, 132, 255"]);
    };
    img.src = station.favicon;
  }, [station?.favicon, extractColors]);

  // Initialize position on mount
  useEffect(() => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 20,
        y: window.innerHeight - rect.height - 20,
      });
    }
  }, []);

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !playerRef.current) return;

    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const maxX = window.innerWidth - (playerRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (playerRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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

  // Update audio source when station changes
  useEffect(() => {
    if (!station || !audioRef.current) return;

    const streamUrl = station.urlResolved || station.url;

    if (!streamUrl) {
      setError("No stream URL available for this station");
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsPlaying(false);

    const audio = audioRef.current;
    audio.pause();
    audio.src = "";

    tryPlayStream(streamUrl).catch((err) => {
      console.error("Stream play error:", err);
    });
  }, [station, tryPlayStream]);

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

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
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
  }, []);

  // Retry function
  const handleRetry = useCallback(async () => {
    if (!station || !audioRef.current) return;

    const streamUrl = station.urlResolved || station.url;
    if (!streamUrl) return;

    setError(null);
    setIsLoading(true);
    await tryPlayStream(streamUrl);
  }, [station, tryPlayStream]);

  if (!station) {
    return null;
  }

  // Create beautiful gradient background from image colors (Windows taskbar style)
  // Use light white background with degraded image colors
  const gradientStyle = dominantColors.length >= 2
    ? {
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 255, 255, 0.95) 100%),
                     linear-gradient(135deg, rgba(${dominantColors[0]}, 0.15) 0%, rgba(${dominantColors[1]}, 0.20) 50%, rgba(${dominantColors[0]}, 0.15) 100%)`,
      borderColor: `rgba(${dominantColors[0]}, 0.3)`,
      boxShadow: `0 20px 40px -10px rgba(${dominantColors[0]}, 0.2), 0 0 0 1px rgba(${dominantColors[0]}, 0.25)`,
    }
    : {
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 255, 255, 0.95) 100%)`,
    };

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 w-96 backdrop-blur-xl border-2 rounded-2xl shadow-2xl transition-all duration-500 ${isDragging ? "cursor-grabbing" : "cursor-default"
        }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        ...gradientStyle,
      }}
    >
      {/* Drag Handle */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className="flex items-center justify-end p-4 border-b border-border/30 cursor-grab active:cursor-grabbing"
      >
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-6">
        {/* Station Info with Large Image */}
        <div className="mb-6">
          <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4 shadow-lg">
            {station.favicon ? (
              <img
                ref={imageRef}
                src={station.favicon}
                alt={station.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Radio className="w-16 h-16 text-primary" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-lg truncate text-gray-900 mb-1">{station.name}</h4>
            <p className="text-sm text-gray-600 truncate">
              {station.genre || station.country || "Radio Station"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800 font-medium mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full h-8 text-xs border-red-300 hover:bg-red-100 text-red-800"
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
              size="lg"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-white" />
              ) : (
                <Play className="w-6 h-6 fill-current text-white ml-0.5" />
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="h-9 w-9 flex-shrink-0 text-gray-700 hover:bg-gray-100"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(0, 122, 255) 0%, rgb(0, 122, 255) ${(isMuted ? 0 : volume) * 100}%, rgb(229, 231, 235) ${(isMuted ? 0 : volume) * 100}%, rgb(229, 231, 235) 100%)`,
              }}
            />
            <span className="text-xs text-gray-700 font-medium w-10 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            <span>LIVE</span>
          </div>
        </div>
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
