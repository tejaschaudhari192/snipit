import { localStore } from "@/utils/storage";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import {
	lazy,
	Suspense,
	useEffect,
	useState,
	useRef,
	type RefObject,
	useCallback,
	memo,
} from "react";
import { useTranslation } from "react-i18next";
import { usePaste } from "@/context/PasteContext";
import { useTheme } from "@/hooks/use-theme";
import { useFileDrop } from "@/hooks/use-file-drop";
import type { PasteData } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useEditorLayout } from "@/hooks/use-editor-layout";
import { cn } from "@/utils";
import type { useTransliteration } from "@/hooks/use-transliteration";
import type { Editor as TiptapEditorInstance } from "@tiptap/core";
import { PlainTextEditor } from "@/components/common/plain-text-editor";
import { MonacoConfig } from "@/hooks/use-monaco-config";

const EditorToolbar = lazy(() =>
	import("@/components/common/editor-toolbar").then((m) => ({
		default: m.EditorToolbar,
	})),
);

const FileUploadView = lazy(() =>
	import("@/components/common/file-upload-view").then((m) => ({
		default: m.FileUploadView,
	})),
);

const LinkResultView = lazy(() =>
	import("@/components/home/link-result-view").then((m) => ({
		default: m.LinkResultView,
	})),
);

const ResizableSplitPane = lazy(() =>
	import("@/components/common/resizable-split-pane").then((m) => ({
		default: m.ResizableSplitPane,
	})),
);

const CollabDraw = lazy(() =>
	import("@/components/display/collab-draw").then((m) => ({
		default: m.CollabDraw,
	})),
);
const MarkdownDisplay = lazy(() =>
	import("@/components/display/content/markdown-display").then((m) => ({
		default: m.MarkdownDisplay,
	})),
);
const HtmlDisplay = lazy(() =>
	import("@/components/display/content/html-display").then((m) => ({
		default: m.HtmlDisplay,
	})),
);

const VideoSetupView = lazy(() =>
	import("./video-setup-view").then((m) => ({
		default: m.VideoSetupView,
	})),
);

const TiptapEditor = lazy(() =>
	import("@/components/editor/tiptap-editor").then((m) => ({
		default: m.TiptapEditor,
	})),
);
const MonacoEditor = lazy(() =>
	import("@monaco-editor/react").then((m) => ({
		default: m.Editor,
	})),
);

const EditorInnerSkeleton = () => (
	<div className="flex-1 p-6 space-y-4 w-full h-full bg-background/50">
		<div className="animate-pulse space-y-4">
			<Skeleton className="w-3/4 h-4 rounded opacity-40 bg-muted-foreground/30" />
			<Skeleton className="w-1/2 h-4 rounded opacity-40 bg-muted-foreground/30" />
			<Skeleton className="w-5/6 h-4 rounded opacity-40 bg-muted-foreground/30" />
			<div className="pt-4 space-y-2">
				<Skeleton className="w-full h-3 rounded-full opacity-20 bg-muted-foreground/30" />
				<Skeleton className="w-full h-3 rounded-full opacity-20 bg-muted-foreground/30" />
				<Skeleton className="w-2/3 h-3 rounded-full opacity-20 bg-muted-foreground/30" />
			</div>
		</div>
	</div>
);

