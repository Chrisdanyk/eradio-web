/**
 * Utility function to merge class names
 *
 * Similar to clsx or classnames, but simpler.
 * Used for conditional className merging.
 */

type ClassValue = string | number | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

