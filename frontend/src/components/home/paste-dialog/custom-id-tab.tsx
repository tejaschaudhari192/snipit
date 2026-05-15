import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { IdAvailabilityIndicator } from "./availability-indicator";
import { useIdAvailability } from "@/hooks/paste-id/use-id-availability";
import { useAiIdSuggester } from "@/hooks/paste-id/use-ai-id-suggester";
import { usePaste } from "@/context/PasteContext";

interface Props {
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
}

export const CustomIdTab = ({ customId, setCustomId, onSubmit }: Props) => {
	const { t } = useTranslation();
	const { textValue, files } = usePaste();

	const { isAvailable, isChecking } = useIdAvailability(customId, "dynamic");
	const { isSuggesting, handleSuggestId } = useAiIdSuggester(
		textValue,
		setCustomId,
		files,
	);

	return (
		<div className="flex flex-col space-y-2 min-h-[80px]">
			<div className="flex gap-2">
				<Input
					placeholder={t("home.dynamic_id_dialog.placeholder")}
					value={customId}
					className="h-10 text-sm focus-visible:ring-primary/40 transition-shadow bg-card/40 hover:bg-card/60"
					onChange={(e) => setCustomId(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && onSubmit()}
				/>
				<Button
					variant="outline"
					size="icon"
					className="h-10 w-10 shrink-0 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all"
					onClick={handleSuggestId}
					disabled={isSuggesting}
					title={t("home.suggest_id_ai")}
				>
					{isSuggesting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Sparkles className="h-4 w-4" />
					)}
				</Button>
			</div>

			<IdAvailabilityIndicator
				isChecking={isChecking}
				isAvailable={isAvailable}
				customId={customId}
			/>
		</div>
	);
};

export default CustomIdTab;
