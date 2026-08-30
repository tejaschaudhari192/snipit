import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export const CompanionPageSkeleton = () => {
	return (
		<div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex flex-col bg-background relative overflow-hidden">
			{/* Top Bar Skeleton */}
			<div className="h-16 px-4 md:px-8 border-b border-border/50 flex items-center justify-between bg-card/30 backdrop-blur-md">
				<div className="flex items-center gap-3">
					<div className="relative">
						<Skeleton className="w-10 h-10 rounded-full" />
						<div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary/20 animate-pulse ring-2 ring-background" />
					</div>
					<div className="space-y-1.5">
						<Skeleton className="w-28 h-4 rounded" />
						<Skeleton className="w-20 h-3 rounded-full" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="w-24 h-8 rounded-full" />
					<Skeleton className="w-8 h-8 rounded-lg" />
					<Skeleton className="w-8 h-8 rounded-lg" />
				</div>
			</div>

			{/* Center Chat Feed Skeleton */}
			<div className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto flex flex-col justify-end space-y-4 overflow-hidden">
				<div className="flex items-center justify-center my-auto">
					<div className="flex flex-col items-center gap-3 p-6 text-center opacity-60">
						<div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
							<Sparkles className="w-8 h-8 text-primary animate-pulse" />
						</div>
						<Skeleton className="w-48 h-5 rounded" />
						<Skeleton className="w-64 h-3.5 rounded" />
					</div>
				</div>

				<div className="flex gap-3 max-w-[80%]">
					<Skeleton className="w-8 h-8 rounded-full shrink-0" />
					<div className="space-y-2">
						<Skeleton className="w-72 h-16 rounded-2xl" />
					</div>
				</div>

				<div className="flex gap-3 max-w-[80%] self-end">
					<div className="space-y-2">
						<Skeleton className="w-56 h-10 rounded-2xl" />
					</div>
				</div>

				<div className="flex gap-3 max-w-[80%]">
					<Skeleton className="w-8 h-8 rounded-full shrink-0" />
					<div className="space-y-2">
						<Skeleton className="w-80 h-14 rounded-2xl" />
					</div>
				</div>
			</div>

			{/* Bottom Input Area Skeleton */}
			<div className="p-4 md:p-6 border-t border-border/50 bg-background/80 backdrop-blur-md">
				<div className="max-w-4xl mx-auto flex items-center gap-3">
					<Skeleton className="flex-1 h-12 rounded-xl" />
					<Skeleton className="w-12 h-12 rounded-xl shrink-0" />
				</div>
			</div>
		</div>
	);
};
