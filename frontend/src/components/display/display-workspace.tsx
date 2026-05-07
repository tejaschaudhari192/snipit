import React, { Suspense, memo } from "react";
import { ResizablePanels } from "@/components/common/resizable-panels";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { TerminalContainer } from "@/components/terminal/terminal-container";
import { DisplayContent } from "@/components/display/display-content";
import type { PasteData, ContentMode, ActiveUser, EditorChange } from "@/types";
import { Socket } from "socket.io-client";
import { type BeforeMount, type OnMount } from "@monaco-editor/react";

interface DisplayWorkspaceProps {
	id: string;
	isEdit: boolean;
	contentType: ContentMode;
	language: string;
	updatedContent: string | undefined;
	paste: PasteData;
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
	sharedSocketRef: React.MutableRefObject<Socket | null>;
	syncUsers: ActiveUser[];
	isFullscreen: boolean;
	setIsFullscreen: (val: boolean) => void;
	isWindowFullscreen: boolean;
	setIsWindowFullscreen: (val: boolean) => void;
	isTerminalOpen: boolean;
	setIsTerminalOpen: (val: boolean) => void;
	terminalPosition: "bottom" | "right";
	setTerminalPosition: (pos: "bottom" | "right") => void;
	socket: Socket | null;
	onFileSelect: (file: File) => void;
	onClearFile: () => void;
	isServerFileRemoved: boolean;
	uploadedFileName: string | null;
	isFileUploading: boolean;
	fileUploadProgress: number;
	fileUploadError: string | null;
}

export const DisplayWorkspace = memo(
	({
		id,
		isEdit,
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
		uploadedFileName,
		isFileUploading,
		fileUploadProgress,
		fileUploadError,
	}: DisplayWorkspaceProps) => {
		const isTerminalVisible =
			isTerminalOpen && !!paste && contentType === "code";

		const editorPanel = (
			<div className="h-full w-full min-h-0 min-w-0 flex flex-col">
				<Suspense fallback={<ShimmerSection type="editor" />}>
					<DisplayContent
						id={id}
						isEdit={isEdit}
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
						previewUrl={isServerFileRemoved ? null : paste?.fileUrl}
						uploadedFileName={
							uploadedFileName ||
							(isServerFileRemoved ? null : paste?.fileName)
						}
						isFileUploading={isFileUploading}
						fileUploadProgress={fileUploadProgress}
						fileUploadError={fileUploadError}
					/>
				</Suspense>
			</div>
		);

		const terminalPanel = (
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
		);

		if (!isTerminalVisible) {
			return (
				<div className="flex-1 min-h-0 min-w-0 h-full flex flex-col">
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
