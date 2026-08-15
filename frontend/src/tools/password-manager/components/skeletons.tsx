import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function InitialLoader() {
	return (
		<div className="h-full w-full bg-background flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="w-10 h-10 text-primary animate-spin" />
				<div className="space-y-2 flex flex-col items-center opacity-50">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-48" />
				</div>
			</div>
		</div>
	);
}

export function AppSkeleton() {
	return (
		<div className="h-full flex flex-col bg-background">
			<div className="flex-1 flex overflow-hidden bg-pm-surface animate-in fade-in duration-500">
				{/* Left - Sidebar Skeleton */}
				<div className="w-60 shrink-0 h-full overflow-hidden border-r border-pm-border flex flex-col bg-pm-sidebar shadow-sm z-10 p-4 space-y-4">
					<Skeleton className="h-8 w-3/4 mb-6 bg-white/5" />
					<Skeleton className="h-10 w-full rounded-md bg-white/5" />
					<div className="space-y-2 mt-8">
						<Skeleton className="h-4 w-1/3 mb-4 bg-white/5" />
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-8 w-full rounded-md bg-white/5"
							/>
						))}
					</div>
				</div>

				{/* Main Content Area - List Skeleton */}
				<div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col p-8 space-y-4">
					<div className="flex items-center justify-between mb-8">
						<Skeleton className="h-10 w-1/3 bg-white/5" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-24 rounded-md bg-white/5" />
							<Skeleton className="h-9 w-24 rounded-md bg-white/5" />
						</div>
					</div>

					<div className="space-y-1 mt-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-15 w-full rounded-none border-b border-white/5 bg-transparent"
							/>
						))}
					</div>
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

export function SharingCenterSkeleton() {
	return (
		<div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto animate-in fade-in duration-500">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48 rounded-md" />
					<Skeleton className="h-4 w-64 rounded-md" />
				</div>
				<Skeleton className="h-10 w-48 rounded-md" />
			</div>

			<div className="space-y-4">
				<div className="flex gap-4 border-b border-border pb-2">
					<Skeleton className="h-8 w-32 rounded-md" />
					<Skeleton className="h-8 w-32 rounded-md" />
				</div>

				<div className="grid gap-4 mt-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="p-4 border border-border rounded-xl bg-card flex items-center justify-between"
						>
							<div className="flex items-center gap-4">
								<Skeleton className="w-11 h-11 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-5 w-40 rounded-md" />
									<Skeleton className="h-4 w-24 rounded-md" />
								</div>
							</div>
							<Skeleton className="h-9 w-32 rounded-md hidden sm:block" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
