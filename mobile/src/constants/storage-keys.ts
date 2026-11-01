export const STORAGE_KEYS = {
	AUTH_USER: "@snipit/auth_user",
	VAULT_META: "@snipit/pwmg_meta",
	ENCRYPTED_ITEMS: "@snipit/pwmg_items",
	ENCRYPTED_FOLDERS: "@snipit/pwmg_folders",
	RECOVERY_RECORD: "@snipit/pwmg_recovery",
	API_BASE_URL: "@snipit/api_url",
	THEME: "@snipit/theme",
	DEFAULT_TOOL: "@snipit/default_tool",
	PENDING_DELETES: "@snipit/pwmg_pending_deletes",
	PENDING_FOLDER_DELETES: "@snipit/pwmg_pending_folder_deletes",
	PENDING_ITEM_UPSERTS: "@snipit/pwmg_pending_item_upserts",
	PENDING_FOLDER_UPSERTS: "@snipit/pwmg_pending_folder_upserts",
	SYNCED_ITEM_IDS: "@snipit/pwmg_synced_item_ids",
	SYNCED_FOLDER_IDS: "@snipit/pwmg_synced_folder_ids",
	BIOMETRICS_ENABLED: "@snipit/pwmg_biometrics_enabled",
	BIOMETRIC_VAULT_PAYLOAD: "snipit_biometric_vault_payload",
	UI_STYLE: "@snipit/ui_style",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
