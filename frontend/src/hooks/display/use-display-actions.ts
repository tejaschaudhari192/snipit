import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { guestStorage } from "@/utils/guest-storage";
import { clearDrafts, playRemoveSound } from "@/utils";
import type { User, FileAttachment, UpdatePasteData } from "@/types";
import { FileService, type FileUploadStatus } from "@/lib/file-service";
import type { DisplayState } from "@/hooks/use-display-state";

import { type editor } from "monaco-editor";

interface UseDisplayActionsProps {
	id: string | undefined;
	state: DisplayState;
	user: User | null;
	hasPending: boolean;
	uploadFiles: () => Promise<FileUploadStatus[]>;
	resetFileUpload?: () => void;
}

export const useDisplayActions = ({
	id,
	state,
	user,
	hasPending,
	uploadFiles,
	resetFileUpload,
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
		redirectionType,
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

				const currentValues = {
					content:
						updatedContent !== undefined
							? updatedContent
							: paste?.content,
					language,
					visibility,
					editPermission,
					newId: customId,
					password: isPasswordEnabled
						? editPassword || undefined
						: null,
					allowedUsers,
					collaborators: collaborators.map((c) => ({
						email: c.email,
						role: c.role,
					})),
					publicRole,
					allowComments,
					expiresTime,
					contentMode: contentType,
					files: finalFiles,
					redirectionType,
				};

				const originalValues = {
					content: paste?.content,
					language: paste?.language,
					visibility: paste?.visibility,
					editPermission: paste?.editPermission,
					newId: paste?.id,
					password: paste?.isPasswordProtected
						? paste?.password
						: null,
					allowedUsers: paste?.allowedUsers || [],
					collaborators: (paste?.collaborators || []).map((c) => ({
						email: c.email,
						role: c.role,
					})),
					publicRole: paste?.publicRole,
					allowComments: paste?.allowComments,
					expiresTime: paste?.expiresTime,
					contentMode: paste?.contentMode,
					files: paste?.files || [],
					redirectionType: paste?.redirectionType || "click",
				};

				const updates: UpdatePasteData = {};

				type Key = keyof typeof currentValues;

				(Object.keys(currentValues) as Key[]).forEach((key) => {
					const cur = currentValues[key];
					const orig = originalValues[key];

					let changed = false;

					if (Array.isArray(cur) && Array.isArray(orig)) {
						changed = JSON.stringify(cur) !== JSON.stringify(orig);
					} else if (key === "password") {
						const wasProtected = !!paste?.isPasswordProtected;
						const isProtected = isPasswordEnabled;
						changed =
							isProtected !== wasProtected ||
							(isProtected && !!editPassword);
					} else {
						changed = cur !== orig;
					}

					if (changed) {
						if (key === "files") {
							updates.fileUrl = finalFiles[0]?.url || null;
							updates.fileName = finalFiles[0]?.name || null;
							updates.fileSize = finalFiles[0]?.size || null;
							updates.fileMimeType =
								finalFiles[0]?.mimeType || null;
							updates.files = finalFiles;
						} else {
							(updates as Record<string, unknown>)[key] = cur;
						}
					}
				});

				// If no changes have been made, skip request and succeed immediately
				if (Object.keys(updates).length === 0) {
					setSaveStatus("saved");
					setTimeout(() => setSaveStatus("idle"), 3000);
					if (shouldClose) setIsEdit(false);
					return;
				}

				const data = await apiHelpers.updatePaste(id!, updates);

				if (data) {
					updateAllFromData(data);
					resetFileUpload?.();
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
			redirectionType,
			resetFileUpload,
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
