import { Skeleton } from "@/components/ui/skeleton";

export const CinemaPageSkeleton = () => {
	return (
		<div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex flex-col md:flex-row bg-background">
			<div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
				<Skeleton className="h-16 w-16 rounded-2xl" />
				<div className="space-y-4 w-full max-w-lg text-center">
					<Skeleton className="h-8 w-64 mx-auto" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6 mx-auto" />
				</div>
				<Skeleton className="w-full max-w-md h-12 rounded-xl" />
				<Skeleton className="w-full max-w-md h-12 rounded-xl" />
			</div>
		</div>
	);
};
