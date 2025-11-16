/**
 * Card Component
 *
 * Reusable card container component.
 *
 * SOLID: Single Responsibility - Only handles card rendering
 */

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-card text-card-foreground border",
      elevated: "bg-card text-card-foreground border shadow-sm",
      outlined: "bg-card text-card-foreground border-2",
    };

    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          "flex flex-col gap-6 rounded-xl py-6",
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export { Card };

