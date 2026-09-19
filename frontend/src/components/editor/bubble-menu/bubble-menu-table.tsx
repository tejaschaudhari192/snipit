import { type Editor } from "@tiptap/core";
import {
	Table as TableIcon,
	ChevronDown,
	Plus,
	Columns,
	Combine,
	Split,
	Rows,
	Trash2,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function BubbleMenuTable({ editor }: { editor: Editor }) {
	if (!editor.isActive("table")) return null;

	return (
		<>
			<div className="w-px h-4 bg-border/80 self-center mx-0.5" />
			<div className="flex items-center gap-0.5">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-xs flex items-center gap-1.5 text-foreground bg-accent/50 hover:bg-accent rounded-sm font-medium cursor-pointer"
							>
								<TableIcon className="h-3.5 w-3.5 text-primary" />
								<span>Table</span>
								<ChevronDown className="h-3 w-3 opacity-60" />
							</Button>
						}
					/>
					<DropdownMenuContent
						align="start"
						className="w-48 p-1 z-999999 border border-border/60 bg-popover text-popover-foreground shadow-xl rounded-lg"
					>
						<div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-wider">
							Rows & Columns
						</div>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().addRowBefore().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5 text-primary" />
							<span>Insert Row Above</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().addRowAfter().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5 text-primary" />
							<span>Insert Row Below</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().addColumnBefore().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5 text-primary" />
							<span>Insert Column Left</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().addColumnAfter().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5 text-primary" />
							<span>Insert Column Right</span>
						</DropdownMenuItem>

						<div className="h-px bg-border/40 my-1" />
						<div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-wider">
							Cells & Headers
						</div>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().toggleHeaderRow().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<span>Toggle Header Row</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeaderColumn()
									.run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Columns className="h-3.5 w-3.5" />
							<span>Toggle Header Column</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().mergeCells().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Combine className="h-3.5 w-3.5" />
							<span>Merge Cells</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().splitCell().run()
							}
							className="text-xs flex items-center gap-2 cursor-pointer"
						>
							<Split className="h-3.5 w-3.5" />
							<span>Split Cell</span>
						</DropdownMenuItem>

						<div className="h-px bg-border/40 my-1" />
						<div className="text-[10px] font-bold text-destructive uppercase px-2 py-1 tracking-wider">
							Delete
						</div>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().deleteRow().run()
							}
							className="text-xs flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
						>
							<Rows className="h-3.5 w-3.5" />
							<span>Delete Row</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().deleteColumn().run()
							}
							className="text-xs flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
						>
							<Columns className="h-3.5 w-3.5" />
							<span>Delete Column</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().deleteTable().run()
							}
							className="text-xs flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span>Delete Table</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
