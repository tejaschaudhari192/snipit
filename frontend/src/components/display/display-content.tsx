import { type BeforeMount, type OnMount } from "@monaco-editor/react";

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
}

export const DisplayContent = ({
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
}: DisplayContentProps) => {
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
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1">
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
		/>
	);
};
