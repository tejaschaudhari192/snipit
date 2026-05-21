import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FileAttachment } from "@/types";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import FilePreview from "@/components/common/file-preview";
import { cn } from "@/utils";

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileDisplayCard = ({ file }: { file: FileAttachment }) => {
	const { t } = useTranslation();
	const isImage = file.mimeType?.startsWith("image/");
	const isVideo = file.mimeType?.startsWith("video/");
	const isAudio = file.mimeType?.startsWith("audio/");
	const isPdf =
		file.mimeType === "application/pdf" ||
		file.name?.toLowerCase().endsWith(".pdf");

	const textExtensions = [
		"js",
		"ts",
		"tsx",
		"jsx",
		"json",
		"py",
		"java",
		"c",
		"cpp",
		"h",
		"hpp",
		"sh",
		"yml",
		"yaml",
		"md",
		"css",
		"html",
		"php",
		"go",
		"rs",
		"rb",
		"sql",
		"txt",
		"xml",
		"svg",
		"log",
	];
	const ext = file.name?.split(".").pop()?.toLowerCase() || "";
	const isText =
		file.mimeType?.startsWith("text/") || textExtensions.includes(ext);

	const hasPreview =
		file.url && (isImage || isVideo || isAudio || isPdf || isText);

	const handleDownload = () => {
		if (file.url) {
			window.open(file.url, "_blank");
		}
	};

	const cardWidthClass =
		isPdf || isText
			? "w-full md:w-[75vw] lg:w-[65vw] max-w-4xl"
			: isImage || isVideo
				? "w-full md:w-[55vw] max-w-2xl"
				: "w-full md:w-sm";

	return (
		<Card
			className={cn(
				"border border-border/50 bg-background/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden group hover:border-primary/50 transition-all ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col",
				cardWidthClass,
			)}
		>
			{hasPreview ? (
				<FilePreview
					url={file.url!}
					fileName={file.name}
					mimeType={file.mimeType}
					className="border-b"
					maxHeight={
						isPdf || isText
							? "clamp(450px, 60vh, 750px)"
							: "clamp(300px, 50vh, 600px)"
					}
				/>
			) : (
				<div className="h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
					<div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
					<div className="relative transform group-hover:scale-110 transition-transform duration-500">
						<div className="p-4 rounded-2xl bg-background shadow-xl border border-border/50">
							<FileTypeIcon
								fileName={file.name}
								mimeType={file.mimeType}
								className="w-12 h-12 text-primary transition-colors duration-300"
								strokeWidth={1.5}
							/>
						</div>
					</div>
				</div>
			)}
			<CardContent className="pt-6 text-center space-y-6 flex-1 flex flex-col justify-between">
				<div className="space-y-2">
					<h3 className="font-black text-lg truncate px-2">
						{file.name || t("common.unnamed_file")}
					</h3>
					<div className="flex items-center justify-center gap-2">
						<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
							{file.mimeType?.split("/")[1] || "file"}
						</span>
						<span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
							{formatFileSize(file.size || 0)}
						</span>
					</div>
				</div>
				<Button
					className="w-full gap-2 font-bold h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
					onClick={handleDownload}
				>
					<FileDown className="w-4 h-4" />
					{t("common.download_file")}
				</Button>
			</CardContent>
		</Card>
	);
};
