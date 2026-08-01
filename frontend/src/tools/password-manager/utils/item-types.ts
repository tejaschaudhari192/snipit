export type FieldType =
	| "text"
	| "password"
	| "url"
	| "date"
	| "number"
	| "email"
	| "tel"
	| "multiline"
	| "file";

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
				label: "tools.password_manager.fields.username",
				type: "text",
				placeholder: "tools.password_manager.username_placeholder",
			},
			{
				key: "password",
				label: "tools.password_manager.fields.password",
				type: "password",
				placeholder: "tools.password_manager.password_placeholder",
			},
			{
				key: "url",
				label: "tools.password_manager.fields.website",
				type: "url",
				placeholder: "tools.password_manager.url_placeholder",
			},
		],
	},
	card: {
		id: "card",
		fields: [
			{
				key: "cardholderName",
				label: "tools.password_manager.fields.cardholder_name",
				type: "text",
			},
			{
				key: "cardNumber",
				label: "tools.password_manager.fields.card_number",
				type: "text",
				placeholder: "tools.password_manager.card_number",
			},
			{
				key: "expiration",
				label: "tools.password_manager.fields.expiration",
				type: "text",
			},
			{
				key: "cvv",
				label: "tools.password_manager.fields.cvv",
				type: "password",
			},
			{
				key: "pin",
				label: "tools.password_manager.fields.pin",
				type: "password",
			},
		],
	},
	apikey: {
		id: "apikey",
		fields: [
			{
				key: "keyId",
				label: "tools.password_manager.fields.key_id",
				type: "text",
				placeholder: "tools.password_manager.key_id",
			},
			{
				key: "apiKey",
				label: "tools.password_manager.fields.api_key",
				type: "password",
				placeholder: "tools.password_manager.password_placeholder",
			},
			{
				key: "url",
				label: "tools.password_manager.fields.base_url",
				type: "url",
				placeholder: "tools.password_manager.url_placeholder",
			},
		],
	},
	passkey: {
		id: "passkey",
		fields: [
			{
				key: "displayName",
				label: "tools.password_manager.fields.display_name",
				type: "text",
			},
			{
				key: "userId",
				label: "tools.password_manager.fields.user_id",
				type: "text",
			},
			{
				key: "publicKey",
				label: "tools.password_manager.fields.public_key",
				type: "multiline",
			},
			{
				key: "privateKey",
				label: "tools.password_manager.fields.private_key",
				type: "password",
			},
		],
	},
	credfile: {
		id: "credfile",
		fields: [
			{
				key: "fileName",
				label: "tools.password_manager.fields.file_name",
				type: "text",
				placeholder: "tools.password_manager.cred_file_name",
			},
			{
				key: "fileContent",
				label: "tools.password_manager.fields.file_content",
				type: "file",
			},
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
