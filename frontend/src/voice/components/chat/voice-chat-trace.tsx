import React, { useState } from "react";
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
	ChevronDown,
	ChevronRight,
	Cpu,
	CheckCircle2,
	Loader2,
	AlertCircle,
} from "lucide-react";
import type { ExecutionStep } from "../../types/voice.types";

interface VoiceChatTraceProps {
	steps: ExecutionStep[];
	isStreaming?: boolean;
}

export const VoiceChatTrace: React.FC<VoiceChatTraceProps> = ({
	steps,
	isStreaming,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	if (!steps || steps.length === 0) return null;

	const completedCount = steps.filter((s) => s.status === "done").length;
	const runningStep = steps.find((s) => s.status === "running");

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="w-full my-1.5"
		>
			<CollapsibleTrigger
				type="button"
				className="flex items-center gap-2 w-full px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-all cursor-pointer select-none group text-left"
			>
				{isStreaming ? (
					<Loader2 className="w-3 h-3 text-primary animate-spin" />
				) : (
					<Cpu className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
				)}

				<span className="truncate">
					{runningStep
						? runningStep.label
						: `Trace (${completedCount}/${steps.length} steps)`}
				</span>

				<Badge
					variant="secondary"
					className="h-4 px-1 text-[10px] font-mono leading-none rounded"
				>
					{completedCount === steps.length ? "Done" : "Live"}
				</Badge>

				{isOpen ? (
					<ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
				) : (
					<ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
				)}
			</CollapsibleTrigger>

			<CollapsibleContent className="mt-1.5 space-y-1.5 pt-1 pl-1">
				<div className="rounded-lg border border-border/50 bg-muted/20 p-2 space-y-1.5 text-xs max-h-32 overflow-y-auto">
					{steps.map((step) => {
						const isDone = step.status === "done";
						const isRunning = step.status === "running";
						const isError = step.status === "error";

						return (
							<div
								key={step.id}
								className="flex items-start gap-2 py-0.5"
							>
								<div className="mt-0.5 shrink-0">
									{isDone ? (
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
									) : isRunning ? (
										<Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
									) : isError ? (
										<AlertCircle className="w-3.5 h-3.5 text-destructive" />
									) : (
										<div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/40 ml-0.5 mt-0.5" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[11px] font-medium leading-tight text-foreground truncate">
										{step.label}
									</p>
									{step.detail && (
										<p className="text-[10px] font-mono text-muted-foreground truncate">
											{step.detail}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
};
