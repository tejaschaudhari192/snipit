/**
 * Frontend Configuration Constants
 */

export const CONFIG = {
	// API Configuration
	API_BASE_URL: import.meta.env.VITE_API_BASE_URL,

	// Supabase Configuration
	SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
	SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
	SUPABASE_STORAGE_BUCKET:
		import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "uploads",

	// Google Auth Configuration
	GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,

	// Storage Keys
	STORAGE_KEYS: {
		FONT_SIZE: "snipit-font-size",
		LANGUAGE: "snipit-last-language",
		THEME: "snipit-theme",
		HISTORY: "snipit-history",
		TERMINAL_POSITION: "snipit-terminal-position",
	},

	// Default Values
	DEFAULTS: {
		FONT_SIZE: 14,
		MIN_FONT_SIZE: 8,
		MAX_FONT_SIZE: 48,
		LANGUAGE: "text",
		EXPIRY: "1d",
		VISIBILITY: "public" as const,
		EDIT_PERMISSION: "owner" as const,
		PUBLIC_ROLE: "viewer" as const,
		CONTENT_MODE: "text" as const,
		MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
	},

	// UI Constants
	UI: {
		DETECTION_DELAY: 2000,
		TOAST_DURATION: 3000,
	},
};
