"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { usePlayerStore } from "~/lib/store/player-store";
import { Header } from "~/components/landing/header";
import { HeroSection } from "~/components/landing/hero-section";
import { FeaturesSection } from "~/components/landing/features-section";
import { ContentSection } from "~/components/landing/content-section";
import { DiscoverSection } from "~/components/landing/discover-section";
import { AISuggestionsSection } from "~/components/landing/ai-suggestions-section";
import { CTASection } from "~/components/landing/cta-section";
import { Footer } from "~/components/landing/footer";
import { Waves, Heart } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, initialize } = useAuthStore();
  const { stopAudio } = usePlayerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    stopAudio();
  }, [stopAudio]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recommendations");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <Header />

      <HeroSection />

      <FeaturesSection />

      <AISuggestionsSection />

      <ContentSection
        title="Crystal clear sound"
        description="High-quality streaming meets intuitive design. Every station sounds incredible."
        image="/beautiful-radio-player-interface-close-up-with-ele.jpg"
        imageAlt="Radio Player Close-up"
        icon={Waves}
        iconLabel="Premium audio quality"
        reverse={false}
      />

      <ContentSection
        title="Your favorites. Always ready."
        description="Save stations you love. Pick up right where you left off on any device."
        image="/favorites-screen-with-saved-radio-stations--elegan.jpg"
        imageAlt="Favorites Collection"
        icon={Heart}
        iconLabel="Seamless sync across devices"
        reverse={true}
      />

      <section id="features" className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4 leading-[1.05]">
              Why eRadio
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Designed to be the best radio experience ever.
            </p>
          </div>
        </div>
      </section>

      <DiscoverSection />

      <CTASection />

      <Footer />
    </div>
  );
}
