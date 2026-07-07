export type FieldType =
	| "text"
	| "password"
	| "url"
	| "date"
	| "number"
	| "email"
	| "tel"
	| "multiline";

export interface ItemFieldDef {
	key: string;
	label: string; // Translation key
	type: FieldType;
	placeholder?: string; // Translation key
}

export interface ItemTypeSchema {
	id: string;
	fields: ItemFieldDef[];
}

export const ITEM_TYPE_SCHEMAS: Record<string, ItemTypeSchema> = {
	login: {
		id: "login",
		fields: [
			{
				key: "username",
				label: "Username",
				type: "text",
				placeholder: "tools.password_manager_username_placeholder",
			},
			{
				key: "password",
				label: "Password",
				type: "password",
				placeholder: "tools.password_manager_password_placeholder",
			},
			{
				key: "url",
				label: "Website",
				type: "url",
				placeholder: "tools.password_manager_url_placeholder",
			},
		],
	},
	card: {
		id: "card",
		fields: [
			{ key: "cardholderName", label: "Cardholder Name", type: "text" },
			{
				key: "cardNumber",
				label: "Card Number",
				type: "text",
				placeholder: "tools.password_manager_card_number",
			},
			{ key: "expiration", label: "Expiration (MM/YY)", type: "text" },
			{ key: "cvv", label: "CVV / CVC", type: "password" },
			{ key: "pin", label: "PIN", type: "password" },
		],
	},
	apikey: {
		id: "apikey",
		fields: [
			{
				key: "keyId",
				label: "Key ID",
				type: "text",
				placeholder: "tools.password_manager_key_id",
			},
			{
				key: "apiKey",
				label: "API Key",
				type: "password",
				placeholder: "tools.password_manager_password_placeholder",
			},
			{
				key: "url",
				label: "Base URL",
				type: "url",
				placeholder: "tools.password_manager_url_placeholder",
			},
		],
	},
	passkey: {
		id: "passkey",
		fields: [
			{ key: "displayName", label: "Display Name", type: "text" },
			{ key: "userId", label: "User ID", type: "text" },
			{ key: "publicKey", label: "Public Key", type: "multiline" },
			{ key: "privateKey", label: "Private Key", type: "password" },
		],
	},
	credfile: {
		id: "credfile",
		fields: [
			{
				key: "fileName",
				label: "File Name",
				type: "text",
				placeholder: "tools.password_manager_cred_file_name",
			},
			{ key: "fileContent", label: "File Content", type: "multiline" },
		],
	},
	note: {
		id: "note",
		fields: [],
	},
};

export const getFieldsForType = (itemType: string): ItemFieldDef[] => {
	return (
		ITEM_TYPE_SCHEMAS[itemType]?.fields || ITEM_TYPE_SCHEMAS["login"].fields
	);
};
