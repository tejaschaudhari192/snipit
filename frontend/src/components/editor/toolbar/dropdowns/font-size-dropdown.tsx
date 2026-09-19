import { type Editor } from "@tiptap/core";
import { ChevronDown, Minus, Plus } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const FONT_SIZES = [
	"10px",
	"11px",
	"12px",
	"13px",
	"14px",
	"15px",
	"16px",
	"18px",
	"20px",
	"24px",
	"28px",
	"32px",
	"36px",
	"48px",
	"64px",
	"72px",
];

export function FontSizeDropdown({
	editor,
	compact,
}: {
	editor: Editor;
	compact?: boolean;
}) {
	const currentFontSize =
		(editor.getAttributes("textStyle").fontSize as string) || "16px";
	const numericSize = parseInt(currentFontSize, 10) || 16;

	const handleSetSize = (size: string) => {
		if (size === "default") {
			editor.chain().focus().unsetFontSize().run();
		} else {
			editor.chain().focus().setFontSize(size).run();
		}
	};

	const stepSize = (delta: number) => {
		const newSize = Math.max(8, Math.min(120, numericSize + delta));
		handleSetSize(`${newSize}px`);
	};

	return (
		<div className="flex items-center gap-0.5">
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"px-0 text-muted-foreground hover:text-foreground cursor-pointer",
								compact ? "h-7 w-6" : "h-8 w-7",
							)}
							onClick={() => stepSize(-1)}
						>
							<Minus className="h-3 w-3" />
						</Button>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">
						Decrease font size
					</span>
				</TooltipContent>
			</Tooltip>

			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger
						render={
							<DropdownMenuTrigger
								render={
									<Button
										variant={compact ? "ghost" : "outline"}
										size="sm"
										className={cn(
											"gap-1 text-xs font-semibold justify-between cursor-pointer",
											compact
												? "h-7 px-1.5 border-0 min-w-10"
												: "h-8 px-2 shadow-sm border-border/40 bg-background/50 min-w-13",
										)}
									>
										<span>
											{currentFontSize.replace("px", "")}
										</span>
										<ChevronDown className="h-3 w-3 text-muted-foreground" />
									</Button>
								}
							/>
						}
					/>
					<TooltipContent className="kbd-badge">
						<span className="font-semibold text-white">
							Font Size
						</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent
					align="start"
					className="w-28 max-h-56 overflow-y-auto custom-scrollbar"
				>
					{FONT_SIZES.map((size) => (
						<DropdownMenuItem
							key={size}
							onClick={() => handleSetSize(size)}
							className={cn(
								"text-xs justify-between cursor-pointer",
								currentFontSize === size &&
									"font-bold text-primary",
							)}
						>
							<span>{size.replace("px", "")} pt</span>
							{size === "16px" && (
								<span className="text-[10px] text-muted-foreground">
									Default
								</span>
							)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"px-0 text-muted-foreground hover:text-foreground cursor-pointer",
								compact ? "h-7 w-6" : "h-8 w-7",
							)}
							onClick={() => stepSize(1)}
						>
							<Plus className="h-3 w-3" />
						</Button>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">
						Increase font size
					</span>
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
