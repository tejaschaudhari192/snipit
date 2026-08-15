import { type Editor } from "@tiptap/core";
import { TextQuote, Code2, Code, Minus } from "lucide-react";
import { TooltipButton } from "./tooltip-button";
import { cn } from "@/utils";

export function BlockControls({ editor }: { editor: Editor }) {
	return (
		<>
			<TooltipButton
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={cn(
					"icon-btn",
					editor.isActive("blockquote") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Quote"
				shortcut="Ctrl Shift B"
			>
				<TextQuote className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={cn(
					"icon-btn",
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
					"icon-btn",
					editor.isActive("code") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Inline Code"
				shortcut="Ctrl E"
			>
				<Code className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className="icon-btn"
				title="Horizontal Rule"
			>
				<Minus className="h-4 w-4" />
			</TooltipButton>
		</>
	);
}
