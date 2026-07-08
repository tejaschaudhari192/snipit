import { Skeleton } from "@/components/ui/skeleton";

export function ToolsPageSkeleton() {
	return (
		<div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
			<div className="mb-8 space-y-4">
				<Skeleton className="h-10 w-48 rounded-md" />
				<Skeleton className="h-6 w-96 max-w-full rounded-md" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex flex-col border border-border rounded-xl p-6 space-y-4 bg-card/50">
						<div className="flex items-center gap-4">
							<Skeleton className="h-10 w-10 rounded-md" />
							<Skeleton className="h-6 w-32 rounded-md" />
						</div>
						<Skeleton className="h-16 w-full rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
}
