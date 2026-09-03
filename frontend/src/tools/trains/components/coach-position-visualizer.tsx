import React, { useState } from "react";
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
			<div className="rounded-xl bg-linear-to-r from-sky-600 to-blue-700 text-white p-3.5 shadow-md flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-base font-black tracking-wide">
							{activeCoachCode}
						</span>
						<span className="text-sm font-semibold opacity-90">
							— {activeCoachDetails.label}
						</span>
						{isUserAssigned && (
							<span className="text-[11px] font-bold bg-white text-blue-800 px-2 py-0.5 rounded-full shadow-xs">
								Your Coach
							</span>
						)}
					</div>
					{(trainName || trainNumber) && (
						<p className="text-xs text-sky-100 font-medium mt-0.5 opacity-90">
							{trainNumber ? `${trainNumber} - ` : ""}
							{trainName}
						</p>
					)}
				</div>
				<div className="text-right">
					<span className="text-[11px] uppercase tracking-wider text-sky-200 block font-semibold">
						Position
					</span>
					<span className="text-sm font-bold font-mono">
						#{selectedCoachIndex + 1} of {rawCoaches.length}
					</span>
				</div>
			</div>

			{/* Scrollable Realistic Train Rake Track View */}
			<div className="relative rounded-2xl border border-border/70 bg-card p-4 shadow-sm overflow-hidden">
				<div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 px-1 border-b border-border/40">
					<span className="font-semibold flex items-center gap-1 text-primary">
						<span>◄ Engine (Front)</span>
					</span>
					<span className="text-[10px] text-muted-foreground flex items-center gap-1">
						<Info className="w-3 h-3" /> Scroll horizontally to see
						all coaches • Click to inspect
					</span>
					<span className="font-semibold text-muted-foreground">
						Rear (Guard) ►
					</span>
				</div>

				{/* Horizontal Train Rake Track - Scrollable */}
				<div
					ref={scrollContainerRef}
					className="overflow-x-auto py-4 px-2 select-none scroll-smooth touch-pan-x"
					style={{
						scrollbarWidth: "thin",
					}}
				>
					<div className="flex items-center min-w-max pb-2">
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
									className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 relative"
								>
									{/* Top Coach Label (D5, D6, C1, etc.) */}
									<span
										className={`text-xs font-black tracking-wider transition-colors pb-1.5 ${
											isSelected
												? "text-primary scale-110"
												: isUserCoach
													? "text-emerald-600 dark:text-emerald-400"
													: "text-muted-foreground group-hover:text-foreground"
										}`}
									>
										{coachCode}
									</span>

									{/* The Train Coach Graphic matching reference image */}
									<div className="flex items-center">
										{/* Front Coupler rod connecting coaches */}
										{idx > 0 && (
											<div className="w-2.5 h-1 bg-zinc-600 dark:bg-zinc-400 shrink-0" />
										)}

										{/* Coach Container */}
										<div
											className={`relative w-13 h-7 rounded-sm flex flex-col justify-between p-0.5 shadow-sm transition-all ${
												isSelected
													? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
													: ""
											} ${
												isUserCoach
													? "ring-2 ring-emerald-500 shadow-md"
													: ""
											}`}
										>
											{/* Top Roof / AC Unit (Blue/Livery colored band) */}
											<div
												className={`w-full h-2 rounded-t-xs ${details.roofColor} shadow-xs`}
											/>

											{/* Lower Coach Body (Orange / Class Livery) with Realistic Windows */}
											<div
												className={`w-full h-4.5 rounded-b-xs ${details.bodyColor} border-t ${details.borderBody} flex items-center justify-around px-1 relative`}
											>
												{/* Left Window */}
												<div className="w-4 h-1.5 bg-slate-900 rounded-xs border border-white/20" />
												{/* Right Window */}
												<div className="w-4 h-1.5 bg-slate-900 rounded-xs border border-white/20" />
											</div>

											{/* Two Bogie Wheels under Coach */}
											<div className="absolute -bottom-1.5 left-0 right-0 flex justify-between px-1.5 pointer-events-none">
												<div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 shadow-xs" />
												<div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 shadow-xs" />
											</div>
										</div>
									</div>

									{/* Bottom Coach Serial Number (1, 2, 3...) */}
									<span
										className={`text-[11px] font-mono mt-3.5 transition-colors ${
											isSelected
												? "text-primary font-black"
												: "text-muted-foreground/80 font-medium"
										}`}
									>
										{idx + 1}
									</span>
								</div>
							);
						})}
					</div>

					{/* Continuous Railway Rail Track Line below wheels */}
					<div className="w-full h-1 bg-linear-to-r from-zinc-400 via-zinc-500 to-zinc-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-full mt-1 relative">
						<div className="absolute inset-0 bg-repeat-x opacity-40 bg-[linear-gradient(90deg,transparent_4px,#333_4px,#333_6px,transparent_6px)]" />
					</div>
				</div>
			</div>
		</div>
	);
};
