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
      default: "bg-white border border-gray-200",
      elevated: "bg-white shadow-lg",
      outlined: "bg-white border-2 border-gray-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6",
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

