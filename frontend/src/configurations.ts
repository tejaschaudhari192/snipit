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
		HISTORY: "snipit-history",
	},

	// Default Values
	DEFAULTS: {
		FONT_SIZE: 14,
		MIN_FONT_SIZE: 8,
		MAX_FONT_SIZE: 48,
		LANGUAGE: "javascript",
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

export const CONTENT_MODES = ["text", "code", "draw", "link", "file"] as const;
export const VISIBILITIES = ["public", "private", "shared"] as const;
export const EDIT_PERMISSIONS = ["owner", "shared", "public"] as const;
export const ROLES = ["viewer", "editor", "admin", "commenter"] as const;

export const LANGUAGES = [
	{ name: "Plain Text", value: "text" },
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

export const FILE_EXTENSIONS = {
	ARCHIVE: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"],
	CODE: [
		"js",
		"ts",
		"jsx",
		"tsx",
		"py",
		"java",
		"c",
		"cpp",
		"cs",
		"html",
		"css",
		"json",
		"md",
		"sh",
		"rs",
		"go",
		"php",
		"rb",
		"sql",
		"yaml",
		"yml",
		"xml",
	],
	TEXT: [
		"txt",
		"doc",
		"docx",
		"rtf",
		"odt",
		"xls",
		"xlsx",
		"ppt",
		"pptx",
		"csv",
	],
	EXEC: ["exe", "msi", "bin", "apk", "dmg", "app", "bat", "cmd"],
};

export const ADJECTIVES = [
	"Anonymous",
	"Secret",
	"Hidden",
	"Silent",
	"Mysterious",
	"Ghostly",
	"Shadowy",
	"Invisible",
	"Stealthy",
];

export const ANIMALS = [
	"Panda",
	"Tiger",
	"Fox",
	"Wolf",
	"Owl",
	"Bear",
	"Cat",
	"Dog",
	"Rabbit",
	"Dragon",
	"Phoenix",
];

export const COLLABORATOR_COLORS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#84cc16",
	"#22c55e",
	"#10b981",
	"#06b6d4",
	"#0ea5e9",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#d946ef",
	"#f43f5e",
];
