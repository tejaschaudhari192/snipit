import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePaste } from "@/context/PasteContext";
import { clearDrafts } from "@/utils";
import { guestStorage } from "@/utils/guest-storage";
import type {
	IdType,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
} from "@/types";

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
		fileUrl,
		fileName,
		fileSize,
		fileMimeType,
		setIsSubmitting,
		uploadFile,
		labels,
	} = usePaste();

	const [pendingFile, setPendingFile] = useState<File | null>(null);

	const handleSubmit = async (
		selectedIdType: IdType,
		providedId?: string,
		options: SubmitOptions = {},
	) => {
		try {
			setIsSubmitting(true);
			const finalVisibility = options.visibility ?? visibility;
			const finalEditPermission =
				options.editPermission ?? editPermission;

			let currentFileUrl = fileUrl;
			let currentFileName = fileName;
			let currentFileSize = fileSize;
			let currentFileMimeType = fileMimeType;

			if (contentType === "file" && pendingFile && !currentFileUrl) {
				const uploadResult = await uploadFile(pendingFile);
				if (uploadResult.error) throw new Error(uploadResult.error);
				currentFileUrl = uploadResult.fileUrl;
				currentFileName = uploadResult.fileName;
				currentFileSize = uploadResult.fileSize;
				currentFileMimeType = uploadResult.fileMimeType;
				setPendingFile(null);
			}

			const data = await apiHelpers.submitPaste({
				content:
					contentType === "file"
						? currentFileUrl || currentFileName || "File upload"
						: contentType === "draw" && !textValue.trim()
							? JSON.stringify({ elements: [], appState: {} })
							: textValue,
				expiresTime,
				idType: selectedIdType,
				customId: providedId,
				contentMode: contentType,
				fileUrl: contentType === "file" ? currentFileUrl : undefined,
				fileName: contentType === "file" ? currentFileName : undefined,
				fileSize: contentType === "file" ? currentFileSize : undefined,
				fileMimeType:
					contentType === "file" ? currentFileMimeType : undefined,
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
				publicRole: options.publicRole ?? publicRole,
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
					defaultValue: `Snippet created: /${data.id}`,
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
				axiosError.response?.data?.error || t("messages.snippet_failed")
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return { handleSubmit, pendingFile, setPendingFile };
};
