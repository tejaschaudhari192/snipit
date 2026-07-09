import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MusicPlayerSkeleton: React.FC = () => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="w-[90vw] max-w-112.5 p-5 gap-4 border border-border bg-background shadow-lg rounded-lg text-foreground flex flex-col">
				{/* Header Skeleton */}
				<div className="flex flex-row items-center justify-between w-full">
					<div className="flex flex-col gap-1.5 flex-1 pr-4">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-20" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-7 w-20" />
						<Skeleton className="h-7 w-7" />
					</div>
				</div>

				{/* Search Bar Skeleton */}
				<div className="flex items-center gap-2 w-full mt-1">
					<Skeleton className="h-8 flex-1" />
					<Skeleton className="h-8 w-16" />
				</div>

				{/* Player Info Skeleton */}
				<div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/50 w-full mt-1">
					<Skeleton className="w-12 h-12 shrink-0" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-3.5 w-3/4" />
						<Skeleton className="h-2.5 w-1/2" />
					</div>
				</div>

				{/* Progress Slider Skeleton */}
				<div className="space-y-2 w-full mt-2">
					<Skeleton className="h-1 w-full" />
					<div className="flex justify-between">
						<Skeleton className="h-2.5 w-8" />
						<Skeleton className="h-2.5 w-8" />
					</div>
				</div>

				{/* Controls Skeleton */}
				<div className="flex items-center justify-center gap-6 py-2 w-full">
					<Skeleton className="h-4 w-4 rounded-full" />
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-4 w-4 rounded-full" />
				</div>

				{/* Volume Slider Skeleton */}
				<div className="flex items-center gap-2.5 px-1 py-1.5 w-full">
					<Skeleton className="h-4 w-4 rounded-full shrink-0" />
					<Skeleton className="h-1 flex-1" />
				</div>

				{/* Playlist Skeleton */}
				<div className="space-y-2.5 pt-3.5 border-t border-border/50 w-full mt-1">
					<Skeleton className="h-3 w-14" />
					<div className="space-y-1.5 w-full">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="flex items-center gap-2.5 p-1.5 rounded-md border border-transparent w-full"
							>
								<Skeleton className="w-7 h-7 shrink-0" />
								<div className="flex-1 space-y-1.5">
									<Skeleton className="h-2.5 w-2/3" />
									<Skeleton className="h-2 w-1/3" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MusicPlayerSkeleton;
