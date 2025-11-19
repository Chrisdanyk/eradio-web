"use client";

import { Radio, Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center">
            <Radio className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            eRadio
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#discover"
            className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            Discover
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/recommendations">
                <Button variant="ghost" size="sm">
                  Browse
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="black" className="rounded-full">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container px-6 py-4 space-y-2">
            <Link
              href="#features"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#discover"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <Link
                  href="/recommendations"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Browse
                  </Button>
                </Link>
                <Link
                  href="/profile"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Sign in
                  </Button>
                </Link>
                <Link
                  href="/register"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button size="sm" variant="black" className="w-full rounded-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

