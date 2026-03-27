import { Cloud, Loader2, AlertCircle, Check } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveStatusProps {
	status: SaveStatus;
}

export const AutosaveStatus = ({ status }: AutosaveStatusProps) => {
	if (status === "saving") {
		return (
			<div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-md rounded-full border border-border/50 text-[10px] font-bold shadow-sm transition-all duration-300">
				<div className="flex items-center gap-2 text-primary">
					<div className="relative flex items-center justify-center">
						<Cloud className="h-4 w-4 fill-primary/10" />
						<Loader2 className="absolute h-2 w-2 animate-spin text-primary" />
					</div>
					<span className="hidden sm:inline opacity-70">
						Saving...
					</span>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-md rounded-full border border-border/50 text-[10px] font-bold shadow-sm transition-all duration-300">
				<div className="flex items-center gap-2 text-destructive animate-bounce">
					<div className="relative flex items-center justify-center">
						<Cloud className="h-4 w-4 text-destructive opacity-50" />
						<AlertCircle className="absolute h-2.5 w-2.5 text-destructive fill-background" />
					</div>
					<span className="hidden sm:inline">Save Failed</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-md rounded-full border border-border/50 text-[10px] font-bold shadow-sm transition-all duration-300">
			<div className="flex items-center gap-2 text-emerald-500 animate-in fade-in slide-in-from-left-2">
				<div className="relative flex items-center justify-center">
					<Cloud className="h-4 w-4 fill-emerald-500/10" />
					<Check className="absolute h-2 w-2 text-emerald-500 font-black" />
				</div>
				<span className="hidden sm:inline opacity-80">Saved</span>
			</div>
		</div>
	);
};
