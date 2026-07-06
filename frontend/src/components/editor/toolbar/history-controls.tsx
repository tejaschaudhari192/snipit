import { type Editor } from "@tiptap/core";
import { Undo, Redo } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function HistoryControls({ editor }: { editor: Editor }) {
	return (
		<>
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
		</>
	);
}
