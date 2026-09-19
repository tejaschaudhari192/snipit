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
import { Button } from "@/components/ui/button";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "../constants/colors";

export function ColorControls({ editor }: { editor: Editor }) {
	const currentColor =
		editor.getAttributes("textStyle").color || "currentColor";

	return (
		<>
			{/* Text Color */}
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger
						render={
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										className="h-8 w-9 px-0 border-transparent cursor-pointer"
									>
										<span
											className="underline decoration-2 text-sm font-bold"
											style={{ color: currentColor }}
										>
											A
										</span>
										<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
									</Button>
								}
							/>
						}
					/>
					<TooltipContent className="kbd-badge">
						<span className="font-semibold text-white">
							Text Color
						</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem
						onClick={() =>
							editor.chain().focus().unsetColor().run()
						}
						className="cursor-pointer"
					>
						Reset Color
					</DropdownMenuItem>
					{TEXT_COLORS.map((c) => (
						<DropdownMenuItem
							key={c.color}
							onClick={() =>
								editor.chain().focus().setColor(c.color).run()
							}
							className="cursor-pointer"
						>
							<span
								className={`w-3.5 h-3.5 rounded-full ${c.bgClass || ""} mr-2 border border-border`}
							/>{" "}
							{c.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Text Highlight / Background Color */}
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger
						render={
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										className="h-8 w-9 px-0 border-transparent cursor-pointer"
									>
										<Highlighter className="h-4 w-4" />
										<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
									</Button>
								}
							/>
						}
					/>
					<TooltipContent className="kbd-badge">
						<span className="font-semibold text-white">
							Highlight Text
						</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="end" className="w-36">
					<DropdownMenuItem
						onClick={() =>
							editor.chain().focus().unsetHighlight().run()
						}
						className="cursor-pointer"
					>
						Reset Highlight
					</DropdownMenuItem>
					{HIGHLIGHT_COLORS.map((c) => (
						<DropdownMenuItem
							key={c.color}
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHighlight({ color: c.color })
									.run()
							}
							className="cursor-pointer"
						>
							<span
								className={`w-3.5 h-3.5 rounded ${c.bgClass || ""} mr-2 border border-border`}
							/>{" "}
							{c.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
