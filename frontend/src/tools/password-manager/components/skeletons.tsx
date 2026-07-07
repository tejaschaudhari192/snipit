import { Skeleton } from "@/components/ui/skeleton";

export function AppSkeleton() {
	return (
		<div className="h-full flex flex-col bg-background p-4 animate-in fade-in duration-1000">
			<div className="flex-1 flex overflow-hidden rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm relative">
				{/* Left - Sidebar Skeleton */}
				<div className="w-[260px] flex-shrink-0 bg-sidebar overflow-hidden border-r border-border h-full p-4 space-y-4">
					<Skeleton className="h-8 w-3/4 mb-6" />
					<Skeleton className="h-10 w-full rounded-md" />
					<div className="space-y-2 mt-8">
						<Skeleton className="h-4 w-1/3 mb-4" />
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-8 w-full rounded-md"
							/>
						))}
					</div>
				</div>

				{/* Middle - List Skeleton */}
				<div className="w-[320px] flex-shrink-0 bg-background/50 overflow-hidden flex flex-col border-r border-border h-full p-4 space-y-4">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-6 w-1/3" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
					<Skeleton className="h-10 w-full rounded-md mb-4" />
					<div className="space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-20 w-full rounded-xl"
							/>
						))}
					</div>
				</div>

				{/* Right - Detail Skeleton */}
				<div className="flex-1 min-w-0 overflow-hidden bg-background h-full p-8 flex flex-col items-center justify-center">
					<Skeleton className="h-16 w-16 rounded-full mb-6" />
					<Skeleton className="h-6 w-1/3 mb-4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</div>
		</div>
	);
}

export function SidebarSkeleton() {
	return (
		<div className="p-4 space-y-4 h-full w-full">
			<Skeleton className="h-8 w-3/4 mb-6" />
			<Skeleton className="h-10 w-full rounded-md" />
			<div className="space-y-2 mt-8">
				<Skeleton className="h-4 w-1/3 mb-4" />
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-8 w-full rounded-md" />
				))}
			</div>
		</div>
	);
}

export function ListSkeleton() {
	return (
		<div className="p-4 space-y-4 h-full w-full">
			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-6 w-1/3" />
				<Skeleton className="h-8 w-8 rounded-full" />
			</div>
			<Skeleton className="h-10 w-full rounded-md mb-4" />
			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-20 w-full rounded-xl" />
				))}
			</div>
		</div>
	);
}

export function DetailSkeleton() {
	return (
		<div className="h-full w-full p-8 flex flex-col items-center justify-center animate-in fade-in duration-500">
			<Skeleton className="h-16 w-16 rounded-full mb-6" />
			<Skeleton className="h-6 w-1/3 mb-4" />
			<Skeleton className="h-4 w-1/2" />
		</div>
	);
}
