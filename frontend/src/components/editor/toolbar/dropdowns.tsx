import { type Editor } from "@tiptap/core";
import {
	ChevronDown,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	Minus,
	Plus,
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
import { Button } from "@/components/ui/button";
import { FONTS, loadFontOnDemand } from "../utils/fonts";
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

export function HeadingDropdown({ editor }: { editor: Editor }) {
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
									variant="outline"
									size="sm"
									className="h-8 gap-1 px-2.5 text-xs font-semibold shadow-sm border-border/40 bg-background/50 min-w-24 justify-between"
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

export function FontSizeDropdown({ editor }: { editor: Editor }) {
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
							className="h-8 w-7 px-0 text-muted-foreground hover:text-foreground"
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
										variant="outline"
										size="sm"
										className="h-8 gap-1 px-2 text-xs font-semibold shadow-sm border-border/40 bg-background/50 min-w-13 justify-between"
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
							className="h-8 w-7 px-0 text-muted-foreground hover:text-foreground"
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

export function FontDropdown({ editor }: { editor: Editor }) {
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
									variant="outline"
									size="sm"
									className="h-8 gap-1 px-2.5 text-xs font-semibold shadow-sm border-border/40 bg-background/50 whitespace-nowrap"
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
									className="h-8 w-8 rounded-md border-transparent"
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
									className="h-8 w-8 rounded-md border-transparent"
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
