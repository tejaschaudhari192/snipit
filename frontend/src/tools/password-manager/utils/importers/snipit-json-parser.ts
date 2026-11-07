import type { PasswordItem } from "../../types";
import type { ParsedImportItem } from "./types";
import type { SnipitExportData } from "../export-vault";

export function parseSnipitJSON(rawJSON: string): ParsedImportItem[] {
	let data: SnipitExportData | { items: PasswordItem[] } | PasswordItem[];
	try {
		data = JSON.parse(rawJSON);
	} catch (e) {
		console.error("Failed to parse Snipit JSON:", e);
		return [];
	}

	const rawItems: PasswordItem[] = Array.isArray(data)
		? data
		: Array.isArray(data.items)
			? data.items
			: [];

	const results: ParsedImportItem[] = [];

	for (const item of rawItems) {
		if (!item || typeof item !== "object") continue;
		// Accept items that have at least one meaningful field (mirrors mobile importer logic)
		if (!item.title && !item.username && !item.password && !item.notes)
			continue;

		const mapped: PasswordItem = {
			id:
				item.id ||
				`import_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
			// Fallback title: first 50 chars of notes, or generic label
			title:
				item.title ||
				(item.notes
					? String(item.notes).slice(0, 50)
					: "Imported Item"),
			username: item.username || "",
			password: item.password || "",
			url: item.url || "",
			notes: item.notes || "",
			isFavorite: !!item.isFavorite,
			folderId: item.folderId,
			// Mobile exports use "category"; web exports use "itemType" — support both
			itemType:
				("itemType" in item && typeof item.itemType === "string"
					? (item.itemType as PasswordItem["itemType"])
					: undefined) ||
				("category" in item && typeof item.category === "string"
					? (item.category as PasswordItem["itemType"])
					: undefined) ||
				"login",
			metadata: item.metadata || {},
			customFields: Array.isArray(item.customFields)
				? item.customFields
				: [],
			createdAt: item.createdAt || new Date().toISOString(),
			updatedAt: item.updatedAt || new Date().toISOString(),
		};

		results.push({
			id: mapped.id,
			sourceApp: "snipit",
			sourceFields: {
				title: mapped.title,
				username: mapped.username,
				password: mapped.password,
				url: mapped.url,
				notes: mapped.notes,
			},
			mapped,
			isDuplicate: false,
			isSkipped: false,
		});
	}

	return results;
}
