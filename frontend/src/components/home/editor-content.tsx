import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { CollabDraw } from "@/components/display/collab-draw";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link, FileUp, X, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	useEffect,
	useState,
	useRef,
	type RefObject,
	useCallback,
	memo,
} from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/configurations";
import type { ContentMode } from "@/types";
import { MarkdownDisplay } from "@/components/display/content/markdown-display";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { FilePreview } from "@/components/common/file-preview";

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

export const EditorContent = memo(
	({
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
		const containerRef = useRef<HTMLDivElement>(null);
		const [isFullscreen, setIsFullscreen] = useState(false);

		useEffect(() => {
			const handleFullscreenChange = () => {
				setIsFullscreen(!!document.fullscreenElement);
			};
			document.addEventListener(
				"fullscreenchange",
				handleFullscreenChange,
			);
			return () =>
				document.removeEventListener(
					"fullscreenchange",
					handleFullscreenChange,
				);
		}, []);

		const toggleFullscreen = () => {
			if (!document.fullscreenElement) {
				containerRef.current?.requestFullscreen().catch((err) => {
					console.error(
						"Error attempting to enable fullscreen:",
						err,
					);
				});
			} else {
				document.exitFullscreen().catch((err) => console.error(err));
			}
		};

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

		const handleFileInputChange = (
			e: React.ChangeEvent<HTMLInputElement>,
		) => {
			const file = e.target.files?.[0];
			if (file && onFileSelect) {
				onFileSelect(file);
			}
		};

		const stableRefCallback = useCallback(
			(node: HTMLDivElement | null) => {
				containerRef.current = node;
				if (contentType !== "draw" && editorContainerRef) {
					editorContainerRef(node);
				}
			},
			[contentType, editorContainerRef],
		);

		return (
			<div className="flex-1 flex flex-col min-h-0 relative">
				{(contentType === "code" ||
					contentType === "text" ||
					contentType === "draw") && (
					<ZenModeToggle
						isFullscreen={isFullscreen}
						onToggle={toggleFullscreen}
						className={cn(
							contentType === "draw"
								? "absolute right-3 top-3"
								: "absolute top-8 right-8",
							isFullscreen ? "fixed top-4 right-8" : "",
						)}
					/>
				)}
				<div
					ref={stableRefCallback}
					className={cn(
						"m-3 sm:m-5 glass-card overflow-hidden touch-none relative z-20 flex flex-col",
						isFullscreen
							? "fixed inset-0 m-0 z-50 rounded-none h-screen"
							: "h-[60vh] rounded-2xl",
					)}
				>
					<div className="flex-1 w-full h-full relative">
						{contentType === "draw" ? (
							<CollabDraw
								isEdit={true}
								content={textValue}
								onContentChange={setTextValue}
								theme={theme as "light" | "dark" | "system"}
							/>
						) : contentType === "code" || contentType === "text" ? (
							language === "markdown" ? (
								<div className="flex flex-col md:flex-row h-full w-full">
									<div className="flex-1 md:w-1/2 min-h-[200px] md:min-h-0 min-w-0 md:border-r border-b md:border-b-0 border-border/50 relative">
										<Editor
											height="100%"
											language={language}
											value={textValue}
											onChange={(value) =>
												setTextValue(value || "")
											}
											theme={
												theme === "dark"
													? "snipit-dark"
													: "snipit-light"
											}
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
									</div>
									<div className="flex-1 md:w-1/2 min-h-[200px] md:min-h-0 min-w-0 overflow-y-auto bg-background/50">
										<MarkdownDisplay
											content={textValue}
											fontSize={fontSize}
											contentRef={() => {}}
										/>
									</div>
								</div>
							) : (
								<Editor
									height="100%"
									language={language}
									value={textValue}
									onChange={(value) =>
										setTextValue(value || "")
									}
									theme={
										theme === "dark"
											? "snipit-dark"
											: "snipit-light"
									}
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
							)
						) : contentType === "file" ? (
							<div
								className="h-full w-full flex items-center justify-center p-6 bg-muted/5 overflow-y-auto"
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							>
								<div className="w-full max-w-xl my-auto">
									{uploadedFileName ? (
										<div className="space-y-6">
											{previewUrl && (
												<FilePreview
													url={previewUrl}
													fileName={uploadedFileName}
													mimeType={fileMimeType}
													maxHeight="180px"
												/>
											)}
											{!previewUrl && (
												<div className="flex flex-col items-center gap-2 text-center">
													<div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
														<FileUp className="h-5 w-5" />
													</div>
													<h2 className="text-lg font-bold tracking-tight">
														{t(
															"home.tab_file",
															"Upload File",
														)}
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
														) : uploadProgress ===
														  100 ? (
															<div className="p-3.5 rounded-xl bg-emerald-500 text-white transition-colors duration-300">
																<CheckCircle2 className="h-6 w-6" />
															</div>
														) : (
															<div className="p-3.5 rounded-xl bg-primary/10 text-primary transition-colors duration-300">
																<FileTypeIcon
																	fileName={
																		uploadedFileName
																	}
																	mimeType={
																		fileMimeType
																	}
																	className="h-6 w-6"
																/>
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between mb-1.5">
															<p className="font-semibold text-lg truncate pr-3 text-foreground/90">
																{
																	uploadedFileName
																}
															</p>
															{!isUploading && (
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={
																		onClearFile
																	}
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
																value={
																	uploadProgress
																}
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
													onChange={
														handleFileInputChange
													}
												/>

												<div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all duration-200">
													<FileUp className="h-8 w-8" />
												</div>

												<div className="text-center space-y-2 max-w-sm">
													<h2 className="text-xl font-bold tracking-tight">
														{t(
															"home.tab_file",
															"Upload File",
														)}
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
										onChange={(e) =>
											setTextValue(e.target.value)
										}
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
								placeholder={t(
									"home.enter_snippet_placeholder",
								)}
								className="h-full w-full mx-auto resize-none border-0 focus-visible:ring-0 p-6 bg-background"
								onPaste={handlePaste}
								style={{ fontSize: `${fontSize}px` }}
							/>
						)}
					</div>
				</div>
			</div>
		);
	},
);
