import type { PasswordItem, CustomField } from "../../types";
import type { ParsedImportItem } from "./types";

interface EnpassField {
	label: string;
	type: string;
	value: string;
	sensitive?: number;
}

interface EnpassItem {
	title: string;
	subtitle: string;
	note: string;
	category: string;
	trashed: number;
	archived: number;
	fields: EnpassField[];
	folders?: string[]; // Folder UUIDs
}

interface EnpassJSON {
	folders?: { uuid: string; title: string }[];
	items: EnpassItem[];
}

export function parseEnpassJSON(rawJSON: string): ParsedImportItem[] {
	let data: EnpassJSON;
	try {
		data = JSON.parse(rawJSON);
	} catch (e) {
		console.error("Failed to parse Enpass JSON:", e);
		return [];
	}

	const results: ParsedImportItem[] = [];
	const folderMap = new Map<string, string>();

	if (data.folders) {
		for (const folder of data.folders) {
			folderMap.set(folder.uuid, folder.title);
		}
	}

	for (const item of data.items) {
		const isSkipped = item.trashed === 1 || item.archived === 1;

		let username = "";
		let password = "";
		let url = "";
		const customFields: CustomField[] = [];
		const metadata: Record<string, string> = {};

		const sourceFields: Record<string, string> = {
			title: item.title,
			notes: item.note,
		};

		// Extract fields based on type and label
		for (const field of item.fields) {
			if (!field.value) continue;

			sourceFields[field.label || field.type] = field.value;

			if (field.type === "username" || field.type === "email") {
				if (!username) {
					username = field.value;
				} else if (field.type === "username") {
					// Prefer username type over email
					username = field.value;
				}
			} else if (
				field.type === "password" ||
				field.type === "ccTxnpassword" ||
				field.type === "ccPin" ||
				field.type === "ccCvc"
			) {
				if (!password && field.type === "password") {
					password = field.value;
				} else {
					// Put other sensitive fields into custom fields
					customFields.push({
						id: crypto.randomUUID(),
						name: field.label || field.type,
						value: field.value,
						type: "password",
						isProtected: true,
					});
				}
			} else if (field.type === "url") {
				if (!url) url = field.value;
			} else if (field.type === "totp") {
				customFields.push({
					id: crypto.randomUUID(),
					name: field.label || "TOTP",
					value: field.value,
					type: "text",
				});
			} else if (field.type === "phone") {
				customFields.push({
					id: crypto.randomUUID(),
					name: field.label || "Phone",
					value: field.value,
					type: "tel",
				});
			} else if (field.type !== "section") {
				// Dump rest into metadata or custom fields
				customFields.push({
					id: crypto.randomUUID(),
					name: field.label || field.type,
					value: field.value,
					type: field.sensitive === 1 ? "password" : "text",
					isProtected: field.sensitive === 1,
				});
			}
		}

		// Map Enpass category to Snipit item type
		let itemType: PasswordItem["itemType"] = "other";
		if (item.category === "login") itemType = "login";
		else if (item.category === "creditcard" || item.category === "finance")
			itemType = "card";
		else if (item.category === "securenote") itemType = "note";

		// Resolve folder
		let sourceFolder = "";
		if (item.folders && item.folders.length > 0) {
			sourceFolder = folderMap.get(item.folders[0]) || "";
		}

		const mapped: PasswordItem = {
			id: crypto.randomUUID(),
			title: item.title || "Unknown",
			username,
			password,
			url,
			notes: item.note,
			itemType,
			metadata,
			customFields,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		results.push({
			id: crypto.randomUUID(),
			sourceApp: "enpass",
			sourceFields,
			sourceFolder,
			mapped,
			isDuplicate: false,
			isSkipped,
		});
	}

	return results;
}
