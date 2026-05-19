import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { guestStorage } from "@/utils/guest-storage";
import { clearDrafts, playRemoveSound } from "@/utils";
import type { User, ContentMode, FileAttachment } from "@/types";
import { FileService, type FileUploadStatus } from "@/lib/file-service";
import type { DisplayState } from "../use-display-state";

import { type editor } from "monaco-editor";

interface UseDisplayActionsProps {
	id: string | undefined;
	state: DisplayState;
	user: User | null;
	hasPending: boolean;
	uploadFiles: () => Promise<FileUploadStatus[]>;
}

export const useDisplayActions = ({
	id,
	state,
	user,
	hasPending,
	uploadFiles,
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
		collaborators,
		publicRole,
		allowComments,
		expiresTime,
		removedServerFileUrls,
		updateAllFromData,
		setIsEdit,
		setIsSaving,
		setIsDeleting,
		setSaveStatus,
		setUpdatedContent,
		setIsDeleteDialogOpen,
		idTypeTab,
	} = state;

	const handleEditSave = useCallback(
		async (shouldClose = true) => {
			setSaveStatus("saving");

			const hasContent =
				contentType === "file"
					? !!(
							hasPending ||
							(paste?.files &&
								paste.files.some(
									(f) => !removedServerFileUrls.has(f.url),
								)) ||
							(paste?.fileUrl &&
								!removedServerFileUrls.has(paste.fileUrl))
						)
					: (updatedContent || paste?.content)?.trim() !== "";

			if (!hasContent) {
				toast.error(t("messages.content_required"));
				setSaveStatus("error");
				return;
			}

			if (
				(idTypeTab === "dynamic" || idTypeTab === "semantic") &&
				!customId.trim()
			) {
				toast.error(
					t("home.custom_id_required") || "Custom ID is required",
				);
				setSaveStatus("error");
				return;
			}

			if (
				isPasswordEnabled &&
				!editPassword &&
				!(paste?.isPasswordProtected || paste?.password)
			) {
				toast.error(t("messages.password_required"));
				setSaveStatus("error");
				return;
			}

			try {
				setIsSaving(true);

				const finalFiles = [
					...(paste?.files?.filter(
						(f) => !removedServerFileUrls.has(f.url),
					) || []),
					...(paste?.fileUrl &&
					!removedServerFileUrls.has(paste.fileUrl)
						? [
								{
									url: paste.fileUrl,
									name: paste.fileName || "File",
									size: paste.fileSize || 0,
									mimeType:
										paste.fileMimeType ||
										"application/octet-stream",
								},
							]
						: []),
				];

				// Handle pending file uploads
				if (contentType === "file" && hasPending) {
					const uploadResults = await uploadFiles();
					const errors = uploadResults.filter((r) => r.error);
					if (errors.length > 0) throw new Error(errors[0].error!);

					const newUploadedFiles = uploadResults
						.map(FileService.toAttachment)
						.filter((f): f is FileAttachment => f !== null);
					finalFiles.push(...newUploadedFiles);
				}

				const data = await apiHelpers.updatePaste(id!, {
					content: updatedContent || paste?.content || "",
					language,
					visibility,
					editPermission,
					newId: customId,
					password: isPasswordEnabled
						? editPassword || undefined
						: null,
					allowedUsers,
					collaborators,
					publicRole,
					allowComments,
					expiresTime,
					contentMode: contentType as ContentMode,
					// Legacy fields for backward compatibility
					fileUrl: finalFiles[0]?.url,
					fileName: finalFiles[0]?.name,
					fileSize: finalFiles[0]?.size,
					fileMimeType: finalFiles[0]?.mimeType,
					files: finalFiles,
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
			collaborators,
			publicRole,
			allowComments,
			expiresTime,
			id,
			apiHelpers,
			user,
			navigate,
			removedServerFileUrls,
			updateAllFromData,
			setIsEdit,
			setIsSaving,
			setSaveStatus,
			hasPending,
			uploadFiles,
			idTypeTab,
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
			setIsDeleting(true);
			playRemoveSound();
			await apiHelpers.deletePaste(id!);
			toast.success(t("messages.snippet_deleted"));
			navigate("/");
		} catch {
			toast.error(t("messages.delete_failed"));
			setIsDeleting(false);
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
