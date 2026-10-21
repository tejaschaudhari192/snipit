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
		if (!item || typeof item !== "object" || !item.title) continue;

		const mapped: PasswordItem = {
			id:
				item.id ||
				`import_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
			title: item.title || "Untitled",
			username: item.username || "",
			password: item.password || "",
			url: item.url || "",
			notes: item.notes || "",
			isFavorite: !!item.isFavorite,
			folderId: item.folderId,
			itemType: item.itemType || "login",
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
