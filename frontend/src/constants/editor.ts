/**
 * Editor Modes, Access Control and Layout Constants
 */
import {
	FileText,
	Code2,
	Link,
	FileUp,
	Paintbrush,
	EyeOff,
	Layout,
	Eye,
	Pencil,
	Shield,
	MessageSquare,
	Globe,
	Lock,
	Users,
	Clock,
} from "lucide-react";

export const CONTENT_MODES = [
	"text",
	"docs",
	"code",
	"draw",
	"link",
	"file",
] as const;

export const VISIBILITIES = ["public", "private", "shared"] as const;
export const VISIBILITY_OPTIONS = [
	{ value: "public", labelKey: "common.access.public", icon: Globe },
	{ value: "restricted", labelKey: "common.access.restricted", icon: Lock },
	{ value: "shared", labelKey: "common.access.shared", icon: Users },
] as const;

export const EDIT_PERMISSIONS = ["owner", "shared", "public"] as const;

export const ROLES = ["viewer", "editor", "admin", "commenter"] as const;
export const ROLE_OPTIONS = [
	{ value: "viewer", labelKey: "common.access.viewer", icon: Eye },
	{ value: "editor", labelKey: "common.access.editor", icon: Pencil },
	{ value: "admin", labelKey: "common.access.admin", icon: Shield },
	{
		value: "commenter",
		labelKey: "common.access.commenter",
		icon: MessageSquare,
	},
] as const;

export const ID_TYPES = ["system", "dynamic", "semantic"] as const;

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

export const FOLDER_COLORS = [
	{ name: "Gray", hex: "" },
	{ name: "Red", hex: "#ef4444" },
	{ name: "Orange", hex: "#f97316" },
	{ name: "Amber", hex: "#f59e0b" },
	{ name: "Green", hex: "#22c55e" },
	{ name: "Blue", hex: "#3b82f6" },
	{ name: "Indigo", hex: "#6366f1" },
	{ name: "Violet", hex: "#8b5cf6" },
	{ name: "Pink", hex: "#ec4899" },
];

export const EXPIRY_OPTIONS = [
	{
		value: "one-time",
		labelKey: "home.expire_options.one_time_snippet",
		icon: Clock,
	},
	{ value: "never", labelKey: "home.expire_options.never", icon: Clock },
	{
		value: "1h",
		labelKey: "home.expire_options.expire_in_1_hour",
		icon: Clock,
	},
	{
		value: "1d",
		labelKey: "home.expire_options.expire_in_1_day",
		icon: Clock,
	},
	{
		value: "1w",
		labelKey: "home.expire_options.expire_in_1_week",
		icon: Clock,
	},
	{
		value: "1m",
		labelKey: "home.expire_options.expire_in_1_month",
		icon: Clock,
	},
	{
		value: "1y",
		labelKey: "home.expire_options.expire_in_1_year",
		icon: Clock,
	},
];

export const TABS_CONFIG = [
	{
		id: "text",
		icon: FileText,
		fullKey: "home.tabs.text.full",
		shortKey: "home.tabs.text.short",
	},
	{
		id: "docs",
		icon: FileText,
		fullKey: "home.tabs.docs.full",
		shortKey: "home.tabs.docs.short",
		badge: "New",
	},
	{
		id: "code",
		icon: Code2,
		fullKey: "home.tabs.code.full",
		shortKey: "home.tabs.code.short",
	},
	{
		id: "draw",
		icon: Paintbrush,
		fullKey: "home.tabs.draw.full",
		shortKey: "home.tabs.draw.short",
	},
	{
		id: "link",
		icon: Link,
		fullKey: "home.tabs.link.full",
		shortKey: "home.tabs.link.short",
	},
	{
		id: "file",
		icon: FileUp,
		fullKey: "home.tabs.file.full",
		shortKey: "home.tabs.file.short",
		requiresFileOption: true,
	},
];

export const MARKDOWN_LAYOUT_MODES = [
	{
		id: "editor" as const,
		icon: EyeOff,
		titleKey: "common.editor_only",
	},
	{
		id: "split" as const,
		icon: Layout,
		titleKey: "common.split_view",
	},
	{
		id: "preview" as const,
		icon: Eye,
		titleKey: "common.preview_only",
	},
];
