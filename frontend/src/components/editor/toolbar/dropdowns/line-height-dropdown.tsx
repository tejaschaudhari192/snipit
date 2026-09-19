import { type Editor } from "@tiptap/core";
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

export function LineHeightDropdown({ editor }: { editor: Editor }) {
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
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-4 w-4"
									>
										<line x1="21" y1="6" x2="3" y2="6" />
										<line x1="21" y1="12" x2="9" y2="12" />
										<line x1="21" y1="18" x2="3" y2="18" />
										<polyline points="6 10 4 12 6 14" />
										<line x1="4" y1="12" x2="4" y2="2" />
										<line x1="4" y1="12" x2="4" y2="22" />
									</svg>
								</Button>
							}
						/>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">
						Line Height
					</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-28">
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setLineHeight("1").run()
					}
					className="cursor-pointer"
				>
					<span className="text-xs">Single (1.0)</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setLineHeight("1.15").run()
					}
					className="cursor-pointer"
				>
					<span className="text-xs">1.15</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setLineHeight("1.5").run()
					}
					className="cursor-pointer"
				>
					<span className="text-xs">1.5</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						editor.chain().focus().setLineHeight("2").run()
					}
					className="cursor-pointer"
				>
					<span className="text-xs">Double (2.0)</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
