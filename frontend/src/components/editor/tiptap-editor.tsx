import { useEffect, useRef, useMemo, useState } from "react";
import { useApiHelpers } from "@/lib/api";
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
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandList,
	EditorCommandItem,
	createSuggestionItems,
	useEditor,
	EditorBubble,
	EditorBubbleItem,
	ImageResizer,
	Mathematics,
	Twitter,
	Youtube,
	GlobalDragHandle,
} from "novel";
import "katex/dist/katex.min.css";
import {
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	TextQuote,
	Code2,
	Minus,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Sparkles,
	ChevronDown,
	ExternalLink,
	Sigma,
	ArrowUp,
	CheckCheck,
	Play,
	RefreshCw,
} from "lucide-react";
import { getTransliteratedSuggestions } from "@/utils/transliteration-utils";
import { Extension, Editor } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { cn } from "@/utils";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

const Transliteration = Extension.create({
	name: "transliteration",

	addOptions() {
		return {
			transliterationRef: {
				current: { enabled: false, targetLanguage: "hi" },
			},
		};
	},

	addProseMirrorPlugins() {
		const transliterationRef = this.options.transliterationRef;
		return [
			new Plugin({
				key: new PluginKey("transliteration"),
				props: {
					handleKeyDown(view, event) {
						const config = transliterationRef?.current;
						if (!config || !config.enabled) return false;

						if (event.key === " " || event.key === "Enter") {
							const { state, dispatch } = view;
							const { selection } = state;
							const { $from } = selection;

							const textBefore = $from.parent.textBetween(
								0,
								$from.parentOffset,
								null,
								" ",
							);
							const words = textBefore.split(/\s+/);
							const lastWord = words[words.length - 1];

							if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
								const suggestions =
									getTransliteratedSuggestions(
										lastWord,
										config.targetLanguage,
									);
								if (suggestions && suggestions.length > 0) {
									const transliterated = suggestions[0];
									const startPos =
										$from.pos - lastWord.length;
									const endPos = $from.pos;

									const transaction = state.tr.insertText(
										transliterated,
										startPos,
										endPos,
									);
									dispatch(transaction);
									return false; // let default Space or Enter propagate
								}
							}
						}
						return false;
					},
				},
			}),
		];
	},
});

