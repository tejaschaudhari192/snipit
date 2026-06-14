import { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import { useRef, useEffect, memo, useState, lazy, Suspense } from "react";
import { cn } from "@/utils";
import { EditorToolbar } from "@/components/common/editor-toolbar";
import type { PasteData, ContentMode, EditorChange } from "@/types";
import { MarkdownDisplay } from "@/components/display/content/markdown-display";
import { HtmlDisplay } from "@/components/display/content/html-display";
import { ResizableSplitPane } from "@/components/common/resizable-split-pane";
import { FileDisplay } from "@/components/display/content/file-display";
import { CodeEditorView } from "@/components/display/content/code-editor-view";
import { LinkView } from "@/components/display/content/link-view";
import { useMarkdownLayout } from "@/hooks/use-markdown-layout";

import type { Socket } from "socket.io-client";
import type { ActiveUser } from "@/types";
import { CollabDraw } from "@/components/display/collab-draw";
import { FileEditView } from "@/components/display/content/file-edit-view";
import { CinemaSkeleton } from "@/components/display/content/cinema-skeleton";
import type { FileUploadStatus } from "@/lib/file-service";

const VideoDisplay = lazy(() =>
	import("@/components/display/content/video-display").then((m) => ({
		default: m.VideoDisplay,
	})),
);

const TiptapEditor = lazy(() =>
	import("@/components/editor/tiptap-editor").then((m) => ({
		default: m.TiptapEditor,
	})),
);

import { Editor } from "@tiptap/core";
import { Skeleton } from "@/components/ui/skeleton";
import type { useTransliteration } from "@/hooks/use-transliteration";

interface DisplayContentProps {
	id: string;
	isEdit: boolean;
	isAdmin?: boolean;
	contentType: ContentMode;
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	onEditorChange?: (data: {
		changes?: EditorChange[];
		content?: string;
	}) => void;
	theme: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
	handleEditorWillMount: BeforeMount;
	paste: PasteData;
	onMount?: OnMount;
	socketRef?: React.MutableRefObject<Socket | null>;
	activeUsers?: ActiveUser[];
	isFullscreen: boolean;
	setIsFullscreen: (v: boolean) => void;
	isWindowFullscreen: boolean;
	setIsWindowFullscreen: (v: boolean) => void;
	onFileSelect?: (files: File[]) => void;
	onClearFile?: () => void;
	isServerFileRemoved?: boolean;
	onRemoveServerFile?: (url: string) => void;
	onRemovePendingFile?: (id: string) => void;
	onClearAll?: () => void;
	removedServerFileUrls?: Set<string>;
	previewUrl?: string | null;
	files?: FileUploadStatus[];
	isFileUploading?: boolean;
	fileUploadError?: string | null;
	transliteration?: ReturnType<typeof useTransliteration>;
	onEditorInstance?: (editor: Editor | null) => void;
	onMarkdownLayoutModeChange?: (mode: "split" | "editor" | "preview") => void;
}

export const DisplayContent = memo(
	({
		id,
		isEdit,
		isAdmin,
		contentType,
		language,
		content,
		onContentChange,
		onEditorChange,
		theme,
		fontSize,
		contentRef,
		handleEditorWillMount,
		paste,
		onMount,
		socketRef,
		activeUsers,
		isFullscreen,
		setIsFullscreen,
		isWindowFullscreen,
		setIsWindowFullscreen,
		onFileSelect,
		onClearFile,
		isServerFileRemoved,
		onRemoveServerFile,
		onRemovePendingFile,
		onClearAll,
		removedServerFileUrls,
		previewUrl,
		files = [],
		isFileUploading = false,
		fileUploadError = null,
		transliteration,
		onEditorInstance,
	}: DisplayContentProps) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const [mdLayoutMode, setMdLayoutMode] = useMarkdownLayout();
		const [editorInstance, setEditorInstance] =
			useState<editor.IStandaloneCodeEditor | null>(null);

		const handleMount: OnMount = (ed, monaco) => {
			setEditorInstance(ed);
			if (onMount) onMount(ed, monaco);
		};

		// Cleanup editor instance on unmount to prevent using disposed instances
		useEffect(() => {
			return () => {
				setEditorInstance(null);
			};
		}, []);

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
		}, [setIsWindowFullscreen]);

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

		const toggleFullscreen = () => {
			setIsFullscreen(!isFullscreen);
		};

		const renderContent = () => {
			if (contentType === "video") {
				return (
					<Suspense fallback={<CinemaSkeleton />}>
						<VideoDisplay
							paste={paste}
							contentRef={contentRef}
							socketRef={socketRef}
							activeUsers={activeUsers}
							isEdit={isEdit}
							content={content}
							onContentChange={onContentChange}
						/>
					</Suspense>
				);
			}

			if (contentType === "richtext") {
				return (
					<Suspense
						fallback={<Skeleton className="flex-1 w-full h-full" />}
					>
						<TiptapEditor
							value={content}
							onChange={onContentChange}
							readOnly={!isEdit}
							transliteration={transliteration}
							onEditorInstance={onEditorInstance}
						/>
					</Suspense>
				);
			}

			if (contentType === "file") {
				if (isEdit) {
					return (
						<FileEditView
							paste={paste || null}
							previewUrl={previewUrl}
							files={files}
							isFileUploading={isFileUploading}
							fileUploadError={fileUploadError}
							onFileSelect={onFileSelect || (() => {})}
							onRemoveServerFile={
								onRemoveServerFile || (() => {})
							}
							onRemovePendingFile={
								onRemovePendingFile || (() => {})
							}
							onClearAll={onClearAll || (() => {})}
							onClearFile={onClearFile || (() => {})}
							removedServerFileUrls={
								removedServerFileUrls || new Set()
							}
							isServerFileRemoved={isServerFileRemoved || false}
						/>
					);
				}
				return <FileDisplay paste={paste} contentRef={contentRef} />;
			}

			if (contentType === "draw") {
				return (
					<div className="h-full w-full">
						<CollabDraw
							id={id}
							socketRef={socketRef}
							isEdit={isEdit}
							content={content}
							onContentChange={onContentChange}
							theme={theme as "light" | "dark" | "system"}
							activeUsers={activeUsers}
						/>
					</div>
				);
			}

			if (contentType === "link") {
				return (
					<LinkView
						isEdit={isEdit}
						content={content}
						onContentChange={onContentChange}
						contentRef={contentRef}
						isAdmin={isAdmin}
						redirectionType={paste?.redirectionType}
					/>
				);
			}

			if (language === "markdown" || language === "html") {
				if (isEdit) {
					return (
						<ResizableSplitPane
							className="flex-1"
							showHint={true}
							initialWidth={50}
							mode={mdLayoutMode}
							storageKey={`display-preview-split-${language}`}
							left={
								<CodeEditorView
									isEdit={isEdit}
									contentType={contentType}
									language={language}
									content={content}
									onContentChange={onContentChange}
									onEditorChange={onEditorChange}
									theme={theme}
									fontSize={fontSize}
									handleEditorWillMount={
										handleEditorWillMount
									}
									contentRef={contentRef}
									onMount={handleMount}
									hideFullscreen={true}
								/>
							}
							right={
								<div className="h-full overflow-y-auto bg-background/30 p-1 sm:p-4">
									{language === "markdown" ? (
										<MarkdownDisplay
											content={content}
											fontSize={fontSize}
											contentRef={contentRef}
										/>
									) : (
										<HtmlDisplay content={content} />
									)}
								</div>
							}
						/>
					);
				}
				return (
					<div className="h-full overflow-y-auto p-1 sm:p-4 md:p-8 flex flex-col items-center">
						<div className="my-auto w-full flex flex-col items-center h-full max-h-full">
							{language === "markdown" ? (
								<MarkdownDisplay
									content={content}
									fontSize={fontSize}
									contentRef={contentRef}
								/>
							) : (
								<HtmlDisplay content={content} />
							)}
						</div>
					</div>
				);
			}

			return (
				<CodeEditorView
					isEdit={isEdit}
					contentType={contentType}
					language={language}
					content={content}
					onContentChange={onContentChange}
					onEditorChange={onEditorChange}
					theme={theme}
					fontSize={fontSize}
					handleEditorWillMount={handleEditorWillMount}
					contentRef={contentRef}
					onMount={handleMount}
					hideFullscreen={true}
				/>
			);
		};

		return (
			<div
				ref={containerRef}
				className={cn(
					"flex-1 flex flex-col min-h-0 h-full relative",
					isFullscreen || isWindowFullscreen ? "bg-background" : "",
				)}
			>
				<EditorToolbar
					contentType={contentType}
					content={content}
					language={language}
					isFullscreen={isFullscreen}
					isWindowFullscreen={isWindowFullscreen}
					onToggleFullscreen={toggleFullscreen}
					onToggleWindowFullscreen={toggleWindowFullscreen}
					mdLayoutMode={mdLayoutMode}
					onMdLayoutModeChange={setMdLayoutMode}
					showMarkdownToggles={isEdit}
					editor={editorInstance}
				/>

				<div
					className={cn(
						"flex-1 w-full relative min-h-0 flex flex-col",
						contentType !== "richtext" && "overflow-hidden",
					)}
				>
					{renderContent()}
				</div>
			</div>
		);
	},
);
