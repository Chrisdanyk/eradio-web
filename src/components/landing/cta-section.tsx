"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { useState, useEffect, useRef } from "react";

export function CTASection() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (user) {
      router.push("/recommendations");
    } else {
      router.push("/register");
    }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2
          className={`text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-balance leading-[1.05] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          eRadio
        </h2>
        <p
          className={`text-xl sm:text-2xl text-muted-foreground transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          The future of radio listening.
        </p>
        <div
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button
            size="lg"
            variant="black"
            className="h-11 px-8 rounded-full hover:scale-105 transition-transform"
            onClick={handleClick}
          >
            {user ? "Browse Stations" : "Get Started"}
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>
    </section>
  );
}

