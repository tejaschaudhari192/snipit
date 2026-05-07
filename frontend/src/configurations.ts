/**
 * Frontend Configuration Constants
 */

export const CONFIG = {
	// API Configuration
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

	// Supabase Configuration
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
	supabaseStorageBucket:
		import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "uploads",

	// Google Auth Configuration
	googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,

	// Storage Keys
	storageKeys: {
		fontSize: "snipit-font-size",
		language: "snipit-last-language",
		theme: "snipit-theme",
		history: "snipit-history",
		terminalPosition: "snipit-terminal-position",
		aiAutocomplete: "snipit-ai-autocomplete",
	},

	// Default Values
	defaults: {
		fontSize: 14,
		minFontSize: 8,
		maxFontSize: 48,
		language: "text",
		expiry: "1d",
		visibility: "public" as const,
		editPermission: "owner" as const,
		publicRole: "viewer" as const,
		contentMode: "text" as const,
		maxFileSize: 50 * 1024 * 1024, // 50MB
	},

	// UI Constants
	ui: {
		detectionDelay: 2000,
		toastDuration: 3000,
	},
};
