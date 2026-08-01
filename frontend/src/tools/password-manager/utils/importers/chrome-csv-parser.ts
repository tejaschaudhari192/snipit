import Papa from "papaparse";
import type { PasswordItem } from "../../types";
import type { ParsedImportItem } from "./types";

export function parseChromeCSV(rawCSV: string): ParsedImportItem[] {
	const parsed = Papa.parse<{
		name: string;
		url: string;
		username: string;
		password: string;
		note: string;
	}>(rawCSV.trim(), {
		header: true,
		skipEmptyLines: true});

	if (parsed.errors && parsed.errors.length > 0) {
		console.warn("Chrome CSV parse errors:", parsed.errors);
	}

	const results: ParsedImportItem[] = [];

	for (const row of parsed.data) {
		if (!row.name && !row.url) continue;

		const mapped: PasswordItem = {
			id: crypto.randomUUID(),
			title: row.name || new URL(row.url.startsWith("http") ? row.url : `https://${row.url}`).hostname || "Unknown",
			username: row.username,
			password: row.password,
			url: row.url,
			notes: row.note,
			itemType: "login",
			metadata: {},
			customFields: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		results.push({
			id: crypto.randomUUID(),
			sourceApp: "chrome",
			sourceFields: {
				title: row.name,
				url: row.url,
				username: row.username,
				password: row.password,
				notes: row.note,
			},
			mapped,
			isDuplicate: false,
			isSkipped: false});
	}

	return results;
}
