import { useEffect, useRef } from "react";
import { CONFIG } from "@/configurations";
import { type PasteData } from "@/types";
import type { ShareEntry } from "../use-display-state";

interface UseAutosaveProps {
	isAutosave: boolean;
	isEdit: boolean;
	loading: boolean;
	isSaving: boolean;
	content: string | undefined;
	originalContent: string | undefined;
	onSave: () => Promise<void>;
	isRemoteUpdateRef: React.MutableRefObject<boolean>;
	lastLocalEditRef: React.MutableRefObject<number>;
	setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
	// Advanced Config
	config: {
		language: string;
		visibility: string;
		editPermission: string;
		allowedUsers: string[];
		collaborators: ShareEntry[];
		publicRole: string;
		allowComments: boolean;
		expiresTime: string;
		customId: string;
		isPasswordEnabled: boolean;
		editPassword: string;
	};
	originalPaste: PasteData | undefined;
}

export const useAutosave = ({
	isAutosave,
	isEdit,
	loading,
	isSaving,
	content,
	originalContent,
	onSave,
	isRemoteUpdateRef,
	lastLocalEditRef,
	setSaveStatus,
	config,
	originalPaste,
}: UseAutosaveProps) => {
	const onSaveRef = useRef(onSave);

	// Keep the latest onSave function without triggering effects
	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	const allowedUsersStr = JSON.stringify(config.allowedUsers);
	const collaboratorsStr = JSON.stringify(config.collaborators);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;

		const originalHasPassword = !!(
			originalPaste?.isPasswordProtected || originalPaste?.password
		);
		let hasPasswordChanged = false;
		if (config.isPasswordEnabled !== originalHasPassword) {
			if (config.isPasswordEnabled) {
				hasPasswordChanged = config.editPassword.trim() !== "";
			} else {
				hasPasswordChanged = true;
			}
		} else {
			hasPasswordChanged =
				config.isPasswordEnabled && config.editPassword.trim() !== "";
		}

		const hasConfigChanged =
			config.language !== originalPaste?.language ||
			config.visibility !== originalPaste?.visibility ||
			config.editPermission !== originalPaste?.editPermission ||
			allowedUsersStr !==
				JSON.stringify(originalPaste?.allowedUsers || []) ||
			collaboratorsStr !==
				JSON.stringify(originalPaste?.collaborators || []) ||
			config.publicRole !== (originalPaste?.publicRole || "viewer") ||
			config.allowComments !== (originalPaste?.allowComments || false) ||
			config.expiresTime !== (originalPaste?.expiresTime || "") ||
			(config.customId.trim() !== "" &&
				config.customId !== (originalPaste?.id || "")) ||
			hasPasswordChanged;

		const timeSinceLastLocalEdit = Date.now() - lastLocalEditRef.current;

		if (
			(!hasContentChanged && !hasConfigChanged) ||
			isRemoteUpdateRef.current ||
			(hasContentChanged &&
				timeSinceLastLocalEdit < CONFIG.ui.syncQuarantineMs)
		) {
			return;
		}

		// Use a shorter delay for config changes vs content changes if desired,
		// but 3s is generally safe.
		const timer = setTimeout(
			() => {
				onSaveRef.current();
			},
			hasContentChanged ? 3000 : 1000,
		);

		return () => clearTimeout(timer);
	}, [
		isAutosave,
		isEdit,
		loading,
		isSaving,
		content,
		originalContent,
		// we explicitly exclude onSave from dependencies to avoid timer resets
		isRemoteUpdateRef,
		lastLocalEditRef,
		// Deep compare trigger for config
		config.language,
		config.visibility,
		config.editPermission,
		config.allowedUsers,
		config.collaborators,
		allowedUsersStr,
		collaboratorsStr,
		config.publicRole,
		config.allowComments,
		config.expiresTime,
		config.customId,
		config.isPasswordEnabled,
		config.editPassword,
		originalPaste,
	]);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;
		const originalHasPassword = !!(
			originalPaste?.isPasswordProtected || originalPaste?.password
		);
		let hasPasswordChanged = false;
		if (config.isPasswordEnabled !== originalHasPassword) {
			if (config.isPasswordEnabled) {
				hasPasswordChanged = config.editPassword.trim() !== "";
			} else {
				hasPasswordChanged = true;
			}
		} else {
			hasPasswordChanged =
				config.isPasswordEnabled && config.editPassword.trim() !== "";
		}

		const hasConfigChanged =
			config.language !== originalPaste?.language ||
			config.visibility !== originalPaste?.visibility ||
			config.editPermission !== originalPaste?.editPermission ||
			allowedUsersStr !==
				JSON.stringify(originalPaste?.allowedUsers || []) ||
			collaboratorsStr !==
				JSON.stringify(originalPaste?.collaborators || []) ||
			config.publicRole !== (originalPaste?.publicRole || "viewer") ||
			config.allowComments !== (originalPaste?.allowComments || false) ||
			config.expiresTime !== (originalPaste?.expiresTime || "") ||
			(config.customId.trim() !== "" &&
				config.customId !== (originalPaste?.id || "")) ||
			hasPasswordChanged;

		if (hasContentChanged || hasConfigChanged) {
			setSaveStatus("saving");
		}
	}, [
		isAutosave,
		isEdit,
		loading,
		isSaving,
		content,
		originalContent,
		config.language,
		config.visibility,
		config.editPermission,
		config.allowedUsers,
		config.collaborators,
		allowedUsersStr,
		collaboratorsStr,
		config.publicRole,
		config.allowComments,
		config.expiresTime,
		config.customId,
		config.isPasswordEnabled,
		config.editPassword,
		originalPaste,
		setSaveStatus,
	]);
};
