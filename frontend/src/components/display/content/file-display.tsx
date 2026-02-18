import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	FileDown,
	File as FileIcon,
	FileImage,
	FileAudio,
	FileVideo,
	FileArchive,
	FileCode,
	FileText,
	Terminal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

interface FileDisplayProps {
	paste: PasteData;
	contentRef: (node: HTMLElement | null) => void;
}

export const FileDisplay = ({ paste, contentRef }: FileDisplayProps) => {
	const { t } = useTranslation();

	const getFileIcon = () => {
		const mime = paste.fileMimeType?.toLowerCase() || "";
		if (mime.startsWith("image/")) return FileImage;
		if (mime.startsWith("audio/")) return FileAudio;
		if (mime.startsWith("video/")) return FileVideo;

		const ext =
			paste.fileName?.toLowerCase().split(".").pop() ||
			mime.split("/")[1] ||
			"";

		const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];
		if (
			archiveExts.includes(ext) ||
			mime.includes("zip") ||
			mime.includes("archive") ||
			mime.includes("compressed")
		)
			return FileArchive;

		const codeExts = [
			"js",
			"ts",
			"jsx",
			"tsx",
			"py",
			"java",
			"c",
			"cpp",
			"cs",
			"html",
			"css",
			"json",
			"md",
			"sh",
			"rs",
			"go",
			"php",
			"rb",
			"sql",
			"yaml",
			"yml",
			"xml",
		];
		if (
			codeExts.includes(ext) ||
			mime.includes("code") ||
			mime.includes("javascript") ||
			mime.includes("json")
		)
			return FileCode;

		if (ext === "pdf" || mime.includes("pdf")) return FileText;

		const textExts = [
			"txt",
			"doc",
			"docx",
			"rtf",
			"odt",
			"xls",
			"xlsx",
			"ppt",
			"pptx",
			"csv",
		];
		if (
			textExts.includes(ext) ||
			mime.includes("text") ||
			mime.includes("document") ||
			mime.includes("sheet") ||
			mime.includes("presentation")
		)
			return FileText;

		const execExts = [
			"exe",
			"msi",
			"bin",
			"apk",
			"dmg",
			"app",
			"bat",
			"cmd",
		];
		if (
			execExts.includes(ext) ||
			mime.includes("shell") ||
			mime.includes("executable") ||
			mime.includes("application/octet-stream")
		)
			return Terminal;

		return FileIcon;
	};

	const Icon = getFileIcon();

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleDownload = () => {
		if (paste.fileUrl) {
			window.open(paste.fileUrl, "_blank");
		}
	};

	return (
		<div
			ref={contentRef}
			className="flex justify-center items-center py-12 px-4"
		>
			<Card className="w-full max-w-sm border-2 shadow-2xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
				<div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
					<div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
					<div className="relative transform group-hover:scale-110 transition-transform duration-500">
						<div className="p-4 rounded-2xl bg-background shadow-xl border border-border/50">
							<Icon
								className="w-12 h-12 text-primary transition-colors duration-300"
								strokeWidth={1.5}
							/>
						</div>
					</div>
				</div>
				<CardContent className="pt-6 text-center space-y-6">
					<div className="space-y-2">
						<h3 className="font-black text-xl truncate px-2">
							{paste.fileName || t("common.unnamed_file")}
						</h3>
						<div className="flex items-center justify-center gap-2">
							<span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
								{paste.fileMimeType?.split("/")[1] || "file"}
							</span>
							<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border/50">
								{formatFileSize(paste.fileSize || 0)}
							</span>
						</div>
					</div>
					<Button
						className="w-full gap-2 font-bold h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
						onClick={handleDownload}
					>
						<FileDown className="w-5 h-5" />
						{t("common.download_file", "Download File")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
