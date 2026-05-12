import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { AiCursorIcon } from "@/components/icons/ai-cursor-icon";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiAutocompleteToggleProps {
	enabled: boolean;
	onToggle: (val: boolean) => void;
	className?: string;
}

export const AiAutocompleteToggle = ({
	enabled,
	onToggle,
	className,
}: AiAutocompleteToggleProps) => {
	const { t } = useTranslation();

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						onClick={() => onToggle(!enabled)}
						className={cn(
							"flex items-center gap-2.5 px-2.5 h-9 rounded-md border transition-all duration-300 shadow-sm select-none cursor-pointer active:scale-95 group",
							enabled
								? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400 shadow-md shadow-violet-500/5"
								: "bg-background border-border text-foreground hover:border-primary/40 hover:bg-muted/50",
							className,
						)}
					>
						<AiCursorIcon
							className={cn(
								"h-[18px] w-[18px] transition-all duration-300",
								enabled
									? "scale-110 text-violet-600 dark:text-violet-400"
									: "text-foreground opacity-70 group-hover:opacity-100",
							)}
						/>
						<Switch
							checked={enabled}
							onCheckedChange={onToggle}
							className={cn(
								"scale-[0.8] transition-all duration-300",
								"data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-foreground/20",
								enabled && "shadow-sm shadow-violet-500/20",
							)}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>{t("editor.ai_autocomplete_tooltip")}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
