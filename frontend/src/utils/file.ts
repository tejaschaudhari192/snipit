/**
 * File related utilities
 */

/**
 * Sanitizes a filename by replacing non-alphanumeric characters with underscores
 */
export function sanitizeFileName(name: string): string {
	return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(filename: string): string {
	return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Checks if a file is an image based on its mime type or extension
 */
export function isImageFile(
	mimeType: string | null,
	filename?: string,
): boolean {
	if (mimeType?.startsWith("image/")) return true;
	if (filename) {
		const ext = getFileExtension(filename).toLowerCase();
		return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
	}
	return false;
}
