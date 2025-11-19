import { Radio } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Radio className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">eRadio</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Copyright © 2025 eRadio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

