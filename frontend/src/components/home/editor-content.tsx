import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { CollabDraw } from "@/components/display/collab-draw";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { usePaste } from "@/context/PasteContext";
import { useTheme } from "@/hooks/use-theme";
import { EditorToolbar } from "@/components/common/editor-toolbar";
import { FileUploadView } from "./file-upload-view";
import { LinkResultView } from "./link-result-view";
import {
	useEffect,
	useState,
	useRef,
	type RefObject,
	useCallback,
	memo,
} from "react";
import { cn } from "@/lib/utils";
import { MarkdownDisplay } from "@/components/display/content/markdown-display";
import { ResizableSplitPane } from "@/components/common/resizable-split-pane";
import { useMarkdownLayout } from "@/hooks/use-markdown-layout";
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
		const [mdLayoutMode, setMdLayoutMode] = useMarkdownLayout();

		const [isHistoryVisible, setIsHistoryVisible] = useState(() => {
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("link-history-visible");
				return saved !== "false";
			}
			return true;
		});

		useEffect(() => {
			localStorage.setItem(
				"link-history-visible",
				isHistoryVisible.toString(),
			);
		}, [isHistoryVisible]);

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
		}, [isFullscreen, isWindowFullscreen, setIsFullscreen]);

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
						"mx-2 mt-0.5 sm:mx-4 sm:mt-1 mb-4 glass-card overflow-hidden relative z-20 flex flex-col rounded-2xl",
						contentType === "draw" && "touch-none",
						isFullscreen
							? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none"
							: "flex-1 min-h-0",
					)}
				>
					<EditorToolbar
						contentType={contentType}
						language={language}
						isFullscreen={isFullscreen}
						isWindowFullscreen={isWindowFullscreen}
						onToggleFullscreen={toggleFullscreen}
						onToggleWindowFullscreen={toggleWindowFullscreen}
						mdLayoutMode={mdLayoutMode}
						onMdLayoutModeChange={setMdLayoutMode}
					/>

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
								<ResizableSplitPane
									className="flex-1"
									showHint={true}
									initialWidth={50}
									mode={mdLayoutMode}
									storageKey="markdown-editor-preview-split"
									left={
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
									}
									right={
										<div className="h-full w-full overflow-y-auto bg-background/50">
											<MarkdownDisplay
												content={textValue}
												fontSize={fontSize}
												contentRef={() => {}}
											/>
										</div>
									}
								/>
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
									className="flex-1"
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
