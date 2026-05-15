/**
 * Frontend Constants
 */

export const CONTENT_MODES = ["text", "code", "draw", "link", "file"] as const;
export const VISIBILITIES = ["public", "private", "shared"] as const;
export const EDIT_PERMISSIONS = ["owner", "shared", "public"] as const;
export const ROLES = ["viewer", "editor", "admin", "commenter"] as const;
export const ID_TYPES = ["system", "dynamic", "semantic"] as const;

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

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
	javascript: "js",
	typescript: "ts",
	python: "py",
	java: "java",
	c: "c",
	cpp: "cpp",
	csharp: "cs",
	go: "go",
	rust: "rs",
	php: "php",
	ruby: "rb",
	shell: "sh",
	bash: "sh",
	sql: "sql",
	html: "html",
	css: "css",
	json: "json",
	markdown: "md",
	yaml: "yaml",
	yml: "yaml",
	xml: "xml",
};

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

export const SUPPORTED_RUN_LANGUAGES = [
	"javascript",
	"python",
	"typescript",
	"php",
	"go",
	"java",
	"c",
	"cpp",
	"rust",
	"csharp",
	"shell",
	"bash",
];
