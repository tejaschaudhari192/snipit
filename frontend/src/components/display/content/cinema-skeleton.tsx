import { Skeleton } from "@/components/ui/skeleton";
import { Tv } from "lucide-react";

export const CinemaSkeleton = () => {
	return (
		<div className="w-full h-full flex flex-col md:flex-row relative bg-black/95 rounded-2xl overflow-hidden shadow-2xl min-h-[500px] select-none">
			{/* Main Screen Area Skeleton */}
			<div className="flex-1 flex flex-col justify-between relative bg-black p-4 min-h-0 min-w-0">
				{/* Top bar details placeholder */}
				<div className="flex justify-between items-center w-full pb-2 border-b border-white/5">
					<div className="flex items-center gap-2">
						<Skeleton className="w-4 h-4 rounded-full bg-white/10" />
						<Skeleton className="w-24 h-4 bg-white/10" />
					</div>
					<Skeleton className="w-16 h-4 bg-white/10" />
				</div>

				{/* Center video skeleton */}
				<div className="flex-1 flex items-center justify-center my-4 relative">
					<Skeleton className="w-full h-full aspect-video rounded-xl max-w-full max-h-full bg-white/5 flex flex-col items-center justify-center gap-3">
						<Tv className="w-12 h-12 text-white/10 animate-pulse" />
						<Skeleton className="w-32 h-3 bg-white/10 rounded-full" />
					</Skeleton>
				</div>

				{/* Controls skeleton at bottom */}
				<div className="flex flex-col gap-3 pt-2 border-t border-white/5">
					{/* Progress slider bar */}
					<div className="flex items-center gap-2">
						<Skeleton className="w-full h-1.5 bg-white/10 rounded-full" />
					</div>
					{/* Control buttons line */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
							<Skeleton className="w-16 h-4 bg-white/10" />
							<Skeleton className="w-12 h-8 rounded-lg bg-white/10" />
						</div>
						<div className="flex items-center gap-3">
							<div className="flex gap-1.5">
								{[...Array(5)].map((_, i) => (
									<Skeleton
										key={i}
										className="w-6 h-6 rounded-full bg-white/10"
									/>
								))}
							</div>
							<Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
						</div>
					</div>
				</div>
			</div>

			{/* Sidebar Area Skeleton */}
			<div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 bg-black/80 flex flex-col shrink-0 p-4 min-h-[350px] md:min-h-0">
				{/* Top Section: Active Watchers */}
				<div className="flex flex-col gap-2 min-h-0 border-b border-white/5 pb-3">
					<div className="flex items-center gap-2">
						<div className="w-2.5 h-2.5 bg-emerald-500/40 rounded-full animate-pulse" />
						<Skeleton className="w-28 h-3.5 bg-white/10" />
					</div>
					{/* Compact Watcher avatars placeholder */}
					<div className="flex flex-wrap gap-1.5 mt-1">
						{[...Array(3)].map((_, i) => (
							<Skeleton
								key={i}
								className="w-7 h-7 rounded-full bg-white/15"
							/>
						))}
					</div>
				</div>

				{/* Middle Section: Chat History */}
				<div className="flex-1 flex flex-col gap-3 min-h-0 py-3">
					<Skeleton className="w-16 h-3 bg-white/10" />
					<div className="flex flex-col gap-3 mt-1">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex flex-col gap-1.5">
								<Skeleton className="w-16 h-2.5 bg-white/15" />
								<Skeleton className="w-3/4 h-8 rounded-lg bg-white/5" />
							</div>
						))}
					</div>
				</div>

				{/* Bottom Section: Chat Input */}
				<div className="pt-3 border-t border-white/5 flex gap-1 bg-transparent">
					<Skeleton className="flex-1 h-9 bg-white/5 rounded-lg" />
					<Skeleton className="h-9 w-9 shrink-0 bg-white/10 rounded-lg" />
				</div>
			</div>
		</div>
	);
};

export default CinemaSkeleton;
