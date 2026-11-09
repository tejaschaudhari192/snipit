import { Skeleton } from "@/components/ui/skeleton";

export { VaultProgressLoader as InitialLoader } from "./vault-progress-loader";

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

export function DashboardSkeleton() {
	return (
		<div className="flex-1 overflow-y-auto no-scrollbar bg-background">
			{/* Top Hero Banner Skeleton */}
			<div className="border-b border-border/60 bg-muted/10 px-6 sm:px-8 py-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Skeleton className="w-8 h-8 rounded-lg" />
							<Skeleton className="h-7 w-64 rounded-lg" />
						</div>
						<Skeleton className="h-4 w-80 rounded-md" />
					</div>
					<div className="flex items-center gap-2.5">
						<Skeleton className="h-9 w-32 rounded-xl" />
						<Skeleton className="h-9 w-28 rounded-xl" />
					</div>
				</div>
			</div>

			<div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
				{/* 4 Metric KPI Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between space-y-4"
						>
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-24 rounded-md" />
								<Skeleton className="w-8 h-8 rounded-xl" />
							</div>
							<div className="space-y-1.5">
								<Skeleton className="h-8 w-20 rounded-md" />
								<Skeleton className="h-3.5 w-32 rounded-md" />
							</div>
							<Skeleton className="h-1 w-full rounded-full" />
						</div>
					))}
				</div>

				{/* 2-Column Middle Row: Security Gauge + Strength Spectrum */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Circular Gauge Skeleton */}
					<div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row items-center gap-6">
						<Skeleton className="w-36 h-36 rounded-full shrink-0" />
						<div className="flex-1 space-y-3 w-full">
							<Skeleton className="h-5 w-28 rounded-full" />
							<Skeleton className="h-6 w-44 rounded-md" />
							<Skeleton className="h-4 w-full rounded-md" />
							<Skeleton className="h-4 w-3/4 rounded-md" />
							<Skeleton className="h-3.5 w-48 rounded-md mt-2" />
						</div>
					</div>

					{/* Strength Spectrum Skeleton */}
					<div className="lg:col-span-6 p-6 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-48 rounded-md" />
								<Skeleton className="h-4 w-24 rounded-md" />
							</div>
							<Skeleton className="h-3.5 w-72 rounded-md" />
							<Skeleton className="h-3 w-full rounded-full my-4" />
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border/50">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton
									key={i}
									className="h-4 w-full rounded-md"
								/>
							))}
						</div>
					</div>
				</div>

				{/* 6 Category Tiles */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="p-3.5 rounded-xl bg-card border border-border/60 space-y-2"
						>
							<div className="flex items-center justify-between">
								<Skeleton className="w-4 h-4 rounded-md" />
								<Skeleton className="w-3 h-3 rounded-md" />
							</div>
							<Skeleton className="h-6 w-10 rounded-md" />
							<Skeleton className="h-3 w-16 rounded-md" />
						</div>
					))}
				</div>

				{/* Vulnerability Audit List Skeleton */}
				<div className="rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden">
					<div className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
						<div className="space-y-1.5">
							<Skeleton className="h-5 w-56 rounded-md" />
							<Skeleton className="h-3.5 w-80 rounded-md" />
						</div>
						<div className="flex gap-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton
									key={i}
									className="h-7 w-20 rounded-lg"
								/>
							))}
						</div>
					</div>
					<div className="divide-y divide-border/50 p-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="p-3.5 flex items-center justify-between gap-4"
							>
								<div className="flex items-center gap-3.5 flex-1">
									<Skeleton className="w-10 h-10 rounded-xl shrink-0" />
									<div className="space-y-1.5 flex-1">
										<Skeleton className="h-4 w-36 rounded-md" />
										<Skeleton className="h-3 w-48 rounded-md" />
									</div>
								</div>
								<Skeleton className="h-8 w-20 rounded-lg shrink-0" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
