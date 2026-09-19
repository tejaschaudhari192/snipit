import { type Editor } from "@tiptap/core";
import { ChevronDown } from "lucide-react";
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

export function HeadingDropdown({
	editor,
	compact = false,
}: {
	editor: Editor;
	compact?: boolean;
}) {
	const currentHeading = editor.isActive("heading", { level: 1 })
		? "Heading 1"
		: editor.isActive("heading", { level: 2 })
			? "Heading 2"
			: editor.isActive("heading", { level: 3 })
				? "Heading 3"
				: editor.isActive("heading", { level: 4 })
					? "Heading 4"
					: editor.isActive("heading", { level: 5 })
						? "Heading 5"
						: editor.isActive("heading", { level: 6 })
							? "Heading 6"
							: "Normal Text";

	return (
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
										"gap-1 font-medium border-0 transition-all cursor-pointer",
										compact
											? "h-7 px-2 rounded-sm text-xs"
											: "h-8 px-2.5 text-xs font-semibold shadow-sm border border-border/40 bg-background/50 min-w-24 justify-between",
									)}
								>
									<span>{currentHeading}</span>
									<ChevronDown className="h-3 w-3 text-muted-foreground" />
								</Button>
							}
						/>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">Headings</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-44">
				<DropdownMenuItem
					onClick={() => editor.chain().focus().setParagraph().run()}
					className={cn(
						"text-xs flex items-center justify-between cursor-pointer",
						!editor.isActive("heading") && "font-bold text-primary",
					)}
				>
					<span>Normal Text</span>
					<span className="text-[10px] text-muted-foreground">
						Ctrl+Alt+0
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setHeading({ level: 1 }).run()
					}
					className={cn(
						"text-base font-bold flex items-center justify-between cursor-pointer",
						editor.isActive("heading", { level: 1 }) &&
							"text-primary",
					)}
				>
					<span>Heading 1</span>
					<span className="text-[10px] font-normal text-muted-foreground">
						Ctrl+Alt+1
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setHeading({ level: 2 }).run()
					}
					className={cn(
						"text-sm font-semibold flex items-center justify-between cursor-pointer",
						editor.isActive("heading", { level: 2 }) &&
							"text-primary",
					)}
				>
					<span>Heading 2</span>
					<span className="text-[10px] font-normal text-muted-foreground">
						Ctrl+Alt+2
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setHeading({ level: 3 }).run()
					}
					className={cn(
						"text-xs font-medium flex items-center justify-between cursor-pointer",
						editor.isActive("heading", { level: 3 }) &&
							"text-primary",
					)}
				>
					<span>Heading 3</span>
					<span className="text-[10px] font-normal text-muted-foreground">
						Ctrl+Alt+3
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setHeading({ level: 4 }).run()
					}
					className={cn(
						"text-xs font-medium flex items-center justify-between cursor-pointer",
						editor.isActive("heading", { level: 4 }) &&
							"text-primary",
					)}
				>
					<span>Heading 4</span>
					<span className="text-[10px] font-normal text-muted-foreground">
						Ctrl+Alt+4
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
