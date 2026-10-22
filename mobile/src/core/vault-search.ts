import type { PasswordItem, Folder } from "./vault-storage";

/**
 * Normalizes a URL to its base domain and path segments for clean searching.
 */
function extractUrlKeywords(rawUrl?: string): string {
	if (!rawUrl) return "";
	try {
		const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
		return `${rawUrl} ${parsed.hostname} ${parsed.pathname}`.toLowerCase();
	} catch {
		return rawUrl.toLowerCase();
	}
}

/**
 * Calculates a relevance score for an item against search tokens.
 * Higher score = higher relevance in search results.
 * If any token does not match ANY field, returns 0 (item is excluded).
 */
export function scoreVaultItem(
	item: PasswordItem,
	tokens: string[],
	folderNameMap?: Map<string, string>,
): number {
	if (tokens.length === 0) return 1;

	const title = (item.title || "").toLowerCase();
	const username = (
		item.username ||
		item.metadata?.username ||
		item.metadata?.email ||
		item.metadata?.fullName ||
		""
	).toLowerCase();
	const urlKeywords = extractUrlKeywords(item.url || item.metadata?.url || item.metadata?.website);
	const notes = (item.notes || "").toLowerCase();

	const folderName =
		(item.folderId && folderNameMap?.get(item.folderId))?.toLowerCase() || "";

	// Metadata values (e.g. cardholderName, last 4 digits of card, api key id)
	const metaValues = item.metadata
		? Object.values(item.metadata).join(" ").toLowerCase()
		: "";

	// Custom fields (names and non-protected values)
	const customValues = item.customFields
		? item.customFields
				.map((f) => `${f.name} ${f.isProtected ? "" : f.value}`)
				.join(" ")
				.toLowerCase()
		: "";

	let totalScore = 0;

	// Check if every token matches AT LEAST ONE searchable field (AND logic)
	for (const token of tokens) {
		let tokenMatched = false;
		let tokenScore = 0;

		// 1. Title exact match or prefix
		if (title === token) {
			tokenScore += 1000;
			tokenMatched = true;
		} else if (title.startsWith(token)) {
			tokenScore += 500;
			tokenMatched = true;
		} else if (title.includes(` ${token}`)) {
			tokenScore += 350;
			tokenMatched = true;
		} else if (title.includes(token)) {
			tokenScore += 200;
			tokenMatched = true;
		}

		// 2. Username / Email match
		if (username === token) {
			tokenScore += 400;
			tokenMatched = true;
		} else if (username.startsWith(token)) {
			tokenScore += 250;
			tokenMatched = true;
		} else if (username.includes(token)) {
			tokenScore += 150;
			tokenMatched = true;
		}

		// 3. URL / Domain match
		if (urlKeywords.includes(token)) {
			tokenScore += 120;
			tokenMatched = true;
		}

		// 4. Folder name match
		if (folderName.includes(token)) {
			tokenScore += 80;
			tokenMatched = true;
		}

		// 5. Metadata fields (cardholder, API key id, etc.)
		if (metaValues.includes(token)) {
			tokenScore += 70;
			tokenMatched = true;
		}

		// 6. Custom fields match
		if (customValues.includes(token)) {
			tokenScore += 60;
			tokenMatched = true;
		}

		// 7. Notes match
		if (notes.includes(token)) {
			tokenScore += 30;
			tokenMatched = true;
		}

		// If a required token matched nowhere in this item, disqualify the item
		if (!tokenMatched) {
			return 0;
		}

		totalScore += tokenScore;
	}

	return totalScore;
}

/**
 * Industry-standard tokenized multi-field vault search with ranked scoring for Mobile.
 */
export function searchVaultItems(
	items: PasswordItem[],
	query: string,
	folders: Folder[] = [],
): PasswordItem[] {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) {
		return items;
	}

	const tokens = trimmed.split(/\s+/).filter(Boolean);
	if (tokens.length === 0) {
		return items;
	}

	const folderNameMap = new Map<string, string>();
	for (const f of folders) {
		if (f.id && f.name) {
			folderNameMap.set(f.id, f.name);
		}
	}

	const scored: { item: PasswordItem; score: number }[] = [];

	for (const item of items) {
		const score = scoreVaultItem(item, tokens, folderNameMap);
		if (score > 0) {
			scored.push({ item, score });
		}
	}

	// Sort descending by score, tie-breaker: most recent updated date
	scored.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		const dateA = a.item.updatedAt ? new Date(a.item.updatedAt).getTime() : 0;
		const dateB = b.item.updatedAt ? new Date(b.item.updatedAt).getTime() : 0;
		return dateB - dateA;
	});

	return scored.map((s) => s.item);
}
