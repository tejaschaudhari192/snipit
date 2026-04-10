import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import type { ContentMode } from "@/types";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";

interface CodeEditorViewProps {
	id: string;
	isEdit: boolean;
	contentType: ContentMode;
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	theme: string;
	fontSize: number;
	handleEditorWillMount: BeforeMount;
	contentRef: (node: HTMLElement | null) => void;
	onMount?: OnMount;
	hideFullscreen?: boolean;
}

export const CodeEditorView = ({
	id,
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	theme,
	fontSize,
	handleEditorWillMount,
	contentRef,
	onMount,
	hideFullscreen = false,
}: CodeEditorViewProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsWindowFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange,
			);
	}, []);

	const toggleWindowFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen().catch((err) => {
				console.error("Error attempting to enable fullscreen:", err);
			});
		} else {
			document.exitFullscreen();
		}
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};
	if (contentType === "code" || contentType === "text") {
		return (
			<div
				ref={(node) => {
					containerRef.current = node;
					if (typeof contentRef === "function") contentRef(node);
				}}
				className={`glass-card rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col flex-1 h-full ${isFullscreen || isWindowFullscreen ? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none" : ""}`}
			>
				{!hideFullscreen && (
					<ZenModeToggle
						isFullscreen={isFullscreen}
						isWindowFullscreen={isWindowFullscreen}
						onToggle={toggleFullscreen}
						onWindowToggle={toggleWindowFullscreen}
						className="absolute top-8 right-8"
					/>
				)}
				<div className="flex-1 w-full h-full relative">
					<Editor
						key={id}
						height="100%"
						language={contentType === "text" ? "text" : language}
						defaultValue={content}
						onChange={
							isEdit
								? (val) => onContentChange(val ?? "")
								: undefined
						}
						onMount={onMount}
						beforeMount={handleEditorWillMount}
						theme={
							theme === "dark" ? "snipit-dark" : "snipit-light"
						}
						options={{
							readOnly: !isEdit,
							fontSize,
							minimap: { enabled: true },
							scrollBeyondLastLine: false,
							lineNumbers: "on",
							roundedSelection: true,
							padding: { top: 20, bottom: 20 },
							fontFamily:
								"'JetBrains Mono', 'Fira Code', monospace",
							fontWeight: "500",
							cursorStyle: isEdit ? "line" : "block",
							renderLineHighlight: "all",
							scrollbar: {
								vertical: "visible",
								horizontal: "visible",
								useShadows: false,
								verticalScrollbarSize: 10,
								horizontalScrollbarSize: 10,
							},
							wordWrap: "on",
							automaticLayout: true,
							unicodeHighlight: {
								ambiguousCharacters: false,
								invisibleCharacters: false,
							},
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={(node) => {
				containerRef.current = node;
				if (typeof contentRef === "function") contentRef(node);
			}}
			className={`relative z-10 ${isFullscreen || isWindowFullscreen ? "fixed inset-0 m-0 z-50 rounded-none h-screen border-none bg-background flex flex-col" : ""}`}
		>
			{!hideFullscreen && (
				<ZenModeToggle
					isFullscreen={isFullscreen}
					isWindowFullscreen={isWindowFullscreen}
					onToggle={toggleFullscreen}
					onWindowToggle={toggleWindowFullscreen}
					className="absolute top-8 right-8 z-50"
				/>
			)}
			<Textarea
				readOnly={!isEdit}
				value={content}
				onChange={
					isEdit ? (e) => onContentChange(e.target.value) : undefined
				}
				className={`font-mono text-sm resize-none glass-card rounded-2xl p-6 leading-relaxed animate-in fade-in zoom-in-95 duration-500 ${
					!isEdit
						? "select-all cursor-text"
						: "focus-visible:ring-primary/20"
				} ${isFullscreen || isWindowFullscreen ? "flex-1 rounded-none border-0" : "flex-1 h-full min-h-[300px]"}`}
				style={{ fontSize: `${fontSize}px` }}
				placeholder="Start typing your content here..."
			/>
		</div>
	);
};
