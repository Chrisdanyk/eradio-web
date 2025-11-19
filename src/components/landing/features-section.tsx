"use client";

import { Search, Heart, Music2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: <Search className="h-6 w-6 text-white" />,
    title: "Instant Search",
    description:
      "Find any station in milliseconds. Filter by genre, location, or language.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: <Heart className="h-6 w-6 text-white" />,
    title: "Your Favorites",
    description:
      "Save stations you love. Sync across all your devices seamlessly.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: <Music2 className="h-6 w-6 text-white" />,
    title: "Crystal Clear",
    description:
      "High-quality streaming meets intuitive design. Every station sounds incredible.",
    gradient: "from-green-500 to-green-600",
  },
];

export function FeaturesSection() {
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
    <section ref={sectionRef} className="container px-6 pb-20 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group space-y-4 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

