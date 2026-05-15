import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePaste } from "@/context/PasteContext";
import { clearDrafts, dateConverter } from "@/utils";
import { guestStorage } from "@/utils/guest-storage";
import type {
	IdType,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	FileAttachment,
} from "@/types";
import { FileService } from "@/lib/file-service";

interface SubmitOptions {
	visibility?: Visibility;
	password?: string;
	editPermission?: EditPermission;
	allowedUsers?: string[];
	shareList?: { email: string; role: ShareRole }[];
	publicRole?: PublicRole;
	allowComments?: boolean;
	isCollaborative?: boolean;
}

export const usePasteSubmission = (
	onShortened?: (result: { id: string; url: string }) => void,
) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();
	const apiHelpers = useApiHelpers();
	const {
		visibility,
		editPermission,
		allowedUsers,
		shareList,
		publicRole,
		allowComments,
		expiresTime,
		contentType,
		language,
		password,
		textValue,
		readyAttachments,
		hasPending,
		setIsSubmitting,
		uploadFiles,
		labels,
	} = usePaste();

	const handleSubmit = async (
		selectedIdType: IdType,
		providedId?: string,
		options: SubmitOptions = {},
	) => {
		try {
			setIsSubmitting(true);
			const finalVisibility = options.visibility ?? visibility;

			// For unauthenticated users, always default to public edit so they can manage their own snippet
			let finalEditPermission = options.editPermission ?? editPermission;
			let finalPublicRole = options.publicRole ?? publicRole;

			if (!user) {
				finalEditPermission = "public";
				finalPublicRole = "editor";
			}

			// Handle pending file uploads if any
			let finalFiles = contentType === "file" ? readyAttachments : [];
			if (contentType === "file" && hasPending) {
				const results = await uploadFiles();
				const errors = results.filter((r) => r.error);
				if (errors.length > 0) {
					throw new Error(errors[0].error || "Upload failed");
				}
				// Use the actual results from upload instead of stale readyAttachments
				finalFiles = results
					.map(FileService.toAttachment)
					.filter((a): a is FileAttachment => a !== null);
			}

			const data = await apiHelpers.submitPaste({
				content:
					contentType === "file"
						? finalFiles.length > 0
							? finalFiles[0].url
							: "File upload"
						: contentType === "draw" && !textValue.trim()
							? JSON.stringify({ elements: [], appState: {} })
							: textValue,
				expiresTime,
				expiresAt: dateConverter(expiresTime),
				idType: selectedIdType,
				customId: providedId,
				contentMode: contentType,
				// Keep legacy fields for first file if exists
				fileUrl: finalFiles.length > 0 ? finalFiles[0].url : undefined,
				fileName:
					finalFiles.length > 0 ? finalFiles[0].name : undefined,
				fileSize:
					finalFiles.length > 0 ? finalFiles[0].size : undefined,
				fileMimeType:
					finalFiles.length > 0 ? finalFiles[0].mimeType : undefined,
				files: finalFiles.length > 0 ? finalFiles : undefined,
				redirectUrl: contentType === "link",
				language:
					contentType === "code" || contentType === "text"
						? language
						: "text",
				burnAfterRead: expiresTime === "one-time",
				visibility: finalVisibility,
				allowedUsers:
					finalVisibility === "shared" ||
					finalEditPermission === "shared"
						? (options.allowedUsers ?? allowedUsers)
						: undefined,
				password: (options.password ?? password) || undefined,
				editPermission: finalEditPermission,
				shareList: options.shareList ?? shareList,
				publicRole: finalPublicRole,
				allowComments: options.allowComments ?? allowComments,
			});

			if (user && labels.length > 0) {
				try {
					await apiHelpers.updateLabels(data.id, labels);
				} catch (err) {
					console.error("Failed to save labels during creation", err);
				}
			}

			toast.success(
				t("messages.snippet_created", {
					idType: selectedIdType,
					id: `/${data.id}`,
				}),
				{ position: "bottom-right" },
			);

			if (contentType === "link" && onShortened) {
				onShortened({
					id: data.id,
					url: window.location.origin + "/" + data.id,
				});
				return true;
			}

			navigate("/" + data.id, {
				state: {
					pasteData: data,
					isCollaborative: options.isCollaborative,
				},
			});
			if (!user) {
				guestStorage.addToHistory(data);
				guestStorage.addCreated(data);
			}
			clearDrafts();
			return true;
		} catch (error) {
			const axiosError = error as AxiosError<{
				error: string;
				details?: { path: string[]; message: string }[];
			}>;
			if (axiosError.response?.status === 409)
				return t("messages.id_conflict");
			const details = axiosError.response?.data?.details;
			if (details && details.length > 0) return details[0].message;
			return (
				axiosError.response?.data?.error ||
				(error as Error).message ||
				t("messages.snippet_failed")
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return { handleSubmit };
};
