import { FileUploadView } from "../../home/file-upload-view";
import type { PasteData } from "@/types";

interface FileEditViewProps {
	paste: PasteData | null;
	uploadedFileName?: string | null;
	previewUrl?: string | null;
	isFileUploading: boolean;
	fileUploadProgress: number;
	fileUploadError: string | null;
	onFileSelect: (file: File) => void;
	onClearFile: () => void;
}

export const FileEditView = ({
	paste,
	uploadedFileName,
	previewUrl,
	isFileUploading,
	fileUploadProgress,
	fileUploadError,
	onFileSelect,
	onClearFile,
}: FileEditViewProps) => {
	return (
		<FileUploadView
			uploadedFileName={
				uploadedFileName || (previewUrl ? "New File" : paste?.fileName)
			}
			previewUrl={previewUrl || paste?.fileUrl}
			fileMimeType={paste?.fileMimeType}
			isUploading={isFileUploading}
			uploadProgress={fileUploadProgress}
			uploadError={fileUploadError}
			onClearFile={onClearFile}
			handleDragOver={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			handleDrop={(e) => {
				e.preventDefault();
				e.stopPropagation();
				const file = e.dataTransfer.files[0];
				if (file) {
					onFileSelect(file);
				}
			}}
			handleFileInputChange={(e) => {
				const file = e.target.files?.[0];
				if (file) {
					onFileSelect(file);
				}
			}}
			isEdit={true}
		/>
	);
};
