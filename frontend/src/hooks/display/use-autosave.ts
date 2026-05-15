import { useEffect } from "react";
import { CONFIG } from "@/configurations";

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
}: UseAutosaveProps) => {
	useEffect(() => {
		if (!isAutosave || !isEdit || loading || isSaving) return;

		const hasChanged = content !== undefined && content !== originalContent;
		const timeSinceLastLocalEdit = Date.now() - lastLocalEditRef.current;

		if (
			!hasChanged ||
			isRemoteUpdateRef.current ||
			timeSinceLastLocalEdit < CONFIG.ui.syncQuarantineMs
		) {
			return;
		}

		const timer = setTimeout(() => {
			onSave();
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		isAutosave,
		isEdit,
		loading,
		isSaving,
		content,
		originalContent,
		onSave,
		isRemoteUpdateRef,
		lastLocalEditRef,
	]);
};
