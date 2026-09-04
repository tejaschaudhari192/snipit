import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
	Train,
	Clock,
	FileCheck2,
	TrendingUp,
	Sparkles,
	Star,
	IndianRupee,
} from "lucide-react";
import type { PnrData } from "../types/trains";
import { CoachPositionVisualizer } from "./coach-position-visualizer";

interface PnrResultCardProps {
	data: PnrData;
	onViewRoute: () => void;
}

export const PnrResultCard: React.FC<PnrResultCardProps> = ({
	data,
	onViewRoute,
}) => {
	const { t } = useTranslation();

	const getStatusVariant = (
		status: string,
	): "default" | "secondary" | "destructive" | "outline" => {
		const s = status.toLowerCase();
		if (s.includes("confirm") || s.includes("cnf")) return "default";
		if (s.includes("rac")) return "secondary";
		if (s.includes("wl") || s.includes("wait")) return "destructive";
		return "outline";
	};

	const formatJourneyDate = (dateStr: string) => {
		if (!dateStr) return "";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(undefined, {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden animate-in fade-in-50 duration-300">
			<CardContent className="p-6 space-y-6">
				{/* Header: Train name, Class & PNR badges */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Train className="h-5 w-5 text-primary shrink-0" />
							<h2 className="text-lg font-bold text-foreground">
								{data.train}
							</h2>
						</div>
						<div className="flex flex-wrap items-center gap-2 ml-7">
							<Badge variant="secondary" className="text-xs">
								{data.class}
							</Badge>
							<Badge
								variant="outline"
								className="text-xs font-mono"
							>
								PNR: {data.pnr}
							</Badge>
							<Badge variant="outline" className="text-xs">
								{formatJourneyDate(data.date)}
							</Badge>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start sm:self-center ml-7 sm:ml-0">
						{data.chartStatus && (
							<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg">
								<FileCheck2 className="h-4 w-4 text-primary" />
								<span>{data.chartStatus}</span>
							</div>
						)}
						<Button
							variant="outline"
							size="sm"
							className="text-xs h-8 gap-1.5"
							onClick={onViewRoute}
						>
							<Train className="h-3.5 w-3.5 text-primary" />
							<span>{t("tools.pnr_checker.train_route")}</span>
						</Button>
					</div>
				</div>

				<Separator />

				{/* Source & Destination Route */}
				<div className="flex justify-between items-center gap-4">
					<div className="flex-1 text-left">
						<div className="text-xl font-black tracking-tight text-foreground">
							{data.from || "Source"}
						</div>
						<div className="flex flex-col text-xs text-muted-foreground mt-0.5 space-y-0.5">
							{data.departureDate && (
								<span className="font-semibold text-foreground/90">
									{formatJourneyDate(data.departureDate)}
								</span>
							)}
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3 text-primary shrink-0" />
								<span>{data.departure || "--:--"}</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-center justify-center px-2 shrink-0">
						<span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/40">
							{data.duration || "Route"}
						</span>
						<div className="w-16 h-px bg-border/80 my-1 relative">
							<div className="absolute right-0 -top-0.75 border-y-4 border-y-transparent border-l-[6px] border-l-border/80" />
						</div>
					</div>

					<div className="flex-1 text-right">
						<div className="text-xl font-black tracking-tight text-foreground">
							{data.to || "Destination"}
						</div>
						<div className="flex flex-col items-end text-xs text-muted-foreground mt-0.5 space-y-0.5">
							{data.arrivalDate && (
								<span className="font-semibold text-foreground/90">
									{formatJourneyDate(data.arrivalDate)}
								</span>
							)}
							<div className="flex items-center justify-end gap-1">
								<Clock className="h-3 w-3 text-primary shrink-0" />
								<span>{data.arrival || "--:--"}</span>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				{/* Passenger Status List */}
				<div className="space-y-3">
					<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{t("tools.pnr_checker.passengers_header")}
					</h3>

					{data.passengers && data.passengers.length > 0 ? (
						<div className="divide-y divide-border/40">
							{data.passengers.map((passenger) => (
								<div
									key={`pax-${passenger.number}`}
									className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2"
								>
									<div className="flex flex-col">
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold text-foreground">
												{passenger.name ||
													t(
														"tools.pnr_checker.passenger",
														{
															number: passenger.number,
														},
													)}
											</span>
											{passenger.coach && (
												<Badge
													variant="outline"
													className="text-[11px] font-mono py-0"
												>
													Coach {passenger.coach}
													{passenger.berth
														? ` / Berth ${passenger.berth}`
														: ""}
												</Badge>
											)}
										</div>
										{passenger.bookingStatus && (
											<span className="text-xs text-muted-foreground mt-0.5">
												Booking:{" "}
												{passenger.bookingStatus}
											</span>
										)}
									</div>

									<div className="flex items-center gap-2 shrink-0">
										{passenger.prediction && (
											<Badge
												variant="outline"
												className="text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1"
											>
												<TrendingUp className="w-3 h-3" />
												<span>
													{passenger.prediction}
												</span>
											</Badge>
										)}
										<Badge
											variant={getStatusVariant(
												passenger.status,
											)}
											className="text-xs font-semibold px-2.5 py-1"
										>
											{passenger.status}
										</Badge>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground italic">
							{t("tools.pnr_checker.no_status")}
						</p>
					)}
				</div>

				{/* Confirmation Intelligence */}
				{data.benefits && data.benefits.length > 0 && (
					<>
						<Separator />
						<div className="space-y-2.5">
							<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
								<Sparkles className="w-3.5 h-3.5 text-primary" />
								<span>
									{t(
										"tools.pnr_checker.confirmation_intelligence",
									)}
								</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
								{data.benefits.map((b, idx) => (
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
				{(data.expectedPlatformNo ||
					data.ticketFare ||
					data.ratings) && (
					<>
						<Separator />
						<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
							<div className="flex flex-wrap items-center gap-4">
								{data.expectedPlatformNo && (
									<div className="flex items-center gap-1.5">
										<span className="font-semibold text-foreground">
											{t(
												"tools.pnr_checker.expected_platform",
											)}
											:
										</span>
										<Badge
											variant="secondary"
											className="font-mono text-xs"
										>
											#{data.expectedPlatformNo}
										</Badge>
									</div>
								)}
								{data.ticketFare && (
									<div className="flex items-center gap-1">
										<span className="font-semibold text-foreground">
											{t(
												"tools.pnr_checker.total_amount",
											)}
											:
										</span>
										<span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center">
											<IndianRupee className="w-3 h-3 inline" />
											{data.ticketFare}
										</span>
									</div>
								)}
							</div>

							{data.ratings && data.ratings.overall && (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1 text-amber-500 font-bold">
										<Star className="w-3.5 h-3.5 fill-amber-500" />
										<span>{data.ratings.overall} / 5</span>
									</div>
									{data.ratings.cleanliness && (
										<span className="text-[11px]">
											(
											{t(
												"tools.pnr_checker.cleanliness_rating",
											)}
											: {data.ratings.cleanliness})
										</span>
									)}
								</div>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
