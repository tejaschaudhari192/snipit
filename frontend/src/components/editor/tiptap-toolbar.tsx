import { useEditor } from "novel";
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Code2,
	List,
	ListOrdered,
	TextQuote,
	Minus,
	Link as LinkIcon,
	Image as ImageIcon,
	Video as VideoIcon,
	Sigma,
	ChevronDown,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	Indent,
	Outdent,
	ListTodo,
	Paperclip,
	Undo,
	Redo,
	Highlighter,
	Superscript,
	Subscript,
	Maximize2,
	Minimize2,
	Search,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";

import { Editor } from "@tiptap/core";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

import { useState, useEffect } from "react";
import { MediaDialog } from "./media-dialog";
import { GifPopover } from "./gif-popover";
import { TableSelector } from "./table-selector";
import { FONTS } from "./utils/fonts";
import { EmojiPicker } from "./emoji-picker";

function TooltipButton({
	onClick,
	className,
	title,
	shortcut,
	children,
}: {
	onClick?: () => void;
	className?: string;
	title: string;
	shortcut?: string;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button onClick={onClick} className={className}>
					{children}
				</button>
			</TooltipTrigger>
			<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
				<span className="font-semibold text-white">{title}</span>
				{shortcut && (
					<span className="text-[9px] text-zinc-400 mt-0.5">
						{shortcut}
					</span>
				)}
			</TooltipContent>
		</Tooltip>
	);
}

