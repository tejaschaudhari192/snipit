import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { CollabDraw } from "@/components/display/collab-draw";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
	Link,
	FileUp,
	X,
	CheckCircle2,
	Loader2,
	Copy,
	ExternalLink,
	History,
	RefreshCw,
	Trash2,
} from "lucide-react";
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
import { cn, timeAgo } from "@/lib/utils";
import { CONFIG } from "@/configurations";
import { MarkdownDisplay } from "@/components/display/content/markdown-display";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { FilePreview } from "@/components/common/file-preview";
import { usePaste } from "@/context/PasteContext";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";
import type { PasteData } from "@/types";

interface EditorContentProps {
	fontSize: number;
	editorContainerRef: (node: HTMLElement | null) => void;
	userInputRef: RefObject<HTMLTextAreaElement | null>;
	handleEditorWillMount: BeforeMount;
	handleEditorMount: OnMount;
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
	onFileSelect?: (file: File) => void;
	onClearFile?: () => void;
	previewUrl?: string | null;
	isFullscreen: boolean;
	setIsFullscreen: (val: boolean | ((p: boolean) => boolean)) => void;
	shortenedResult?: {
		id: string;
		url: string;
	} | null;
	historyItems?: Array<PasteData>;
	onDeleteHistoryItem?: (id: string) => void;
}

