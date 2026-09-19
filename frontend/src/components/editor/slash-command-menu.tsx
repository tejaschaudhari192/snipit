import {
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
} from "novel";
import { suggestionItems } from "./slash-command-items";
import type { CustomSuggestionItem } from "./slash-command-items";

export function SlashCommandMenu() {
	let renderedInsertHeader = false;

	return (
		<EditorCommand className="z-50 h-auto max-h-82.5 w-72 overflow-y-auto rounded-md border border-border bg-popover px-1 py-2 shadow-md transition-all custom-scrollbar">
			<EditorCommandEmpty className="px-2 text-muted-foreground text-xs">
				No results found
			</EditorCommandEmpty>
			<EditorCommandList>
				{suggestionItems.map((item: CustomSuggestionItem) => {
					const showHeader =
						item.category === "INSERT" && !renderedInsertHeader;
					if (showHeader) {
						renderedInsertHeader = true;
					}
					return (
						<div key={item.title} className="flex flex-col w-full">
							{showHeader && (
								<div className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider select-none border-t border-border/40 my-1 pt-2">
									INSERT
								</div>
							)}
							<EditorCommandItem
								value={item.title}
								onCommand={(val) => item.command(val)}
								className="flex w-full items-center space-x-2.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent aria-selected:bg-accent cursor-pointer text-foreground animate-in fade-in slide-in-from-bottom-1 duration-100"
							>
								<div className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background shrink-0 text-foreground/80">
									{item.icon}
								</div>
								<div className="flex flex-col min-w-0">
									<p className="font-medium text-xs text-foreground/90">
										{item.title}
									</p>
									<p className="text-[10px] text-muted-foreground/75 truncate max-w-50">
										{item.description}
									</p>
								</div>
							</EditorCommandItem>
						</div>
					);
				})}
			</EditorCommandList>
		</EditorCommand>
	);
}
