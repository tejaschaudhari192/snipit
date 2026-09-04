import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

interface CoachPositionVisualizerProps {
	coachPosition: string;
	userCoach?: string;
	trainName?: string;
	trainNumber?: string;
}

interface CoachTypeInfo {
	label: string;
	roofColor: string;
	bodyColor: string;
	borderBody: string;
	isEngine?: boolean;
}

/**
 * Returns color tokens and description matching Indian Railways livery
 */
function getCoachDetails(code: string): CoachTypeInfo {
	const c = code.toUpperCase().trim();

	// Engine
	if (c === "L" || c === "ENG" || c === "LOCO") {
		return {
			label: "Engine",
			roofColor: "bg-red-700",
			bodyColor: "bg-amber-600",
			borderBody: "border-amber-700",
			isEngine: true,
		};
	}

	// General / Second Sitting / Unreserved
	if (
		c.startsWith("UR") ||
		c.startsWith("GEN") ||
		c.startsWith("GS") ||
		c.startsWith("D")
	) {
		return {
			label: c.startsWith("D")
				? "Second Sitting (Chair Car)"
				: "General / Unreserved",
			roofColor: "bg-sky-500",
			bodyColor: "bg-orange-500",
			borderBody: "border-orange-600",
		};
	}

	// AC Chair Car / Executive
	if (c.startsWith("C") || c.startsWith("E")) {
		return {
			label: c.startsWith("E") ? "Executive Chair Car" : "AC Chair Car",
			roofColor: "bg-sky-500",
			bodyColor: "bg-teal-500",
			borderBody: "border-teal-600",
		};
	}

	// Sleeper Class (S1, S2, ...)
	if (c.startsWith("S")) {
		return {
			label: "Sleeper Class",
			roofColor: "bg-blue-600",
			bodyColor: "bg-blue-500",
			borderBody: "border-blue-600",
		};
	}

	// AC 3 Tier / 3 Economy (B1, B2, ..., M1, M2, ...)
	if (c.startsWith("B") || c.startsWith("M")) {
		return {
			label: c.startsWith("M") ? "AC 3 Tier (Economy)" : "AC 3 Tier",
			roofColor: "bg-teal-600",
			bodyColor: "bg-teal-500",
			borderBody: "border-teal-600",
		};
	}

	// AC 2 Tier (A1, A2, ...)
	if (c.startsWith("A")) {
		return {
			label: "AC 2 Tier",
			roofColor: "bg-cyan-600",
			bodyColor: "bg-sky-600",
			borderBody: "border-sky-700",
		};
	}

	// AC 1st Class (H1, HA1, ...)
	if (c.startsWith("H")) {
		return {
			label: "AC First Class",
			roofColor: "bg-indigo-600",
			bodyColor: "bg-indigo-500",
			borderBody: "border-indigo-600",
		};
	}

	// Pantry Car
	if (c.includes("PC") || c.includes("PANTRY")) {
		return {
			label: "Pantry Car",
			roofColor: "bg-amber-600",
			bodyColor: "bg-amber-500",
			borderBody: "border-amber-600",
		};
	}

	// SLR / Brake Van / Guard
	if (c.includes("SLR") || c.includes("EOG") || c.includes("LPR")) {
		return {
			label: "Seating Cum Luggage Rake (SLR)",
			roofColor: "bg-orange-600",
			bodyColor: "bg-orange-500",
			borderBody: "border-orange-600",
		};
	}

	return {
		label: "Standard Coach",
		roofColor: "bg-sky-500",
		bodyColor: "bg-orange-500",
		borderBody: "border-orange-600",
	};
}

export const CoachPositionVisualizer: React.FC<
	CoachPositionVisualizerProps
