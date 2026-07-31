import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FindReplaceProps {
	findText: string;
	setFindText: (text: string) => void;
	replaceText: string;
	setReplaceText: (text: string) => void;
	onReplace: (all: boolean) => void;
	matchCount: number;
	onClose: () => void;
}

export function FindReplace({
	findText,
	setFindText,
	replaceText,
	setReplaceText,
	onReplace,
	matchCount,
	onClose,
}: FindReplaceProps) {
	return (
		<div className="absolute top-14 right-4 z-40 w-80 p-3.5 rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-200">
			<div className="flex items-center justify-between">
				<span className="text-xs font-bold text-foreground/80 tracking-wide">
					Find & Replace
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="text-[10px] font-semibold text-muted-foreground hover:text-foreground px-1.5 py-0.5 h-6 rounded bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
				>
					Esc
				</Button>
			</div>
			<div className="flex items-center gap-1.5 border border-border/60 rounded px-2.5 py-1 bg-background shadow-inner">
				<Input
					type="text"
					placeholder="Find text..."
					value={findText}
					onChange={(e) => setFindText(e.target.value)}
					className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 shadow-none text-xs text-foreground placeholder:text-muted-foreground/60 h-auto p-0"
					autoFocus
				/>
				{findText && (
					<span className="text-[9px] font-bold text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded shrink-0">
						{matchCount} matches
					</span>
				)}
			</div>
			<div className="flex items-center gap-1.5 border border-border/60 rounded px-2.5 py-1 bg-background shadow-inner">
				<Input
					type="text"
					placeholder="Replace with..."
					value={replaceText}
					onChange={(e) => setReplaceText(e.target.value)}
					className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 shadow-none text-xs text-foreground placeholder:text-muted-foreground/60 h-auto p-0"
				/>
			</div>
			<div className="flex items-center gap-2 mt-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onReplace(false)}
					disabled={!findText}
					className="flex-1 text-[11px] h-8"
				>
					Replace
				</Button>
				<Button
					size="sm"
					onClick={() => onReplace(true)}
					disabled={!findText}
					className="flex-1 text-[11px] h-8 shadow-sm"
				>
					Replace All
				</Button>
			</div>
		</div>
	);
}
