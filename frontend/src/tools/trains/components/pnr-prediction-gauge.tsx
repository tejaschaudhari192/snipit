import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
	Sparkles,
	Clock,
	TrendingUp,
	TrendingDown,
	Info,
	ShieldCheck,
	AlertTriangle,
	Calendar,
	Layers,
	ChevronDown,
	BarChart3,
} from "lucide-react";
import type { RailTcPrediction } from "../types/trains";

interface PnrPredictionGaugeProps {
	prediction?: RailTcPrediction;
	isAllConfirmed?: boolean;
}

export const PnrPredictionGauge: React.FC<PnrPredictionGaugeProps> = ({
	prediction,
	isAllConfirmed = false,
}) => {
	const { t, i18n } = useTranslation();
	const [showBreakdown, setShowBreakdown] = React.useState(false);

	if (isAllConfirmed) {
		return (
			<div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-5 sm:p-6 shadow-sm">
				<div className="flex items-start sm:items-center gap-4">
					<div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-600 dark:text-emerald-400 shrink-0">
						<ShieldCheck className="h-7 w-7" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-bold text-foreground">
								{t(
									"tools.pnr_checker.prediction.confirmed_ticket",
								)}
							</h3>
							<Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] px-2 py-0.5 font-semibold">
								100% CNF
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
							{t("tools.pnr_checker.prediction.confirmed_desc")}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!prediction) {
		return null;
	}

	const hasProb = typeof prediction.probability === "number";
	const prob = hasProb
		? Math.min(100, Math.max(0, Math.round(prediction.probability!)))
		: null;

	const getProbabilityTheme = (percentage: number | null) => {
		if (percentage === null) {
			return {
				stroke: "#94a3b8",
				bgGradient: "from-muted/40 via-muted/20 to-muted/40",
				borderColor: "border-border/60",
				textColor: "text-muted-foreground",
				badgeBg: "bg-muted text-foreground",
				label:
					prediction.riskLevel ||
					t("tools.pnr_checker.prediction.badge"),
				icon: Sparkles,
			};
		}
		if (percentage >= 80) {
			return {
				stroke: "#10b981",
				bgGradient:
					"from-emerald-500/10 via-emerald-500/5 to-teal-500/10",
				borderColor: "border-emerald-500/30",
				textColor: "text-emerald-600 dark:text-emerald-400",
				badgeBg: "bg-emerald-600 text-white",
				label: t("tools.pnr_checker.prediction.high_chance"),
				icon: ShieldCheck,
			};
		}
		if (percentage >= 60) {
			return {
				stroke: "#06b6d4",
				bgGradient: "from-cyan-500/10 via-sky-500/5 to-blue-500/10",
				borderColor: "border-cyan-500/30",
				textColor: "text-cyan-600 dark:text-cyan-400",
				badgeBg: "bg-cyan-600 text-white",
				label: t("tools.pnr_checker.prediction.leans_confirm"),
				icon: TrendingUp,
			};
		}
		if (percentage >= 40) {
			return {
				stroke: "#f59e0b",
				bgGradient:
					"from-amber-500/10 via-amber-500/5 to-orange-500/10",
				borderColor: "border-amber-500/30",
				textColor: "text-amber-600 dark:text-amber-400",
				badgeBg: "bg-amber-600 text-white",
				label: t("tools.pnr_checker.prediction.medium_risk"),
				icon: AlertTriangle,
			};
		}
		return {
			stroke: "#ef4444",
			bgGradient: "from-rose-500/10 via-red-500/5 to-rose-500/10",
			borderColor: "border-rose-500/30",
			textColor: "text-rose-600 dark:text-rose-400",
			badgeBg: "bg-rose-600 text-white",
			label: t("tools.pnr_checker.prediction.high_risk"),
			icon: TrendingDown,
		};
	};

	const theme = getProbabilityTheme(prob);
	const ThemeIcon = theme.icon;

	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset =
		prob !== null
			? circumference - (prob / 100) * circumference
			: circumference;

	const factors = prediction.factors;
	const breakdown = prediction.breakdown;
	const routeStats = prediction.routeStats;
	const dailyTrend = routeStats?.dailyTrend || [];

	const maxDailyCnf = Math.max(
		1,
		...dailyTrend.map((d) => d.confirmedTotal || d.wlToCnf || 0),
	);

	return (
		<div className="space-y-4">
			{/* Main Prediction Analysis Card */}
			<div
				className={`relative overflow-hidden rounded-2xl border ${theme.borderColor} bg-linear-to-r ${theme.bgGradient} p-5 sm:p-6 shadow-sm transition-all duration-300`}
			>
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
					{/* Left side: Gauge & status summary */}
					<div className="flex items-center gap-5">
						{prob !== null && (
							<div className="relative flex items-center justify-center shrink-0 w-24 h-24">
								<svg
									className="w-full h-full -rotate-90 transform"
									viewBox="0 0 100 100"
								>
									<circle
										cx="50"
										cy="50"
										r={radius}
										className="stroke-muted/40"
										strokeWidth="9"
										fill="transparent"
									/>
									<circle
										cx="50"
										cy="50"
										r={radius}
										stroke={theme.stroke}
										strokeWidth="9"
										strokeDasharray={circumference}
										strokeDashoffset={strokeDashoffset}
										strokeLinecap="round"
										fill="transparent"
										className="transition-all duration-1000 ease-out"
									/>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
									<span
										className={`text-2xl font-black tracking-tight ${theme.textColor}`}
									>
										{prob}%
									</span>
									<span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider -mt-0.5">
										CNF
									</span>
								</div>
							</div>
						)}

						<div className="space-y-1.5">
							<div className="flex flex-wrap items-center gap-2">
								{(prediction.bucketDisplay || theme.label) && (
									<Badge
										className={`${theme.badgeBg} text-[11px] font-bold px-2.5 py-0.5 shadow-xs flex items-center gap-1`}
									>
										<ThemeIcon className="h-3 w-3" />
										<span>
											{prediction.predictionBucket?.toLowerCase() ===
											"safe"
												? t(
														"tools.pnr_checker.prediction.bucket_safe",
													)
												: prediction.predictionBucket?.toLowerCase() ===
													  "medium"
													? prediction.mediumHint
														? t(
																"tools.pnr_checker.prediction.bucket_medium_leans_confirm",
															)
														: t(
																"tools.pnr_checker.prediction.bucket_medium",
															)
													: prediction.bucketDisplay ||
														theme.label}
										</span>
									</Badge>
								)}
								<Badge
									variant="outline"
									className="text-[10px] font-medium border-primary/20 text-muted-foreground gap-1"
								>
									<Sparkles className="h-3 w-3 text-primary" />
									<span>
										{t(
											"tools.pnr_checker.prediction.badge",
										)}
									</span>
								</Badge>
								{prediction.predictionSource && (
									<Badge
										variant="outline"
										className="text-[10px] font-normal text-muted-foreground"
									>
										{prediction.predictionSource}
									</Badge>
								)}
							</div>

							<div>
								<span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 block">
									{t(
										"tools.pnr_checker.prediction.prediction_analysis_header",
									)}
								</span>
								<h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
									{t("tools.pnr_checker.prediction.title")}
								</h3>
								<p className="text-[11px] text-muted-foreground font-medium mt-0.5">
									{t(
										"tools.pnr_checker.prediction.personal_prediction_basis",
									)}
								</p>
							</div>

							<div className="rounded-lg bg-background/60 border border-border/50 px-2.5 py-1.5 text-xs text-foreground/90">
								<Trans
									i18nKey="tools.pnr_checker.prediction.personal_prediction_explanation"
									values={{ prob }}
									components={{
										bold: (
											<strong className="text-foreground font-black" />
										),
									}}
								/>
							</div>

							{prediction.message && (
								<p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed max-w-lg">
									{prediction.message}
								</p>
							)}

							{factors?.routeMessage && (
								<div className="pt-0.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
									<span>{factors.routeMessage}</span>
								</div>
							)}
						</div>
					</div>

					{/* Right side: Key factors pills */}
					{factors && (
						<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 w-full lg:w-auto shrink-0">
							{factors.daysLeft !== undefined && (
								<div className="flex items-center gap-2 rounded-xl bg-background/60 backdrop-blur-xs border border-border/60 px-3 py-2">
									<Calendar className="h-4 w-4 text-primary shrink-0" />
									<div>
										<span className="text-[10px] text-muted-foreground block leading-tight font-medium">
											{t(
												"tools.pnr_checker.prediction.factor_days",
											)}
										</span>
										<span className="text-xs font-bold text-foreground">
											{t(
												"tools.pnr_checker.prediction.days_left",
												{ count: factors.daysLeft },
											)}
										</span>
									</div>
								</div>
							)}

							{factors.wlNumber !== undefined && (
								<div className="flex items-center gap-2 rounded-xl bg-background/60 backdrop-blur-xs border border-border/60 px-3 py-2">
									<Clock className="h-4 w-4 text-primary shrink-0" />
									<div>
										<span className="text-[10px] text-muted-foreground block leading-tight font-medium">
											{t(
												"tools.pnr_checker.prediction.factor_queue",
											)}
										</span>
										<span className="text-xs font-bold text-foreground">
											WL {factors.wlNumber}
										</span>
									</div>
								</div>
							)}

							{factors.quota && (
								<div className="flex items-center gap-2 rounded-xl bg-background/60 backdrop-blur-xs border border-border/60 px-3 py-2">
									<Layers className="h-4 w-4 text-primary shrink-0" />
									<div>
										<span className="text-[10px] text-muted-foreground block leading-tight font-medium">
											{t(
												"tools.pnr_checker.prediction.factor_quota",
											)}
										</span>
										<span className="text-xs font-bold text-foreground">
											{t(
												"tools.pnr_checker.prediction.quota_label",
												{ quota: factors.quota },
											)}
										</span>
									</div>
								</div>
							)}

							{factors.class && (
								<div className="flex items-center gap-2 rounded-xl bg-background/60 backdrop-blur-xs border border-border/60 px-3 py-2">
									<TrendingUp className="h-4 w-4 text-primary shrink-0" />
									<div>
										<span className="text-[10px] text-muted-foreground block leading-tight font-medium">
											{t(
												"tools.pnr_checker.prediction.factor_class",
											)}
										</span>
										<span className="text-xs font-bold text-foreground">
											{t(
												"tools.pnr_checker.prediction.class_label",
												{ classCode: factors.class },
											)}
										</span>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Score Breakdown Toggle */}
				{breakdown && (
					<div className="mt-4 pt-3 border-t border-border/40">
						<button
							type="button"
							onClick={() => setShowBreakdown((prev) => !prev)}
							className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
						>
							<Info className="h-3.5 w-3.5 text-primary" />
							<span>
								{t(
									"tools.pnr_checker.prediction.breakdown_title",
								)}
							</span>
							<ChevronDown
								className={`h-3 w-3 transition-transform duration-200 ${
									showBreakdown ? "rotate-180" : ""
								}`}
							/>
						</button>

						{showBreakdown && (
							<div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-background/50 rounded-xl p-3 border border-border/50 animate-in fade-in-50 duration-200">
								{breakdown.baseScore !== undefined && (
									<div>
										<span className="text-muted-foreground text-[10px] block">
											{t(
												"tools.pnr_checker.prediction.base_score",
											)}
										</span>
										<span className="font-semibold text-foreground">
											+{breakdown.baseScore}
										</span>
									</div>
								)}
								{breakdown.wlPenalty !== undefined && (
									<div>
										<span className="text-muted-foreground text-[10px] block">
											{t(
												"tools.pnr_checker.prediction.wl_penalty",
											)}
										</span>
										<span
											className={`font-semibold ${
												breakdown.wlPenalty < 0
													? "text-rose-500"
													: "text-foreground"
											}`}
										>
											{breakdown.wlPenalty}
										</span>
									</div>
								)}
								{breakdown.quotaPenalty !== undefined && (
									<div>
										<span className="text-muted-foreground text-[10px] block">
											{t(
												"tools.pnr_checker.prediction.quota_penalty",
											)}
										</span>
										<span
											className={`font-semibold ${
												breakdown.quotaPenalty < 0
													? "text-rose-500"
													: "text-foreground"
											}`}
										>
											{breakdown.quotaPenalty}
										</span>
									</div>
								)}
								{breakdown.daysAdjustment !== undefined && (
									<div>
										<span className="text-muted-foreground text-[10px] block">
											{t(
												"tools.pnr_checker.prediction.days_adjustment",
											)}
										</span>
										<span
											className={`font-semibold ${
												breakdown.daysAdjustment >= 0
													? "text-emerald-500"
													: "text-rose-500"
											}`}
										>
											{breakdown.daysAdjustment > 0
												? `+${breakdown.daysAdjustment}`
												: breakdown.daysAdjustment}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Dynamic Previous Trend Analysis (Last 5 Days) & Confirmation Timing */}
			{routeStats && (
				<div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
						<div>
							<h4 className="text-sm font-bold text-foreground flex items-center gap-2">
								<BarChart3 className="h-4 w-4 text-primary" />
								<span>
									{t(
										"tools.pnr_checker.prediction.previous_trend_title",
										{ days: routeStats.daysSampled || 5 },
									)}
								</span>
							</h4>
							{routeStats.dataScopeLabel && (
								<p className="text-[11px] text-muted-foreground mt-0.5">
									{t(
										"tools.pnr_checker.prediction.source_prefix",
										{ label: routeStats.dataScopeLabel },
									)}
								</p>
							)}
						</div>
						{routeStats.recentConfirmedCount !== undefined && (
							<Badge
								variant="secondary"
								className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20 self-start sm:self-auto"
							>
								{t(
									"tools.pnr_checker.prediction.tickets_confirmed_period",
									{ count: routeStats.recentConfirmedCount },
								)}
							</Badge>
						)}
					</div>

					<div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
						<Trans
							i18nKey="tools.pnr_checker.prediction.route_trend_disclaimer"
							components={{
								bold: (
									<span className="font-semibold text-foreground" />
								),
								highlight: (
									<span className="font-semibold text-foreground" />
								),
							}}
						/>
					</div>

					{/* Trend Narrative matching RailTC layout */}
					<div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
						<div>
							<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
								{t(
									"tools.pnr_checker.prediction.route_trend_section_header",
								)}
							</span>
							<p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
								<Trans
									i18nKey="tools.pnr_checker.prediction.route_trend_detailed_narrative"
									values={{
										days: routeStats.daysSampled || 5,
										cnfRate:
											routeStats.wlToCnfRate !== undefined
												? routeStats.wlToCnfRate
												: 42,
										confirmedCount:
											routeStats.recentConfirmedCount !==
											undefined
												? routeStats.recentConfirmedCount
												: 88,
										prob,
									}}
									components={{
										bold: (
											<strong className="text-foreground font-bold" />
										),
									}}
								/>
							</p>
						</div>

						{routeStats.wlToRacRate !== undefined && (
							<div className="pt-2 border-t border-border/40 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-1">
								<span>
									<Trans
										i18nKey="tools.pnr_checker.prediction.route_trend_wl_rac_narrative"
										values={{
											racRate: routeStats.wlToRacRate,
										}}
										components={{
											bold: (
												<strong className="text-foreground font-bold" />
											),
										}}
									/>
								</span>
								<span className="text-[11px] italic text-muted-foreground/70">
									{t(
										"tools.pnr_checker.prediction.separate_from_personal",
									)}
								</span>
							</div>
						)}
					</div>

					{/* Practical confirmation range */}
					{(routeStats.practicalRangeMax ||
						routeStats.maxObservedWl) && (
						<p className="text-xs text-muted-foreground">
							{t(
								"tools.pnr_checker.prediction.practical_range_desc",
								{
									limit: routeStats.practicalRangeMax || 25,
									max: routeStats.maxObservedWl || 105,
								},
							)}
						</p>
					)}

					{/* Estimated Confirmation Timing Pill */}
					{routeStats.typicalClearWindow && (
						<div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-start gap-2.5">
							<Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
							<div>
								<span className="text-xs font-bold text-foreground block">
									{t(
										"tools.pnr_checker.prediction.expected_window_title",
									)}
								</span>
								<p className="text-xs text-muted-foreground mt-0.5">
									{routeStats.typicalClearWindow}
								</p>
							</div>
						</div>
					)}

					{/* Daily Confirmed Tickets Chart & Table */}
					{dailyTrend.length > 0 && (
						<div className="space-y-3 pt-2">
							<span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
								{t(
									"tools.pnr_checker.prediction.daily_confirmed_tickets",
								)}
							</span>

							{/* Bar chart visualization */}
							<div className="grid grid-cols-5 gap-2 pt-4 pb-2 items-end h-28 border-b border-border/50">
								{dailyTrend.map((day) => {
									const cnfCount =
										day.confirmedTotal || day.wlToCnf || 0;
									const heightPct = Math.max(
										8,
										Math.round(
											(cnfCount / maxDailyCnf) * 100,
										),
									);
									const dayLabel = new Date(
										day.date,
									).toLocaleDateString(
										i18n.language || "en-US",
										{
											day: "2-digit",
											month: "short",
										},
									);
									return (
										<div
											key={day.date}
											className="flex flex-col items-center h-full justify-end group"
										>
											<span className="text-[10px] font-bold text-foreground mb-1 group-hover:scale-110 transition-transform">
												{cnfCount}
											</span>
											<div className="w-full max-w-12.5 bg-muted/40 rounded-t-md h-full flex items-end overflow-hidden">
												<div
													className="w-full bg-emerald-500 transition-all duration-500 rounded-t-md"
													style={{
														height: `${cnfCount > 0 ? heightPct : 6}%`,
														opacity:
															cnfCount > 0
																? 0.9
																: 0.3,
													}}
												/>
											</div>
											<span className="text-[10px] text-muted-foreground mt-1.5 whitespace-nowrap">
												{dayLabel}
											</span>
										</div>
									);
								})}
							</div>

							{/* Detail breakdown table */}
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead>
										<tr className="border-b border-border/60 text-muted-foreground">
											<th className="py-2 font-medium">
												{t(
													"tools.pnr_checker.prediction.table_col_date",
												)}
											</th>
											<th className="py-2 font-medium text-right">
												{t(
													"tools.pnr_checker.prediction.table_col_wl_checked",
												)}
											</th>
											<th className="py-2 font-medium text-right">
												{t(
													"tools.pnr_checker.prediction.table_col_wl_to_rac",
												)}
											</th>
											<th className="py-2 font-medium text-right">
												{t(
													"tools.pnr_checker.prediction.table_col_wl_to_cnf",
												)}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/40 font-mono">
										{dailyTrend.map((day) => {
											const dayLabel = new Date(
												day.date,
											).toLocaleDateString(
												i18n.language || "en-US",
												{
													day: "2-digit",
													month: "short",
												},
											);
											return (
												<tr
													key={day.date}
													className="hover:bg-muted/20"
												>
													<td className="py-1.5 font-sans text-foreground">
														{dayLabel}
													</td>
													<td className="py-1.5 text-right text-muted-foreground">
														{day.wlChecked}
													</td>
													<td className="py-1.5 text-right text-muted-foreground">
														{day.wlToRac}
													</td>
													<td className="py-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
														{day.wlToCnf}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
