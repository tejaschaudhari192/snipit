import type { BeforeMount, OnMount } from "@monaco-editor/react";
import { useRef, useEffect, memo, lazy, Suspense } from "react";
import { cn } from "@/utils";
const EditorToolbar = lazy(() =>
	import("@/components/common/editor-toolbar").then((m) => ({
		default: m.EditorToolbar,
	})),
);
import { EditorToolbarSkeleton } from "@/components/common/editor-toolbar-skeleton";
import {
	DisplayContentSkeleton,
	FileDisplaySkeleton,
	LinkDisplaySkeleton,
	DocsDisplaySkeleton,
	MonacoDisplaySkeleton,
} from "@/components/common/skeletons/display-skeletons";
import type {
	PasteData,
	ContentMode,
	EditorChange,
	RedirectionType,
} from "@/types";
const ResizableSplitPane = lazy(() =>
	import("@/components/common/resizable-split-pane").then((m) => ({
		default: m.ResizableSplitPane,
	})),
);
import { useMarkdownLayout } from "@/hooks/use-markdown-layout";
import { useEditorEngine } from "@/hooks/use-editor-engine";

import type { Socket } from "socket.io-client";
import type { ActiveUser } from "@/types";

import type { FileUploadStatus } from "@/lib/file-service";

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
const FileDisplay = lazy(() =>
	import("@/components/display/content/file-display").then((m) => ({
		default: m.FileDisplay,
	})),
);
const CodeEditorView = lazy(() =>
	import("@/components/display/content/code-editor-view").then((m) => ({
		default: m.CodeEditorView,
	})),
);
const LinkView = lazy(() =>
	import("@/components/display/content/link-view").then((m) => ({
		default: m.LinkView,
	})),
);
const CollabDraw = lazy(() =>
	import("@/components/display/collab-draw").then((m) => ({
		default: m.CollabDraw,
	})),
);
const FileEditView = lazy(() =>
	import("@/components/display/content/file-edit-view").then((m) => ({
		default: m.FileEditView,
	})),
);

const TiptapEditor = lazy(() =>
	import("@/components/editor/tiptap-editor").then((m) => ({
		default: m.TiptapEditor,
	})),
);

import { Editor } from "@tiptap/core";
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
	redirectionType?: RedirectionType;
	setRedirectionType?: (v: RedirectionType) => void;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
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
		redirectionType,
		setRedirectionType,
		textareaRef,
	}: DisplayContentProps) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);
		const activeTextareaRef = textareaRef ?? internalTextareaRef;
		const [mdLayoutMode, setMdLayoutMode] = useMarkdownLayout();
		const { editorEngine, toggleEditorEngine } = useEditorEngine();
		const handleMount: OnMount = (ed, monaco) => {
			if (onMount) onMount(ed, monaco);
			if (transliteration) {
				transliteration.setupEditor(ed, monaco);
			}
		};

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
			if (contentType === "docs") {
				return (
					<Suspense fallback={<DisplayContentSkeleton mode="docs" />}>
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
						<Suspense fallback={<FileDisplaySkeleton />}>
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
								isServerFileRemoved={
									isServerFileRemoved || false
								}
							/>
						</Suspense>
					);
				}
				return (
					<Suspense fallback={<FileDisplaySkeleton />}>
						<FileDisplay paste={paste!} contentRef={contentRef} />
					</Suspense>
				);
			}

			if (contentType === "draw") {
				return (
					<div className="h-full w-full">
						<Suspense
							fallback={<DisplayContentSkeleton mode="draw" />}
						>
							<CollabDraw
								id={id}
								socketRef={socketRef}
								isEdit={isEdit}
								content={content}
								onContentChange={onContentChange}
								theme={theme as "light" | "dark" | "system"}
								activeUsers={activeUsers}
							/>
						</Suspense>
					</div>
				);
			}

			if (contentType === "link") {
				return (
					<Suspense fallback={<LinkDisplaySkeleton />}>
						<LinkView
							content={content}
							onContentChange={onContentChange}
							contentRef={contentRef}
							isAdmin={isAdmin}
							isEdit={isEdit}
							redirectionType={
								redirectionType ?? paste?.redirectionType
							}
							setRedirectionType={setRedirectionType}
						/>
					</Suspense>
				);
			}

			if (language === "markdown" || language === "html") {
				if (isEdit) {
					return (
						<Suspense fallback={<MonacoDisplaySkeleton />}>
							<ResizableSplitPane
								className="flex-1"
								showHint={true}
								initialWidth={50}
								mode={mdLayoutMode}
								storageKey={`display-preview-split-${language}`}
								left={
									<Suspense
										fallback={<MonacoDisplaySkeleton />}
									>
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
											editorEngine={editorEngine}
											textareaRef={
												editorEngine === "native"
													? activeTextareaRef
													: undefined
											}
										/>
									</Suspense>
								}
								right={
									<div className="h-full overflow-y-auto bg-background/30">
										<Suspense
											fallback={<DocsDisplaySkeleton />}
										>
											{language === "markdown" ? (
												<MarkdownDisplay
													content={content}
													fontSize={fontSize}
													contentRef={contentRef}
												/>
											) : (
												<HtmlDisplay
													content={content}
												/>
											)}
										</Suspense>
									</div>
								}
							/>
						</Suspense>
					);
				}
				return (
					<div className="h-full overflow-y-auto flex flex-col items-center">
						<div className="my-auto w-full flex flex-col items-center h-full max-h-full">
							<Suspense fallback={<DocsDisplaySkeleton />}>
								{language === "markdown" ? (
									<MarkdownDisplay
										content={content}
										fontSize={fontSize}
										contentRef={contentRef}
									/>
								) : (
									<HtmlDisplay content={content} />
								)}
							</Suspense>
						</div>
					</div>
				);
			}

			return (
				<Suspense fallback={<MonacoDisplaySkeleton />}>
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
						editorEngine={editorEngine}
						textareaRef={
							editorEngine === "native"
								? activeTextareaRef
								: undefined
						}
					/>
				</Suspense>
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
				<Suspense fallback={<EditorToolbarSkeleton />}>
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
						editorEngine={editorEngine}
						onToggleEditorEngine={toggleEditorEngine}
					/>
				</Suspense>

				<div
					className={cn(
						"flex-1 w-full relative min-h-0 flex flex-col",
						contentType !== "docs" && "overflow-hidden",
					)}
				>
					{renderContent()}
				</div>
			</div>
		);
	},
);
