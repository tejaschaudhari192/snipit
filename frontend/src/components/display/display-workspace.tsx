import {
	lazy,
	memo,
	Suspense,
	useMemo,
	type RefObject,
	type MutableRefObject,
} from "react";
import type { Socket } from "socket.io-client";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { Editor } from "@tiptap/core";

import { ResizablePanels } from "@/components/common/resizable-panels";
import { ShimmerSection } from "@/components/common/shimmer-section";
import type { FileUploadStatus } from "@/lib/file-service";
import type { useTransliteration } from "@/hooks/use-transliteration";
import type {
	PasteData,
	ContentMode,
	ActiveUser,
	EditorChange,
	RedirectionType,
} from "@/types";

// Lazy-loaded workspace child components
const TerminalContainer = lazy(() =>
	import("@/components/terminal/terminal-container").then((m) => ({
		default: m.TerminalContainer,
	})),
);

const DisplayContent = lazy(() =>
	import("@/components/display/display-content").then((m) => ({
		default: m.DisplayContent,
	})),
);

export interface DisplayWorkspaceProps {
	// Identity & Mode
	id: string;
	isEdit: boolean;
	isAdmin: boolean;
	contentType: ContentMode;
	language: string;
	updatedContent: string | undefined;
	paste?: PasteData;

	// Content & Editor
	handleContentChange: (val: string | undefined) => void;
	handleEditorChange: (data: {
		changes?: EditorChange[];
		content?: string;
	}) => void;
	handleEditorMount: OnMount;
	handleEditorWillMount: BeforeMount;
	theme: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
	textareaRef?: RefObject<HTMLTextAreaElement | null>;
	transliteration?: ReturnType<typeof useTransliteration>;
	onEditorInstance?: (editor: Editor | null) => void;

	// Collaboration & Socket
	sharedSocketRef: MutableRefObject<Socket | null>;
	syncUsers: ActiveUser[];
	socket: Socket | null;

	// Viewport & Fullscreen
	isFullscreen: boolean;
	setIsFullscreen: (val: boolean) => void;
	isWindowFullscreen: boolean;
	setIsWindowFullscreen: (val: boolean) => void;

	// Terminal
	isTerminalOpen: boolean;
	setIsTerminalOpen: (val: boolean) => void;
	terminalPosition: "bottom" | "right";
	setTerminalPosition: (pos: "bottom" | "right") => void;

	// File Handling
	files: FileUploadStatus[];
	isFileUploading: boolean;
	fileUploadError: string | null;
	isServerFileRemoved: boolean;
	removedServerFileUrls?: Set<string>;
	onFileSelect: (files: File[]) => void;
	onClearFile: () => void;
	onRemoveServerFile?: (url: string) => void;
	onRemovePendingFile?: (id: string) => void;
	onClearAll?: () => void;

	// Redirection
	redirectionType?: RedirectionType;
	setRedirectionType?: (v: RedirectionType) => void;
}

export const DisplayWorkspace = memo(
	({
		id,
		isEdit,
		isAdmin,
		contentType,
		language,
		updatedContent,
		paste,
		handleContentChange,
		handleEditorChange,
		handleEditorMount,
		handleEditorWillMount,
		theme,
		fontSize,
		contentRef,
		sharedSocketRef,
		syncUsers,
		isFullscreen,
		setIsFullscreen,
		isWindowFullscreen,
		setIsWindowFullscreen,
		isTerminalOpen,
		setIsTerminalOpen,
		terminalPosition,
		setTerminalPosition,
		socket,
		onFileSelect,
		onClearFile,
		isServerFileRemoved,
		onRemoveServerFile,
		onRemovePendingFile,
		onClearAll,
		removedServerFileUrls,
		files,
		isFileUploading,
		fileUploadError,
		transliteration,
		onEditorInstance,
		redirectionType,
		setRedirectionType,
		textareaRef,
	}: DisplayWorkspaceProps) => {
		if (!paste) {
			return <ShimmerSection type="editor" className="flex-1" />;
		}

		const isTerminalVisible =
			isTerminalOpen && !!paste && contentType === "code";

		const previewUrl = useMemo(() => {
			if (isServerFileRemoved || !paste?.fileUrl) return null;
			if (
				removedServerFileUrls &&
				removedServerFileUrls.has(paste.fileUrl)
			) {
				return null;
			}
			return paste.fileUrl;
		}, [isServerFileRemoved, paste?.fileUrl, removedServerFileUrls]);

		const editorPanel = (
			<div className="h-full w-full min-h-0 min-w-0 flex flex-col">
				<Suspense fallback={<ShimmerSection type="editor" />}>
					<DisplayContent
						id={id}
						isEdit={isEdit}
						isAdmin={isAdmin}
						contentType={contentType}
						language={language}
						content={updatedContent || ""}
						onContentChange={handleContentChange}
						onEditorChange={handleEditorChange}
						theme={theme}
						fontSize={fontSize}
						contentRef={contentRef}
						handleEditorWillMount={handleEditorWillMount}
						paste={paste}
						onMount={handleEditorMount}
						socketRef={sharedSocketRef}
						activeUsers={syncUsers}
						isFullscreen={isFullscreen}
						setIsFullscreen={setIsFullscreen}
						isWindowFullscreen={isWindowFullscreen}
						setIsWindowFullscreen={setIsWindowFullscreen}
						onFileSelect={onFileSelect}
						onClearFile={onClearFile}
						onRemoveServerFile={onRemoveServerFile}
						onRemovePendingFile={onRemovePendingFile}
						onClearAll={onClearAll}
						removedServerFileUrls={removedServerFileUrls}
						previewUrl={previewUrl}
						files={files}
						isFileUploading={isFileUploading}
						fileUploadError={fileUploadError}
						transliteration={transliteration}
						onEditorInstance={onEditorInstance}
						redirectionType={redirectionType}
						setRedirectionType={setRedirectionType}
						textareaRef={textareaRef}
					/>
				</Suspense>
			</div>
		);

		const terminalPanel = (
			<Suspense
				fallback={
					<div className="mx-2 sm:mx-4 mb-2 h-full skeleton rounded-xl opacity-50" />
				}
			>
				<TerminalContainer
					isOpen={isTerminalVisible}
					position={terminalPosition}
					onPositionChange={setTerminalPosition}
					onClose={() => setIsTerminalOpen(false)}
					code={updatedContent ?? paste.content}
					language={language}
					fontSize={fontSize}
					socket={socket}
					className="mx-2 sm:mx-4 mb-2"
				/>
			</Suspense>
		);

		if (!isTerminalVisible) {
			return (
				<div className="flex-1 min-h-0 min-w-0 flex flex-col">
					{editorPanel}
				</div>
			);
		}

		return (
			<ResizablePanels
				direction={
					terminalPosition === "bottom" ? "vertical" : "horizontal"
				}
				initialSize={terminalPosition === "bottom" ? 62 : 65}
				minSize={20}
				maxSize={85}
				className="flex-1"
				first={editorPanel}
				second={terminalPanel}
				storageKey={`display-terminal-split-${terminalPosition}`}
			/>
		);
	},
);

DisplayWorkspace.displayName = "DisplayWorkspace";
