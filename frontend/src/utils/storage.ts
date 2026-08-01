/**
 * LocalStorage and Persistence utilities
 */

/**
 * Saves a content draft for a specific mode/id
 */
export function saveDraft(mode: string, content: string, id?: string) {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	localStore.setItem(key, content);
}

/**
 * Retrieves a content draft
 */
export function getDraft(mode: string, id?: string): string | null {
	const key = id ? `draft_${id}_${mode}` : `draft_${mode}`;
	return localStore.getItem(key);
}

/**
 * Clears drafts for all modes
 */
export function clearDrafts(id?: string) {
	const modes = ["text", "code", "draw", "link", "file"];
	modes.forEach((mode) => {
		localStore.removeItem(id ? `draft_${id}_${mode}` : `draft_${mode}`);
	});
}

/**
 * Safe, direct string-based local storage wrapper
 */
export const localStore = {
	getItem: (key: string): string | null => {
		try {
			return typeof window !== "undefined"
				? window.localStorage.getItem(key)
				: null;
		} catch (e) {
			console.warn(
				`[localStore] Failed to get item for key "${key}":`,
				e,
			);
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("snipit-storage-error", {
						detail: { code: "access_denied" },
					}),
				);
			}
			return null;
		}
	},
	setItem: (key: string, value: string): void => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, value);
			}
		} catch (e) {
			console.warn(
				`[localStore] Failed to set item for key "${key}":`,
				e,
			);
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("snipit-storage-error", {
						detail: { code: "save_failed" },
					}),
				);
			}
		}
	},
	removeItem: (key: string): void => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(key);
			}
		} catch (e) {
			console.warn(
				`[localStore] Failed to remove item for key "${key}":`,
				e,
			);
		}
	},
};

/**
 * Generic storage helper for JSON typed data
 */
export const storage = {
	get: <T>(key: string, defaultValue: T): T => {
		const stored = localStore.getItem(key);
		if (!stored) return defaultValue;
		try {
			return JSON.parse(stored) as T;
		} catch {
			return defaultValue;
		}
	},
	set: <T>(key: string, value: T): void => {
		localStore.setItem(key, JSON.stringify(value));
	},
	remove: (key: string): void => {
		localStore.removeItem(key);
	},
};
