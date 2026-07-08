import { Skeleton } from "@/components/ui/skeleton";

export function CryptoSafeSkeleton() {
	return (
		<div className="min-h-full bg-background p-4 animate-in fade-in duration-500">
			<section className="relative py-12 md:py-16 px-4">
				<div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6">
					<Skeleton className="h-8 w-24 rounded-full" />
					<Skeleton className="h-12 w-3/4 max-w-md rounded-lg" />
					<Skeleton className="h-6 w-1/2 max-w-sm rounded-md" />
				</div>
			</section>

			<section className="pb-16 px-4 md:px-8 max-w-2xl mx-auto space-y-8">
				<Skeleton className="h-12 w-full rounded-xl" />
				<div className="bg-card border border-border p-6 rounded-xl space-y-6">
					<Skeleton className="h-6 w-32 rounded-md" />
					<Skeleton className="h-32 w-full rounded-md" />
					<Skeleton className="h-10 w-full rounded-md" />
					<Skeleton className="h-10 w-full rounded-md" />
				</div>
			</section>
		</div>
	);
}
