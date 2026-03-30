import {
	FileIcon,
	FileImage,
	FileAudio,
	FileVideo,
	FileArchive,
	FileCode,
	FileText,
	Terminal,
} from "lucide-react";
import { FILE_EXTENSIONS } from "@/constants";

interface FileIconProps {
	fileName?: string | null;
	mimeType?: string | null;
	className?: string;
	strokeWidth?: number;
}

export const FileTypeIcon = ({
	fileName,
	mimeType,
	className,
	strokeWidth = 2,
}: FileIconProps) => {
	const mime = mimeType?.toLowerCase() || "";
	const ext =
		fileName?.toLowerCase().split(".").pop() || mime.split("/")[1] || "";

	if (mime.startsWith("image/"))
		return <FileImage className={className} strokeWidth={strokeWidth} />;
	if (mime.startsWith("audio/"))
		return <FileAudio className={className} strokeWidth={strokeWidth} />;
	if (mime.startsWith("video/"))
		return <FileVideo className={className} strokeWidth={strokeWidth} />;

	if (
		FILE_EXTENSIONS.ARCHIVE.includes(ext) ||
		mime.includes("zip") ||
		mime.includes("archive") ||
		mime.includes("compressed")
	)
		return <FileArchive className={className} strokeWidth={strokeWidth} />;

	if (
		FILE_EXTENSIONS.CODE.includes(ext) ||
		mime.includes("code") ||
		mime.includes("javascript") ||
		mime.includes("json")
	)
		return <FileCode className={className} strokeWidth={strokeWidth} />;

	if (mime === "application/pdf" || ext === "pdf")
		return <FileText className={className} strokeWidth={strokeWidth} />;

	if (
		FILE_EXTENSIONS.TEXT.includes(ext) ||
		mime.includes("text") ||
		mime.includes("document") ||
		mime.includes("sheet") ||
		mime.includes("presentation")
	)
		return <FileText className={className} strokeWidth={strokeWidth} />;

	if (
		FILE_EXTENSIONS.EXEC.includes(ext) ||
		mime.includes("shell") ||
		mime.includes("executable") ||
		mime.includes("application/octet-stream")
	)
		return <Terminal className={className} strokeWidth={strokeWidth} />;

	return <FileIcon className={className} strokeWidth={strokeWidth} />;
};
