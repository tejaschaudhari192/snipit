import type { PasswordItem } from "../../types";
import type { ParsedImportItem } from "./types";

/**
 * Normalizes a parsed item and flags potential duplicates against the existing vault items.
 */
export function normalizeImportItem(
	item: ParsedImportItem,
	existingItems: PasswordItem[],
): ParsedImportItem {
	const mapped = item.mapped;

	// Normalize URL
	if (
		mapped.url &&
		!mapped.url.startsWith("http://") &&
		!mapped.url.startsWith("https://")
	) {
		mapped.url = `https://${mapped.url}`;
	}

	if (
		mapped.metadata?.url &&
		!mapped.metadata.url.startsWith("http://") &&
		!mapped.metadata.url.startsWith("https://")
	) {
		mapped.metadata.url = `https://${mapped.metadata.url}`;
	}

	if (
		mapped.metadata?.website &&
		!mapped.metadata.website.startsWith("http://") &&
		!mapped.metadata.website.startsWith("https://")
	) {
		mapped.metadata.website = `https://${mapped.metadata.website}`;
	}

	// Basic trim
	mapped.title = mapped.title.trim();
	if (mapped.username) mapped.username = mapped.username.trim();

	// Check for duplicates
	// Simple duplicate heuristic: Same title, and (same username or same URL)
	const duplicate = existingItems.find((existing) => {
		const sameTitle =
			existing.title.toLowerCase() === mapped.title.toLowerCase();

		const existingDomain = extractDomain(
			existing.url ||
				existing.metadata?.url ||
				existing.metadata?.website,
		);
		const newDomain = extractDomain(
			mapped.url || mapped.metadata?.url || mapped.metadata?.website,
		);

		const sameUrl =
			existingDomain && newDomain && existingDomain === newDomain;
		const sameUsername =
			existing.username &&
			mapped.username &&
			existing.username.toLowerCase() === mapped.username.toLowerCase();

		return sameTitle && (sameUrl || sameUsername);
	});

	if (duplicate) {
		item.isDuplicate = true;
		item.duplicateOfId = duplicate.id;
	}

	return item;
}

function extractDomain(url?: string): string | null {
	if (!url) return null;
	try {
		// handle just domains being passed in (e.g. twitter.com)
		const withProtocol = url.startsWith("http") ? url : `https://${url}`;
		return new URL(withProtocol).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}
