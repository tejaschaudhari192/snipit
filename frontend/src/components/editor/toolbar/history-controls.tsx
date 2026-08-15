import { type Editor } from "@tiptap/core";
import { Undo, Redo } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function HistoryControls({ editor }: { editor: Editor }) {
	return (
		<>
			<TooltipButton
				onClick={() => editor.chain().focus().undo().run()}
				className="icon-btn disabled:opacity-40"
				title="Undo"
				shortcut="Ctrl Z"
			>
				<Undo className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={() => editor.chain().focus().redo().run()}
				className="icon-btn disabled:opacity-40"
				title="Redo"
				shortcut="Ctrl Y"
			>
				<Redo className="h-4 w-4" />
			</TooltipButton>
		</>
	);
}