> = ({ coachPosition, userCoach, trainName, trainNumber }) => {
	const { t } = useTranslation();
	const rawCoaches = coachPosition
		.split(" ")
		.map((c) => c.trim())
		.filter(Boolean);
	const [selectedCoachIndex, setSelectedCoachIndex] = useState<number>(() => {
		if (userCoach) {
			const idx = rawCoaches.findIndex(
				(c) => c.toUpperCase() === userCoach.toUpperCase(),
			);
			if (idx !== -1) return idx;
		}
		return 0;
	});

	if (rawCoaches.length === 0) return null;

	const activeCoachCode = rawCoaches[selectedCoachIndex] || rawCoaches[0];
	const activeCoachDetails = getCoachDetails(activeCoachCode);
	const isUserAssigned =
		userCoach && activeCoachCode.toUpperCase() === userCoach.toUpperCase();

	const scrollContainerRef = React.useRef<HTMLDivElement>(null);

	// Auto-scroll the selected/user coach into view when loaded
	React.useEffect(() => {
		if (scrollContainerRef.current) {
			const activeElement = scrollContainerRef.current.querySelector(
				`[data-coach-idx="${selectedCoachIndex}"]`,
			);
			if (activeElement) {
				activeElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
			}
		}
	}, [selectedCoachIndex]);

	return (
		<div className="w-full space-y-3">
			{/* Top Selected Coach Banner (Inspired by Image Reference) */}
			<div className="rounded-2xl bg-linear-to-r from-sky-600 via-blue-600 to-blue-700 text-white p-4 sm:p-5 shadow-lg flex items-center justify-between">
				<div>
					<div className="flex flex-wrap items-center gap-2.5">
						<span className="text-xl sm:text-2xl font-black tracking-wide">
							{activeCoachCode}
						</span>
						<span className="text-base sm:text-lg font-bold opacity-95">
							— {activeCoachDetails.label}
						</span>
						{isUserAssigned && (
							<span className="text-xs font-bold bg-white text-blue-800 px-2.5 py-1 rounded-full shadow-xs">
								{t("tools.pnr_checker.your_coach")}
							</span>
						)}
					</div>
					{(trainName || trainNumber) && (
						<p className="text-sm text-sky-100 font-semibold mt-1 opacity-95">
							{trainNumber ? `${trainNumber} - ` : ""}
							{trainName}
						</p>
					)}
				</div>
				<div className="text-right shrink-0">
					<span className="text-xs uppercase tracking-wider text-sky-200 block font-bold">
						{t("tools.pnr_checker.position_indicator")}
					</span>
					<span className="text-base sm:text-lg font-black font-mono">
						#{selectedCoachIndex + 1} / {rawCoaches.length}
					</span>
				</div>
			</div>

			{/* Scrollable Realistic Train Rake Track View */}
			<div className="relative rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-md overflow-hidden">
				<div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pb-3 px-1 border-b border-border/40 font-medium">
					<span className="font-bold flex items-center gap-1.5 text-primary">
						<span>{t("tools.pnr_checker.engine_front")}</span>
					</span>
					<span className="text-xs text-muted-foreground flex items-center gap-1.5">
						<Info className="w-4 h-4 text-primary" />{" "}
						{t("tools.pnr_checker.coach_scroll_hint")}
					</span>
					<span className="font-bold text-muted-foreground">
						{t("tools.pnr_checker.rear_guard")}
					</span>
				</div>

				{/* Horizontal Train Rake Track - Scrollable */}
				<div
					ref={scrollContainerRef}
					className="overflow-x-auto py-6 px-3 select-none scroll-smooth touch-pan-x"
					style={{
						scrollbarWidth: "thin",
					}}
				>
					<div className="flex items-center min-w-max pb-3">
						{rawCoaches.map((coachCode, idx) => {
							const isSelected = selectedCoachIndex === idx;
							const isUserCoach =
								userCoach &&
								coachCode.toUpperCase() ===
									userCoach.toUpperCase();
							const details = getCoachDetails(coachCode);

							return (
								<div
									key={`rake-${coachCode}-${idx}`}
									data-coach-idx={idx}
									onClick={() => setSelectedCoachIndex(idx)}
									className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1.5 relative px-1"
								>
									{/* Top Coach Label (D5, D6, C1, etc.) */}
									<span
										className={`text-sm sm:text-base font-black tracking-wider transition-all pb-2 ${
											isSelected
												? "text-primary scale-110"
												: isUserCoach
													? "text-emerald-600 dark:text-emerald-400 font-black"
													: "text-muted-foreground group-hover:text-foreground"
										}`}
									>
										{coachCode}
									</span>

									{/* The Train Coach Graphic matching reference image */}
									<div className="flex items-center">
										{/* Front Coupler rod connecting coaches */}
										{idx > 0 && (
											<div className="w-3 h-1.5 bg-zinc-600 dark:bg-zinc-400 shrink-0" />
										)}

										{/* Coach Container */}
										<div
											className={`relative w-18 h-10 rounded-sm flex flex-col justify-between p-0.5 shadow-md transition-all ${
												isSelected
													? "ring-3 ring-primary ring-offset-2 ring-offset-background scale-105"
													: ""
											} ${
												isUserCoach
													? "ring-3 ring-emerald-500 shadow-lg"
													: ""
											}`}
										>
											{/* Top Roof / AC Unit (Blue/Livery colored band) */}
											<div
												className={`w-full h-3 rounded-t-xs ${details.roofColor} shadow-xs`}
											/>

											{/* Lower Coach Body (Orange / Class Livery) with Realistic Windows */}
											<div
												className={`w-full h-6 rounded-b-xs ${details.bodyColor} border-t ${details.borderBody} flex items-center justify-around px-1.5 relative`}
											>
												{/* Left Window */}
												<div className="w-5 h-2.5 bg-slate-900 rounded-xs border border-white/20" />
												{/* Right Window */}
												<div className="w-5 h-2.5 bg-slate-900 rounded-xs border border-white/20" />
											</div>

											{/* Two Bogie Wheels under Coach */}
											<div className="absolute -bottom-2 left-0 right-0 flex justify-between px-2 pointer-events-none">
												<div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-700 shadow-sm" />
												<div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-700 shadow-sm" />
											</div>
										</div>
									</div>

									{/* Bottom Coach Serial Number (1, 2, 3...) */}
									<span
										className={`text-xs sm:text-sm font-mono mt-4 transition-colors ${
											isSelected
												? "text-primary font-black scale-110"
												: "text-muted-foreground font-semibold"
										}`}
									>
										{idx + 1}
									</span>
								</div>
							);
						})}
					</div>

					{/* Continuous Railway Rail Track Line below wheels */}
					<div className="w-full h-1.5 bg-linear-to-r from-zinc-400 via-zinc-500 to-zinc-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-full mt-1.5 relative">
						<div className="absolute inset-0 bg-repeat-x opacity-40 bg-[linear-gradient(90deg,transparent_4px,#333_4px,#333_6px,transparent_6px)]" />
					</div>
				</div>
			</div>
		</div>
	);
};
