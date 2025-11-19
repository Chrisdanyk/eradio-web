"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { useState, useEffect, useRef } from "react";

interface Genre {
  name: string;
  image: string;
  alt: string;
}

const genres: Genre[] = [
  { name: "Jazz", image: "/jazz-radio.jpg", alt: "Jazz" },
  { name: "Rock", image: "/rock-radio.jpg", alt: "Rock" },
  { name: "Classical", image: "/classical-music-scene.png", alt: "Classical" },
  { name: "Electronic", image: "/rock-radio.jpg", alt: "Electronic" },
  { name: "Hip Hop", image: "/hiphop-radio.jpg", alt: "Hip Hop" },
  { name: "Country", image: "/country-music-scene.png", alt: "Country" },
  { name: "Latin", image: "/latin-music.jpg", alt: "Latin" },
  { name: "Blues", image: "/latin-music.jpg", alt: "Blues" },
];

export function DiscoverSection() {
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

  const handleGenreClick = () => {
    if (user) {
      router.push("/search");
    } else {
      router.push("/register");
    }
  };

  return (
    <section ref={sectionRef} id="discover" className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-balance leading-[1.05]">
            Every sound.
            <br />
            Every culture.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            From jazz in New York to classical in Vienna. Explore music without
            borders.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {genres.map((genre, index) => (
            <button
              key={index}
              onClick={handleGenreClick}
              className={`relative group overflow-hidden rounded-lg aspect-square cursor-pointer transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <img
                src={genre.image}
                alt={genre.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-all duration-500" />
              <p className="absolute bottom-3 left-3 text-base font-medium text-white group-hover:scale-105 transition-transform duration-300">
                {genre.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

