import { type Editor } from "@tiptap/core";
import { Indent, Outdent } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function IndentControls({ editor }: { editor: Editor }) {
	return (
		<>
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
		</>
	);
}
