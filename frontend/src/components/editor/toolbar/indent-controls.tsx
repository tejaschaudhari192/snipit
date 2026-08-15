import { type Editor } from "@tiptap/core";
import { Indent, Outdent } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function IndentControls({ editor }: { editor: Editor }) {
	return (
		<>
			<TooltipButton
				onClick={() => editor.chain().focus().outdent().run()}
				className="icon-btn"
				title="Decrease Indent"
			>
				<Outdent className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={() => editor.chain().focus().indent().run()}
				className="icon-btn"
				title="Increase Indent"
			>
				<Indent className="h-4 w-4" />
			</TooltipButton>
		</>
	);
}
