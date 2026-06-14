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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

import { Editor } from "@tiptap/core";

import { useState, useEffect } from "react";
import { MediaDialog } from "./media-dialog";
import { GifPopover } from "./gif-popover";
import { TableSelector } from "./table-selector";

export function TiptapToolbar({
	editor: propEditor,
}: {
	editor?: Editor | null;
}) {
	const { editor: contextEditor } = useEditor();
	const editor = propEditor || contextEditor;

	const [mediaModal, setMediaModal] = useState<{
		isOpen: boolean;
		type: "image" | "video";
	}>({
		isOpen: false,
		type: "image",
	});

	useEffect(() => {
		const handleOpenMedia = (e: Event) => {
			const customEvent = e as CustomEvent<{ type: "image" | "video" }>;
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

	const addYoutube = () => {
		setMediaModal({ isOpen: true, type: "video" });
	};

	const handleMediaInsert = (url: string) => {
		if (mediaModal.type === "image") {
			editor.chain().focus().setImage({ src: url }).run();
		} else {
			editor.chain().focus().setYoutubeVideo({ src: url }).run();
		}
	};

	const addLink = () => {
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("Enter link URL:", previousUrl);
		if (url === null) return;
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor
			.chain()
			.focus()
			.extendMarkRange("link")
			.setLink({ href: url })
			.run();
	};

	const addLatex = () => {
		const formula = window.prompt("Enter LaTeX formula (e.g. E=mc^2):");
		if (formula !== null) {
			editor.chain().focus().setLatex({ latex: formula }).run();
		}
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

	return (
		<div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/40 bg-muted/20 select-none">
			{/* Headings */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="flex h-8 items-center gap-1 px-2.5 rounded-md text-foreground hover:bg-accent text-xs font-semibold cursor-pointer transition-colors border border-border/40 bg-background/50 shadow-sm">
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

			<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

			{/* Inline Styles */}
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("bold") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Bold"
			>
				<Bold className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("italic") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Italic"
			>
				<Italic className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("underline") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Underline"
			>
				<Underline className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("strike") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</button>

			<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

			{/* Blocks and Lists */}
			<button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("bulletList") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Bullet List"
			>
				<List className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("orderedList") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Numbered List"
			>
				<ListOrdered className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleTaskList().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("taskList") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Task List"
			>
				<ListTodo className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("blockquote") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Quote"
			>
				<TextQuote className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("codeBlock") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Code Block"
			>
				<Code2 className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("code") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Inline Code"
			>
				<Code className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground"
				title="Horizontal Rule"
			>
				<Minus className="h-4 w-4" />
			</button>

			{/* Alignment Options */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
						{editor.isActive({ textAlign: "center" }) ? (
							<AlignCenter className="h-4 w-4" />
						) : editor.isActive({ textAlign: "right" }) ? (
							<AlignRight className="h-4 w-4" />
						) : editor.isActive({ textAlign: "justify" }) ? (
							<AlignJustify className="h-4 w-4" />
						) : (
							<AlignLeft className="h-4 w-4" />
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-32">
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setTextAlign("left").run()
						}
					>
						<span className="flex items-center gap-2 text-xs">
							<AlignLeft className="h-3.5 w-3.5" /> Left
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setTextAlign("center").run()
						}
					>
						<span className="flex items-center gap-2 text-xs">
							<AlignCenter className="h-3.5 w-3.5" /> Center
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setTextAlign("right").run()
						}
					>
						<span className="flex items-center gap-2 text-xs">
							<AlignRight className="h-3.5 w-3.5" /> Right
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setTextAlign("justify").run()
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
				<DropdownMenuTrigger asChild>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent"
						title="Line Height"
					>
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
							editor.chain().focus().setLineHeight("1.15").run()
						}
					>
						<span className="text-xs">1.15</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setLineHeight("1.5").run()
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
			<button
				onClick={() => editor.chain().focus().outdent().run()}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="Decrease Indent"
			>
				<Outdent className="h-4 w-4" />
			</button>

			<button
				onClick={() => editor.chain().focus().indent().run()}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="Increase Indent"
			>
				<Indent className="h-4 w-4" />
			</button>

			<TableSelector
				onSelect={(r, c) =>
					editor
						.chain()
						.focus()
						.insertTable({ rows: r, cols: c, withHeaderRow: true })
						.run()
				}
			/>

			<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

			{/* Insert Links, Latex, Media */}
			<button
				onClick={addLink}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent",
					editor.isActive("link") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Hyperlink"
			>
				<LinkIcon className="h-4 w-4" />
			</button>

			<button
				onClick={addLatex}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground"
				title="LaTeX Formula"
			>
				<Sigma className="h-4 w-4" />
			</button>

			<button
				onClick={addImage}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground"
				title="Insert Image"
			>
				<ImageIcon className="h-4 w-4" />
			</button>

			<button
				onClick={addYoutube}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground"
				title="Insert YouTube Video"
			>
				<VideoIcon className="h-4 w-4" />
			</button>

			<GifPopover
				onSelect={(url) =>
					editor.chain().focus().setImage({ src: url }).run()
				}
			/>

			<div className="w-[1px] h-5 bg-border/40 mx-1 self-center" />

			{/* Colors */}
			<DropdownMenu>
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

			<MediaDialog
				isOpen={mediaModal.isOpen}
				onClose={() =>
					setMediaModal((prev) => ({ ...prev, isOpen: false }))
				}
				type={mediaModal.type}
				onInsert={handleMediaInsert}
			/>
		</div>
	);
}
