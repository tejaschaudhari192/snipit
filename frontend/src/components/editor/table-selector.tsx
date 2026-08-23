import { useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import {
	Table as TableIcon,
	Plus,
	Trash2,
	Columns,
	Rows,
	Combine,
	Split,
	Heading1,
} from "lucide-react";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/core";

interface TableSelectorProps {
	editor?: Editor | null;
	onSelect: (rows: number, cols: number) => void;
}

export function TableSelector({ editor, onSelect }: TableSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredRows, setHoveredRows] = useState(0);
	const [hoveredCols, setHoveredCols] = useState(0);
	const [viewMode, setViewMode] = useState<"grid" | "actions">("grid");

	const isInsideTable = editor?.isActive("table") ?? false;
	const maxRows = 10;
	const maxCols = 10;

	const handleSelect = (r: number, c: number) => {
		onSelect(r, c);
		setIsOpen(false);
	};

	const handleMouseLeave = () => {
		setHoveredRows(0);
		setHoveredCols(0);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip>
				<TooltipTrigger
					render={
						<PopoverTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-8 w-8 rounded-md border-transparent transition-colors",
										isInsideTable &&
											"bg-accent text-accent-foreground",
									)}
								>
									<TableIcon className="h-4 w-4" />
								</Button>
							}
						/>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">
						{isInsideTable ? "Table Options" : "Insert Table"}
					</span>
				</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="start"
				className="w-auto min-w-56 p-3 border border-border/50 bg-popover text-popover-foreground shadow-2xl rounded-2xl flex flex-col gap-2.5 select-none"
			>
				{isInsideTable && (
					<div className="flex items-center gap-1 border-b border-border/40 pb-2 mb-1">
						<Button
							variant={
								viewMode === "actions" ? "secondary" : "ghost"
							}
							size="sm"
							className="h-7 text-xs flex-1 font-medium"
							onClick={() => setViewMode("actions")}
						>
							Table Controls
						</Button>
						<Button
							variant={
								viewMode === "grid" ? "secondary" : "ghost"
							}
							size="sm"
							className="h-7 text-xs flex-1 font-medium"
							onClick={() => setViewMode("grid")}
						>
							New Table
						</Button>
					</div>
				)}

				{isInsideTable && viewMode === "actions" ? (
					<div className="flex flex-col gap-1 w-full min-w-52">
						<div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 tracking-wider">
							Rows & Columns
						</div>
						<div className="grid grid-cols-2 gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor
										?.chain()
										.focus()
										.addRowBefore()
										.run();
									setIsOpen(false);
								}}
							>
								<Plus className="h-3.5 w-3.5 text-primary" />
								<span>Row Above</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor?.chain().focus().addRowAfter().run();
									setIsOpen(false);
								}}
							>
								<Plus className="h-3.5 w-3.5 text-primary" />
								<span>Row Below</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor
										?.chain()
										.focus()
										.addColumnBefore()
										.run();
									setIsOpen(false);
								}}
							>
								<Plus className="h-3.5 w-3.5 text-primary" />
								<span>Col Left</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor
										?.chain()
										.focus()
										.addColumnAfter()
										.run();
									setIsOpen(false);
								}}
							>
								<Plus className="h-3.5 w-3.5 text-primary" />
								<span>Col Right</span>
							</Button>
						</div>

						<div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 tracking-wider mt-1 border-t border-border/40 pt-1.5">
							Structure & Cells
						</div>
						<div className="grid grid-cols-2 gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor
										?.chain()
										.focus()
										.toggleHeaderRow()
										.run();
									setIsOpen(false);
								}}
							>
								<Heading1 className="h-3.5 w-3.5" />
								<span>Header Row</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor
										?.chain()
										.focus()
										.toggleHeaderColumn()
										.run();
									setIsOpen(false);
								}}
							>
								<Columns className="h-3.5 w-3.5" />
								<span>Header Col</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor?.chain().focus().mergeCells().run();
									setIsOpen(false);
								}}
							>
								<Combine className="h-3.5 w-3.5" />
								<span>Merge</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2"
								onClick={() => {
									editor?.chain().focus().splitCell().run();
									setIsOpen(false);
								}}
							>
								<Split className="h-3.5 w-3.5" />
								<span>Split</span>
							</Button>
						</div>

						<div className="text-[10px] font-bold text-destructive/80 uppercase px-2 py-0.5 tracking-wider mt-1 border-t border-border/40 pt-1.5">
							Delete
						</div>
						<div className="flex flex-col gap-1">
							<div className="grid grid-cols-2 gap-1">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs justify-start gap-1.5 px-2 text-destructive hover:bg-destructive/10"
									onClick={() => {
										editor
											?.chain()
											.focus()
											.deleteRow()
											.run();
										setIsOpen(false);
									}}
								>
									<Rows className="h-3.5 w-3.5" />
									<span>Delete Row</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs justify-start gap-1.5 px-2 text-destructive hover:bg-destructive/10"
									onClick={() => {
										editor
											?.chain()
											.focus()
											.deleteColumn()
											.run();
										setIsOpen(false);
									}}
								>
									<Columns className="h-3.5 w-3.5" />
									<span>Delete Col</span>
								</Button>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs justify-start gap-1.5 px-2 text-destructive hover:bg-destructive/10 w-full"
								onClick={() => {
									editor?.chain().focus().deleteTable().run();
									setIsOpen(false);
								}}
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>Delete Entire Table</span>
							</Button>
						</div>
					</div>
				) : (
					<>
						<div
							className="grid grid-cols-10 gap-1.5 p-1"
							onMouseLeave={handleMouseLeave}
						>
							{Array.from({ length: maxRows }).map((_, rIdx) => {
								const row = rIdx + 1;
								return Array.from({ length: maxCols }).map(
									(__, cIdx) => {
										const col = cIdx + 1;
										const isHighlighted =
											row <= hoveredRows &&
											col <= hoveredCols;
										return (
											<div
												key={`${row}-${col}`}
												onMouseEnter={() => {
													setHoveredRows(row);
													setHoveredCols(col);
												}}
												onClick={() =>
													handleSelect(row, col)
												}
												className={cn(
													"w-4 h-4 rounded border transition-all cursor-pointer",
													isHighlighted
														? "bg-foreground border-foreground shadow-sm scale-105"
														: "border-border hover:border-foreground/50 bg-background",
												)}
											/>
										);
									},
								);
							})}
						</div>
						<div className="text-xs font-semibold text-muted-foreground text-center">
							{hoveredRows > 0 && hoveredCols > 0
								? `${hoveredCols} × ${hoveredRows}`
								: "Insert Table"}
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
