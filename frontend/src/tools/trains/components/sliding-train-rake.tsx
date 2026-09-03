import React from "react";

interface SlidingTrainRakeProps {
	x: number;
	y: number;
	visible: boolean;
}

/**
 * Top-down aerial view of a full realistic train rake moving DOWN the railway track:
 * - Train moves downward from source to destination (head engine facing DOWN).
 * - Guard Brake Van / Generator Car at the top (with pulsing red tail lamp).
 * - Passenger Sleeper & AC Tier coaches in the middle with vestibule couplers.
 * - Lead Locomotive Engine at the bottom with headlights facing down.
 */
export const SlidingTrainRake: React.FC<SlidingTrainRakeProps> = ({
	x,
	y,
	visible,
}) => {
	if (!visible || x === 0 || y === 0) return null;

	return (
		<div
			className="absolute z-20 pointer-events-none transition-transform will-change-transform duration-75"
			style={{
				left: `${x}px`,
				top: 0,
				// Center the locomotive & rake vertically around the current station node point
				transform: `translate3d(-50%, ${y - 80}px, 0)`,
			}}
		>
			{/* Authentic Long Train Rake Heading Downwards (Top-Down Bird's-Eye View) */}
			<div className="flex flex-col items-center gap-0.5 bg-slate-950/95 p-1 rounded-sm shadow-2xl border border-teal-400/90 ring-2 ring-teal-400/40 shrink-0">
				{/* 1. Rear Guard Brake Van / EOG Generator Car (Top end with red flashing tail lamp) */}
				<div className="w-3.5 h-5 bg-linear-to-b from-rose-700 to-red-600 rounded-t-sm border border-rose-300/80 flex flex-col items-center justify-between p-0.5 shadow-xs">
					{/* Tail End Red Lamp / Flashing Marker (Facing upwards/rear) */}
					<div className="w-1.5 h-1 bg-red-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
					<div className="w-1.5 h-1 bg-rose-950 rounded-xs" />
					<div className="w-2 h-0.5 bg-rose-200 rounded-xs" />
				</div>

				{/* Gangway Coupler */}
				<div className="w-1.5 h-0.5 bg-zinc-500 rounded-xs" />

				{/* 2. Passenger Coach (Sleeper Class - Deep Blue) */}
				<div className="w-3.5 h-5.5 bg-linear-to-b from-blue-700 to-blue-600 border border-blue-300/80 flex flex-col items-center justify-between p-0.5 shadow-xs">
					<div className="w-2 h-0.5 bg-blue-200/90 rounded-xs" />
					<div className="w-1.5 h-1 bg-blue-900 rounded-xs" />
					<div className="w-2 h-0.5 bg-blue-200/90 rounded-xs" />
				</div>

				{/* Gangway Coupler */}
				<div className="w-1.5 h-0.5 bg-zinc-500 rounded-xs" />

				{/* 3. Passenger Coach (Sleeper Class - Deep Blue) */}
				<div className="w-3.5 h-5.5 bg-linear-to-b from-blue-700 to-blue-600 border border-blue-300/80 flex flex-col items-center justify-between p-0.5 shadow-xs">
					<div className="w-2 h-0.5 bg-blue-200/90 rounded-xs" />
					<div className="w-1.5 h-1 bg-blue-900 rounded-xs" />
					<div className="w-2 h-0.5 bg-blue-200/90 rounded-xs" />
				</div>

				{/* Gangway Coupler */}
				<div className="w-1.5 h-0.5 bg-zinc-500 rounded-xs" />

				{/* 4. AC Tier Coach (Teal/Cyan Livery) */}
				<div className="w-3.5 h-5.5 bg-linear-to-b from-teal-600 to-teal-500 border border-teal-300/80 flex flex-col items-center justify-between p-0.5 shadow-xs">
					<div className="w-2 h-0.5 bg-teal-200/90 rounded-xs" />
					{/* Roof AC Vents */}
					<div className="w-1.5 h-1 bg-teal-800 rounded-xs" />
					<div className="w-2 h-0.5 bg-teal-200/90 rounded-xs" />
				</div>

				{/* Gangway Coupler */}
				<div className="w-1.5 h-0.5 bg-zinc-500 rounded-xs" />

				{/* 5. Lead Locomotive Engine (Head facing downward in direction of travel) */}
				<div className="w-3.5 h-6 bg-linear-to-b from-amber-700 via-amber-600 to-amber-500 rounded-b-sm border border-amber-300/90 flex flex-col items-center justify-between p-0.5 shadow-sm relative">
					{/* Coupler to coach */}
					<div className="w-1 h-0.5 bg-zinc-400 rounded-xs" />
					{/* Pantograph 1 */}
					<div className="w-2 h-0.5 bg-slate-900 rounded-full" />
					{/* Roof Air Duct */}
					<div className="w-1.5 h-1 bg-amber-200 rounded-xs shadow-xs" />
					{/* Pantograph 2 */}
					<div className="w-2 h-0.5 bg-slate-900 rounded-full" />
					{/* Front Windshield / Nose pointing DOWN */}
					<div className="w-2.5 h-1 bg-sky-950 rounded-xs border-t border-sky-400/50 flex items-center justify-center">
						{/* Headlight beam */}
						<div className="w-1.5 h-0.5 bg-yellow-300 rounded-full shadow-[0_0_4px_rgba(253,224,71,1)]" />
					</div>
				</div>
			</div>
		</div>
	);
};
