import { type BeforeMount, type OnMount, Editor } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
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
import { EditorToolbar } from "@/components/common/editor-toolbar";
import { FileUploadView } from "./file-upload-view";
import { LinkResultView } from "./link-result-view";
import { cn } from "@/utils";
import { ResizableSplitPane } from "@/components/common/resizable-split-pane";
import { useEditorLayout } from "@/hooks/use-editor-layout";
import { useFileDrop } from "@/hooks/use-file-drop";
import type { PasteData } from "@/types";
import { Textarea } from "@/components/ui/textarea";

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
	shortenedResult?: { id: string; url: string } | null;
	historyItems?: Array<PasteData>;
	onDeleteHistoryItem?: (id: string) => void;
	drawRevision?: number;
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
				const saved = localStorage.getItem("link-history-visible");
				return saved !== "false";
			}
			return true;
		});

		const [editorInstance, setEditorInstance] =
			useState<editor.IStandaloneCodeEditor | null>(null);

		const onMount: OnMount = (ed, monaco) => {
			setEditorInstance(ed);
			handleEditorMount(ed, monaco);
		};

		useEffect(() => {
			localStorage.setItem(
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
						"mx-2 mt-0.5 sm:mx-4 sm:mt-1 mb-4 glass-card overflow-hidden relative z-20 flex flex-col rounded-2xl",
						contentType === "draw" && "touch-none",
						isFullscreen
							? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none"
							: "flex-1 min-h-0",
					)}
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
						editor={editorInstance}
					/>

					<div className="flex-1 w-full h-full relative min-h-0 flex flex-col">
						{contentType === "draw" ? (
							<Suspense
								fallback={
									<div className="w-full h-full animate-pulse bg-muted/20 rounded-xl" />
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
						) : contentType === "code" || contentType === "text" ? (
							language === "markdown" ? (
								<ResizableSplitPane
									className="flex-1"
									showHint={true}
									initialWidth={50}
									mode={mdLayoutMode}
									storageKey="markdown-editor-preview-split"
									left={
										<Suspense
											fallback={
												<div className="h-full w-full bg-background animate-pulse" />
											}
										>
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
												beforeMount={
													handleEditorWillMount
												}
												onMount={onMount}
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
									}
									right={
										<div className="h-full w-full overflow-y-auto bg-background/50">
											<Suspense
												fallback={
													<div className="p-10 animate-pulse bg-muted/10 rounded-2xl h-64" />
												}
											>
												<MarkdownDisplay
													content={textValue}
													fontSize={fontSize}
													contentRef={() => {}}
												/>
											</Suspense>
										</div>
									}
								/>
							) : (
								<Suspense
									fallback={
										<div className="h-full w-full bg-background animate-pulse" />
									}
								>
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
										className="flex-1"
										beforeMount={handleEditorWillMount}
										onMount={onMount}
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
							<FileUploadView
								uploadedFileName={uploadedFileName}
								previewUrl={previewUrl}
								fileMimeType={fileMimeType}
								isUploading={isUploading}
								uploadProgress={uploadProgress}
								uploadError={uploadError}
								onClearFile={onClearFile}
								handleDragOver={handleDragOver}
								handleDrop={handleDrop}
								handleFileInputChange={handleFileInputChange}
							/>
						) : contentType === "link" ? (
							<LinkResultView
								textValue={textValue}
								setTextValue={setTextValue}
								shortenedResult={shortenedResult}
								isHistoryVisible={isHistoryVisible}
								setIsHistoryVisible={setIsHistoryVisible}
								linkHistory={linkHistory}
								onDeleteHistoryItem={onDeleteHistoryItem}
							/>
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