const suggestionItems = createSuggestionItems([
	{
		title: "Heading 1",
		description: "Big section heading.",
		icon: <Heading1 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		icon: <Heading2 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		icon: <Heading3 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHeading({ level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bulleted list.",
		icon: <List className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering.",
		icon: <ListOrdered className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		icon: <TextQuote className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Code Block",
		description: "Capture a code snippet.",
		icon: <Code2 className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Divider",
		description: "Insert a horizontal divider.",
		icon: <Minus className="w-4 h-4 text-foreground" />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setHorizontalRule().run();
		},
	},
]);

function BubbleMenuContent() {
	const { editor } = useEditor();
	const [isAiOpen, setIsAiOpen] = useState(false);
	const [customPrompt, setCustomPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const apiHelpers = useApiHelpers();

	if (!editor) return null;

	const handleAiAction = async (prompt: string) => {
		const { from, to } = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(from, to, " ");
		if (!selectedText) return;

		setIsLoading(true);
		try {
			const formattedPrompt = `${prompt} (IMPORTANT: Return the response as clean, nicely formatted HTML suitable for a rich text editor. Use proper semantic tags like <p>, <strong>, <em>, <ul>, <li>, <h3>, <h4>, <blockquote>, <code> etc. Do NOT wrap the code/response in markdown formatting like \`\`\`html or similar code blocks. Output ONLY the raw HTML content.)`;
			const response = await apiHelpers.enhanceContent(
				selectedText,
				formattedPrompt,
			);
			if (response && response.result) {
				editor.chain().focus().insertContent(response.result).run();
			}
		} catch (error) {
			console.error("AI Error:", error);
		} finally {
			setIsLoading(false);
			setIsAiOpen(false);
		}
	};

	if (isAiOpen) {
		return (
			<div className="flex flex-col w-72 max-h-[350px] overflow-hidden bg-popover text-popover-foreground rounded-md p-1.5 shadow-lg border border-border/80">
				{/* AI Input Header */}
				<div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50">
					<Sparkles className="h-4 w-4 text-purple-500 animate-pulse shrink-0" />
					<input
						type="text"
						value={customPrompt}
						onChange={(e) => setCustomPrompt(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && customPrompt.trim()) {
								handleAiAction(customPrompt);
							}
						}}
						placeholder={
							isLoading
								? "Generating..."
								: "Ask AI to edit or generate..."
						}
						disabled={isLoading}
						className="flex-1 bg-transparent text-sm outline-none border-none placeholder:text-muted-foreground/70 text-foreground"
						autoFocus
					/>
					<button
						onClick={() =>
							customPrompt.trim() && handleAiAction(customPrompt)
						}
						disabled={isLoading || !customPrompt.trim()}
						className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white cursor-pointer transition-colors shrink-0"
					>
						<ArrowUp className="h-3.5 w-3.5" />
					</button>
				</div>

				{/* Options List */}
				{!isLoading && (
					<div className="flex flex-col mt-1 overflow-y-auto max-h-[220px] text-xs">
						<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
							Edit or review selection
						</div>
						<button
							onClick={() =>
								handleAiAction(
									"Improve the writing quality, grammar, and style.",
								)
							}
							className="flex w-full items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-sm text-left font-medium transition-colors cursor-pointer"
						>
							<RefreshCw className="h-3.5 w-3.5 text-purple-500" />
							<span>Improve writing</span>
						</button>
						<button
							onClick={() =>
								handleAiAction(
									"Identify and fix spelling, grammar, or syntax errors.",
								)
							}
							className="flex w-full items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-sm text-left font-medium transition-colors cursor-pointer"
						>
							<CheckCheck className="h-3.5 w-3.5 text-purple-500" />
							<span>Fix grammar</span>
						</button>
						<button
							onClick={() =>
								handleAiAction(
									"Make this selection shorter and more concise.",
								)
							}
							className="flex w-full items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-sm text-left font-medium transition-colors cursor-pointer"
						>
							<ChevronDown className="h-3.5 w-3.5 text-purple-500 rotate-180" />
							<span>Make shorter</span>
						</button>
						<button
							onClick={() =>
								handleAiAction(
									"Expand this selection with more detailed information.",
								)
							}
							className="flex w-full items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-sm text-left font-medium transition-colors cursor-pointer"
						>
							<ChevronDown className="h-3.5 w-3.5 text-purple-500" />
							<span>Make longer</span>
						</button>

						<div className="h-px bg-border/50 my-1 mx-1" />

						<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
							Use AI to do more
						</div>
						<button
							onClick={() =>
								handleAiAction(
									"Continue writing or extending the thoughts in this text.",
								)
							}
							className="flex w-full items-center gap-2 px-2.5 py-1.5 hover:bg-accent rounded-sm text-left font-medium transition-colors cursor-pointer"
						>
							<Play className="h-3.5 w-3.5 text-purple-500" />
							<span>Continue writing</span>
						</button>
					</div>
				)}
			</div>
		);
	}

	const currentHeading = editor.isActive("heading", { level: 1 })
		? "Heading 1"
		: editor.isActive("heading", { level: 2 })
			? "Heading 2"
			: editor.isActive("heading", { level: 3 })
				? "Heading 3"
				: "Normal Text";

	const currentColor =
		editor.getAttributes("textStyle").color || "currentColor";

	return (
		<>
			<EditorBubbleItem
				onSelect={() => setIsAiOpen(true)}
				className="flex h-7 items-center gap-1.5 px-2.5 rounded-sm text-purple-500 hover:bg-purple-500/10 cursor-pointer transition-colors text-xs font-semibold"
			>
				<Sparkles className="h-3.5 w-3.5 fill-purple-500/20" />
				<span>Ask AI</span>
			</EditorBubbleItem>
			<div className="w-[1px] h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => {}}
				className="flex items-center gap-0.5"
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="flex h-7 items-center gap-1 px-2 rounded-sm text-foreground hover:bg-accent text-xs font-medium cursor-pointer transition-colors border-0 outline-none">
							<span>{currentHeading}</span>
							<ChevronDown className="h-3 w-3 text-muted-foreground" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-32">
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setParagraph().run()
							}
						>
							Normal Text
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setHeading({ level: 1 })
									.run()
							}
						>
							Heading 1
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setHeading({ level: 2 })
									.run()
							}
						>
							Heading 2
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setHeading({ level: 3 })
									.run()
							}
						>
							Heading 3
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</EditorBubbleItem>

			<div className="w-[1px] h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={(editor) => {
					const previousUrl = editor.getAttributes("link").href;
					const url = window.prompt("Enter link URL:", previousUrl);
					if (url === null) return;
					if (url === "") {
						editor
							.chain()
							.focus()
							.extendMarkRange("link")
							.unsetLink()
							.run();
						return;
					}
					editor
						.chain()
						.focus()
						.extendMarkRange("link")
						.setLink({ href: url })
						.run();
				}}
				className="flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
			>
				<ExternalLink className="h-3.5 w-3.5 text-blue-500" />
			</EditorBubbleItem>

			<EditorBubbleItem
				onSelect={(editor) => {
					editor.chain().focus().setLatex({ latex: "" }).run();
				}}
				className="flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
			>
				<Sigma className="h-3.5 w-3.5" />
			</EditorBubbleItem>

			<div className="w-[1px] h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={(editor) => editor.chain().focus().toggleBold().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("bold") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Bold className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(editor) =>
					editor.chain().focus().toggleItalic().run()
				}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("italic") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Italic className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(editor) =>
					editor.chain().focus().toggleUnderline().run()
				}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("underline") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Underline className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(editor) =>
					editor.chain().focus().toggleStrike().run()
				}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("strike") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Strikethrough className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(editor) => editor.chain().focus().toggleCode().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("code") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Code className="h-3.5 w-3.5" />
			</EditorBubbleItem>

			<div className="w-[1px] h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem onSelect={() => {}} className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="flex h-7 w-8 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors text-xs font-semibold border-0 outline-none">
							<span
								className="underline decoration-2"
								style={{ color: currentColor }}
							>
								A
							</span>
							<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-32">
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().unsetColor().run()
							}
						>
							Reset Color
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setColor("#9333ea").run()
							}
						>
							<span className="w-3.5 h-3.5 rounded-full bg-purple-600 mr-2 border border-border" />{" "}
							Purple
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setColor("#ec4899").run()
							}
						>
							<span className="w-3.5 h-3.5 rounded-full bg-pink-500 mr-2 border border-border" />{" "}
							Pink
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setColor("#2563eb").run()
							}
						>
							<span className="w-3.5 h-3.5 rounded-full bg-blue-600 mr-2 border border-border" />{" "}
							Blue
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setColor("#16a34a").run()
							}
						>
							<span className="w-3.5 h-3.5 rounded-full bg-green-600 mr-2 border border-border" />{" "}
							Green
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setColor("#dc2626").run()
							}
						>
							<span className="w-3.5 h-3.5 rounded-full bg-red-600 mr-2 border border-border" />{" "}
							Red
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</EditorBubbleItem>
		</>
	);
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

					{/* Slash Commands Dropdown */}
					{!readOnly && (
						<EditorCommand className="z-[99999] h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md transition-all">
							<EditorCommandEmpty className="px-2 py-1.5 text-xs text-muted-foreground">
								No results found
							</EditorCommandEmpty>
							<EditorCommandList>
								{suggestionItems.map((item) => (
									<EditorCommandItem
										value={item.title}
										onCommand={(val) => item.command?.(val)}
										key={item.title}
										className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
									>
										<div className="flex h-5 w-5 items-center justify-center rounded border border-border bg-background">
											{item.icon}
										</div>
										<div>
											<p className="font-medium">
												{item.title}
											</p>
											<p className="text-xs text-muted-foreground">
												{item.description}
											</p>
										</div>
									</EditorCommandItem>
								))}
							</EditorCommandList>
						</EditorCommand>
					)}

					{/* Image Resize Helper */}
					{!readOnly && <ImageResizer />}
				</EditorContent>
			</EditorRoot>
		</div>
	);
}
