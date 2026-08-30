import type { BeforeMount, OnMount } from "@monaco-editor/react";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import type { ContentMode, EditorChange } from "@/types";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";
import { MonacoConfig } from "@/hooks/use-monaco-config";
import { useEditorEngine, type EditorEngine } from "@/hooks/use-editor-engine";
import { PlainTextEditor } from "@/components/common/plain-text-editor";
import type { useTransliteration } from "@/hooks/use-transliteration";

interface CodeEditorViewProps {
	isEdit: boolean;
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
	handleEditorWillMount: BeforeMount;
	contentRef: (node: HTMLElement | null) => void;
	onMount?: OnMount;
	hideFullscreen?: boolean;
	editorEngine?: EditorEngine;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
	transliteration?: ReturnType<typeof useTransliteration>;
}

const MonacoEditor = lazy(() =>
	import("@monaco-editor/react").then((m) => ({
		default: m.Editor,
	})),
);

export const CodeEditorView = ({
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	onEditorChange,
	theme,
	fontSize,
	handleEditorWillMount,
	contentRef,
	onMount,
	hideFullscreen = false,
	editorEngine,
	textareaRef,
	transliteration,
}: CodeEditorViewProps) => {
	const { editorEngine: defaultEngine } = useEditorEngine();
	const currentEngine = editorEngine ?? defaultEngine;
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

	// ── Native / Simple Editor mode ──
	if (currentEngine === "native" && !transliteration?.enabled) {
		return (
			<div
				ref={(node) => {
					containerRef.current = node;
					if (typeof contentRef === "function") contentRef(node);
				}}
				className={`glass-card rounded-2xl animate-in fade-in duration-300 flex flex-col flex-1 h-full min-h-0 relative ${isFullscreen || isWindowFullscreen ? "fixed inset-0 m-0 z-50 rounded-none h-dvh border-none" : ""}`}
			>
				{!hideFullscreen && (
					<ZenModeToggle
						isFullscreen={isFullscreen}
						isWindowFullscreen={isWindowFullscreen}
						onToggle={toggleFullscreen}
						onWindowToggle={toggleWindowFullscreen}
						className="absolute top-4 right-4 z-10"
					/>
				)}
				<PlainTextEditor
					content={content}
					onContentChange={onContentChange}
					isEdit={isEdit}
					fontSize={fontSize}
					showLineNumbers={true}
					className="border-none rounded-2xl"
					textareaRef={textareaRef}
				/>
			</div>
		);
	}

	// ── Desktop Monaco editor ──
	if (contentType === "code" || contentType === "text") {
		return (
			<div
				ref={(node) => {
					containerRef.current = node;
					if (typeof contentRef === "function") contentRef(node);
				}}
				className={`glass-card rounded-2xl animate-in fade-in zoom-in-95 duration-500 flex flex-col flex-1 h-full ${isFullscreen || isWindowFullscreen ? "fixed inset-0 m-0 z-50 rounded-none h-dvh border-none" : "min-h-0"}`}
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
					<Suspense
						fallback={
							<div className="h-full w-full animate-pulse bg-muted/50 rounded-2xl" />
						}
					>
						<MonacoConfig />
						<MonacoEditor
							height="100%"
							language={
								contentType === "text" ? "plaintext" : language
							}
							value={content}
							onChange={(val, ev) => {
								if (!isEdit) return;
								onContentChange(val ?? "");
								if (onEditorChange && ev.changes) {
									onEditorChange({
										changes: ev.changes,
										content: val ?? undefined,
									});
								}
							}}
							onMount={onMount}
							beforeMount={handleEditorWillMount}
							theme={
								theme === "dark"
									? "snipit-dark"
									: "snipit-light"
							}
							options={{
								readOnly: !isEdit,
								fontSize,
								minimap: { enabled: contentType !== "text" },
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
					</Suspense>
				</div>
			</div>
		);
	}
};
