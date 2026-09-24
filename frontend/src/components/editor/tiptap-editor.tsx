import { useEffect, useRef, useMemo, useState } from "react";
import {
	EditorRoot,
	EditorContent,
	Command,
	renderItems,
	useEditor,
	EditorBubble,
} from "novel";
import "katex/dist/katex.min.css";
import { Editor, type JSONContent } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { cn } from "cn";
import { Image as ImageIcon } from "lucide-react";

import { suggestionItems } from "./slash-command-items";
import { BubbleMenuContent } from "./bubble-menu-content";
import { TiptapToolbar } from "./tiptap-toolbar";
import { FindReplace } from "./find-replace";
import { StatusBar } from "./status-bar";
import { SlashCommandMenu } from "./slash-command-menu";

import { useEditorStats } from "./hooks/use-editor-stats";
import { useEditorFindReplace } from "./hooks/use-editor-find-replace";
import { useEditorDragDrop } from "./hooks/use-editor-drag-drop";
import { createEditorExtensions } from "./utils/editor-extensions";

interface TiptapEditorProps {
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
	fontSize?: number;
	transliteration?: {
		enabled: boolean;
		targetLanguage: string;
		toggle: () => void;
		setTargetLanguage: (lang: string) => void;
	};
	onEditorInstance?: (editor: Editor | null) => void;
}

function EditorSync({
	value,
	readOnly,
	lastEmittedHtmlRef,
	onEditorInstance,
	onEditorChange,
}: {
	value: string;
	readOnly: boolean;
	lastEmittedHtmlRef: React.MutableRefObject<string | null>;
	onEditorInstance?: (editor: Editor | null) => void;
	onEditorChange?: (editor: Editor | null) => void;
}) {
	const { editor } = useEditor();
	const isInitializedRef = useRef(false);

	useEffect(() => {
		if (!editor) return;

		if (
			lastEmittedHtmlRef.current !== null &&
			lastEmittedHtmlRef.current === value
		) {
			return;
		}

		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
			if (value) {
				editor.commands.setContent(value);
			}
			return;
		}

		const currentHtml = editor.getHTML();
		if (value !== currentHtml) {
			editor.commands.setContent(value);
		}
	}, [value, editor, lastEmittedHtmlRef]);

	useEffect(() => {
		if (editor && !editor.isDestroyed) {
			editor.setEditable(!readOnly);
		}
	}, [readOnly, editor]);

	useEffect(() => {
		onEditorInstance?.(editor || null);
		onEditorChange?.(editor || null);
		return () => {
			onEditorInstance?.(null);
			onEditorChange?.(null);
		};
	}, [editor, onEditorInstance, onEditorChange]);

	return null;
}

