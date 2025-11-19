/**
 * Navbar Component
 *
 * Reusable navigation bar component for authenticated pages.
 * Displays navigation links, user profile, and logout functionality.
 *
 * SOLID: Single Responsibility - Only handles navigation UI
 */

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Radio, User } from "lucide-react";
import { useAuthStore } from "~/lib/store/auth-store";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

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
          <Link
            href="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all ring-2 ring-primary/20 group-hover:ring-primary/40">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {user?.username}
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="h-9 text-foreground/80 hover:text-foreground">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

