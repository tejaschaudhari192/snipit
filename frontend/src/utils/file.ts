/**
 * File related utilities
 */

/**
 * Sanitizes a filename by replacing non-alphanumeric characters with underscores
 */
export function sanitizeFileName(name: string): string {
	return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}
