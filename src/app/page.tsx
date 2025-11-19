"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Radio, Heart, Play, Search, Globe, ArrowRight, Waves, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recommendations");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Radio className="w-5 h-5 text-primary" />
            <span>eRadio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#discover" className="text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
            {user && (
              <Link href="/recommendations" className="text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
                e.preventDefault();
                router.push("/recommendations");
              }}>
                Browse
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-sm"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-sm bg-primary hover:bg-primary/90"
                  onClick={() => router.push("/recommendations")}
                >
                  Listen Now
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 text-sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-8 text-sm bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="pt-28 pb-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tight mb-4 text-balance leading-[0.95]">
            eRadio
          </h1>

          <p className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground mb-3 font-normal">
            World radio. In your pocket.
          </p>

          <p className="text-base sm:text-lg text-muted-foreground/70 mb-8">
            Available now
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <>
                <Button
                  size="lg"
                  className="h-11 px-6 bg-primary hover:bg-primary/90 text-[15px] rounded-full font-normal"
                  onClick={() => router.push("/recommendations")}
                >
                  Start Listening
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-11 px-6 text-[15px] text-primary rounded-full font-normal hover:bg-transparent"
                  onClick={() => router.push("/favorites")}
                >
                  My Favorites <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="h-11 px-6 bg-primary hover:bg-primary/90 text-[15px] rounded-full font-normal">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="ghost" className="h-11 px-6 text-[15px] text-primary rounded-full font-normal hover:bg-transparent">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="relative rounded-[2.5rem] overflow-hidden">
              <img
                src="/modern-sleek-radio-app-interface-with-dark-theme--.jpg"
                alt="eRadio App Interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="/beautiful-radio-player-interface-close-up-with-ele.jpg"
                alt="Radio Player Close-up"
                className="w-full h-auto rounded-3xl"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-balance leading-tight">
                Crystal clear sound
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                High-quality streaming meets intuitive design. Every station sounds incredible.
              </p>
              <div className="flex items-center gap-3 text-primary pt-4">
                <Waves className="w-6 h-6" />
                <span className="text-lg">Premium audio quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-balance leading-tight">
                Your favorites. Always ready.
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                Save stations you love. Pick up right where you left off on any device.
              </p>
              <div className="flex items-center gap-3 text-primary pt-4">
                <Heart className="w-6 h-6" />
                <span className="text-lg">Seamless sync across devices</span>
              </div>
            </div>
            <div>
              <img
                src="/favorites-screen-with-saved-radio-stations--elegan.jpg"
                alt="Favorites Collection"
                className="w-full h-auto rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mb-4">
              Why eRadio
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground">
              Designed to be the best radio experience ever.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background/60 backdrop-blur-xl rounded-[2rem] p-10 border border-border/50 hover-lift hover:border-primary/30 transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Instant Search</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Find any station in milliseconds. Filter by genre, location, or language.
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur-xl rounded-[2rem] p-10 border border-border/50 hover-lift hover:border-primary/30 transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Smart Discovery</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Explore curated collections and discover stations tailored to your taste.
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur-xl rounded-[2rem] p-10 border border-border/50 hover-lift hover:border-primary/30 transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Global Reach</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Thousands of stations from every corner of the world at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mb-6 text-balance leading-tight">
              Every sound.
              <br />
              Every culture.
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              From jazz in New York to classical in Vienna. Explore music without borders.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/jazz-radio.jpg"
                alt="Jazz"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Jazz</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/rock-radio.jpg"
                alt="Rock"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Rock</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/classical-music-scene.png"
                alt="Classical"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Classical</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/rock-radio.jpg"
                alt="Electronic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Electronic</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/hiphop-radio.jpg"
                alt="Hip Hop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Hip Hop</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/country-music-scene.png"
                alt="Country"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Country</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/latin-music.jpg"
                alt="Latin"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Latin</p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-square">
              <img
                src="/latin-music.jpg"
                alt="Blues"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-6 left-6 text-2xl font-semibold text-white">Blues</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight mb-6 text-balance leading-[0.95]">
            eRadio
          </h2>
          <p className="text-2xl sm:text-3xl text-muted-foreground mb-12">
            The future of radio listening.
          </p>
          <Button
            size="lg"
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-base rounded-full font-normal"
            onClick={() => router.push(user ? '/recommendations' : '/register')}
          >
            {user ? 'Browse Stations' : 'Get Started'}
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              <span className="text-base">eRadio</span>
            </div>
            <p>Copyright © 2025 eRadio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
