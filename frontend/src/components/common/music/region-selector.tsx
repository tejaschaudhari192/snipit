import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface RegionSelectorProps {
	currentRegion: string;
	onRegionChange: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
	currentRegion,
	onRegionChange,
}) => {
	const { t } = useTranslation();

	const REGIONS = [
		{ id: "default", name: t("music.regions.default") },
		{ id: "english", name: t("music.regions.english") },
		{ id: "maharashtra", name: t("music.regions.maharashtra") },
		{ id: "tamil_nadu", name: t("music.regions.tamil_nadu") },
		{ id: "karnataka", name: t("music.regions.karnataka") },
		{ id: "kerala", name: t("music.regions.kerala") },
		{ id: "telangana", name: t("music.regions.telangana") },
		{ id: "west_bengal", name: t("music.regions.west_bengal") },
		{ id: "punjab", name: t("music.regions.punjab") },
		{ id: "gujarat", name: t("music.regions.gujarat") },
	];
	return (
		<div className="flex items-center">
			<Select value={currentRegion} onValueChange={onRegionChange}>
				<SelectTrigger className="w-auto h-7 bg-transparent border border-border/50 hover:bg-muted/50 rounded-md px-2.5 transition-colors focus:ring-0 text-[10px] font-semibold gap-1 shrink-0">
					<SelectValue placeholder="Select Region" />
				</SelectTrigger>
				<SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
					{REGIONS.map((r) => (
						<SelectItem
							key={r.id}
							value={r.id}
							className="text-xs focus:bg-primary/20 focus:text-primary"
						>
							{r.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default RegionSelector;
