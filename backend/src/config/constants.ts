export const CONTENT_MODES = [
	"text",
	"code",
	"link",
	"file",
	"draw",
	"video",
] as const;
export const VISIBILITIES = ["public", "private", "shared"] as const;
export const EDIT_PERMISSIONS = ["owner", "shared", "public"] as const;
export const ROLES = ["viewer", "editor", "admin", "commenter"] as const;
export const ID_TYPES = ["system", "dynamic", "semantic"] as const;

export type ContentMode = (typeof CONTENT_MODES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type EditPermission = (typeof EDIT_PERMISSIONS)[number];
export type Role = (typeof ROLES)[number];
export type IdType = (typeof ID_TYPES)[number];

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

export const VALID_LANGUAGES = [
	"javascript",
	"typescript",
	"html",
	"css",
	"json",
	"java",
	"python",
	"c",
	"cpp",
	"csharp",
	"go",
	"rust",
	"markdown",
	"shell",
	"bash",
	"text",
	"other",
];
