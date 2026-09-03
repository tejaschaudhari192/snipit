import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const TrainsPageSkeleton = () => {
	return (
		<div className="w-full space-y-6 max-w-2xl mx-auto p-4 md:p-6">
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl">
				<CardContent className="p-6 space-y-4">
					<Skeleton className="h-4 w-24" />
					<div className="flex gap-3">
						<Skeleton className="h-11 flex-1" />
						<Skeleton className="h-11 w-28" />
					</div>
				</CardContent>
			</Card>

			<Card className="border-border/50 bg-background/60 backdrop-blur-xl">
				<CardContent className="p-6 space-y-5">
					<div className="flex justify-between items-center">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-px w-full my-4" />
					<div className="flex justify-between items-center">
						<Skeleton className="h-12 w-32" />
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-12 w-32" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
