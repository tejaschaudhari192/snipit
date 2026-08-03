import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";
import type { FileUploadStatus } from "@/lib/file-service";

interface FileUploadItemProps {
	file: FileUploadStatus;
	isUploading: boolean;
	onRemove?: (id: string) => void;
}

export const FileUploadItem = ({
	file,
	isUploading,
	onRemove,
}: FileUploadItemProps) => {
	const { t } = useTranslation();

	let state: "idle" | "uploading" | "processing" | "error" | "done" = "idle";
	if (file.isUploading) {
		state = "uploading";
	} else if (file.progress === 100) {
		state = "done";
	}

	return (
		<Attachment
			state={state}
			className="w-full sm:w-60 bg-background/50 hover:bg-background transition-colors"
		>
			<AttachmentMedia>
				<FileTypeIcon
					fileName={file.fileName}
					mimeType={file.fileMimeType}
					className="h-5 w-5"
				/>
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>{file.fileName}</AttachmentTitle>
				<AttachmentDescription>
					{file.isUploading
						? `${Math.round(file.progress)}% • ${t("home.file_upload.uploading")}`
						: file.progress === 100
							? t("home.file_upload.ready")
							: t("home.file_upload.selected")}
				</AttachmentDescription>
			</AttachmentContent>
			{!isUploading && onRemove && (
				<AttachmentActions>
					<AttachmentAction
						aria-label={`Remove ${file.fileName}`}
						onClick={() => onRemove(file.id)}
					>
						<X className="h-4 w-4" />
					</AttachmentAction>
				</AttachmentActions>
			)}
		</Attachment>
	);
};
