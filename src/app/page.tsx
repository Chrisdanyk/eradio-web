"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/search");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-16">
      <div className="container flex flex-col items-center justify-center gap-12 text-center">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-[5rem]">
            E<span className="text-blue-600">-Radio</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Discover and listen to radio stations from around the world
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">
          <div className="rounded-xl bg-white/80 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900">🎵 Search</h3>
            <p className="mt-2 text-gray-600">
              Find radio stations by name, country, or language
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900">❤️ Favorites</h3>
            <p className="mt-2 text-gray-600">
              Save your favorite stations for quick access
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900">🌍 Global</h3>
            <p className="mt-2 text-gray-600">
              Listen to stations from anywhere in the world
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
