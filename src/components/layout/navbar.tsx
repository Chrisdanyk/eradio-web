"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Radio } from "lucide-react";
import { useAuthStore } from "~/lib/store/auth-store";
import { authApi } from "~/lib/api/auth.api";
import type { UserProfileResponse } from "~/lib/types/api.types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setProfile(data);
      } catch (error) {
        // Silently fail - will use username initials as fallback
      }
    };
    if (user) {
      void loadProfile();
    }
  }, [user]);

  const getInitials = () => {
    if (profile?.fullName) {
      const names = profile.fullName.trim().split(/\s+/);
      if (names.length >= 2) {
        return (names[0]![0] + names[names.length - 1]![0]).toUpperCase();
      }
      return profile.fullName.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getLinkClassName = (path: string) => {
    const baseClasses = "text-sm font-medium transition-colors px-3 py-1.5 rounded-md";
    if (isActive(path)) {
      return `${baseClasses} text-primary bg-primary/10`;
    }
    return `${baseClasses} text-foreground/70 hover:text-foreground hover:bg-muted/50`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/recommendations" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Radio className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground">eRadio</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/recommendations" className={getLinkClassName("/recommendations")}>
              Recommendations
            </Link>
            <Link href="/search" className={getLinkClassName("/search")}>
              Search
            </Link>
            <Link href="/favorites" className={getLinkClassName("/favorites")}>
              Favorites
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all ring-2 ring-primary/20 group-hover:ring-primary/40">
              <span className="text-sm font-semibold text-primary">
                {getInitials()}
              </span>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="h-9 text-foreground/80 hover:text-foreground">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

