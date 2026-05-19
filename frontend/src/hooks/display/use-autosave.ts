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
}: UseAutosaveProps) => {
	const onSaveRef = useRef(onSave);

	// Keep the latest onSave function without triggering effects
	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;

		if (!hasContentChanged || isRemoteUpdateRef.current) {
			return;
		}

		const timer = setTimeout(() => {
			const timeSinceLastLocalEdit =
				Date.now() - lastLocalEditRef.current;
			if (timeSinceLastLocalEdit < CONFIG.ui.syncQuarantineMs) {
				return;
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
	]);

	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasContentChanged =
			content !== undefined && content !== originalContent;

		if (hasContentChanged) {
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
	]);
};
