import { type Editor } from "@tiptap/core";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
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

export function AlignmentDropdown({ editor }: { editor: Editor }) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger
					render={
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-md border-transparent cursor-pointer"
								>
									{editor.isActive({
										textAlign: "center",
									}) ? (
										<AlignCenter className="h-4 w-4" />
									) : editor.isActive({
											textAlign: "right",
									  }) ? (
										<AlignRight className="h-4 w-4" />
									) : editor.isActive({
											textAlign: "justify",
									  }) ? (
										<AlignJustify className="h-4 w-4" />
									) : (
										<AlignLeft className="h-4 w-4" />
									)}
								</Button>
							}
						/>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">Align Text</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-32">
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setTextAlign("left").run()
					}
					className="cursor-pointer"
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignLeft className="h-3.5 w-3.5" /> Left
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setTextAlign("center").run()
					}
					className="cursor-pointer"
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignCenter className="h-3.5 w-3.5" /> Center
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setTextAlign("right").run()
					}
					className="cursor-pointer"
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignRight className="h-3.5 w-3.5" /> Right
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setTextAlign("justify").run()
					}
					className="cursor-pointer"
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignJustify className="h-3.5 w-3.5" /> Justify
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
