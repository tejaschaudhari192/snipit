import { cn } from "@/lib/utils";
import { FileAudio } from "lucide-react";

interface FilePreviewProps {
	url: string;
	fileName?: string | null;
	mimeType?: string | null;
	className?: string;
	maxHeight?: string;
}

export const FilePreview = ({
	url,
	fileName,
	mimeType,
	className,
	maxHeight = "350px",
}: FilePreviewProps) => {
	const mime = mimeType?.toLowerCase() || "";
	const ext =
		fileName?.split(".").pop()?.toLowerCase() || mime.split("/")[1] || "";

	const isImage = mime.startsWith("image/");
	const isVideo = mime.startsWith("video/");
	const isAudio = mime.startsWith("audio/");
	const isPdf = mime === "application/pdf" || ext === "pdf";

	const containerClass = cn(
		"w-full bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden flex items-center justify-center relative",
		className,
	);

	if (isImage) {
		return (
			<div className={containerClass}>
				<img
					src={url}
					alt={fileName || "File Preview"}
					className={cn(
						"w-full h-auto object-cover bg-muted/10 pattern-boxes pattern-muted/20 pattern-bg-transparent pattern-size-4",
					)}
					style={{ maxHeight }}
				/>
			</div>
		);
	}

	if (isVideo) {
		return (
			<div className={containerClass}>
				<video
					src={url}
					controls
					className="w-full h-auto bg-black"
					style={{ maxHeight }}
				/>
			</div>
		);
	}

	if (isAudio) {
		return (
			<div
				className={cn(
					containerClass,
					"py-8 px-4 flex flex-col gap-4 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent",
				)}
			>
				<FileAudio className="w-12 h-12 text-primary animate-pulse drop-shadow-md" />
				<audio
					src={url}
					controls
					className="w-full max-w-sm shadow-md rounded-full"
				/>
			</div>
		);
	}

	if (isPdf) {
		return (
			<div className={containerClass}>
				<iframe
					src={url}
					className="w-full border-0 bg-white"
					style={{ height: maxHeight }}
					title={fileName || "PDF Preview"}
				/>
			</div>
		);
	}

	return null;
};
