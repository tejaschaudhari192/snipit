import type { PasswordItem } from "../../types";

export interface ParsedImportItem {
	id: string; // Temporary ID for the UI list
	sourceApp: "chrome" | "enpass";
	
	// Original fields extracted from the file
	sourceFields: {
		title?: string;
		username?: string;
		password?: string;
		url?: string;
		notes?: string;
		[key: string]: string | undefined;
	};
	sourceFolder?: string;
	
	// The mapped output
	mapped: PasswordItem;

	// Status flags
	isDuplicate: boolean;
	duplicateOfId?: string; // If duplicate, the ID of the existing vault item
	isSkipped: boolean; // e.g., trashed or archived in source
}

export type DuplicateStrategy = "ask" | "skip" | "overwrite" | "keep_both";
