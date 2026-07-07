import type { PasteData } from "@/types";
import { localStore } from "@/utils/storage";

const KEYS = {
	HISTORY: "items",
	CREATED: "created_items",
	SAVED: "savedItems",
};

/**
 * Generic helper to get items from localStorage
 */
const getItems = (key: string): PasteData[] => {
	try {
		const stored = localStore.getItem(key);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error(`Failed to parse ${key} from localStorage`, error);
		return [];
	}
};

/**
 * Generic helper to save items to localStorage
 */
const setItems = (key: string, items: PasteData[]): void => {
	try {
		localStore.setItem(key, JSON.stringify(items));
	} catch (error) {
		console.error(`Failed to save ${key} to localStorage`, error);
	}
};

/**
 * Upserts a snippet into a specific list (moves to top)
 */
const upsertSnippet = (key: string, paste: PasteData): void => {
	const items = getItems(key);
	const filtered = items.filter((item) => item.id !== paste.id);
	setItems(key, [paste, ...filtered]);
};

/**
 * Guest Storage Utilities
 */
export const guestStorage = {
	// History (All accessed snippets)
	getHistory: () => getItems(KEYS.HISTORY),
	addToHistory: (paste: PasteData) => upsertSnippet(KEYS.HISTORY, paste),
	removeFromHistory: (id: string) => {
		const items = getItems(KEYS.HISTORY).filter((p) => p.id !== id);
		setItems(KEYS.HISTORY, items);
	},

	// Created (Authored by guest)
	getCreated: () => getItems(KEYS.CREATED),
	addCreated: (paste: PasteData) => upsertSnippet(KEYS.CREATED, paste),
	isCreated: (id: string) => getItems(KEYS.CREATED).some((p) => p.id === id),
	removeFromCreated: (id: string) => {
		const items = getItems(KEYS.CREATED).filter((p) => p.id !== id);
		setItems(KEYS.CREATED, items);
	},

	// Saved (Bookmarked by guest)
	getSaved: () => getItems(KEYS.SAVED),
	toggleSaved: (paste: PasteData): boolean => {
		const items = getItems(KEYS.SAVED);
		const index = items.findIndex((p) => p.id === paste.id);
		let saved = false;

		if (index > -1) {
			items.splice(index, 1);
		} else {
			items.unshift(paste);
			saved = true;
		}

		setItems(KEYS.SAVED, items);
		return saved;
	},
	removeFromSaved: (id: string) => {
		const items = getItems(KEYS.SAVED).filter((p) => p.id !== id);
		setItems(KEYS.SAVED, items);
	},

	// Global Cleanup
	removeSnippetEverywhere: (id: string) => {
		guestStorage.removeFromHistory(id);
		guestStorage.removeFromCreated(id);
		guestStorage.removeFromSaved(id);
	},
};
