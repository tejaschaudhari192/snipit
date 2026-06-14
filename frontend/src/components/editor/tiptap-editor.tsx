import { useEffect, useRef, useMemo } from "react";
import {
	EditorRoot,
	EditorContent,
	StarterKit,
	Placeholder,
	TextStyle,
	Color,
	TiptapUnderline,
	TiptapLink,
	HighlightExtension,
	HorizontalRule,
	TaskList,
	TaskItem,
	UpdatedImage,
	Command,
	renderItems,
	useEditor,
	EditorBubble,
	Mathematics,
	Twitter,
	Youtube,
	GlobalDragHandle,
} from "novel";
import "katex/dist/katex.min.css";
import { Editor } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { cn } from "@/utils";

// Extracted modules
import { Transliteration } from "./extensions/transliteration-extension";
import { suggestionItems } from "./slash-command-items";
import { BubbleMenuContent } from "./bubble-menu-content";

interface TiptapEditorProps {
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
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
	onEditorInstance,
}: {
	value: string;
	readOnly: boolean;
	onEditorInstance?: (editor: Editor | null) => void;
}) {
	const { editor } = useEditor();

	useEffect(() => {
		if (editor && value && editor.getHTML() !== value) {
			editor.commands.setContent(value);
		}
	}, [editor, value]);

	useEffect(() => {
		if (editor) {
			editor.setEditable(!readOnly);
		}
	}, [editor, readOnly]);

	useEffect(() => {
		if (editor && onEditorInstance) {
			onEditorInstance(editor);
		}
		return () => {
			if (onEditorInstance) {
				onEditorInstance(null);
			}
		};
	}, [editor, onEditorInstance]);

	return null;
}

export function TiptapEditor({
	value,
	onChange,
	readOnly = false,
	transliteration,
	onEditorInstance,
}: TiptapEditorProps) {
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

	const slashCommand = useMemo(() => {
		return Command.configure({
			suggestion: {
				items: () => suggestionItems,
				render: renderItems,
			},
		});
	}, []);

	const extensions = useMemo(() => {
		return [
			StarterKit.configure({
				horizontalRule: false,
				codeBlock: false,
			}),
			Placeholder.configure({
				placeholder: "Press '/' for commands...",
			}),
			TextStyle,
			Color,
			TiptapUnderline,
			TiptapLink,
			HighlightExtension,
			HorizontalRule,
			TaskList,
			TaskItem,
			UpdatedImage,
			Mathematics,
			Twitter,
			Youtube.configure({
				HTMLAttributes: {
					class: "rounded-lg border border-border shadow-sm max-w-full my-4",
				},
			}),
			GlobalDragHandle.configure({
				dragHandleWidth: 20,
				scrollTreshold: 100,
			}),
			slashCommand,
			Transliteration.configure({
				transliterationRef,
			}),
		];
	}, [slashCommand]);

	return (
		<div className="w-full h-full flex flex-col rounded-xl bg-background border border-border/40 p-4 relative">
			<EditorRoot>
				<EditorContent
					className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2"
					initialContent={
						value ? JSON.parse(JSON.stringify(value)) : undefined
					}
					onUpdate={({ editor }) => {
						onChange(editor.getHTML());
					}}
					extensions={extensions as AnyExtension[]}
					editorProps={{
						attributes: {
							class: cn(
								"prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none w-full min-h-[180px] outline-none",
								readOnly && "pointer-events-none",
							),
						},
					}}
				>
					<EditorSync
						value={value}
						readOnly={readOnly}
						onEditorInstance={onEditorInstance}
					/>

					{/* Text Selection Bubble Menu */}
					{!readOnly && (
						<EditorBubble
							tippyOptions={{
								placement: "top",
							}}
							className="flex w-fit max-w-[90vw] items-center overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md gap-0.5 z-[99999]"
						>
							<BubbleMenuContent />
						</EditorBubble>
					)}
				</EditorContent>
			</EditorRoot>
		</div>
	);
}
