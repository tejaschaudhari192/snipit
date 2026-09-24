import { type Editor } from "@tiptap/core";
import { EditorBubbleItem } from "novel";
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Superscript,
	Subscript,
} from "lucide-react";
import { cn } from "cn";

interface BubbleMenuFormattingProps {
	editor: Editor;
}

export function BubbleMenuFormatting({ editor }: BubbleMenuFormattingProps) {
	return (
		<>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleBold().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("bold") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Bold className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleItalic().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("italic") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Italic className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleUnderline().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("underline") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Underline className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleStrike().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("strike") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Strikethrough className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleCode().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("code") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Code className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleSuperscript().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("superscript") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Superscript className="h-3.5 w-3.5" />
			</EditorBubbleItem>
			<EditorBubbleItem
				onSelect={(ed) => ed.chain().focus().toggleSubscript().run()}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors",
					editor.isActive("subscript") &&
						"bg-accent text-accent-foreground",
				)}
			>
				<Subscript className="h-3.5 w-3.5" />
			</EditorBubbleItem>
		</>
	);
}
