import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import { ToolbarButtonSkeleton } from "./toolbar-skeletons";

/**
 * Display-specific skeleton components
 */

export function DisplayWorkspaceSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex flex-col h-full", className)}>
			<DisplayToolbarSkeleton {...props} />
			<div className="flex-1 flex overflow-hidden">
				<div className="flex-1 flex flex-col min-w-0">
					<PasswordGateSkeleton {...props} />
					<EditControlsSkeleton {...props} />
					<DisplayContentSkeleton {...props} />
				</div>
			</div>
		</div>
	);
}

export function DisplayToolbarSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"h-16 flex items-center justify-between px-4 border-b border-border/50 bg-card/50",
				className,
			)}
		>
			<div className="flex items-center gap-3">
				<Skeleton className="h-8 w-8 rounded-lg" {...props} />
				<Skeleton className="h-6 w-32 rounded-md" {...props} />
			</div>
			<div className="flex items-center gap-2">
				<ToolbarButtonSkeleton variant="icon" {...props} />
				<ToolbarButtonSkeleton variant="icon" {...props} />
				<ToolbarButtonSkeleton variant="icon" {...props} />
			</div>
		</div>
	);
}

export function PasswordGateSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"p-6 border-b border-border/50 bg-muted/20",
				className,
			)}
		>
			<div className="max-w-md mx-auto space-y-4">
				<Skeleton className="h-6 w-48 mx-auto rounded-md" {...props} />
				<Skeleton
					className="h-4 w-64 mx-auto rounded text-center"
					{...props}
				/>
				<div className="flex items-center justify-center gap-4">
					<Skeleton className="h-10 w-32 rounded-md" {...props} />
					<Skeleton className="h-10 w-32 rounded-md" {...props} />
				</div>
				<Skeleton
					className="h-4 w-48 mx-auto rounded text-center"
					{...props}
				/>
			</div>
		</div>
	);
}

export function EditControlsSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"p-4 border-b border-border/50 flex items-center justify-between gap-4",
				className,
			)}
		>
			<div className="flex items-center gap-2 flex-1">
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
			</div>
		</div>
	);
}

export function DisplayContentSkeleton({
	className,
	mode = "code",
	...props
}: {
	className?: string;
	mode?: "code" | "text" | "draw" | "file" | "link" | "docs";
} & React.ComponentProps<typeof Skeleton>) {
	const contentSkeletons = {
		code: () => <MonacoDisplaySkeleton className="flex-1" {...props} />,
		text: () => <MonacoDisplaySkeleton className="flex-1" {...props} />,
		draw: () => (
			<div
				className={cn(
					"flex-1 bg-muted/20 flex items-center justify-center",
					className,
				)}
			>
				<Skeleton className="w-48 h-10 rounded-md" {...props} />
			</div>
		),
		file: () => <FileDisplaySkeleton className="flex-1" {...props} />,
		link: () => <LinkDisplaySkeleton className="flex-1" {...props} />,
		docs: () => <DocsDisplaySkeleton className="flex-1" {...props} />,
	};

	return (
		<div className={cn("flex-1 overflow-auto p-4", className)}>
			{contentSkeletons[mode]()}
		</div>
	);
}

export function MonacoDisplaySkeleton({
	className,
	lines = 25,
	...props
}: {
	className?: string;
	lines?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex", className)}>
			<div className="flex-1 flex flex-col">
				<div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
					<Skeleton className="h-4 w-20 rounded" {...props} />
					<Skeleton className="h-4 w-16 rounded" {...props} />
					<Skeleton className="h-4 w-16 rounded" {...props} />
				</div>
				<div className="flex-1 p-4 space-y-1.5 overflow-auto font-mono text-sm">
					{Array.from({ length: lines }).map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-3 min-h-5"
						>
							<span className="text-muted-foreground/50 w-8 text-right select-none">
								{String(i + 1).padStart(3, "0")}
							</span>
							<Skeleton
								className={cn(
									"h-4 flex-1 rounded",
									i % 4 === 0
										? "w-1/3"
										: i % 4 === 1
											? "w-1/2"
											: i % 4 === 2
												? "w-2/3"
												: "w-3/4",
								)}
								{...props}
							/>
						</div>
					))}
				</div>
			</div>
			<div className="w-16 bg-muted/30 border-l border-border/50">
				<div className="h-full bg-linear-to-b from-transparent via-primary/10 to-transparent rounded-r-lg" />
			</div>
		</div>
	);
}

