import type { PasswordItem, Folder } from "../types";

export interface SnipitExportData {
	version: "1.0";
	generator: "snipit-password-manager";
	exportedAt: string;
	folders: Array<{
		id: string;
		name: string;
		color?: string;
		iconName?: string;
	}>;
	items: PasswordItem[];
}

/**
 * Creates the JSON export string for the given vault items and folders.
 */
export function generateVaultExportJson(
	items: PasswordItem[],
	folders: Folder[] = [],
): string {
	const exportData: SnipitExportData = {
		version: "1.0",
		generator: "snipit-password-manager",
		exportedAt: new Date().toISOString(),
		folders: folders.map((f) => ({
			id: f.id,
			name: f.name,
			color: f.color,
			iconName: f.iconName,
		})),
		items: items.map((item) => ({
			id: item.id,
			title: item.title,
			username: item.username,
			password: item.password,
			url: item.url,
			notes: item.notes,
			isFavorite: item.isFavorite,
			folderId: item.folderId,
			itemType: item.itemType,
			metadata: item.metadata,
			customFields: item.customFields,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		})),
	};

	return JSON.stringify(exportData, null, 2);
}

/**
 * Triggers a browser file download of the JSON export.
 */
export function downloadVaultExportJson(
	items: PasswordItem[],
	folders: Folder[] = [],
	filenamePrefix: string = "snipit-vault",
): void {
	const jsonString = generateVaultExportJson(items, folders);
	const blob = new Blob([jsonString], {
		type: "application/json;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const dateStr = new Date().toISOString().split("T")[0];
	const filename = `${filenamePrefix}-${dateStr}.json`;

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
