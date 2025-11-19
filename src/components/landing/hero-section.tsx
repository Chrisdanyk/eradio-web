"use client";

import { Sparkles, ArrowRight, Radio, Music2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (user) {
      router.push("/recommendations");
    } else {
      router.push("/register");
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      const featuresSection = document.getElementById("features");
      featuresSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="container px-6 py-20 sm:py-24 md:py-32 lg:py-40 relative overflow-hidden">
      <div className="mx-auto max-w-4xl text-center space-y-5">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs font-normal text-muted-foreground transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>The future of radio listening</span>
        </div>

        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-balance leading-[1.05] transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          eRadio
        </h1>

        <p
          className={`text-xl sm:text-2xl text-muted-foreground text-balance max-w-xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          World radio. In your pocket. Stream thousands of stations from every
          corner of the globe.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            size="lg"
            variant="black"
            className="text-base h-11 px-8 w-full sm:w-auto rounded-full hover:scale-105 transition-transform"
            onClick={handleGetStarted}
          >
            {user ? "Start Listening" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-base h-11 px-8 w-full sm:w-auto hover:scale-105 transition-transform"
            onClick={handleLearnMore}
          >
            Learn more
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="absolute top-10 right-20 opacity-[0.02] dark:opacity-[0.04]">
          <Radio className="h-40 w-40 text-foreground" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-[0.02] dark:opacity-[0.04]">
          <Music2 className="h-32 w-32 text-foreground" />
        </div>
      </div>
    </section>
  );
}
