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

	// Storage Keys
	STORAGE_KEYS: {
		FONT_SIZE: "snipit-font-size",
		LANGUAGE: "snipit-last-language",
		THEME: "snipit-theme",
	},

	// Default Values
	DEFAULTS: {
		FONT_SIZE: 14,
		MIN_FONT_SIZE: 8,
		MAX_FONT_SIZE: 48,
		LANGUAGE: "javascript",
		EXPIRY: "1w",
		VISIBILITY: "public" as const,
		MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
	},

	// UI Constants
	UI: {
		DETECTION_DELAY: 2000,
		TOAST_DURATION: 3000,
	},
};

export const LANGUAGES = [
	{ name: "JavaScript", value: "javascript" },
	{ name: "TypeScript", value: "typescript" },
	{ name: "HTML", value: "html" },
	{ name: "CSS", value: "css" },
	{ name: "JSON", value: "json" },
	{ name: "Java", value: "java" },
	{ name: "Python", value: "python" },
	{ name: "C", value: "c" },
	{ name: "C++", value: "cpp" },
	{ name: "C#", value: "csharp" },
	{ name: "Go", value: "go" },
	{ name: "Rust", value: "rust" },
	{ name: "Markdown", value: "markdown" },
	{ name: "Shell", value: "shell" },
	{ name: "Other", value: "other" },
];
