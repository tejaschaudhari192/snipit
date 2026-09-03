import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { TrainSearchResult } from "../types/trains";

interface TrainSearchSuggestionsProps {
	suggestions: TrainSearchResult[];
	loading: boolean;
	onSelect: (train: TrainSearchResult) => void;
}

export const TrainSearchSuggestions: React.FC<TrainSearchSuggestionsProps> = ({
	suggestions,
	loading,
	onSelect,
}) => {
	const { t } = useTranslation();

	return (
		<div className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-border/30 animate-in fade-in-50 slide-in-from-top-2 duration-200">
			{loading && (
				<div className="p-3 text-xs text-muted-foreground animate-pulse text-center">
					{t("tools.pnr_checker.schedule_fetching")}
				</div>
			)}
			{suggestions.map((train) => (
				<button
					key={train.trainNumber}
					onClick={() => onSelect(train)}
					className="w-full text-left p-3.5 hover:bg-primary/10 transition-colors flex items-center justify-between group"
				>
					<div>
						<div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
							<span>{train.trainName}</span>
							<Badge
								variant="outline"
								className="font-mono text-[11px] py-0"
							>
								#{train.trainNumber}
							</Badge>
						</div>
						<div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
							<span>{train.origin}</span>
							<ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
							<span>{train.destination}</span>
						</div>
					</div>
					<Badge
						variant="secondary"
						className="text-[10px] font-mono shrink-0"
					>
						{train.schedule.length} Stations
					</Badge>
				</button>
			))}
		</div>
	);
};
