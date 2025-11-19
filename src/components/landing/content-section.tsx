"use client";

import type { LucideIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ContentSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  iconLabel: string;
  reverse?: boolean;
}

export function ContentSection({
  title,
  description,
  image,
  imageAlt,
  icon: Icon,
  iconLabel,
  reverse = false,
}: ContentSectionProps) {
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

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div
            className={`order-2 ${reverse ? "lg:order-1" : "lg:order-2"} transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : reverse
                  ? "opacity-0 -translate-x-10"
                  : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative group">
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-auto rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
          <div
            className={`order-1 ${reverse ? "lg:order-2" : "lg:order-1"} space-y-5 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : reverse
                  ? "opacity-0 translate-x-10"
                  : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground pt-2">
              <Icon className="w-4 h-4" />
              <span className="text-sm">{iconLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

