import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import type { PnrData } from "../types/trains";
import {
	checkIsAllConfirmed,
	getEffectiveCoachAndBerth,
} from "../utils/pnr-helpers";
import { CoachPositionVisualizer } from "./coach-position-visualizer";
import { PnrPredictionGauge } from "./pnr-prediction-gauge";
import { PnrTicketCard } from "./pnr-ticket-card";
import { PnrTrackerCard } from "./pnr-tracker-card";
import { PnrBenefitsSection } from "./pnr-benefits-section";
import { PnrFooterMetaSection } from "./pnr-footer-meta-section";

interface PnrResultCardProps {
	data: PnrData;
	onViewRoute: () => void;
	onCheckLiveStatus?: () => void;
	predictionLoading?: boolean;
	onPredict?: () => void;
	hasPredicted?: boolean;
}

export const PnrResultCard: React.FC<PnrResultCardProps> = ({
	data,
	onViewRoute,
	onCheckLiveStatus,
	predictionLoading = false,
	onPredict,
	hasPredicted = false,
}) => {
	const { t } = useTranslation();
	const isAllConfirmed = React.useMemo(() => {
		return checkIsAllConfirmed(data.passengers);
	}, [data.passengers]);

	const hasBenefits = Boolean(data.benefits && data.benefits.length > 0);
	const hasFooterMeta = Boolean(
		data.expectedPlatformNo || data.ticketFare || data.ratings,
	);

	return (
		<Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden animate-in fade-in-50 duration-300">
			<CardContent className="p-6 space-y-6">
				{/* 1. Authentic Boarding Pass / Ticket Card (Hero Result at the top) */}
				<PnrTicketCard
					data={data}
					onViewRoute={onViewRoute}
					onCheckLiveStatus={onCheckLiveStatus}
				/>

				{/* 2. PNR Tracking Card (Directly BELOW the ticket, ABOVE prediction) */}
				<Separator />
				<PnrTrackerCard
					pnr={data.pnr}
					isAllConfirmed={isAllConfirmed}
				/>

				{/* 3. AI Confirmation Intelligence (Directly BELOW tracking card) */}
				{isAllConfirmed ? (
					<>
						<Separator />
						<PnrPredictionGauge
							prediction={data.railtcPrediction}
							isAllConfirmed={true}
							loading={false}
						/>
					</>
				) : hasPredicted ||
				  data.railtcPrediction ||
				  predictionLoading ? (
					<>
						<Separator />
						<PnrPredictionGauge
							prediction={data.railtcPrediction}
							isAllConfirmed={false}
							loading={predictionLoading}
						/>
					</>
				) : (
					<>
						<Separator />
						{/* On-Demand Prediction Action Prompt */}
						<div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-r from-primary/10 via-primary/5 to-secondary/10 p-5 sm:p-6 shadow-sm transition-all duration-300">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="space-y-1.5 max-w-xl">
									<div className="flex items-center gap-2">
										<div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
											<Sparkles className="h-4 w-4" />
										</div>
										<h4 className="text-sm sm:text-base font-bold text-foreground">
											{t(
												"tools.pnr_checker.prediction.predict_prompt_title",
												"AI Confirmation Probability",
											)}
										</h4>
										<Badge
											variant="outline"
											className="font-mono text-[10px] text-primary border-primary/30"
										>
											{t(
												"tools.pnr_checker.prediction.badge",
												"RailTC Engine",
											)}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground leading-relaxed">
										{t(
											"tools.pnr_checker.prediction.predict_prompt_desc",
											"Analyze waitlist clearance chances and historical chart trends with the RailTC ML model.",
										)}
									</p>
								</div>

								<Button
									type="button"
									onClick={onPredict}
									disabled={predictionLoading}
									className="h-10 px-5 rounded-xl font-semibold shadow-md gap-2 cursor-pointer self-start sm:self-auto shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
								>
									{predictionLoading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>Analyzing...</span>
										</>
									) : (
										<>
											<TrendingUp className="h-4 w-4" />
											<span>
												{t(
													"tools.pnr_checker.prediction.predict_button",
													"Predict Confirmation Chance",
												)}
											</span>
										</>
									)}
								</Button>
							</div>
						</div>
					</>
				)}

				{/* Confirmation Intelligence Benefits */}
				{hasBenefits && (
					<>
						<Separator />
						<PnrBenefitsSection benefits={data.benefits} />
					</>
				)}

				{/* Coach Position Visualizer */}
				{data.coachPosition && (
					<>
						<Separator />
						<CoachPositionVisualizer
							coachPosition={data.coachPosition}
							userCoach={
								data.passengers?.[0]?.coach ||
								getEffectiveCoachAndBerth(data.passengers?.[0])
									?.coach
							}
							trainName={data.train}
							trainNumber={data.trainNumber}
						/>
					</>
				)}

				{/* Platform, Fare & Ratings Footer */}
				{hasFooterMeta && (
					<>
						<Separator />
						<PnrFooterMetaSection
							expectedPlatformNo={data.expectedPlatformNo}
							ticketFare={data.ticketFare}
							ratings={data.ratings}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
};
