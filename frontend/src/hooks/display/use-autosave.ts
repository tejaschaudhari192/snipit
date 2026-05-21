import { useEffect, useRef } from "react";
import { CONFIG } from "@/configurations";
import { type PasteData } from "@/types";
import type { ShareEntry } from "@/hooks/use-display-state";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";

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
	config?: {
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
	originalPaste?: PasteData | undefined;
	isAdmin?: boolean;
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
	const { checkIdAvailability } = useApiHelpers();

	// Keep the latest onSave function without triggering effects
	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;

		const hasConfigChanged = (() => {
			if (!config || !originalPaste) return false;

			const collaboratorsChanged =
				JSON.stringify(
					config.collaborators.map((c) => ({
						email: c.email,
						role: c.role,
					})),
				) !==
				JSON.stringify(
					(originalPaste.collaborators || []).map((c) => ({
						email: c.email,
						role: c.role,
					})),
				);

			const allowedUsersChanged =
				JSON.stringify([...config.allowedUsers].sort()) !==
				JSON.stringify([...(originalPaste.allowedUsers || [])].sort());

			return (
				config.language !== originalPaste.language ||
				config.visibility !== originalPaste.visibility ||
				config.editPermission !== originalPaste.editPermission ||
				config.publicRole !== originalPaste.publicRole ||
				config.allowComments !== originalPaste.allowComments ||
				config.customId !== originalPaste.id ||
				config.expiresTime !== originalPaste.expiresTime ||
				collaboratorsChanged ||
				allowedUsersChanged
			);
		})();

		const hasChanged = hasContentChanged || hasConfigChanged;

		if (!hasChanged || isRemoteUpdateRef.current) {
			return;
		}

		const timer = setTimeout(async () => {
			const timeSinceLastLocalEdit =
				Date.now() - lastLocalEditRef.current;
			if (timeSinceLastLocalEdit < CONFIG.ui.syncQuarantineMs) {
				return;
			}

			// If customId has changed, check availability on the frontend first
			if (
				config &&
				originalPaste &&
				config.customId !== originalPaste.id
			) {
				const trimmedId = config.customId.trim();
				if (!trimmedId) return;

				try {
					const { available } = await checkIdAvailability(trimmedId);
					if (!available) {
						setSaveStatus("error");
						toast.error("Custom ID is not available");
						return;
					}
				} catch (error) {
					console.error(
						"Autosave: failed to check ID availability:",
						error,
					);
					return;
				}
			}

			onSaveRef.current();
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		isAutosave,
		isEdit,
		loading,
		isSaving,
		content,
		originalContent,
		isRemoteUpdateRef,
		lastLocalEditRef,
		config,
		originalPaste,
		checkIdAvailability,
		setSaveStatus,
	]);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;

		const hasConfigChanged = (() => {
			if (!config || !originalPaste) return false;

			const collaboratorsChanged =
				JSON.stringify(
					config.collaborators.map((c) => ({
						email: c.email,
						role: c.role,
					})),
				) !==
				JSON.stringify(
					(originalPaste.collaborators || []).map((c) => ({
						email: c.email,
						role: c.role,
					})),
				);

			const allowedUsersChanged =
				JSON.stringify([...config.allowedUsers].sort()) !==
				JSON.stringify([...(originalPaste.allowedUsers || [])].sort());

			return (
				config.language !== originalPaste.language ||
				config.visibility !== originalPaste.visibility ||
				config.editPermission !== originalPaste.editPermission ||
				config.publicRole !== originalPaste.publicRole ||
				config.allowComments !== originalPaste.allowComments ||
				config.customId !== originalPaste.id ||
				config.expiresTime !== originalPaste.expiresTime ||
				collaboratorsChanged ||
				allowedUsersChanged
			);
		})();

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
		setSaveStatus,
		config,
		originalPaste,
	]);
};