export function FileDisplaySkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex flex-col space-y-4", className)}>
			<div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card">
				<Skeleton className="h-12 w-12 rounded-lg" {...props} />
				<div className="flex-1 space-y-2 min-w-0">
					<Skeleton
						className="h-5 w-48 rounded truncate"
						{...props}
					/>
					<Skeleton className="h-4 w-32 rounded" {...props} />
				</div>
				<Skeleton className="h-9 w-24 rounded-md" {...props} />
			</div>
			<div className="flex-1 border border-border/50 rounded-xl p-4 space-y-3 overflow-auto">
				{Array.from({ length: 10 }).map((_, i) => (
					<Skeleton
						key={i}
						className={cn(
							"h-5 rounded",
							i % 3 === 0
								? "w-3/4"
								: i % 3 === 1
									? "w-full"
									: "w-1/2",
						)}
						{...props}
					/>
				))}
			</div>
		</div>
	);
}

export function LinkDisplaySkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex flex-col space-y-4", className)}>
			<div className="border border-border/50 rounded-xl p-6 space-y-4 bg-card">
				<div className="flex items-start gap-4">
					<Skeleton
						className="h-16 w-16 rounded-lg shrink-0"
						{...props}
					/>
					<div className="flex-1 space-y-2 min-w-0">
						<Skeleton className="h-6 w-64 rounded-md" {...props} />
						<Skeleton
							className="h-4 w-full rounded truncate"
							{...props}
						/>
						<Skeleton className="h-4 w-3/4 rounded" {...props} />
					</div>
				</div>
				<div className="flex items-center gap-4 pt-4 border-t border-border/50">
					<Skeleton className="h-10 w-28 rounded-md" {...props} />
					<Skeleton className="h-10 w-28 rounded-md" {...props} />
				</div>
			</div>
			<div className="border border-border/50 rounded-xl p-4 space-y-3 flex-1 overflow-auto">
				<Skeleton className="h-5 w-32 rounded-md" {...props} />
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton
						key={i}
						className={cn(
							"h-4 rounded",
							i % 3 === 0
								? "w-3/4"
								: i % 3 === 1
									? "w-full"
									: "w-1/2",
						)}
						{...props}
					/>
				))}
			</div>
		</div>
	);
}

export function DocsDisplaySkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex flex-col space-y-4", className)}>
			<div className="border border-border/50 rounded-xl p-6 space-y-4 bg-card">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<Skeleton className="h-6 w-48 rounded-md" {...props} />
						<Skeleton className="h-4 w-64 rounded" {...props} />
					</div>
					<Skeleton className="h-9 w-24 rounded-md" {...props} />
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Skeleton className="h-6 w-20 rounded-full" {...props} />
					<Skeleton className="h-6 w-24 rounded-full" {...props} />
					<Skeleton className="h-6 w-28 rounded-full" {...props} />
				</div>
			</div>
			<div className="flex-1 border border-border/50 rounded-xl p-4 space-y-3 overflow-auto prose">
				<Skeleton className="h-8 w-48 rounded-md" {...props} />
				{Array.from({ length: 12 }).map((_, i) => (
					<Skeleton
						key={i}
						className={cn(
							"h-5 rounded",
							i % 4 === 0
								? "w-full"
								: i % 4 === 1
									? "w-3/4"
									: i % 4 === 2
										? "w-5/6"
										: "w-1/2",
						)}
						{...props}
					/>
				))}
			</div>
		</div>
	);
}

export function CodeEditorViewSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex flex-col", className)}>
			<div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
				<Skeleton className="h-4 w-20 rounded" {...props} />
				<Skeleton className="h-4 w-16 rounded" {...props} />
				<Skeleton className="h-4 w-16 rounded" {...props} />
			</div>
			<div className="flex-1 p-4 space-y-1.5 overflow-auto font-mono text-sm">
				{Array.from({ length: 20 }).map((_, i) => (
					<div key={i} className="flex items-center gap-3 min-h-5">
						<span className="text-muted-foreground/50 w-8 text-right select-none">
							{String(i + 1).padStart(3, "0")}
						</span>
						<Skeleton
							className={cn(
								"h-4 flex-1 rounded",
								i % 4 === 0
									? "w-1/3"
									: i % 4 === 1
										? "w-1/2"
										: i % 4 === 2
											? "w-2/3"
											: "w-3/4",
							)}
							{...props}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
