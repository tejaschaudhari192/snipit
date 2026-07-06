import { type Editor } from "@tiptap/core";
import { List, ListOrdered, ListTodo } from "lucide-react";
import { TooltipButton } from "./tooltip-button";
import { cn } from "@/utils";

export function ListControls({ editor }: { editor: Editor }) {
	return (
		<>
			<TooltipButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
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
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
				onClick={() => editor.chain().focus().toggleTaskList().run()}
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
		</>
	);
}
