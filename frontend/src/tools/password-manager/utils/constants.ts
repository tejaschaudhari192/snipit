import {
	Shield,
	Key,
	Star,
	Clock,
	CreditCard,
	Fingerprint,
	FileCode,
	StickyNote,
	Users,
	FolderIcon,
	Gamepad2,
	Briefcase,
	Book,
	Building,
	Heart,
	Camera,
	Globe,
	Music,
	GraduationCap,
	Plane,
	Code,
	Landmark,
} from "lucide-react";
import type { CustomField } from "../types";

export const SIDEBAR_NAV_ITEMS = [
	{ icon: Key, label: "tools.password_manager.all_items", id: "all" },
	{ icon: Star, label: "tools.password_manager.favorites", id: "favorites" },
	{ icon: Clock, label: "tools.password_manager.recent", id: "recent" },
	{
		icon: Users,
		label: "tools.password_manager.sharing_center_title",
		id: "sharing",
	},
];

export const FOLDER_ICONS = [
	{ id: "folder", icon: FolderIcon, label: "Folder" },
	{ id: "briefcase", icon: Briefcase, label: "Work" },
	{ id: "gamepad", icon: Gamepad2, label: "Entertainment" },
	{ id: "book", icon: Book, label: "Study" },
	{ id: "building", icon: Building, label: "Business" },
	{ id: "heart", icon: Heart, label: "Social" },
	{ id: "camera", icon: Camera, label: "Media" },
	{ id: "globe", icon: Globe, label: "Travel" },
	{ id: "music", icon: Music, label: "Music" },
	{ id: "graduation", icon: GraduationCap, label: "Education" },
	{ id: "plane", icon: Plane, label: "Vacation" },
	{ id: "code", icon: Code, label: "Code" },
	{ id: "government", icon: Landmark, label: "Government" },
];

export const ITEM_TYPE_OPTIONS = [
	{
		icon: Key,
		label: "tools.password_manager.type_logins",
		id: "login",
		color: "text-blue-500",
	},
	{
		icon: CreditCard,
		label: "tools.password_manager.type_cards",
		id: "card",
		color: "text-purple-500",
	},
	{
		icon: FileCode,
		label: "tools.password_manager.type_api_keys",
		id: "apikey",
		color: "text-emerald-500",
	},
	{
		icon: Fingerprint,
		label: "tools.password_manager.type_passkeys",
		id: "passkey",
		color: "text-amber-500",
	},
	{
		icon: Shield,
		label: "tools.password_manager.type_cred_files",
		id: "credfile",
		color: "text-rose-500",
	},
	{
		icon: StickyNote,
		label: "tools.password_manager.type_notes",
		id: "note",
		color: "text-cyan-500",
	},
	{
		icon: Users,
		label: "tools.password_manager.type_identities",
		id: "identity",
		color: "text-indigo-500",
	},
];

export const CUSTOM_FIELD_TYPES: CustomField["type"][] = [
	"text",
	"password",
	"url",
	"date",
	"number",
	"email",
	"tel",
	"color",
];

export const UI_DEFAULTS = {
	FOLDER_COLOR: "#8b5cf6",
	DEFAULT_ITEM_TYPE: "login",
};

export const PRESET_COLORS = [
	"#ef4444", // red
	"#f97316", // orange
	"#eab308", // yellow
	"#22c55e", // green
	"#3b82f6", // blue
	"#8b5cf6", // purple
	"#ec4899", // pink
	"#71717a", // gray
];

export const PASSWORD_CHARS = {
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export const PASSWORD_MANAGER_CONFIG = {
	PASSWORD_EXPIRY_WARNING_DAYS: 90,
	MS_PER_DAY: 24 * 60 * 60 * 1000,
};
