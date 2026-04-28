import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 * Optimized for Tailwind CSS class conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
