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
import { FONTS, loadFontOnDemand } from "../../utils/fonts";
import { cn } from "cn";

export function FontDropdown({
	editor,
	compact,
}: {
	editor: Editor;
	compact?: boolean;
}) {
	const currentFont = editor.getAttributes("textStyle").fontFamily || "";
	const currentFontName =
		FONTS.find(
			(f) =>
				f.value === currentFont ||
				(currentFont !== "" && f.value.startsWith(currentFont)),
		)?.name || "Default";

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
										"gap-1 text-xs font-semibold whitespace-nowrap cursor-pointer",
										compact
											? "h-7 px-2 border-0"
											: "h-8 px-2.5 shadow-sm border-border/40 bg-background/50",
									)}
								>
									<span
										style={{
											fontFamily:
												currentFont === "Default"
													? "inherit"
													: currentFont,
										}}
									>
										{currentFontName}
									</span>
									<ChevronDown className="h-3 w-3 text-muted-foreground" />
								</Button>
							}
						/>
					}
				/>
				<TooltipContent className="kbd-badge">
					<span className="font-semibold text-white">
						Font Family
					</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				align="start"
				className="w-52 max-h-60 overflow-y-auto custom-scrollbar"
			>
				{FONTS.map((font) => (
					<DropdownMenuItem
						key={font.name}
						style={{ fontFamily: font.value || "inherit" }}
						onClick={() => {
							if (font.value) {
								loadFontOnDemand(font.value);
								editor
									.chain()
									.focus()
									.setFontFamily(font.value)
									.run();
							} else {
								editor.chain().focus().unsetFontFamily().run();
							}
						}}
						className="text-xs cursor-pointer"
					>
						{font.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
