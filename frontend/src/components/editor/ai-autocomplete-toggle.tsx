import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";

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
		<div
			className={cn(
				"flex items-center gap-2 px-3 py-1.5 h-9 rounded-md border transition-all duration-300 shadow-sm select-none",
				enabled
					? "bg-violet-500/5 border-violet-500/30 text-violet-600 dark:text-violet-400"
					: "bg-background/80 backdrop-blur-sm border-border/50 text-muted-foreground hover:border-border",
				className,
			)}
			title={t("editor.ai_autocomplete_tooltip")}
		>
			<Sparkles
				className={cn(
					"h-3.5 w-3.5 transition-transform duration-300",
					enabled ? "fill-current" : "opacity-60",
				)}
			/>
			<span className="text-xs font-bold tracking-tight uppercase">
				{t("editor.autocomplete")}
			</span>
			<Switch
				checked={enabled}
				onCheckedChange={onToggle}
				className="scale-[0.7] data-[state=checked]:bg-violet-500"
			/>
		</div>
	);
};
