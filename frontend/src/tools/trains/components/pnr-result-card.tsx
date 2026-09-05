import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PnrData } from "../types/trains";
import { CoachPositionVisualizer } from "./coach-position-visualizer";
import { PnrPredictionGauge } from "./pnr-prediction-gauge";
import { PnrTicketCard } from "./pnr-ticket-card";
import { PnrBenefitsSection } from "./pnr-benefits-section";
import { PnrFooterMetaSection } from "./pnr-footer-meta-section";

interface PnrResultCardProps {
	data: PnrData;
	onViewRoute: () => void;
	predictionLoading?: boolean;
}

export const PnrResultCard: React.FC<PnrResultCardProps> = ({
	data,
	onViewRoute,
	predictionLoading = false,
}) => {
	const isAllConfirmed = React.useMemo(() => {
		if (!data.passengers || data.passengers.length === 0) return false;
		return data.passengers.every((p) => {
			const s = (p.status || "").toLowerCase();
			return (
				s.includes("cnf") ||
				s.includes("confirm") ||
				Boolean(p.coach && p.berth)
			);
		});
	}, [data.passengers]);

	const hasBenefits = Boolean(data.benefits && data.benefits.length > 0);
	const hasFooterMeta = Boolean(
		data.expectedPlatformNo || data.ticketFare || data.ratings,
	);

	return (
		<Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden animate-in fade-in-50 duration-300">
			<CardContent className="p-6 space-y-6">
				{/* Authentic Boarding Pass / Ticket Card with Download Option */}
				<PnrTicketCard data={data} onViewRoute={onViewRoute} />

				{/* AI Confirmation Intelligence & Risk Gauge */}
				{(data.railtcPrediction ||
					isAllConfirmed ||
					predictionLoading) && (
					<>
						<Separator />
						<PnrPredictionGauge
							prediction={data.railtcPrediction}
							isAllConfirmed={isAllConfirmed}
							loading={predictionLoading}
						/>
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
							userCoach={data.passengers?.[0]?.coach}
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
