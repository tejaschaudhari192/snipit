import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import type { PnrIntelligenceBenefit } from "../types/trains";

interface PnrBenefitsSectionProps {
	benefits?: PnrIntelligenceBenefit[];
}

export const PnrBenefitsSection: React.FC<PnrBenefitsSectionProps> = ({
	benefits,
}) => {
	const { t } = useTranslation();

	if (!benefits || benefits.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2.5">
			<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
				<Sparkles className="w-3.5 h-3.5 text-primary" />
				<span>{t("tools.pnr_checker.confirmation_intelligence")}</span>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
				{benefits.map((b, idx) => (
					<div
						key={`benefit-${idx}`}
						className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between"
					>
						<span className="text-[11px] text-muted-foreground font-medium">
							{b.text}
						</span>
						<span
							className="text-sm font-black mt-1 font-mono"
							style={{
								color: b.color || undefined,
							}}
						>
							{b.unlockedText || "--"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
