import { Wand2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
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
						className={cn(
							"flex items-center gap-1 px-1.5 h-8 rounded-md border transition-all duration-300 shadow-sm select-none cursor-pointer",
							enabled
								? "bg-violet-500/5 border-violet-500/30 text-violet-600 dark:text-violet-400"
								: "bg-background/80 backdrop-blur-sm border-border/50 text-muted-foreground hover:border-border",
							className,
						)}
					>
						<Wand2
							className={cn(
								"h-5 w-5 transition-transform duration-300",
								enabled
									? "fill-current"
									: "text-foreground/60 hover:text-foreground/80",
							)}
						/>
						<Switch
							checked={enabled}
							onCheckedChange={onToggle}
							className="scale-[0.7] data-[state=checked]:bg-violet-500"
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
