import {
	Shield,
	Key,
	Star,
	Clock,
	CreditCard,
	Fingerprint,
	FileCode,
	StickyNote,
} from "lucide-react";
import type { CustomField } from "../types";

export const SIDEBAR_NAV_ITEMS = [
	{ icon: Key, label: "tools.password_manager_all_items", id: "all" },
	{ icon: Star, label: "tools.password_manager_favorites", id: "favorites" },
	{ icon: Clock, label: "tools.password_manager_recent", id: "recent" },
];

export const ITEM_TYPE_OPTIONS = [
	{
		icon: Key,
		label: "tools.password_manager_type_logins",
		id: "login",
		color: "text-blue-500",
	},
	{
		icon: CreditCard,
		label: "tools.password_manager_type_cards",
		id: "card",
		color: "text-purple-500",
	},
	{
		icon: FileCode,
		label: "tools.password_manager_type_api_keys",
		id: "apikey",
		color: "text-emerald-500",
	},
	{
		icon: Fingerprint,
		label: "tools.password_manager_type_passkeys",
		id: "passkey",
		color: "text-amber-500",
	},
	{
		icon: Shield,
		label: "tools.password_manager_type_cred_files",
		id: "credfile",
		color: "text-rose-500",
	},
	{
		icon: StickyNote,
		label: "tools.password_manager_type_notes",
		id: "note",
		color: "text-cyan-500",
	},
];

export const PASSWORD_GENERATOR_CONFIG = {
	UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
	NUMBERS: "0123456789",
	SYMBOLS: "!@#$%^&*()_+-=[]{}|;:,.<>?",
	WORDS: [
		"apple",
		"brave",
		"crane",
		"dance",
		"eagle",
		"flame",
		"grape",
		"haste",
		"ideal",
		"jelly",
		"knife",
		"lemon",
		"mango",
		"noble",
		"ocean",
		"pearl",
		"quilt",
		"river",
		"stone",
		"tiger",
		"unity",
		"vocal",
		"whale",
		"xray",
		"yacht",
		"zebra",
		"swede",
		"graveyard",
		"coffee",
		"breeze",
		"rocket",
		"forest",
	],
};

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

export const PASSWORD_STRENGTH_CONFIG = {
	MIN_LENGTH_WEAK: 8,
	MIN_LENGTH_GOOD: 12,
	SCORE_WEAK: 2,
	SCORE_GOOD: 4,
	SCORE_ULTIMATE: 5,
};

export const UI_DEFAULTS = {
	FOLDER_COLOR: "#8b5cf6",
	DEFAULT_ITEM_TYPE: "login",
};

export const MASTER_PASSWORD_REQUIREMENTS = {
	MIN_LENGTH: 8,
	REQUIRE_UPPERCASE: true,
	REQUIRE_NUMBER: true,
	REQUIRE_SPECIAL: true,
};
