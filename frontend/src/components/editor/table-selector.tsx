import { useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Table as TableIcon } from "lucide-react";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

interface TableSelectorProps {
	onSelect: (rows: number, cols: number) => void;
}

export function TableSelector({ onSelect }: TableSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredRows, setHoveredRows] = useState(0);
	const [hoveredCols, setHoveredCols] = useState(0);

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
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer">
							<TableIcon className="h-4 w-4" />
						</button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">
						Insert Table
					</span>
				</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="start"
				className="w-auto p-4 border border-border/50 bg-background shadow-2xl rounded-2xl flex flex-col items-center gap-3 select-none"
			>
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
									row <= hoveredRows && col <= hoveredCols;
								return (
									<div
										key={`${row}-${col}`}
										onMouseEnter={() => {
											setHoveredRows(row);
											setHoveredCols(col);
										}}
										onClick={() => handleSelect(row, col)}
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
			</PopoverContent>
		</Popover>
	);
}
