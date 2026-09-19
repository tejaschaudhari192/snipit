import { type Editor } from "@tiptap/core";
import { ChevronDown, Highlighter } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "../constants/colors";

export function BubbleMenuColors({ editor }: { editor: Editor }) {
	const currentColor =
		editor.getAttributes("textStyle").color || "currentColor";

	return (
		<>
			{/* Text Color dropdown */}
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-8 rounded-sm border-0 cursor-pointer"
							>
								<span
									className="underline decoration-2 text-xs font-semibold"
									style={{ color: currentColor }}
								>
									A
								</span>
								<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
							</Button>
						}
					/>
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
									editor
										.chain()
										.focus()
										.setColor(c.color)
										.run()
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
			</div>

			{/* Highlight Color dropdown */}
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-8 rounded-sm border-0 cursor-pointer"
							>
								<Highlighter className="h-3.5 w-3.5" />
								<ChevronDown className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
							</Button>
						}
					/>
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
			</div>
		</>
	);
}
