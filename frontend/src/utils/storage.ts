import type { PasteData } from "@/types";

/**
 * LocalStorage and Persistence utilities
 */

/**
 * Saves a paste to the local history
 */
export function saveToLocal(pasteData: PasteData) {
	const key = "items";
	const stored = localStorage.getItem(key);
	let items: Array<PasteData> = stored ? JSON.parse(stored) : [];

	items = items.filter((item: PasteData) => item.id !== pasteData.id);
	items.unshift(pasteData);

	localStorage.setItem(key, JSON.stringify(items));
}

/**
 * Saves a content draft for a specific mode/id
 */
export function saveDraft(mode: string, content: string, id?: string) {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	localStorage.setItem(key, content);
}

/**
 * Retrieves a content draft
 */
export function getDraft(mode: string, id?: string): string | null {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	return localStorage.getItem(key);
}

/**
 * Clears drafts for all modes
 */
export function clearDrafts(id?: string) {
	const modes = ["text", "code", "draw", "link", "file"];
	modes.forEach((mode) => {
		localStorage.removeItem(id ? `draft_${id}_${mode}` : `draft_${mode}`);
	});
}

/**
 * Generic storage helper for typed data
 */
export const storage = {
	get: <T>(key: string, defaultValue: T): T => {
		const stored = localStorage.getItem(key);
		if (!stored) return defaultValue;
		try {
			return JSON.parse(stored) as T;
		} catch {
			return defaultValue;
		}
	},
	set: <T>(key: string, value: T): void => {
		localStorage.setItem(key, JSON.stringify(value));
	},
	remove: (key: string): void => {
		localStorage.removeItem(key);
	},
};
