interface StatusBarProps {
	stats: {
		words: number;
		characters: number;
		readTime: number;
	};
}

export function StatusBar({ stats }: StatusBarProps) {
	return (
		<div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-muted/20 text-[11px] text-muted-foreground select-none font-medium z-10 shrink-0">
			<div className="flex items-center gap-4">
				<span>
					Words:{" "}
					<strong className="text-foreground">{stats.words}</strong>
				</span>
				<span>
					Characters:{" "}
					<strong className="text-foreground">
						{stats.characters}
					</strong>
				</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="flex items-center gap-1">
					<svg
						className="h-3.5 w-3.5 opacity-80"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
					Est. Reading Time:{" "}
					<strong className="text-foreground">
						{stats.readTime} min
					</strong>
				</span>
			</div>
		</div>
	);
}
