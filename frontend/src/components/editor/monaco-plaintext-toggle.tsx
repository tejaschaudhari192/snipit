import { memo } from "react";
import { FileCode2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface MonacoPlaintextToggleProps {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
	className?: string;
}

export const MonacoPlaintextToggle = memo(
	({ enabled, onToggle, className }: MonacoPlaintextToggleProps) => {
		const { t } = useTranslation();

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								type="button"
								variant={enabled ? "default" : "outline"}
								size="sm"
								onClick={() => onToggle(!enabled)}
								className={cn(
									"gap-2 h-9 px-3 transition-all",
									enabled
										? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
										: "bg-background/50 hover:bg-background/80 border-border/40 shadow-sm text-muted-foreground",
									className,
								)}
							>
								<FileCode2 className="h-4 w-4" />
								<span className="font-medium text-sm hidden sm:inline-block">
									{enabled ? "Monaco" : "Native"}
								</span>
							</Button>
						}
					/>
					<TooltipContent side="top">
						<p>
							{enabled
								? t(
										"editor.monaco_toggle.tooltip_disable",
										"Switch to Native Editor",
									)
								: t(
										"editor.monaco_toggle.tooltip_enable",
										"Switch to Advanced Editor (Monaco)",
									)}
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	},
);