export const EditorContent = memo(
	({
		fontSize,
		editorContainerRef,
		userInputRef,
		handleEditorWillMount,
		handleEditorMount,
		handlePaste,
		onFileSelect,
		onClearFile,
		previewUrl,
		isFullscreen,
		setIsFullscreen,
		shortenedResult,
		historyItems = [],
		onDeleteHistoryItem,
	}: EditorContentProps) => {
		const {
			contentType,
			language,
			textValue,
			setTextValue,
			isUploading,
			uploadProgress,
			fileName: uploadedFileName,
			uploadError,
			fileMimeType,
		} = usePaste();
		const { theme } = useTheme();
		const { t } = useTranslation();
		const containerRef = useRef<HTMLDivElement>(null);
		const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);

		useEffect(() => {
			const handleFullscreenChange = () => {
				setIsWindowFullscreen(!!document.fullscreenElement);
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

		useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					if (isWindowFullscreen) {
						document
							.exitFullscreen()
							.catch((err) => console.error(err));
					} else if (isFullscreen) {
						setIsFullscreen(false);
					}
				}
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [isFullscreen, isWindowFullscreen]);

		const toggleFullscreen = () => {
			setIsFullscreen((prev) => !prev);
		};

		const toggleWindowFullscreen = () => {
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

		const linkHistory = (historyItems || []).filter(
			(item) => item.contentMode === "link",
		);

		return (
			<div className="flex-1 flex flex-col min-h-0 relative">
				<div
					ref={stableRefCallback}
					className={cn(
						"mx-2 mt-0.5 sm:mx-4 sm:mt-1 mb-4 glass-card overflow-hidden touch-none relative z-20 flex flex-col rounded-2xl",
						isFullscreen
							? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none"
							: "flex-1 min-h-[50vh]",
					)}
				>
					{(contentType === "code" ||
						contentType === "text" ||
						contentType === "draw") && (
						<ZenModeToggle
							isFullscreen={isFullscreen}
							isWindowFullscreen={isWindowFullscreen}
							onToggle={toggleFullscreen}
							onWindowToggle={toggleWindowFullscreen}
							className={cn(
								contentType === "draw"
									? "absolute right-0 top-0"
									: "absolute top-8 right-8",
							)}
						/>
					)}
					<div className="flex-1 w-full h-full relative min-h-0 flex flex-col">
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
												automaticLayout: true,
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
										automaticLayout: true,
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
																				"Selected - click Upload",
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
							<div className="h-full w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden">
								<div className="md:col-span-8 flex items-center justify-center p-6 bg-muted/5 overflow-y-auto border-r border-border/10">
									{shortenedResult ? (
										<div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
											<div className="glass-card p-8 flex flex-col items-center gap-6 text-center border-primary/20 bg-primary/5">
												<div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
													<CheckCircle2 className="h-10 w-10" />
												</div>

												<div className="space-y-2">
													<h2 className="text-2xl font-black tracking-tight text-foreground">
														{t(
															"home.link_shortened",
															"Link Shortened!",
														)}
													</h2>
													<p className="text-muted-foreground font-medium">
														{t(
															"home.link_ready_desc",
															"Your short link is ready to share",
														)}
													</p>
												</div>

												<div className="w-full space-y-4">
													<div className="relative group/link">
														<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-xl blur opacity-20 group-hover/link:opacity-40 transition duration-500"></div>
														<div className="relative flex items-center gap-2 p-1 pl-4 bg-background border border-border/50 rounded-xl">
															<span className="flex-1 text-sm font-bold truncate text-left text-foreground/90">
																{
																	shortenedResult.url
																}
															</span>
															<Button
																size="sm"
																variant="ghost"
																className="h-9 px-4 font-bold gap-2 hover:bg-primary/10 hover:text-primary transition-all"
																onClick={() => {
																	navigator.clipboard.writeText(
																		shortenedResult.url,
																	);
																	toast.success(
																		t(
																			"header.copied_link",
																			{
																				id: `/${shortenedResult.id}`,
																				defaultValue: `Copied /${shortenedResult.id}`,
																			},
																		),
																	);
																}}
															>
																<Copy className="h-3.5 w-3.5" />
																{t(
																	"display.copy_button",
																)}
															</Button>
														</div>
													</div>

													<div className="flex items-center justify-between px-2 text-[11px] font-bold text-muted-foreground/80 tracking-wide">
														<span>
															{t(
																"home.alias",
																"Alias",
															)}
															:{" "}
															{shortenedResult.id}
														</span>
													</div>
												</div>

												<div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
													<Button
														className="flex-1 h-11 font-black uppercase tracking-wider shadow-lg shadow-primary/20"
														onClick={() =>
															window.open(
																shortenedResult.url,
																"_blank",
															)
														}
													>
														<ExternalLink className="h-4 w-4 mr-2" />
														{t("common.visit_link")}
													</Button>
													<Button
														variant="outline"
														className="flex-1 h-11 font-bold border-border/50 bg-background/50 backdrop-blur-sm"
														onClick={() =>
															setTextValue("")
														}
													>
														{t(
															"home.create_another",
															"Create Another",
														)}
													</Button>
												</div>
											</div>
										</div>
									) : (
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
												placeholder={t(
													"home.link_placeholder",
												)}
												className="h-12 text-base px-5 rounded-xl border-primary/20 focus-visible:ring-primary/20 bg-background"
											/>
											<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-bold">
												<span className="px-3 py-1 rounded-lg bg-muted border border-border/50">
													✅{" "}
													{t(
														"home.link_features.fast",
													)}
												</span>
												<span className="px-3 py-1 rounded-lg bg-muted border border-border/50">
													✅{" "}
													{t(
														"home.link_features.custom",
													)}
												</span>
											</div>
										</div>
									)}
								</div>

								{/* Recent Links Sidebar */}
								<div className="md:col-span-4 bg-background/30 flex flex-col min-h-0">
									<div className="p-4 border-b border-border/10 flex items-center justify-between bg-background/40 backdrop-blur-md sticky top-0 z-10">
										<div className="flex items-center gap-2">
											<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
												<History className="h-3.5 w-3.5" />
											</div>
											<h3 className="text-xs font-black uppercase tracking-widest text-primary/80">
												{t(
													"history.title",
													"Recent Links",
												)}
											</h3>
										</div>
										<button
											className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
											onClick={() =>
												window.location.reload()
											}
										>
											<RefreshCw className="h-3 w-3" />
										</button>
									</div>

									<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
										{linkHistory.length === 0 ? (
											<div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
												<div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
													<Link className="h-5 w-5 text-muted-foreground/40" />
												</div>
												<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
													{t(
														"history.no_history_desc",
														"No history yet",
													)}
												</p>
											</div>
										) : (
											linkHistory.map((item) => (
												<div
													key={item.id}
													className={cn(
														"group/history-item w-full p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/[0.02] hover:border-primary/20 transition-all flex flex-col gap-2 relative overflow-hidden",
													)}
												>
													<div className="flex items-center justify-between">
														<span className="text-[10px] font-bold tracking-wider text-primary/80">
															/{item.id}
														</span>
														<span className="text-[9px] font-bold text-muted-foreground/50">
															{timeAgo(
																item.createdAt,
																t,
															)}
														</span>
													</div>
													<p className="text-[11px] font-medium text-foreground/70 truncate leading-relaxed">
														{item.content}
													</p>

													<div className="flex items-center gap-2 mt-1.5">
														<Button
															variant="secondary"
															size="sm"
															className="h-7 px-2.5 text-[9px] font-black uppercase tracking-wider gap-1.5 flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-none transition-all"
															onClick={() => {
																const shortUrl = `${window.location.origin}/${item.id}`;
																navigator.clipboard.writeText(
																	shortUrl,
																);
																toast.success(
																	t(
																		"header.copied_link",
																		{
																			id: `/${item.id}`,
																			defaultValue: `Copied /${item.id}`,
																		},
																	),
																);
															}}
														>
															<Copy className="h-3 w-3" />
															{t(
																"display.copy_button",
																"Copy",
															)}
														</Button>
														<Button
															variant="secondary"
															size="sm"
															className="h-7 px-2.5 text-[9px] font-black uppercase tracking-wider gap-1.5 flex-1 bg-muted/60 hover:bg-muted text-muted-foreground border-none transition-all"
															onClick={() => {
																const shortUrl = `${window.location.origin}/${item.id}`;
																window.open(
																	shortUrl,
																	"_blank",
																);
															}}
														>
															<ExternalLink className="h-3 w-3" />
															{t(
																"common.visit_link",
																"Visit",
															)}
														</Button>
														{onDeleteHistoryItem && (
															<Button
																variant="secondary"
																size="sm"
																className="h-7 w-9 flex items-center justify-center bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none transition-all"
																onClick={(
																	e,
																) => {
																	e.stopPropagation();
																	onDeleteHistoryItem(
																		item.id,
																	);
																}}
																title={t(
																	"display.delete_button",
																	"Delete",
																)}
															>
																<Trash2 className="h-3 w-3" />
															</Button>
														)}
													</div>
												</div>
											))
										)}
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
