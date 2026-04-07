import { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";
import type { PasteData, ContentMode } from "@/types";
import { MarkdownDisplay } from "./content/markdown-display";
import { FileDisplay } from "./content/file-display";
import { CodeEditorView } from "./content/code-editor-view";
import { LinkView } from "./content/link-view";

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
						<div className="flex flex-col md:flex-row gap-4 h-full">
							<div className="flex-1 min-h-[300px]">
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
							</div>
							<div className="flex-1 overflow-auto">
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
					<MarkdownDisplay
						content={content}
						fontSize={fontSize}
						contentRef={contentRef}
					/>
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
				{(contentType === "code" ||
					contentType === "text" ||
					contentType === "draw") && (
					<ZenModeToggle
						isFullscreen={isFullscreen}
						isWindowFullscreen={isWindowFullscreen}
						onToggle={toggleFullscreen}
						onWindowToggle={toggleWindowFullscreen}
						className={cn(
							"z-[101]",
							contentType === "draw"
								? isFullscreen || isWindowFullscreen
									? "fixed top-4 right-4"
									: "absolute right-3 top-3"
								: isFullscreen || isWindowFullscreen
									? "fixed top-8 right-8"
									: "absolute top-8 right-8",
						)}
					/>
				)}
				<div className="flex-1 w-full h-full relative overflow-hidden">
					{renderContent()}
				</div>
			</div>
		);
	},
);
