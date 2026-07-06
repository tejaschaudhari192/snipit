import { type Editor } from "@tiptap/core";
import {
	ChevronDown,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
} from "lucide-react";
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
import { FONTS } from "../utils/fonts";

export function HeadingDropdown({ editor }: { editor: Editor }) {
	const currentHeading = editor.isActive("heading", { level: 1 })
		? "Heading 1"
		: editor.isActive("heading", { level: 2 })
			? "Heading 2"
			: editor.isActive("heading", { level: 3 })
				? "Heading 3"
				: "Normal Text";

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button className="flex h-8 items-center gap-1 px-2.5 rounded-md text-foreground hover:bg-accent text-xs font-semibold cursor-pointer transition-colors border border-border/40 bg-background/50 shadow-sm">
							<span>{currentHeading}</span>
							<ChevronDown className="h-3 w-3 text-muted-foreground" />
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">Headings</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-32">
				<DropdownMenuItem
					onSelect={() => editor.chain().focus().setParagraph().run()}
				>
					Normal Text
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setHeading({ level: 1 }).run()
					}
				>
					Heading 1
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setHeading({ level: 2 }).run()
					}
				>
					Heading 2
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setHeading({ level: 3 }).run()
					}
				>
					Heading 3
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function FontDropdown({ editor }: { editor: Editor }) {
	const currentFont =
		editor.getAttributes("textStyle").fontFamily || "Default";
	const currentFontName =
		FONTS.find(
			(f) =>
				f.value === currentFont ||
				(f.value === "" && currentFont === "Default"),
		)?.name || "Default";

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button className="flex h-8 items-center gap-1 px-2.5 rounded-md text-foreground hover:bg-accent text-xs font-semibold cursor-pointer transition-colors border border-border/40 bg-background/50 shadow-sm whitespace-nowrap">
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
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
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
						onSelect={() => {
							if (font.value) {
								editor
									.chain()
									.focus()
									.setFontFamily(font.value)
									.run();
							} else {
								editor.chain().focus().unsetFontFamily().run();
							}
						}}
						className="text-xs"
					>
						{font.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AlignmentDropdown({ editor }: { editor: Editor }) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
							{editor.isActive({ textAlign: "center" }) ? (
								<AlignCenter className="h-4 w-4" />
							) : editor.isActive({ textAlign: "right" }) ? (
								<AlignRight className="h-4 w-4" />
							) : editor.isActive({ textAlign: "justify" }) ? (
								<AlignJustify className="h-4 w-4" />
							) : (
								<AlignLeft className="h-4 w-4" />
							)}
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">Align Text</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-32">
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setTextAlign("left").run()
					}
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignLeft className="h-3.5 w-3.5" /> Left
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setTextAlign("center").run()
					}
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignCenter className="h-3.5 w-3.5" /> Center
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setTextAlign("right").run()
					}
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignRight className="h-3.5 w-3.5" /> Right
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setTextAlign("justify").run()
					}
				>
					<span className="flex items-center gap-2 text-xs">
						<AlignJustify className="h-3.5 w-3.5" /> Justify
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function LineHeightDropdown({ editor }: { editor: Editor }) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent cursor-pointer transition-colors border border-transparent">
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
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent className="flex flex-col items-center justify-center p-1.5 px-2.5 select-none bg-zinc-950 dark:bg-zinc-900 border border-border/20 text-white text-[11px] rounded-md font-sans z-50">
					<span className="font-semibold text-white">
						Line Height
					</span>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-28">
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setLineHeight("1").run()
					}
				>
					<span className="text-xs">Single (1.0)</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setLineHeight("1.15").run()
					}
				>
					<span className="text-xs">1.15</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setLineHeight("1.5").run()
					}
				>
					<span className="text-xs">1.5</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						editor.chain().focus().setLineHeight("2").run()
					}
				>
					<span className="text-xs">Double (2.0)</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
