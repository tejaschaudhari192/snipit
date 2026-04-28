import type { PasteData, ContentMode } from "@/types";

/**
 * Content-related utilities for Snipit
 */

/**
 * Detects the content mode based on paste metadata
 */
export function detectContentMode(
	data: Pick<
		PasteData,
		"contentMode" | "redirectUrl" | "fileUrl" | "language"
	>,
): ContentMode {
	return (
		data.contentMode ??
		(data.redirectUrl
			? "link"
			: data.fileUrl
				? "file"
				: data.language !== "text"
					? "code"
					: "text")
	);
}

/**
 * Copy text to clipboard helper
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error("Failed to copy: ", err);
		return false;
	}
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
	if (bytes === null || bytes === undefined || bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Checks if a string is a valid Snipit Drawing JSON
 */
export function isSnipitDrawing(text: string): boolean {
	if (!text || !text.startsWith("{")) return false;
	try {
		const parsed = JSON.parse(text);
		return (
			parsed &&
			Array.isArray(parsed.elements) &&
			(parsed.appState || parsed.type === "excalidraw")
		);
	} catch {
		return false;
	}
}