export function TiptapToolbar({
	editor: propEditor,
	isZenMode = false,
	onToggleZenMode,
	onToggleFindReplace,
}: {
	editor?: Editor | null;
	isZenMode?: boolean;
	onToggleZenMode?: () => void;
	onToggleFindReplace?: () => void;
}) {
	const { editor: contextEditor } = useEditor();
	const editor = propEditor || contextEditor;

	const [mediaModal, setMediaModal] = useState<{
		isOpen: boolean;
		type: "image" | "video" | "attachment";
	}>({
		isOpen: false,
		type: "image",
	});

	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkInputUrl, setLinkInputUrl] = useState("");

	const [latexDialogOpen, setLatexDialogOpen] = useState(false);
	const [latexInputFormula, setLatexInputFormula] = useState("");

	useEffect(() => {
		const handleOpenMedia = (e: Event) => {
			const customEvent = e as CustomEvent<{
				type: "image" | "video" | "attachment";
			}>;
			setMediaModal({
				isOpen: true,
				type: customEvent.detail.type,
			});
		};
		window.addEventListener("open-media-modal", handleOpenMedia);
		return () => {
			window.removeEventListener("open-media-modal", handleOpenMedia);
		};
	}, []);

	if (!editor) return null;

	const addImage = () => {
		setMediaModal({ isOpen: true, type: "image" });
	};

	const addVideo = () => {
		setMediaModal({ isOpen: true, type: "video" });
	};

	const handleMediaInsert = (
		url: string,
		filename?: string,
		filesize?: string,
	) => {
		if (mediaModal.type === "image") {
			editor.chain().focus().setImage({ src: url }).run();
		} else if (mediaModal.type === "video") {
			if (url.includes("youtube.com") || url.includes("youtu.be")) {
				editor.chain().focus().setYoutubeVideo({ src: url }).run();
			} else {
				editor
					.chain()
					.focus()
					.insertContent(
						`<video src="${url}" controls class="rounded-lg border border-border shadow-sm max-w-full my-4"></video>`,
					)
					.run();
			}
		} else if (mediaModal.type === "attachment") {
			editor
				.chain()
				.focus()
				.insertContent({
					type: "attachment",
					attrs: {
						href: url,
						filename: filename || "attachment",
						filesize: filesize || "",
					},
				})
				.run();
		}
	};

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

	const handleOpenLatexDialog = () => {
		setLatexInputFormula("");
		setLatexDialogOpen(true);
	};

	const handleSaveLatex = () => {
		if (latexInputFormula.trim()) {
			editor
				.chain()
				.focus()
				.setLatex({ latex: latexInputFormula.trim() })
				.run();
		}
		setLatexDialogOpen(false);
	};

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
		<TooltipProvider delayDuration={400}>
			<div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/40 bg-muted/20 select-none w-full">
				{/* Undo & Redo */}
				<TooltipButton
					onClick={() => editor.chain().focus().undo().run()}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer disabled:opacity-40"
					title="Undo"
					shortcut="Ctrl Z"
				>
					<Undo className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() => editor.chain().focus().redo().run()}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer disabled:opacity-40"
					title="Redo"
					shortcut="Ctrl Y"
				>
					<Redo className="h-4 w-4" />
				</TooltipButton>

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Headings */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 items-center gap-1 px-2.5 rounded-md text-foreground hover:bg-accent text-xs font-semibold cursor-pointer transition-colors border border-border/40 bg-background/50 shadow-sm">
									<span>{currentHeading}</span>
									<ChevronDown className="h-3 w-3 text-muted-foreground" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Headings
							</span>
						</TooltipContent>
					</Tooltip>
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

				{/* Fonts */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 items-center gap-1 px-2.5 rounded-md text-foreground hover:bg-accent text-xs font-semibold cursor-pointer transition-colors border border-border/40 bg-background/50 shadow-sm whitespace-nowrap">
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
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Font Family
							</span>
						</TooltipContent>
					</Tooltip>
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

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Inline Styles */}
				<TooltipButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("bold") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Bold"
					shortcut="Ctrl B"
				>
					<Bold className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("italic") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Italic"
					shortcut="Ctrl I"
				>
					<Italic className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleUnderline().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("underline") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Underline"
					shortcut="Ctrl U"
				>
					<Underline className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("strike") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Strikethrough"
					shortcut="Ctrl Shift S"
				>
					<Strikethrough className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleSuperscript().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("superscript") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Superscript"
				>
					<Superscript className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleSubscript().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("subscript") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Subscript"
				>
					<Subscript className="h-4 w-4" />
				</TooltipButton>

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Blocks and Lists */}
				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleBulletList().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("bulletList") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Bullet List"
					shortcut="Ctrl Shift 8"
				>
					<List className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleOrderedList().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("orderedList") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Numbered List"
					shortcut="Ctrl Shift 7"
				>
					<ListOrdered className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleTaskList().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("taskList") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Task List"
					shortcut="Ctrl Shift 9"
				>
					<ListTodo className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleBlockquote().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("blockquote") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Quote"
					shortcut="Ctrl Shift B"
				>
					<TextQuote className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().toggleCodeBlock().run()
					}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("codeBlock") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Code Block"
					shortcut="Ctrl Alt C"
				>
					<Code2 className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						editor.isActive("code") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Inline Code"
					shortcut="Ctrl E"
				>
					<Code className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						editor.chain().focus().setHorizontalRule().run()
					}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Horizontal Rule"
				>
					<Minus className="h-4 w-4" />
				</TooltipButton>

				{/* Alignment Options */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
									{editor.isActive({
										textAlign: "center",
									}) ? (
										<AlignCenter className="h-4 w-4" />
									) : editor.isActive({
											textAlign: "right",
									  }) ? (
										<AlignRight className="h-4 w-4" />
									) : editor.isActive({
											textAlign: "justify",
									  }) ? (
										<AlignJustify className="h-4 w-4" />
									) : (
										<AlignLeft className="h-4 w-4" />
									)}
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Align Text
							</span>
						</TooltipContent>
					</Tooltip>
					<DropdownMenuContent align="start" className="w-32">
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setTextAlign("left")
									.run()
							}
						>
							<span className="flex items-center gap-2 text-xs">
								<AlignLeft className="h-3.5 w-3.5" /> Left
							</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setTextAlign("center")
									.run()
							}
						>
							<span className="flex items-center gap-2 text-xs">
								<AlignCenter className="h-3.5 w-3.5" /> Center
							</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setTextAlign("right")
									.run()
							}
						>
							<span className="flex items-center gap-2 text-xs">
								<AlignRight className="h-3.5 w-3.5" /> Right
							</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setTextAlign("justify")
									.run()
							}
						>
							<span className="flex items-center gap-2 text-xs">
								<AlignJustify className="h-3.5 w-3.5" /> Justify
							</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Line Height Options */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-4 w-4"
									>
										<line x1="21" y1="6" x2="3" y2="6" />
										<line x1="21" y1="12" x2="9" y2="12" />
										<line x1="21" y1="18" x2="3" y2="18" />
										<polyline points="6 10 4 12 6 14" />
										<line x1="4" y1="12" x2="4" y2="2" />
										<line x1="4" y1="12" x2="4" y2="22" />
									</svg>
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Line Height
							</span>
						</TooltipContent>
					</Tooltip>
					<DropdownMenuContent align="start" className="w-28">
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setLineHeight("1").run()
							}
						>
							<span className="text-xs">Single (1.0)</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setLineHeight("1.15")
									.run()
							}
						>
							<span className="text-xs">1.15</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor
									.chain()
									.focus()
									.setLineHeight("1.5")
									.run()
							}
						>
							<span className="text-xs">1.5</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								editor.chain().focus().setLineHeight("2").run()
							}
						>
							<span className="text-xs">Double (2.0)</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Indentation Options */}
				<TooltipButton
					onClick={() => editor.chain().focus().outdent().run()}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Decrease Indent"
				>
					<Outdent className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() => editor.chain().focus().indent().run()}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Increase Indent"
				>
					<Indent className="h-4 w-4" />
				</TooltipButton>

				<TableSelector
					onSelect={(r, c) =>
						editor
							.chain()
							.focus()
							.insertTable({
								rows: r,
								cols: c,
								withHeaderRow: true,
							})
							.run()
					}
				/>

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Insert Links, Latex, Media */}
				<TooltipButton
					onClick={handleOpenLinkDialog}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent cursor-pointer",
						editor.isActive("link") &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title="Hyperlink"
				>
					<LinkIcon className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={handleOpenLatexDialog}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="LaTeX Formula"
				>
					<Sigma className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={addImage}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Insert Image"
				>
					<ImageIcon className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={addVideo}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Insert Video"
				>
					<VideoIcon className="h-4 w-4" />
				</TooltipButton>

				<TooltipButton
					onClick={() =>
						setMediaModal({ isOpen: true, type: "attachment" })
					}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Insert Attachment"
				>
					<Paperclip className="h-4 w-4" />
				</TooltipButton>

				<GifPopover
					onSelect={(url) =>
						editor.chain().focus().setImage({ src: url }).run()
					}
				/>

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Colors */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
									<span
										className="underline decoration-2 text-sm font-bold"
										style={{ color: currentColor }}
									>
										A
									</span>
									<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Text Color
							</span>
						</TooltipContent>
					</Tooltip>
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

				{/* Text Highlight / Background Color */}
				<DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button className="flex h-8 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
									<Highlighter className="h-4 w-4" />
									<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
							<span className="font-semibold text-white">
								Highlight Text
							</span>
						</TooltipContent>
					</Tooltip>
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

				{/* Emoji Picker Popover */}
				<EmojiPicker editor={editor} />

				<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

				{/* Find & Replace */}
				<TooltipButton
					onClick={onToggleFindReplace}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Find & Replace"
					shortcut="Ctrl H"
				>
					<Search className="h-4 w-4" />
				</TooltipButton>

				{/* Zen / Focus Mode */}
				<TooltipButton
					onClick={onToggleZenMode}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						isZenMode &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title={isZenMode ? "Exit Zen Mode" : "Zen Mode"}
					shortcut="Esc"
				>
					{isZenMode ? (
						<Minimize2 className="h-4 w-4" />
					) : (
						<Maximize2 className="h-4 w-4" />
					)}
				</TooltipButton>

				<MediaDialog
					isOpen={mediaModal.isOpen}
					onClose={() =>
						setMediaModal((prev) => ({ ...prev, isOpen: false }))
					}
					type={mediaModal.type}
					onInsert={handleMediaInsert}
				/>

				{/* Link Modal */}
				<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
					<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
						<DialogHeader>
							<DialogTitle className="text-base font-semibold text-foreground">
								Insert Link
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<label className="text-xs text-muted-foreground font-medium">
								Link URL
							</label>
							<input
								type="text"
								placeholder="https://example.com"
								value={linkInputUrl}
								onChange={(e) =>
									setLinkInputUrl(e.target.value)
								}
								className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveLink();
								}}
								autoFocus
							/>
						</div>
						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setLinkDialogOpen(false)}
								className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveLink}
								className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
							>
								Save Link
							</button>
						</div>
					</DialogContent>
				</Dialog>

				{/* LaTeX Modal */}
				<Dialog
					open={latexDialogOpen}
					onOpenChange={setLatexDialogOpen}
				>
					<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
						<DialogHeader>
							<DialogTitle className="text-base font-semibold text-foreground">
								Insert LaTeX Formula
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<label className="text-xs text-muted-foreground font-medium">
								LaTeX Code
							</label>
							<input
								type="text"
								placeholder="e.g. E=mc^2"
								value={latexInputFormula}
								onChange={(e) =>
									setLatexInputFormula(e.target.value)
								}
								className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveLatex();
								}}
								autoFocus
							/>
						</div>
						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setLatexDialogOpen(false)}
								className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveLatex}
								className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
							>
								Insert Formula
							</button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	);
}
