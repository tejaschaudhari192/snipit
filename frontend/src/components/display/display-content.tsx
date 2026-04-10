import { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "@/components/common/editor-toolbar";
import type { PasteData, ContentMode } from "@/types";
import { MarkdownDisplay } from "./content/markdown-display";
import { ResizableSplitPane } from "@/components/common/resizable-split-pane";
import { FileDisplay } from "./content/file-display";
import { CodeEditorView } from "./content/code-editor-view";
import { LinkView } from "./content/link-view";
import { useMarkdownLayout } from "@/hooks/use-markdown-layout";

import type { Socket } from "socket.io-client";
import type { ActiveUser } from "@/types";
import { CollabDraw } from "./collab-draw";

interface DisplayContentProps {
	id: string;
	isEdit: boolean;
	contentType: ContentMode;
	language: string;
	content: string;
	onContentChange: (val: string) => void;
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
}

export const DisplayContent = memo(
	({
		id,
		isEdit,
		contentType,
		language,
		content,
		onContentChange,
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
	}: DisplayContentProps) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const [mdLayoutMode, setMdLayoutMode] = useMarkdownLayout();

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
			if (contentType === "file") {
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
					/>
				);
			}

			if (language === "markdown") {
				if (isEdit) {
					return (
						<ResizableSplitPane
							showHint={true}
							initialWidth={50}
							mode={mdLayoutMode}
							left={
								<CodeEditorView
									id={id}
									isEdit={isEdit}
									contentType={contentType}
									language={language}
									content={content}
									onContentChange={onContentChange}
									theme={theme}
									fontSize={fontSize}
									handleEditorWillMount={
										handleEditorWillMount
									}
									contentRef={contentRef}
									onMount={onMount}
									hideFullscreen={true}
								/>
							}
							right={
								<div className="h-full overflow-y-auto bg-background/30 p-4">
									<MarkdownDisplay
										content={content}
										fontSize={fontSize}
										contentRef={contentRef}
									/>
								</div>
							}
						/>
					);
				}
				return (
					<div className="h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center">
						<div className="my-auto w-full flex flex-col items-center px-2 md:px-4">
							<MarkdownDisplay
								content={content}
								fontSize={fontSize}
								contentRef={contentRef}
							/>
						</div>
					</div>
				);
			}

			return (
				<CodeEditorView
					id={id}
					isEdit={isEdit}
					contentType={contentType}
					language={language}
					content={content}
					onContentChange={onContentChange}
					theme={theme}
					fontSize={fontSize}
					handleEditorWillMount={handleEditorWillMount}
					contentRef={contentRef}
					onMount={onMount}
					hideFullscreen={true}
				/>
			);
		};

		return (
			<div
				ref={containerRef}
				className={cn(
					"flex-1 flex flex-col min-h-0 relative",
					isFullscreen || isWindowFullscreen ? "bg-background" : "",
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
					showMarkdownToggles={isEdit}
				/>

				<div className="flex-1 w-full h-full relative overflow-hidden">
					{renderContent()}
				</div>
			</div>
		);
	},
);
