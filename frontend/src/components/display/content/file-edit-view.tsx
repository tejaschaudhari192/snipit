import { FileUploadView } from "@/components/common/file-upload-view";
import { FileService, type FileUploadStatus } from "@/lib/file-service";
import type { PasteData } from "@/types";

interface FileEditViewProps {
	paste: PasteData | null;
	isFileUploading: boolean;
	fileUploadError: string | null;
	onFileSelect: (files: File[]) => void;
	onRemoveServerFile: (url: string) => void;
	onRemovePendingFile: (id: string) => void;
	onClearAll: () => void;
	onClearFile: () => void;
	removedServerFileUrls: Set<string>;
	isServerFileRemoved: boolean;
	previewUrl?: string | null;
	files: FileUploadStatus[];
}

export const FileEditView = ({
	paste,
	isFileUploading,
	fileUploadError,
	onFileSelect,
	onRemoveServerFile,
	onRemovePendingFile,
	onClearAll,
	onClearFile,
	removedServerFileUrls,
	isServerFileRemoved,
	previewUrl,
	files,
}: FileEditViewProps) => {
	const allFiles = [
		...FileService.mapPasteToStatus(paste).filter(
			(f) =>
				f.fileUrl &&
				!removedServerFileUrls.has(f.fileUrl) &&
				!isServerFileRemoved,
		),
		...files,
	];

	return (
		<FileUploadView
			files={allFiles}
			previewUrl={previewUrl}
			isUploading={isFileUploading}
			uploadError={fileUploadError}
			onClearFile={() => {
				onClearFile();
				onClearAll();
			}}
			onRemoveFile={(id) => {
				const serverFile = allFiles.find((f) => f.id === id);
				if (serverFile?.fileUrl) {
					onRemoveServerFile(serverFile.fileUrl);
				} else {
					onRemovePendingFile(id);
				}
			}}
			handleDragOver={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			handleDrop={(e) => {
				e.preventDefault();
				e.stopPropagation();
				const files = Array.from(e.dataTransfer.files);
				if (files.length > 0) {
					onFileSelect(files);
				}
			}}
			handleFileInputChange={(e) => {
				const files = e.target.files ? Array.from(e.target.files) : [];
				if (files.length > 0) {
					onFileSelect(files);
				}
			}}
		/>
	);
};
