import { useState } from "react";
import { useApiHelpers } from "@/lib/api";
import { useEditor, EditorBubbleItem } from "novel";
import {
	Sparkles,
	ArrowUp,
	RefreshCw,
	CheckCheck,
	ChevronDown,
	Play,
	ExternalLink,
	Sigma,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

export function BubbleMenuContent() {
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
