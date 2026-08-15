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
					<div
						key={i}
						className="flex flex-col border border-border rounded-xl p-6 space-y-4 bg-card/50"
					>
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

export function HistoryPageSkeleton() {
	return (
		<div className="relative min-h-[90vh] bg-background p-4 md:p-8 overflow-x-hidden w-full">
			<div className="max-w-3xl mx-auto relative z-10 animate-in fade-in duration-500">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
					<div className="space-y-2">
						<Skeleton className="h-9 w-40 rounded-md" />
						<Skeleton className="h-5 w-24 rounded-md" />
					</div>
					<Skeleton className="h-9 w-32 rounded-md" />
				</div>
				<div className="grid gap-4 mt-8">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-32 w-full rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

export function ProfilePageSkeleton() {
	return (
		<div className="relative min-h-dvh bg-background overflow-x-hidden flex flex-col items-center w-full">
			<div className="relative z-10 container mx-auto px-4 py-4 md:py-6 max-w-7xl w-full animate-in fade-in duration-500">
				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start">
					<div className="w-full lg:col-span-4 lg:sticky lg:top-8 max-w-2xl mx-auto lg:max-w-none flex flex-col gap-6 pt-1 pb-4">
						<div className="px-2 space-y-4">
							<div className="flex items-center gap-3 h-10">
								<Skeleton className="w-10 h-10 rounded-xl shrink-0" />
								<Skeleton className="h-9 w-48 rounded-md" />
							</div>
							<Skeleton className="h-12 w-full rounded-2xl" />
						</div>
						<Skeleton className="h-64 w-full rounded-2xl" />
					</div>
					<div className="w-full lg:col-span-8 flex flex-col gap-4 max-w-2xl mx-auto lg:max-w-none pt-2 lg:pt-0 pb-4">
						<Skeleton className="h-12 w-full rounded-2xl mb-2" />
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-40 w-full rounded-xl"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export function AboutPageSkeleton() {
	return (
		<div className="min-h-dvh bg-background text-foreground animate-in fade-in duration-500">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
				<div className="text-center mb-24 space-y-4 flex flex-col items-center">
					<Skeleton className="h-12 w-64 rounded-md mb-2" />
					<Skeleton className="h-6 w-3/4 max-w-2xl rounded-md" />
					<Skeleton className="h-6 w-1/2 max-w-xl rounded-md" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="flex flex-col items-center space-y-4 border border-border p-6 rounded-2xl"
						>
							<Skeleton className="w-12 h-12 rounded-xl mb-2" />
							<Skeleton className="h-6 w-32 rounded-md" />
							<Skeleton className="h-16 w-full rounded-md mt-2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
