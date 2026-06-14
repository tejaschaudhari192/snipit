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
	HorizontalRule,
	TaskList,
	TaskItem,
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
import { Image as ImageIcon } from "lucide-react";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Mention from "@tiptap/extension-mention";

import TextAlign from "@tiptap/extension-text-align";
import { Indent, LineHeight } from "./extensions/formatting-extensions";
import FontFamily from "@tiptap/extension-font-family";

// Extracted modules
import { Transliteration } from "./extensions/transliteration-extension";
import { suggestionItems } from "./slash-command-items";
import type { CustomSuggestionItem } from "./slash-command-items";
import { CustomImage } from "./extensions/custom-image";
import { Attachment } from "./extensions/attachment";
import { BubbleMenuContent } from "./bubble-menu-content";
import { TiptapToolbar } from "./tiptap-toolbar";
import { mentionSuggestion } from "./extensions/mention-suggestion";
import { FindReplace } from "./find-replace";
import { StatusBar } from "./status-bar";

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
	const [isZenMode, setIsZenMode] = useState(false);
	const [showFindReplace, setShowFindReplace] = useState(false);
	const [findText, setFindText] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const dragCounter = useRef(0);
	const [stats, setStats] = useState({
		words: 0,
		characters: 0,
		readTime: 0,
	});

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

	const updateStats = (editorInstance: Editor | null) => {
		if (!editorInstance) return;
		const text = editorInstance.getText();
		const charCount = text.length;
		const wordCount =
			text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
		const readingTime = Math.ceil(wordCount / 200);
		setStats({
			words: wordCount,
			characters: charCount,
			readTime: readingTime,
		});
	};

	useEffect(() => {
		updateStats(activeEditor);
	}, [activeEditor]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "h" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				setShowFindReplace((prev) => !prev);
			}
			if (e.key === "Escape") {
				if (showFindReplace) setShowFindReplace(false);
				if (isZenMode) setIsZenMode(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showFindReplace, isZenMode]);

	const handleReplace = (all = false) => {
		if (!activeEditor || !findText) return;

		const { state, view } = activeEditor;
		const { doc } = state;

		const occurrences: { from: number; to: number }[] = [];
		doc.descendants((node, pos) => {
			if (node.isText && node.text) {
				let index = 0;
				while (true) {
					index = node.text.indexOf(findText, index);
					if (index === -1) break;
					occurrences.push({
						from: pos + index,
						to: pos + index + findText.length,
					});
					index += findText.length;
				}
			}
		});

		if (occurrences.length === 0) return;

		if (all) {
			let tr = state.tr;
			for (let i = occurrences.length - 1; i >= 0; i--) {
				const { from, to } = occurrences[i];
				tr = tr.insertText(replaceText, from, to);
			}
			view.dispatch(tr);
		} else {
			const { from, to } = occurrences[0];
			const tr = state.tr.insertText(replaceText, from, to);
			view.dispatch(tr);
		}
		updateStats(activeEditor);
	};

	const getMatchCount = () => {
		if (!activeEditor || !findText) return 0;
		let count = 0;
		activeEditor.state.doc.descendants((node) => {
			if (node.isText && node.text) {
				let index = 0;
				while (true) {
					index = node.text.indexOf(findText, index);
					if (index === -1) break;
					count++;
					index += findText.length;
				}
			}
		});
		return count;
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current++;
		if (e.dataTransfer.types.includes("Files")) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current = 0;
		setIsDragging(false);
	};

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
			Highlight.configure({
				multicolor: true,
			}),
			Superscript,
			Subscript,
			Mention.configure({
				HTMLAttributes: {
					class: "mention bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium border border-primary/20",
				},
				suggestion: mentionSuggestion,
			}),
			HorizontalRule,
			TaskList,
			TaskItem,
			CustomImage,
			Attachment,
			FontFamily,
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
		<div
			className={cn(
				"relative flex flex-col overflow-hidden transition-all",
				isZenMode
					? "fixed inset-0 z-[9999] bg-background text-foreground w-screen h-screen border-none"
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
					<div className="absolute inset-0 z-[9999] bg-background/85 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-primary/50 m-3 rounded-lg pointer-events-none animate-in fade-in duration-200">
						<div className="p-4 bg-muted rounded-full border border-border mb-3 shadow-md">
							<ImageIcon className="h-7 w-7 text-primary animate-bounce" />
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
						matchCount={getMatchCount()}
						onClose={() => setShowFindReplace(false)}
					/>
				)}

				<EditorContent
					className={cn(
						"flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4 sm:p-8 transition-colors",
						isZenMode
							? "bg-background p-6 sm:p-12"
							: "bg-[#f0f4f9] dark:bg-[#0b0c10]",
					)}
					initialContent={
						value ? JSON.parse(JSON.stringify(value)) : undefined
					}
					onUpdate={({ editor }) => {
						onChange(editor.getHTML());
						updateStats(editor);
					}}
					extensions={extensions as AnyExtension[]}
					editorProps={{
						attributes: {
							id: "tiptap-editor-container",
							class: cn(
								"prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-4xl mx-auto w-full min-h-screen outline-none px-6 sm:px-10 py-8 bg-background border border-border/40 shadow-sm rounded-lg transition-all",
								readOnly && "pointer-events-none",
								isZenMode &&
									"shadow-none border-none bg-muted/20 max-w-3xl",
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
														className="flex w-full items-center space-x-2.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent aria-selected:bg-accent cursor-pointer text-foreground animate-in fade-in slide-in-from-bottom-1 duration-100"
													>
														<div className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background shrink-0 text-foreground/80">
															{item.icon}
														</div>
														<div className="flex flex-col min-w-0">
															<p className="font-medium text-xs text-foreground/90">
																{item.title}
															</p>
															<p className="text-[10px] text-muted-foreground/75 truncate max-w-[200px]">
																{
																	item.description
																}
															</p>
														</div>
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

			{/* Word / Character Count Status Bar */}
			<StatusBar stats={stats} />
		</div>
	);
}
