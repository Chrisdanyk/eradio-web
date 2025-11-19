"use client";

import { Sparkles, Brain, Zap, Radio, MapPin, Activity, Heart, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { useState, useEffect } from "react";
import Skeleton from "~/components/ui/skeleton";

const demoStations = [
  {
    name: "Jazz Lounge Radio",
    country: "United States",
    language: "English",
    bitrate: 128,
    favicon: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Classical Symphony",
    country: "Austria",
    language: "German",
    bitrate: 192,
    favicon: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Electronic Vibes",
    country: "United Kingdom",
    language: "English",
    bitrate: 128,
    favicon: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop&q=80",
  },
];

export function AISuggestionsSection() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    // Show skeleton for 2 seconds, then show data
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/recommendations");
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div
            className={`space-y-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-normal text-primary">
              <Brain className="h-3 w-3" />
              <span>AI-Powered</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
              Discover your next favorite station
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Our AI analyzes your listening preferences and suggests stations
              tailored just for you. Find new music that matches your taste.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Personalized Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get station suggestions based on your favorite genres and listening history.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Find new stations in seconds. No endless scrolling needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                variant="black"
                className="h-11 px-8 rounded-full"
                onClick={handleGetStarted}
              >
                {user ? "View Recommendations" : "Get Started"}
              </Button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
          >
            <div className="space-y-2">
              {demoStations.map((station, index) => (
                <div
                  key={index}
                  className="group relative bg-card border rounded-xl p-4 transition-all duration-500 pointer-events-none"
                  style={{
                    animation: showSkeleton
                      ? undefined
                      : `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {showSkeleton ? (
                    <div className="flex items-center gap-4">
                      <Skeleton height={60} width={60} borderRadius="0.5rem" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton height={20} width="70%" borderRadius="0.375rem" />
                        <Skeleton height={16} width="50%" borderRadius="0.375rem" />
                      </div>
                      <Skeleton height={32} width={32} circle />
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shadow-sm ring-1 ring-border">
                            {station.favicon ? (
                              <img
                                src={station.favicon}
                                alt={station.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : null}
                            {!station.favicon && (
                              <div className="w-full h-full flex items-center justify-center">
                                <Radio className="w-8 h-8 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background animate-pulse" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors truncate">
                            {station.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{station.country}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-muted text-xs font-medium">
                                {station.language}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span className="font-medium">{station.bitrate} kbps</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center border border-border">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="h-9 w-9 rounded-full shadow-md bg-primary flex items-center justify-center">
                            <Play className="h-4 w-4 fill-current text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

