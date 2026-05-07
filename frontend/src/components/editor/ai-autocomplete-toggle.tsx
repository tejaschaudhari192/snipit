import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface AiAutocompleteToggleProps {
	enabled: boolean;
	onToggle: (val: boolean) => void;
}

export const AiAutocompleteToggle = ({
	enabled,
	onToggle,
}: AiAutocompleteToggleProps) => {
	const { t } = useTranslation();

	return (
		<div
			className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-300 shadow-sm h-9 ${
				enabled
					? "bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400"
					: "bg-background/50 border-border/50"
			}`}
			title={t(
				"editor.ai_autocomplete_tooltip",
				"AI suggests code as you type. Press Tab to accept.",
			)}
		>
			<span className="text-[10px] font-bold tracking-tight flex items-center gap-1.5 select-none uppercase">
				<Sparkles
					className={`h-3 w-3 ${enabled ? "animate-pulse" : ""}`}
				/>
				{t("editor.ai_autocomplete", "AI")}
			</span>
			<Switch
				checked={enabled}
				onCheckedChange={onToggle}
				className="scale-[0.7] data-[state=checked]:bg-violet-500 origin-right"
			/>
		</div>
	);
};
