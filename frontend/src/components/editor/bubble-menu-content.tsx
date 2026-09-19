import { useState } from "react";
import { useEditor, EditorBubbleItem } from "novel";
import { Sparkles, ExternalLink, Sigma } from "lucide-react";
import {
	HeadingDropdown,
	FontDropdown,
	FontSizeDropdown,
} from "./toolbar/dropdowns";
import { LinkDialog } from "./dialogs/link-dialog";
import { LatexDialog } from "./dialogs/latex-dialog";
import { BubbleMenuAi } from "./bubble-menu/bubble-menu-ai";
import { BubbleMenuTable } from "./bubble-menu/bubble-menu-table";
import { BubbleMenuColors } from "./bubble-menu/bubble-menu-colors";
import { BubbleMenuFormatting } from "./bubble-menu/bubble-menu-formatting";

export function BubbleMenuContent() {
	const { editor } = useEditor();
	const [isAiOpen, setIsAiOpen] = useState(false);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [latexDialogOpen, setLatexDialogOpen] = useState(false);

	if (!editor) return null;

	if (isAiOpen) {
		return (
			<BubbleMenuAi editor={editor} onClose={() => setIsAiOpen(false)} />
		);
	}

	const handleSaveLink = (url: string) => {
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: url })
				.run();
		}
	};

	const handleSaveLatex = (formula: string) => {
		if (formula.trim()) {
			editor.chain().focus().setLatex({ latex: formula.trim() }).run();
		}
	};

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
				<HeadingDropdown editor={editor} compact />
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => {}}
				className="flex items-center gap-0.5"
			>
				<FontDropdown editor={editor} compact />
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => {}}
				className="flex items-center gap-0.5"
			>
				<FontSizeDropdown editor={editor} compact />
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<EditorBubbleItem
				onSelect={() => setLinkDialogOpen(true)}
				className="flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
			>
				<ExternalLink className="h-3.5 w-3.5 text-blue-500" />
			</EditorBubbleItem>

			<EditorBubbleItem
				onSelect={() => setLatexDialogOpen(true)}
				className="flex h-7 w-7 items-center justify-center rounded-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
			>
				<Sigma className="h-3.5 w-3.5" />
			</EditorBubbleItem>

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<BubbleMenuFormatting editor={editor} />

			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />

			<BubbleMenuColors editor={editor} />

			<BubbleMenuTable editor={editor} />

			<LinkDialog
				isOpen={linkDialogOpen}
				onClose={() => setLinkDialogOpen(false)}
				initialUrl={editor.getAttributes("link").href || ""}
				onSave={handleSaveLink}
			/>

			<LatexDialog
				isOpen={latexDialogOpen}
				onClose={() => setLatexDialogOpen(false)}
				onSave={handleSaveLatex}
			/>
		</>
	);
}
