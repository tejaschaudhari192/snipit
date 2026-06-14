import { useEffect, useRef, useMemo, useState } from "react";
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
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
} from "novel";
import "katex/dist/katex.min.css";
import { Editor } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { cn } from "@/utils";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import TextAlign from "@tiptap/extension-text-align";
import { Indent, LineHeight } from "./extensions/formatting-extensions";

// Extracted modules
import { Transliteration } from "./extensions/transliteration-extension";
import { suggestionItems } from "./slash-command-items";
import type { CustomSuggestionItem } from "./slash-command-items";
import { BubbleMenuContent } from "./bubble-menu-content";
import { TiptapToolbar } from "./tiptap-toolbar";

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
	onEditorChange,
}: {
	value: string;
	readOnly: boolean;
	onEditorInstance?: (editor: Editor | null) => void;
	onEditorChange?: (editor: Editor | null) => void;
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
		if (editor) {
			if (onEditorInstance) onEditorInstance(editor);
			if (onEditorChange) onEditorChange(editor);
		}
		return () => {
			if (onEditorInstance) onEditorInstance(null);
			if (onEditorChange) onEditorChange(null);
		};
	}, [editor, onEditorInstance, onEditorChange]);

	return null;
}

export function TiptapEditor({
	value,
	onChange,
	readOnly = false,
	transliteration,
	onEditorInstance,
}: TiptapEditorProps) {
	const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
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
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class: "border-collapse border border-border w-full my-4",
				},
			}),
			TableRow.configure({
				HTMLAttributes: {
					class: "border-b border-border/80",
				},
			}),
			TableHeader.configure({
				HTMLAttributes: {
					class: "border border-border/85 bg-muted/30 px-3 py-2 text-left font-bold text-xs select-none",
				},
			}),
			TableCell.configure({
				HTMLAttributes: {
					class: "border border-border/70 px-3 py-2 text-xs",
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
				alignments: ["left", "center", "right", "justify"],
			}),
			Indent,
			LineHeight,
		];
	}, [slashCommand]);

	return (
		<div className="w-full h-full flex flex-col rounded-xl bg-background border border-border/40 overflow-hidden relative">
			<EditorRoot>
				{!readOnly && <TiptapToolbar editor={activeEditor} />}
				<EditorContent
					className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-[#f0f4f9] dark:bg-[#0b0c10] p-4 sm:p-8"
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
								"prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-4xl mx-auto w-full min-h-screen outline-none px-6 sm:px-10 py-8 bg-background border border-border/40 shadow-sm rounded-lg transition-all",
								readOnly && "pointer-events-none",
							),
						},
					}}
				>
					<EditorSync
						value={value}
						readOnly={readOnly}
						onEditorInstance={onEditorInstance}
						onEditorChange={setActiveEditor}
					/>

					{/* Slash Command Suggestion Menu */}
					{!readOnly && (
						<EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover px-1 py-2 shadow-md transition-all custom-scrollbar">
							<EditorCommandEmpty className="px-2 text-muted-foreground text-xs">
								No results found
							</EditorCommandEmpty>
							<EditorCommandList>
								{(() => {
									let renderedInsertHeader = false;
									return suggestionItems.map(
										(item: CustomSuggestionItem) => {
											const showHeader =
												item.category === "INSERT" &&
												!renderedInsertHeader;
											if (showHeader) {
												renderedInsertHeader = true;
											}
											return (
												<div
													key={item.title}
													className="flex flex-col w-full"
												>
													{showHeader && (
														<div className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider select-none border-t border-border/40 my-1 pt-2">
															INSERT
														</div>
													)}
													<EditorCommandItem
														value={item.title}
														onCommand={(val) =>
															item.command(val)
														}
														className="flex w-full items-center space-x-2.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent aria-selected:bg-accent cursor-pointer text-foreground"
													>
														<div className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background shrink-0 text-foreground/80">
															{item.icon}
														</div>
														<p className="font-medium text-xs text-foreground/90">
															{item.title}
														</p>
													</EditorCommandItem>
												</div>
											);
										},
									);
								})()}
							</EditorCommandList>
						</EditorCommand>
					)}

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
