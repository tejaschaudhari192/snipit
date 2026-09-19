import { Progress } from "@/components/ui/progress";

interface MediaUploadProgressProps {
	progress: number;
}

export function MediaUploadProgress({ progress }: MediaUploadProgressProps) {
	return (
		<div className="flex flex-col gap-1.5 w-full bg-muted/30 p-3 rounded-lg border border-border/40 animate-in fade-in duration-200">
			<div className="flex items-center justify-between text-xs font-medium">
				<span className="text-foreground flex items-center gap-1.5">
					<span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
					Uploading media...
				</span>
				<span className="font-bold tabular-nums text-primary">
					{progress}%
				</span>
			</div>
			<Progress value={progress} className="h-1.5 w-full" />
		</div>
	);
}
