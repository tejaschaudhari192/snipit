import { cn } from "@/lib/utils";
import { FileAudio, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "@/hooks/use-theme";

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
	const { theme } = useTheme();
	const [textContent, setTextContent] = useState<string | null>(null);
	const [loadingContent, setLoadingContent] = useState(false);

	const mime = mimeType?.toLowerCase() || "";
	const ext =
		fileName?.split(".").pop()?.toLowerCase() || mime.split("/")[1] || "";

	const isImage = mime.startsWith("image/");
	const isVideo = mime.startsWith("video/");
	const isAudio = mime.startsWith("audio/");
	const isPdf = mime === "application/pdf" || ext === "pdf";

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
	const isText = mime.startsWith("text/") || textExtensions.includes(ext);

	useEffect(() => {
		if (isText && url && !textContent && !loadingContent) {
			setLoadingContent(true);
			fetch(url)
				.then((res) => res.text())
				.then((text) => {
					// Only set if it's reasonable size for preview
					if (text.length < 50000) {
						setTextContent(text);
					} else {
						setTextContent(text.substring(0, 50000) + "...");
					}
				})
				.catch((err) =>
					console.error("Failed to fetch text content", err),
				)
				.finally(() => setLoadingContent(false));
		}
	}, [isText, url, textContent, loadingContent]);

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

	if (isText) {
		return (
			<div className={containerClass} style={{ height: maxHeight }}>
				{loadingContent ? (
					<div className="flex flex-col items-center gap-2">
						<Loader2 className="h-8 w-8 text-primary animate-spin" />
						<span className="text-xs font-medium text-muted-foreground">
							Loading preview...
						</span>
					</div>
				) : textContent !== null ? (
					<div className="w-full h-full">
						<Editor
							height="100%"
							width="100%"
							value={textContent}
							language={
								ext === "js"
									? "javascript"
									: ext === "ts"
										? "typescript"
										: ext
							}
							theme={theme === "dark" ? "vs-dark" : "light"}
							options={{
								readOnly: true,
								minimap: { enabled: false },
								fontSize: 12,
								scrollBeyondLastLine: false,
								padding: { top: 12, bottom: 12 },
								domReadOnly: true,
								automaticLayout: true,
							}}
						/>
					</div>
				) : (
					<div className="text-muted-foreground text-xs font-medium">
						Text preview not available
					</div>
				)}
			</div>
		);
	}

	return null;
};

export default FilePreview;