export function TiptapEditor({
	value,
	onChange,
	readOnly = false,
	fontSize,
	transliteration,
	onEditorInstance,
}: TiptapEditorProps) {
	const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
	const [isZenMode, setIsZenMode] = useState(false);
	const lastEmittedHtmlRef = useRef<string | null>(null);

	const initialJsonContent = useMemo<JSONContent | undefined>(() => {
		if (!value) return undefined;
		if (
			typeof value === "string" &&
			(value.trim().startsWith("{") || value.trim().startsWith("["))
		) {
			try {
				return JSON.parse(value) as JSONContent;
			} catch {
				return undefined;
			}
		}
		return undefined;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const transliterationRef = useRef({
		enabled: transliteration?.enabled ?? false,
		targetLanguage: transliteration?.targetLanguage ?? "hi",
	});

	useEffect(() => {
		transliterationRef.current = {
			enabled: transliteration?.enabled ?? false,
			targetLanguage: transliteration?.targetLanguage ?? "hi",
		};
	}, [transliteration?.enabled, transliteration?.targetLanguage]);

	const { stats, updateStatsDebounced } = useEditorStats(activeEditor);

	const {
		showFindReplace,
		setShowFindReplace,
		findText,
		setFindText,
		replaceText,
		setReplaceText,
		matchCount,
		handleReplace,
	} = useEditorFindReplace(
		activeEditor,
		isZenMode,
		setIsZenMode,
		updateStatsDebounced,
	);

	const { isDragging, handleDragEnter, handleDragLeave, handleDrop } =
		useEditorDragDrop(activeEditor, readOnly);

	const slashCommand = useMemo(() => {
		return Command.configure({
			suggestion: {
				items: () => suggestionItems,
				render: renderItems,
			},
		});
	}, []);

	const extensions = useMemo(() => {
		return createEditorExtensions({
			slashCommand,
			transliterationRef,
		});
	}, [slashCommand]);

	return (
		<div
			className={cn(
				"relative flex flex-col overflow-hidden transition-all",
				isZenMode
					? "fixed inset-0 z-9999 bg-background text-foreground w-screen h-dvh border-none"
					: "w-full h-full rounded-xl bg-background border border-border/40",
			)}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={(e) => e.preventDefault()}
			onDrop={handleDrop}
		>
			<EditorRoot>
				{!readOnly && (
					<TiptapToolbar
						editor={activeEditor}
						isZenMode={isZenMode}
						onToggleZenMode={() => setIsZenMode(!isZenMode)}
						onToggleFindReplace={() =>
							setShowFindReplace(!showFindReplace)
						}
					/>
				)}

				{/* Drag and Drop visual indicator */}
				{isDragging && !readOnly && (
					<div className="absolute inset-0 z-9999 bg-background/85 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-primary/50 m-3 rounded-lg pointer-events-none animate-in fade-in duration-200">
						<div className="p-4 bg-muted rounded-full border border-border mb-3 shadow-md">
							<ImageIcon className="h-7 w-7 text-primary transition-transform" />
						</div>
						<p className="font-semibold text-sm text-foreground">
							Drop images or attachments here
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							They will be automatically inserted into the
							document
						</p>
					</div>
				)}

				{/* Find & Replace Floating Panel */}
				{showFindReplace && !readOnly && (
					<FindReplace
						findText={findText}
						setFindText={setFindText}
						replaceText={replaceText}
						setReplaceText={setReplaceText}
						onReplace={handleReplace}
						matchCount={matchCount}
						onClose={() => setShowFindReplace(false)}
					/>
				)}

				<EditorContent
					editable={!readOnly}
					className={cn(
						"flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4 sm:p-8 transition-colors",
						isZenMode ? "bg-background p-6 sm:p-12" : "bg-muted/30",
					)}
					initialContent={initialJsonContent}
					onUpdate={({ editor }) => {
						if (readOnly) return;
						const html = editor.getHTML();
						lastEmittedHtmlRef.current = html;
						onChange(html);
						updateStatsDebounced(editor);
					}}
					extensions={extensions as AnyExtension[]}
					editorProps={{
						attributes: {
							id: "tiptap-editor-container",
							class: cn(
								"prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-4xl mx-auto w-full min-h-dvh outline-none px-6 sm:px-10 py-8 bg-card text-foreground border border-border/40 shadow-sm rounded-lg transition-all",
								isZenMode &&
									"shadow-none border-none bg-muted/20 max-w-3xl",
								readOnly && "cursor-default select-text",
							),
							...(fontSize
								? { style: `font-size: ${fontSize}px;` }
								: {}),
						},
					}}
				>
					<EditorSync
						value={value}
						readOnly={readOnly}
						lastEmittedHtmlRef={lastEmittedHtmlRef}
						onEditorInstance={onEditorInstance}
						onEditorChange={setActiveEditor}
					/>

					{/* Slash Command Suggestion Menu */}
					{!readOnly && <SlashCommandMenu />}

					{/* Text Selection Bubble Menu */}
					{!readOnly && (
						<EditorBubble
							tippyOptions={{
								placement: "top",
							}}
							className="flex w-fit max-w-[90vw] items-center overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md gap-0.5 z-99999"
						>
							<BubbleMenuContent />
						</EditorBubble>
					)}
				</EditorContent>
			</EditorRoot>

			{/* Word / Character Count Status Bar */}
			<StatusBar stats={stats} />
		</div>
	);
}
