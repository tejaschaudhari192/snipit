export const VAULT_CATEGORIES = [
	{ id: "login", label: "Login" },
	{ id: "card", label: "Card" },
	{ id: "apikey", label: "API Key" },
	{ id: "note", label: "Note" },
	{ id: "identity", label: "Identity" },
] as const;

export type VaultCategoryId = (typeof VAULT_CATEGORIES)[number]["id"];
