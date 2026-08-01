import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GlassBadge } from "@/components/common/core/glass-badge";
import { useTranslation } from "react-i18next";

interface ProfileActivityCardProps {
	totalViews: number;
	favoriteLanguage: string;
	averageViews: string;
}

export const ProfileActivityCard: React.FC<ProfileActivityCardProps> = ({
	totalViews,
	favoriteLanguage,
	averageViews,
}) => {
	const { t } = useTranslation();

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
			<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-xl rounded-4xl overflow-hidden ring-1 ring-white/5">
				<CardContent className="p-8 space-y-6">
					<div className="flex items-center justify-between border-b border-border/50 pb-4">
						<h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
							{t("profile.activity")}
						</h3>
						<GlassBadge
							size="xs"
							className="italic text-primary/60"
							variant="glass"
						>
							account history
						</GlassBadge>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between group/row">
							<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
								{t("profile.total_views")}
							</span>
							<div className="font-black text-lg text-primary tabular-nums">
								{totalViews}
							</div>
						</div>
						<div className="flex items-center justify-between group/row">
							<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
								{t("profile.most_used_language")}
							</span>
							<GlassBadge
								size="xs"
								className="group-hover/row:bg-primary/10 transition-all uppercase tracking-widest"
								variant="outline"
							>
								{favoriteLanguage}
							</GlassBadge>
						</div>
						<div className="flex items-center justify-between group/row">
							<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
								{t("profile.avg_views")}
							</span>
							<div className="font-black text-md text-foreground/80 italic font-mono">
								{averageViews}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
