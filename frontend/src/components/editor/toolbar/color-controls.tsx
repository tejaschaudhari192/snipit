import { type Editor } from "@tiptap/core";
import { ChevronDown, Highlighter } from "lucide-react";
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

export function ColorControls({ editor }: { editor: Editor }) {
	const currentColor =
		editor.getAttributes("textStyle").color || "currentColor";

	return (
		<>
			{/* Text Color */}
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<button className="flex h-8 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
								<span
									className="underline decoration-2 text-sm font-bold"
									style={{ color: currentColor }}
								>
									A
								</span>
								<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
							</button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
						<span className="font-semibold text-white">
							Text Color
						</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().unsetColor().run()
						}
					>
						Reset Color
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setColor("#9333ea").run()
						}
					>
						<span className="w-3.5 h-3.5 rounded-full bg-purple-600 mr-2 border border-border" />{" "}
						Purple
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setColor("#ec4899").run()
						}
					>
						<span className="w-3.5 h-3.5 rounded-full bg-pink-500 mr-2 border border-border" />{" "}
						Pink
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setColor("#2563eb").run()
						}
					>
						<span className="w-3.5 h-3.5 rounded-full bg-blue-600 mr-2 border border-border" />{" "}
						Blue
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setColor("#16a34a").run()
						}
					>
						<span className="w-3.5 h-3.5 rounded-full bg-green-600 mr-2 border border-border" />{" "}
						Green
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().setColor("#dc2626").run()
						}
					>
						<span className="w-3.5 h-3.5 rounded-full bg-red-600 mr-2 border border-border" />{" "}
						Red
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Text Highlight / Background Color */}
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<button className="flex h-8 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
								<Highlighter className="h-4 w-4" />
								<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
							</button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
						<span className="font-semibold text-white">
							Highlight Text
						</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="end" className="w-36">
					<DropdownMenuItem
						onSelect={() =>
							editor.chain().focus().unsetHighlight().run()
						}
					>
						Reset Highlight
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor
								.chain()
								.focus()
								.toggleHighlight({ color: "#fef08a" })
								.run()
						}
					>
						<span className="w-3.5 h-3.5 rounded bg-yellow-200 mr-2 border border-border" />{" "}
						Yellow
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor
								.chain()
								.focus()
								.toggleHighlight({ color: "#bbf7d0" })
								.run()
						}
					>
						<span className="w-3.5 h-3.5 rounded bg-green-200 mr-2 border border-border" />{" "}
						Green
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor
								.chain()
								.focus()
								.toggleHighlight({ color: "#bfdbfe" })
								.run()
						}
					>
						<span className="w-3.5 h-3.5 rounded bg-blue-200 mr-2 border border-border" />{" "}
						Blue
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor
								.chain()
								.focus()
								.toggleHighlight({ color: "#fbcfe8" })
								.run()
						}
					>
						<span className="w-3.5 h-3.5 rounded bg-pink-200 mr-2 border border-border" />{" "}
						Pink
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() =>
							editor
								.chain()
								.focus()
								.toggleHighlight({ color: "#ddd6fe" })
								.run()
						}
					>
						<span className="w-3.5 h-3.5 rounded bg-purple-200 mr-2 border border-border" />{" "}
						Purple
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
