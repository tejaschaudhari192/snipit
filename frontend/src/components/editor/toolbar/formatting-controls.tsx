import { type Editor } from "@tiptap/core";
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Superscript,
	Subscript,
} from "lucide-react";
import { TooltipButton } from "./tooltip-button";
import { cn } from "@/utils";

export function FormattingControls({ editor }: { editor: Editor }) {
	return (
		<>
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
				onClick={() => editor.chain().focus().toggleUnderline().run()}
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
				onClick={() => editor.chain().focus().toggleSuperscript().run()}
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
				onClick={() => editor.chain().focus().toggleSubscript().run()}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
					editor.isActive("subscript") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Subscript"
			>
				<Subscript className="h-4 w-4" />
			</TooltipButton>
		</>
	);
}
