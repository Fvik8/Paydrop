import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes with clsx for cleaner component class management.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
