import { memo } from "react";
import { Code2, FileCode } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import type { EditorEngine } from "@/hooks/use-editor-engine";

interface EditorEngineToggleProps {
	engine: EditorEngine;
	onToggle: () => void;
	className?: string;
}

export const EditorEngineToggle = memo(
	({ engine, onToggle, className }: EditorEngineToggleProps) => {
		const isNative = engine === "native";

		return (
			<Tooltip>
				<TooltipTrigger
					render={
						<button
							type="button"
							onClick={onToggle}
							className={cn(
								"flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border/50 bg-background/80 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs shrink-0 select-none",
								className,
							)}
							aria-label={
								isNative
									? "Switch to Monaco Pro Editor"
									: "Switch to Simple / Native Editor"
							}
						>
							{isNative ? (
								<>
									<FileCode className="h-3.5 w-3.5 text-primary shrink-0" />
									<span className="hidden min-[480px]:inline text-[11px] font-semibold">
										Simple
									</span>
								</>
							) : (
								<>
									<Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
									<span className="hidden min-[480px]:inline text-[11px] font-semibold">
										Monaco
									</span>
								</>
							)}
						</button>
					}
				/>
				<TooltipContent side="left">
					<p>
						{isNative
							? "Switch to Monaco Pro Editor"
							: "Switch to Simple / Native Editor"}
					</p>
				</TooltipContent>
			</Tooltip>
		);
	},
);
