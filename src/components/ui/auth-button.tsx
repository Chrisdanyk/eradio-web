/**
 * Action Button Component
 *
 * Reusable action button component with common styling patterns.
 * Can be used for forms, CTAs, and other actions throughout the app.
 *
 * SOLID: Single Responsibility - Only handles action button rendering
 */

import { Button, type ButtonProps } from "./button";
import { cn } from "~/lib/utils/cn";

export interface ActionButtonProps
  extends Omit<ButtonProps, "variant" | "size"> {
  /**
   * Button variant - defaults to "black" for prominent actions
   */
  variant?: ButtonProps["variant"];
  /**
   * Button size - defaults to "lg" for action buttons
   */
  size?: ButtonProps["size"];
  /**
   * Full width button - defaults to true
   */
  fullWidth?: boolean;
  /**
   * Rounded corners style - defaults to "xl" for modern look
   */
  rounded?: "md" | "lg" | "xl" | "full";
}

export function ActionButton({
  className,
  variant = "black",
  size = "lg",
  fullWidth = true,
  rounded = "xl",
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const roundedClasses = {
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <Button
      variant={variant}
      size={size}
      isLoading={isLoading}
      loadingText={loadingText as string | undefined}
      className={cn(
        fullWidth && "w-full",
        roundedClasses[rounded],
        "text-base font-semibold",
        className,
      )}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {children}
    </Button>
  );
}

