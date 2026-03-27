import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { CollabDraw } from "@/components/display/collab-draw";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
	Link,
	FileUp,
	X,
	File,
	CheckCircle2,
	Loader2,
	FileImage,
	FileAudio,
	FileVideo,
	FileArchive,
	FileCode,
	FileText,
	Terminal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/configurations";
import type { ContentMode } from "@/types";

interface EditorContentProps {
	contentType: ContentMode;
	language: string;
	textValue: string;
	setTextValue: (val: string) => void;
	theme: string;
	fontSize: number;
	editorContainerRef: (node: HTMLElement | null) => void;
	userInputRef: RefObject<HTMLTextAreaElement | null>;
	handleEditorWillMount: BeforeMount;
	handleEditorMount: OnMount;
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
	// File upload props
	onFileSelect?: (file: File) => void;
	uploadProgress?: number;
	isUploading?: boolean;
	uploadedFileName?: string | null;
	uploadError?: string | null;
	onClearFile?: () => void;
	fileMimeType?: string | null;
	previewUrl?: string | null;
}

export const EditorContent = ({
	contentType,
	language,
	textValue,
	setTextValue,
	theme,
	fontSize,
	editorContainerRef,
	userInputRef,
	handleEditorWillMount,
	handleEditorMount,
	handlePaste,
	onFileSelect,
	uploadProgress = 0,
	isUploading = false,
	uploadedFileName,
	uploadError,
	onClearFile,
	fileMimeType,
	previewUrl,
}: EditorContentProps) => {
	const { t } = useTranslation();

	const mime = fileMimeType?.toLowerCase() || "";
	const ext =
		uploadedFileName?.toLowerCase().split(".").pop() ||
		mime.split("/")[1] ||
		"";

	const isImage = mime.startsWith("image/");
	const isVideo = mime.startsWith("video/");
	const isAudio = mime.startsWith("audio/");
	const isPdf = mime === "application/pdf" || ext === "pdf";
	const hasPreview = previewUrl && (isImage || isVideo || isAudio || isPdf);

	useEffect(() => {
		if (contentType !== "file" || isUploading) return;

		const handleGlobalPaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.kind === "file") {
					const file = item.getAsFile();
					if (file && onFileSelect) {
						onFileSelect(file);
						e.preventDefault();
						break;
					}
				}
			}
		};

		document.addEventListener("paste", handleGlobalPaste);
		return () => {
			document.removeEventListener("paste", handleGlobalPaste);
		};
	}, [contentType, isUploading, onFileSelect]);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const file = e.dataTransfer.files[0];
		if (file && onFileSelect) {
			onFileSelect(file);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onFileSelect) {
			onFileSelect(file);
		}
	};

	const getFileIcon = () => {
		const mime = fileMimeType?.toLowerCase() || "";
		if (mime.startsWith("image/")) return <FileImage className="h-6 w-6" />;
		if (mime.startsWith("audio/")) return <FileAudio className="h-6 w-6" />;
		if (mime.startsWith("video/")) return <FileVideo className="h-6 w-6" />;

		const ext =
			uploadedFileName?.toLowerCase().split(".").pop() ||
			mime.split("/")[1] ||
			"";

		const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];
		if (
			archiveExts.includes(ext) ||
			mime.includes("zip") ||
			mime.includes("archive") ||
			mime.includes("compressed")
		)
			return <FileArchive className="h-6 w-6" />;

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
			return <FileCode className="h-6 w-6" />;

		if (ext === "pdf" || mime.includes("pdf"))
			return <FileText className="h-6 w-6" />;

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
			return <FileText className="h-6 w-6" />;

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
			return <Terminal className="h-6 w-6" />;

		return <File className="h-6 w-6" />;
	};

	return (
		<div
			ref={contentType === "draw" ? null : editorContainerRef}
			className="m-3 sm:m-5 h-[60vh] border border-border/50 bg-background/60 backdrop-blur-xl rounded-2xl overflow-hidden touch-none shadow-2xl relative z-20 ring-1 ring-white/5"
		>
			{contentType === "draw" ? (
				<CollabDraw
					isEdit={true}
					content={textValue}
					onContentChange={setTextValue}
					theme={theme as "light" | "dark" | "system"}
				/>
			) : contentType === "code" || contentType === "text" ? (
				<Editor
					height="100%"
					language={language}
					value={textValue}
					onChange={(value) => setTextValue(value || "")}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					beforeMount={handleEditorWillMount}
					onMount={handleEditorMount}
					options={{
						minimap: { enabled: false },
						fontSize: fontSize,
						padding: { top: 16 },
						mouseWheelZoom: true,
						wordWrap: "on",
					}}
				/>
			) : contentType === "file" ? (
				<div
					className="h-full w-full flex items-center justify-center p-6 bg-muted/5 overflow-y-auto"
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<div className="w-full max-w-xl my-auto">
						{uploadedFileName ? (
							<div className="space-y-6">
								{hasPreview && (
									<div className="w-full bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm overflow-hidden flex items-center justify-center">
										{isImage && (
											<img
												src={previewUrl!}
												alt={uploadedFileName}
												className="w-full h-auto max-h-[180px] object-cover bg-muted/10 pattern-boxes pattern-muted/20 pattern-bg-transparent pattern-size-4"
											/>
										)}
										{isVideo && (
											<video
												src={previewUrl!}
												controls
												className="w-full h-auto max-h-[180px] bg-black"
											/>
										)}
										{isAudio && (
											<div className="w-full py-4 px-4 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-transparent gap-3">
												<FileAudio className="w-8 h-8 text-primary animate-pulse drop-shadow-md" />
												<audio
													src={previewUrl!}
													controls
													className="w-full max-w-xs shadow-md rounded-full"
												/>
											</div>
										)}
										{isPdf && (
											<iframe
												src={previewUrl!}
												className="w-full h-[180px] border-0 bg-white"
												title={uploadedFileName}
											/>
										)}
									</div>
								)}
								{!hasPreview && (
									<div className="flex flex-col items-center gap-2 text-center">
										<div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
											<FileUp className="h-5 w-5" />
										</div>
										<h2 className="text-lg font-bold tracking-tight">
											{t("home.tab_file", "Upload File")}
										</h2>
									</div>
								)}
								<div
									className={cn(
										"relative p-6 rounded-2xl border-2 transition-all duration-300",
										isUploading
											? "border-primary/30 bg-primary/5"
											: "border-primary/10 bg-background shadow-sm",
									)}
								>
									<div className="flex items-center gap-5 relative z-10">
										<div className="relative">
											{isUploading ? (
												<div className="p-3.5 rounded-xl bg-primary text-primary-foreground transition-colors duration-300">
													<Loader2 className="h-6 w-6 animate-spin" />
												</div>
											) : uploadProgress === 100 ? (
												<div className="p-3.5 rounded-xl bg-emerald-500 text-white transition-colors duration-300">
													<CheckCircle2 className="h-6 w-6" />
												</div>
											) : (
												<div className="p-3.5 rounded-xl bg-primary/10 text-primary transition-colors duration-300">
													{getFileIcon()}
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between mb-1.5">
												<p className="font-semibold text-lg truncate pr-3 text-foreground/90">
													{uploadedFileName}
												</p>
												{!isUploading && (
													<Button
														variant="ghost"
														size="icon"
														onClick={onClearFile}
														className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
													>
														<X className="h-4 w-4" />
													</Button>
												)}
											</div>
											<div className="flex flex-col gap-2.5">
												<div className="flex items-center justify-between text-xs">
													<div className="font-medium">
														{isUploading ? (
															<span className="text-primary flex items-center gap-1.5">
																<span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
																{t(
																	"home.file_uploading",
																	"Uploading...",
																)}
															</span>
														) : uploadProgress ===
														  100 ? (
															<span className="text-emerald-500 flex items-center gap-1.5">
																<CheckCircle2 className="h-3.5 w-3.5" />
																{t(
																	"home.file_ready",
																	"File ready",
																)}
															</span>
														) : (
															<span className="text-muted-foreground flex items-center gap-1.5">
																<div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
																{t(
																	"home.file_selected",
																	"Selected - click Paste",
																)}
															</span>
														)}
													</div>
													{isUploading && (
														<span className="font-bold text-primary tabular-nums">
															{Math.round(
																uploadProgress,
															)}
															%
														</span>
													)}
												</div>
												<Progress
													value={uploadProgress}
													className="h-1.5 bg-muted/50 rounded-full"
													indicatorClassName={cn(
														"transition-all duration-500 ease-out",
														isUploading
															? "bg-primary"
															: uploadProgress ===
																  100
																? "bg-emerald-500"
																: "bg-primary/30",
													)}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="w-full">
								<label
									className={cn(
										"relative flex flex-col items-center justify-center gap-6 p-10 min-h-[300px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
										"border-primary/20 bg-background",
										"hover:border-primary/40 hover:bg-primary/5",
									)}
								>
									<input
										type="file"
										className="absolute inset-0 opacity-0 cursor-pointer z-20"
										onChange={handleFileInputChange}
									/>

									<div className="p-4 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all duration-200">
										<FileUp className="h-8 w-8" />
									</div>

									<div className="text-center space-y-2 max-w-sm">
										<h2 className="text-xl font-bold tracking-tight">
											{t("home.tab_file", "Upload File")}
										</h2>
										<p className="text-muted-foreground text-sm font-medium">
											{t(
												"home.file_drop",
												"Drag and drop your file here or click to browse",
											)}
										</p>
										<p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 pt-2">
											{t(
												"home.file_max_size",
												`Max Size: ${CONFIG.DEFAULTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
											)}
										</p>
									</div>

									<div className="flex items-center gap-4 pt-4 text-[11px] font-bold text-muted-foreground/70">
										<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
											<span className="text-emerald-500">
												✓
											</span>{" "}
											{t(
												"home.file_features.secure",
												"Secure",
											)}
										</div>
										<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
											<span className="text-emerald-500">
												✓
											</span>{" "}
											{t(
												"home.file_features.share",
												"Encrypted",
											)}
										</div>
									</div>
								</label>
							</div>
						)}

						{uploadError && (
							<div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
								{uploadError}
							</div>
						)}
					</div>
				</div>
			) : contentType === "link" ? (
				<div className="h-full w-full flex items-center justify-center p-6 bg-muted/5">
					<div className="w-full max-w-xl space-y-6">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
								<Link className="h-6 w-6" />
							</div>
							<h2 className="text-xl font-bold tracking-tight">
								{t("home.tab_link")}
							</h2>
							<p className="text-muted-foreground text-sm font-medium">
								{t("home.link_desc")}
							</p>
						</div>
						<Input
							value={textValue}
							onChange={(e) => setTextValue(e.target.value)}
							placeholder={t("home.link_placeholder")}
							className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background"
						/>
						<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-bold">
							<span className="px-3 py-1 rounded-lg bg-muted border border-border/50">
								✅ {t("home.link_features.fast")}
							</span>
							<span className="px-3 py-1 rounded-lg bg-muted border border-border/50">
								✅ {t("home.link_features.custom")}
							</span>
						</div>
					</div>
				</div>
			) : (
				<Textarea
					ref={userInputRef}
					value={textValue}
					onChange={(e) => setTextValue(e.target.value)}
					placeholder={t("home.enter_snippet_placeholder")}
					className="h-full w-full mx-auto resize-none border-0 focus-visible:ring-0 p-6 bg-background"
					onPaste={handlePaste}
					style={{ fontSize: `${fontSize}px` }}
				/>
			)}
		</div>
	);
};
