import React from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import type { StationSuggestion } from "../types/trains";

interface StationSearchSuggestionsProps {
	suggestions: StationSuggestion[];
	loading: boolean;
	onSelect: (station: StationSuggestion) => void;
}

export const StationSearchSuggestions: React.FC<
	StationSearchSuggestionsProps
> = ({ suggestions, loading, onSelect }) => {
	const { t } = useTranslation();

	if (!loading && suggestions.length === 0) {
		return null;
	}

	return (
		<div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-border/40 animate-in fade-in-50 slide-in-from-top-2 duration-150">
			{loading && (
				<div className="p-3 text-xs text-muted-foreground animate-pulse text-center flex items-center justify-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
					<span>{t("tools.pnr_checker.searching_stations")}</span>
				</div>
			)}
			{suggestions.map((station) => (
				<button
					key={station.code}
					type="button"
					onClick={() => onSelect(station)}
					className="w-full text-left p-3 hover:bg-primary/10 transition-colors flex items-center justify-between group cursor-pointer"
				>
					<div className="min-w-0 pr-2">
						<div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
							{station.name}
						</div>
						{station.state && (
							<div className="text-[11px] text-muted-foreground truncate">
								{station.state}
							</div>
						)}
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-xs font-bold border border-border/50 group-hover:border-primary/40 transition-colors">
							{station.code}
						</span>
						<MapPin className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
					</div>
				</button>
			))}
		</div>
	);
};
