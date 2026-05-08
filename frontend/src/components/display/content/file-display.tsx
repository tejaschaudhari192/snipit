import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import FilePreview from "../../common/file-preview";

interface FileDisplayProps {
	paste: PasteData;
	contentRef: (node: HTMLElement | null) => void;
}

export const FileDisplay = ({ paste, contentRef }: FileDisplayProps) => {
	const { t } = useTranslation();

	const isImage = paste.fileMimeType?.startsWith("image/");
	const isVideo = paste.fileMimeType?.startsWith("video/");
	const isAudio = paste.fileMimeType?.startsWith("audio/");
	const isPdf =
		paste.fileMimeType === "application/pdf" ||
		paste.fileName?.toLowerCase().endsWith(".pdf");

	const hasPreview =
		paste.fileUrl && (isImage || isVideo || isAudio || isPdf);

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
			className="flex justify-center items-center py-12 px-4 w-full"
		>
			<Card className="w-full max-w-md border border-border/50 bg-background/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden group hover:border-primary/50 transition-all ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
				{hasPreview ? (
					<FilePreview
						url={paste.fileUrl!}
						fileName={paste.fileName}
						mimeType={paste.fileMimeType}
						className="border-b"
					/>
				) : (
					<div className="h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
						<div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
						<div className="relative transform group-hover:scale-110 transition-transform duration-500">
							<div className="p-4 rounded-2xl bg-background shadow-xl border border-border/50">
								<FileTypeIcon
									fileName={paste.fileName}
									mimeType={paste.fileMimeType}
									className="w-12 h-12 text-primary transition-colors duration-300"
									strokeWidth={1.5}
								/>
							</div>
						</div>
					</div>
				)}
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
						{t("common.download_file")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
