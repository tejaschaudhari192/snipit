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
	Highlighter,
	Superscript,
	Subscript,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { FONTS } from "./utils/fonts";

export function BubbleMenuContent() {
	const { editor } = useEditor();
	const [isAiOpen, setIsAiOpen] = useState(false);
	const [customPrompt, setCustomPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const apiHelpers = useApiHelpers();

	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkInputUrl, setLinkInputUrl] = useState("");

	if (!editor) return null;

	const handleOpenLinkDialog = () => {
		const previousUrl = editor.getAttributes("link").href || "";
		setLinkInputUrl(previousUrl);
		setLinkDialogOpen(true);
	};

	const handleSaveLink = () => {
		if (linkInputUrl === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: linkInputUrl })
				.run();
		}
		setLinkDialogOpen(false);
	};

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
			<div className="flex flex-col w-72 max-h-87.5 overflow-hidden bg-popover text-popover-foreground rounded-md p-1.5 shadow-lg border border-border/80">
				{/* AI Input Header */}
				<div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50">
					<Sparkles className="h-4 w-4 text-purple-500 animate-pulse shrink-0" />
					<Input
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
						className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none h-8 text-sm px-0 placeholder:text-muted-foreground/70"
						autoFocus
					/>
					<Button
						size="icon"
						onClick={() =>
							customPrompt.trim() && handleAiAction(customPrompt)
						}
						disabled={isLoading || !customPrompt.trim()}
						className="h-6 w-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white shrink-0"
					>
						<ArrowUp className="h-3.5 w-3.5" />
					</Button>
				</div>

				{/* Options List */}
				{!isLoading && (
					<div className="flex flex-col mt-1 overflow-y-auto max-h-55 text-xs">
						<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
							Edit or review selection
						</div>
						<Button
							variant="ghost"
							onClick={() =>
								handleAiAction(
									"Improve the writing quality, grammar, and style.",
								)
							}
							className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm"
						>
							<RefreshCw className="h-3.5 w-3.5 text-purple-500" />
							<span>Improve writing</span>
						</Button>
						<Button
							variant="ghost"
							onClick={() =>
								handleAiAction(
									"Identify and fix spelling, grammar, or syntax errors.",
								)
							}
							className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm"
						>
							<CheckCheck className="h-3.5 w-3.5 text-purple-500" />
							<span>Fix grammar</span>
						</Button>
						<Button
							variant="ghost"
							onClick={() =>
								handleAiAction(
									"Make this selection shorter and more concise.",
								)
							}
							className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm"
						>
							<ChevronDown className="h-3.5 w-3.5 text-purple-500 rotate-180" />
							<span>Make shorter</span>
						</Button>
						<Button
							variant="ghost"
							onClick={() =>
								handleAiAction(
									"Expand this selection with more detailed information.",
								)
							}
							className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm"
						>
							<ChevronDown className="h-3.5 w-3.5 text-purple-500" />
							<span>Make longer</span>
						</Button>

						<div className="h-px bg-border/50 my-1 mx-1" />

						<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
							Use AI to do more
						</div>
						<Button
							variant="ghost"
							onClick={() =>
								handleAiAction(
									"Continue writing or extending the thoughts in this text.",
								)
							}
							className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm"
						>
							<Play className="h-3.5 w-3.5 text-purple-500" />
							<span>Continue writing</span>
						</Button>
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

	const currentFont =
		editor.getAttributes("textStyle").fontFamily || "Default";
	const currentFontName =
		FONTS.find(
			(f) =>
				f.value === currentFont ||
				(f.value === "" && currentFont === "Default"),
		)?.name || "Default";

	return (
		<>
			<EditorBubbleItem
				onSelect={() => setIsAiOpen(true)}
				className="flex h-7 items-center gap-1.5 px-2.5 rounded-sm text-purple-500 hover:bg-purple-500/10 cursor-pointer transition-colors text-xs font-semibold whitespace-nowrap"
			>
				<Sparkles className="h-3.5 w-3.5 fill-purple-500/20" />
				<span>Ask AI</span>
			</EditorBubbleItem>
			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => {}}
				className="flex items-center gap-0.5"
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 rounded-sm text-xs font-medium border-0 gap-1"
						>
							<span>{currentHeading}</span>
							<ChevronDown className="h-3 w-3 text-muted-foreground" />
						</Button>
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

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => {}}
				className="flex items-center gap-0.5"
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 rounded-sm text-xs font-medium border-0 gap-1"
						>
							<span
								style={{
									fontFamily:
										currentFont === "Default"
											? "inherit"
											: currentFont,
								}}
							>
								{currentFontName}
							</span>
							<ChevronDown className="h-3 w-3 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-52 max-h-60 overflow-y-auto custom-scrollbar"
					>
						{FONTS.map((font) => (
							<DropdownMenuItem
								key={font.name}
								style={{ fontFamily: font.value || "inherit" }}
								onSelect={() => {
									if (font.value) {
										editor
											.chain()
											.focus()
											.setFontFamily(font.value)
											.run();
									} else {
										editor
											.chain()
											.focus()
											.unsetFontFamily()
											.run();
									}
								}}
								className="text-xs"
							>
								{font.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={handleOpenLinkDialog}
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

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

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
			<EditorBubbleItem
				onSelect={(editor) =>
					editor.chain().focus().toggleSuperscript().run()
				}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("superscript") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Superscript className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(editor) =>
					editor.chain().focus().toggleSubscript().run()
				}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("subscript") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Subscript className="h-3.5 w-3.5" />
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem onSelect={() => {}} className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-8 rounded-sm border-0"
						>
							<span
								className="underline decoration-2 text-xs font-semibold"
								style={{ color: currentColor }}
							>
								A
							</span>
							<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
						</Button>
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

			{/* Highlight Color dropdown inside Bubble Menu */}
			<EditorBubbleItem onSelect={() => {}} className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-8 rounded-sm border-0"
						>
							<Highlighter className="h-3.5 w-3.5" />
							<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-36">
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().unsetHighlight().run()
							}
						>
							Reset Highlight
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: "#fef08a" })
									.run()
							}
						>
							<span className="w-3.5 h-3.5 rounded bg-yellow-200 mr-2 border border-border" />{" "}
							Yellow
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: "#bbf7d0" })
									.run()
							}
						>
							<span className="w-3.5 h-3.5 rounded bg-green-200 mr-2 border border-border" />{" "}
							Green
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: "#bfdbfe" })
									.run()
							}
						>
							<span className="w-3.5 h-3.5 rounded bg-blue-200 mr-2 border border-border" />{" "}
							Blue
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: "#fbcfe8" })
									.run()
							}
						>
							<span className="w-3.5 h-3.5 rounded bg-pink-200 mr-2 border border-border" />{" "}
							Pink
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: "#ddd6fe" })
									.run()
							}
						>
							<span className="w-3.5 h-3.5 rounded bg-purple-200 mr-2 border border-border" />{" "}
							Purple
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</EditorBubbleItem>

			{/* Link Modal */}
			<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
				<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4 z-999999">
					<DialogHeader>
						<DialogTitle className="text-base font-semibold text-foreground">
							Insert Link
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-2">
						<label className="text-xs text-muted-foreground font-medium">
							Link URL
						</label>
						<Input
							type="text"
							placeholder="https://example.com"
							value={linkInputUrl}
							onChange={(e) => setLinkInputUrl(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSaveLink();
							}}
							autoFocus
						/>
					</div>
					<div className="flex justify-end gap-2 mt-2">
						<Button
							variant="ghost"
							onClick={() => setLinkDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveLink}>Save Link</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