interface EditorContentProps {
	fontSize: number;
	editorContainerRef: (node: HTMLElement | null) => void;
	userInputRef: RefObject<HTMLTextAreaElement | null>;
	handleEditorWillMount: BeforeMount;
	handleEditorMount: OnMount;
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
	onFileSelect?: (files: File[]) => void;
	onClearFile?: () => void;
	previewUrl?: string | null;
	isFullscreen: boolean;
	setIsFullscreen: (val: boolean | ((p: boolean) => boolean)) => void;
	shortenedResult?: { id: string; url: string } | null;
	historyItems?: Array<PasteData>;
	onDeleteHistoryItem?: (id: string) => void;
	drawRevision?: number;
	transliteration?: ReturnType<typeof useTransliteration>;
	onEditorInstance?: (editor: TiptapEditorInstance | null) => void;
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
		drawRevision = 0,
		transliteration,
		onEditorInstance,
	}: EditorContentProps) => {
		const {
			contentType,
			language,
			textValue,
			setTextValue,
			isUploading,
			files,
			removeFile,
			uploadError,
		} = usePaste();
		const { theme } = useTheme();
		const { t } = useTranslation();
		const containerRef = useRef<HTMLDivElement>(null);

		const {
			isWindowFullscreen,
			mdLayoutMode,
			setMdLayoutMode,
			toggleFullscreen,
			toggleWindowFullscreen,
		} = useEditorLayout({ isFullscreen, setIsFullscreen, containerRef });

		const { handleDragOver, handleDrop, handleFileInputChange } =
			useFileDrop({ onFileSelect });

		const [isHistoryVisible, setIsHistoryVisible] = useState(() => {
			if (typeof window !== "undefined") {
				const saved = localStore.getItem("link-history-visible");
				return saved !== "false";
			}
			return true;
		});

		const onMount: OnMount = (ed, monaco) => {
			handleEditorMount(ed, monaco);
			if (transliteration) {
				transliteration.setupEditor(ed, monaco);
			}
		};

		useEffect(() => {
			localStore.setItem(
				"link-history-visible",
				isHistoryVisible.toString(),
			);
		}, [isHistoryVisible]);

		const stableRefCallback = useCallback(
			(node: HTMLDivElement | null) => {
				(
					containerRef as React.MutableRefObject<HTMLDivElement | null>
				).current = node;
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
						"mx-2 mt-0.5 sm:mx-4 sm:mt-1 mb-4 glass-card relative z-20 flex flex-col rounded-2xl",
						contentType !== "richtext" && "overflow-hidden",
						contentType === "draw" && "touch-none",
						isFullscreen
							? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none"
							: "flex-1 min-h-0",
					)}
				>
					<Suspense
						fallback={
							<div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-2">
								<Skeleton className="h-9 w-9 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</div>
						}
					>
						<EditorToolbar
							contentType={contentType}
							content={textValue}
							language={language}
							isFullscreen={isFullscreen}
							isWindowFullscreen={isWindowFullscreen}
							onToggleFullscreen={toggleFullscreen}
							onToggleWindowFullscreen={toggleWindowFullscreen}
							mdLayoutMode={mdLayoutMode}
							onMdLayoutModeChange={setMdLayoutMode}
						/>
					</Suspense>

					<div className="flex-1 w-full h-full relative min-h-0 flex flex-col">
						{contentType === "draw" ? (
							<Suspense
								fallback={
									<Skeleton className="w-full h-full rounded-xl" />
								}
							>
								<CollabDraw
									key={`draw-${drawRevision}`}
									isEdit={true}
									content={textValue}
									onContentChange={setTextValue}
									theme={theme as "light" | "dark" | "system"}
								/>
							</Suspense>
						) : contentType === "text" ? (
							transliteration?.enabled ? (
								<Suspense
									fallback={
										<Skeleton className="h-full w-full" />
									}
								>
									<MonacoConfig />
									<MonacoEditor
										height="100%"
										language="plaintext"
										value={textValue}
										onChange={(value) =>
											setTextValue(value || "")
										}
										theme={
											theme === "dark"
												? "snipit-dark"
												: "snipit-light"
										}
										className="flex-1"
										beforeMount={handleEditorWillMount}
										onMount={onMount}
										loading={<EditorInnerSkeleton />}
										options={{
											minimap: { enabled: false },
											fontSize: fontSize,
											padding: { top: 16 },
											mouseWheelZoom: true,
											wordWrap: "on",
											automaticLayout: true,
										}}
									/>
								</Suspense>
							) : (
								<PlainTextEditor
									content={textValue}
									onContentChange={setTextValue}
									fontSize={fontSize}
									textareaRef={
										userInputRef as React.RefObject<HTMLTextAreaElement | null>
									}
									onPaste={
										handlePaste as unknown as React.ClipboardEventHandler<HTMLTextAreaElement>
									}
									placeholder={t(
										"home.enter_snippet_placeholder",
									)}
								/>
							)
						) : contentType === "code" ? (
							language === "markdown" || language === "html" ? (
								<Suspense
									fallback={
										<Skeleton className="flex-1 w-full h-full" />
									}
								>
									<MonacoConfig />
									<ResizableSplitPane
										className="flex-1"
										showHint={true}
										initialWidth={50}
										mode={mdLayoutMode}
										storageKey={`${language}-editor-preview-split`}
										left={
											<Suspense
												fallback={
													<Skeleton className="h-full w-full" />
												}
											>
												<MonacoEditor
													height="100%"
													language={language}
													value={textValue}
													onChange={(value) =>
														setTextValue(
															value || "",
														)
													}
													theme={
														theme === "dark"
															? "snipit-dark"
															: "snipit-light"
													}
													beforeMount={
														handleEditorWillMount
													}
													onMount={onMount}
													loading={
														<EditorInnerSkeleton />
													}
													options={{
														minimap: {
															enabled: false,
														},
														fontSize: fontSize,
														padding: { top: 16 },
														mouseWheelZoom: true,
														wordWrap: "on",
														automaticLayout: true,
													}}
												/>
											</Suspense>
										}
										right={
											<div className="h-full w-full overflow-y-auto bg-background/50">
												<Suspense
													fallback={
														<Skeleton className="p-10 rounded-2xl h-64 w-full" />
													}
												>
													{language === "markdown" ? (
														<MarkdownDisplay
															content={textValue}
															fontSize={fontSize}
															contentRef={() => {}}
														/>
													) : (
														<HtmlDisplay
															content={textValue}
														/>
													)}
												</Suspense>
											</div>
										}
									/>
								</Suspense>
							) : (
								<Suspense
									fallback={
										<Skeleton className="h-full w-full" />
									}
								>
									<MonacoConfig />
									<MonacoEditor
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
										className="flex-1"
										beforeMount={handleEditorWillMount}
										onMount={onMount}
										loading={<EditorInnerSkeleton />}
										options={{
											minimap: { enabled: false },
											fontSize: fontSize,
											padding: { top: 16 },
											mouseWheelZoom: true,
											wordWrap: "on",
											automaticLayout: true,
										}}
									/>
								</Suspense>
							)
						) : contentType === "file" ? (
							<Suspense
								fallback={
									<div className="h-full w-full flex items-center justify-center p-10">
										<div className="w-full max-w-xl space-y-6">
											<div className="flex flex-col items-center gap-4">
												<Skeleton className="h-12 w-12 rounded-xl" />
												<Skeleton className="h-8 w-48" />
												<Skeleton className="h-4 w-64" />
											</div>
											<Skeleton className="h-75 w-full rounded-2xl border-2 border-dashed" />
										</div>
									</div>
								}
							>
								<FileUploadView
									files={files}
									previewUrl={previewUrl}
									isUploading={isUploading}
									uploadError={uploadError}
									onClearFile={onClearFile}
									onRemoveFile={removeFile}
									handleDragOver={handleDragOver}
									handleDrop={handleDrop}
									handleFileInputChange={
										handleFileInputChange
									}
								/>
							</Suspense>
						) : contentType === "link" ? (
							<Suspense
								fallback={
									<div className="h-full w-full flex items-center justify-center p-6">
										<div className="w-full max-w-xl space-y-8">
											<div className="flex flex-col items-center gap-4">
												<Skeleton className="h-14 w-14 rounded-xl" />
												<Skeleton className="h-8 w-40" />
												<Skeleton className="h-4 w-60" />
											</div>
											<Skeleton className="h-12 w-full rounded-xl" />
										</div>
									</div>
								}
							>
								<LinkResultView
									textValue={textValue}
									setTextValue={setTextValue}
									shortenedResult={shortenedResult}
									isHistoryVisible={isHistoryVisible}
									setIsHistoryVisible={setIsHistoryVisible}
									linkHistory={linkHistory}
									onDeleteHistoryItem={onDeleteHistoryItem}
								/>
							</Suspense>
						) : contentType === "video" ? (
							<Suspense
								fallback={
									<div className="h-full w-full flex items-center justify-center p-6">
										<div className="w-full max-w-xl space-y-8">
											<div className="flex flex-col items-center gap-4">
												<Skeleton className="h-14 w-14 rounded-xl" />
												<Skeleton className="h-8 w-40" />
												<Skeleton className="h-4 w-60" />
											</div>
											<Skeleton className="h-12 w-full rounded-xl" />
										</div>
									</div>
								}
							>
								<VideoSetupView
									textValue={textValue}
									setTextValue={setTextValue}
									files={files}
									removeFile={removeFile}
									onFileSelect={onFileSelect}
								/>
							</Suspense>
						) : contentType === "richtext" ? (
							<Suspense
								fallback={
									<Skeleton className="flex-1 w-full h-full" />
								}
							>
								<TiptapEditor
									value={textValue}
									onChange={setTextValue}
									transliteration={transliteration}
									onEditorInstance={onEditorInstance}
								/>
							</Suspense>
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
