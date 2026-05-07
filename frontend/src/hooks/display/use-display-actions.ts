import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { guestStorage } from "@/utils/guest-storage";
import { clearDrafts, playRemoveSound } from "@/utils";
import type { User, ContentMode } from "@/types";
import type { UploadState } from "@/hooks/use-file-upload";
import type { DisplayState } from "../use-display-state";

import { type editor } from "monaco-editor";

interface UseDisplayActionsProps {
	id: string | undefined;
	state: DisplayState;
	user: User | null;
	pendingFile: File | null;
	uploadFile: (file: File) => Promise<UploadState>;
}

export const useDisplayActions = ({
	id,
	state,
	user,
	pendingFile,
	uploadFile,
}: UseDisplayActionsProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const apiHelpers = useApiHelpers();
	const {
		contentType,
		paste,
		updatedContent,
		isPasswordEnabled,
		editPassword,
		language,
		visibility,
		editPermission,
		customId,
		allowedUsers,
		shareList,
		publicRole,
		allowComments,
		expiresTime,
		isServerFileRemoved,
		updateAllFromData,
		setIsEdit,
		setIsSaving,
		setSaveStatus,
		setUpdatedContent,
		setIsDeleteDialogOpen,
	} = state;

	const handleEditSave = useCallback(
		async (shouldClose = true) => {
			setSaveStatus("saving");

			const hasContent =
				contentType === "file"
					? !!(pendingFile || paste?.fileUrl)
					: (updatedContent || paste?.content)?.trim() !== "";

			if (!hasContent) {
				toast.error(t("messages.content_required"));
				setSaveStatus("error");
				return;
			}

			try {
				setIsSaving(true);
				let currentFileUrl = isServerFileRemoved
					? null
					: paste?.fileUrl;
				let currentFileName = isServerFileRemoved
					? null
					: paste?.fileName;
				let currentFileSize = isServerFileRemoved ? 0 : paste?.fileSize;
				let currentFileMimeType = isServerFileRemoved
					? null
					: paste?.fileMimeType;

				if (pendingFile) {
					const uploadRes = await uploadFile(pendingFile);
					currentFileUrl = uploadRes.fileUrl;
					currentFileName = uploadRes.fileName;
					currentFileSize = uploadRes.fileSize;
					currentFileMimeType = uploadRes.fileMimeType;
				}

				const data = await apiHelpers.updatePaste(id!, {
					content: updatedContent || paste?.content || "",
					language,
					visibility,
					editPermission,
					newId: customId,
					password: isPasswordEnabled ? editPassword : undefined,
					allowedUsers,
					shareList,
					publicRole,
					allowComments,
					expiresTime,
					contentMode: contentType as ContentMode,
					fileUrl: currentFileUrl,
					fileName: currentFileName,
					fileSize: currentFileSize,
					fileMimeType: currentFileMimeType,
				});

				if (data) {
					updateAllFromData(data);
					setSaveStatus("saved");
					setTimeout(() => setSaveStatus("idle"), 3000);
					if (!user) {
						guestStorage.addToHistory(data);
						if (
							data.id !== id ||
							guestStorage.isCreated(id || data.id)
						)
							guestStorage.addCreated(data);
					}
					if (data.id !== id)
						navigate(`/${data.id}`, { replace: true });
					if (id) clearDrafts(id);
				}

				if (shouldClose) setIsEdit(false);
			} catch (error) {
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 5000);
				const axiosError = error as AxiosError<{ error: string }>;
				toast.error(
					axiosError.response?.data?.error ??
						t("messages.update_failed"),
				);
			} finally {
				setIsSaving(false);
			}
		},
		[
			contentType,
			paste,
			updatedContent,
			t,
			isPasswordEnabled,
			editPassword,
			language,
			visibility,
			editPermission,
			customId,
			allowedUsers,
			shareList,
			publicRole,
			allowComments,
			expiresTime,
			id,
			apiHelpers,
			user,
			navigate,
			isServerFileRemoved,
			updateAllFromData,
			setIsEdit,
			setIsSaving,
			setSaveStatus,
			pendingFile,
			uploadFile,
		],
	);

	const handleDelete = () => setIsDeleteDialogOpen(true);

	const handleCancel = () => {
		if (paste) updateAllFromData(paste);
		setIsEdit(false);
		if (id) clearDrafts(id);
	};

	const handleContentChange = useCallback(
		(
			val: string | undefined,
			isRemoteUpdateRef: React.MutableRefObject<boolean>,
			editorInstance: editor.ICodeEditor | null,
			handleEditorChange: (data: { content?: string }) => void,
		) => {
			if (
				val === undefined ||
				val === updatedContent ||
				isRemoteUpdateRef.current
			)
				return;

			setUpdatedContent(val);
			if (state.isAutosave) setSaveStatus("saving");

			if (
				!editorInstance ||
				(contentType !== "code" && contentType !== "text")
			) {
				handleEditorChange({ content: val });
			}
		},
		[
			contentType,
			updatedContent,
			setUpdatedContent,
			state.isAutosave,
			setSaveStatus,
		],
	);

	const onDeleteConfirm = async () => {
		try {
			playRemoveSound();
			await apiHelpers.deletePaste(id!);
			toast.success(t("messages.snippet_deleted"));
			navigate("/");
		} catch {
			toast.error(t("messages.delete_failed"));
		} finally {
			setIsDeleteDialogOpen(false);
		}
	};

	return {
		handleEditSave,
		handleDelete,
		handleCancel,
		handleContentChange,
		onDeleteConfirm,
	};
};
