import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

/**
 * Editor-specific skeleton components
 */

export function EditorSkeleton({
	className,
	showToolbar = true,
	showContent = true,
	showPreview = false,
	...props
}: {
	className?: string;
	showToolbar?: boolean;
	showContent?: boolean;
	showPreview?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex flex-col h-full", className)}>
			{showToolbar && <EditorToolbarSkeleton {...props} />}
			<div
				className={cn(
					"flex-1 flex",
					showPreview ? "flex-row" : "flex-col",
				)}
			>
				{showContent && <EditorContentSkeleton {...props} />}
				{showPreview && <PreviewPaneSkeleton {...props} />}
			</div>
		</div>
	);
}

export function EditorToolbarSkeleton({
	className,
	groups = 3,
	...props
}: {
	className?: string;
	groups?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 p-2 border-b border-border/50",
				className,
			)}
		>
			{Array.from({ length: groups }).map((_, i) => (
				<div key={i} className="flex items-center gap-1">
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
				</div>
			))}
		</div>
	);
}

export function EditorContentSkeleton({
	className,
	lines = 15,
	...props
}: {
	className?: string;
	lines?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex-1 flex flex-col p-4 space-y-2 overflow-auto",
				className,
			)}
		>
			{Array.from({ length: lines }).map((_, i) => (
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
	);
}

export function PreviewPaneSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"w-96 border-l border-border/50 flex flex-col",
				className,
			)}
		>
			<div className="p-4 border-b border-border/50">
				<Skeleton className="h-6 w-24 rounded-md" {...props} />
			</div>
			<div className="flex-1 p-4 space-y-3 overflow-auto">
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

export function FileUploadSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"border-2 border-dashed border-border/50 rounded-xl p-8 text-center",
				className,
			)}
		>
			<Skeleton
				className="h-12 w-12 rounded-full mx-auto mb-4"
				{...props}
			/>
			<Skeleton className="h-4 w-48 mx-auto mb-2" {...props} />
			<Skeleton className="h-4 w-32 mx-auto mb-4" {...props} />
			<Skeleton className="h-10 w-32 rounded-md mx-auto" {...props} />
		</div>
	);
}

export function LinkResultSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"border border-border/50 rounded-xl p-4 space-y-3",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<Skeleton className="h-5 w-32 rounded-md" {...props} />
				<Skeleton className="h-8 w-24 rounded-md" {...props} />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-full rounded" {...props} />
				<Skeleton className="h-4 w-3/4 rounded" {...props} />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-20 rounded-md" {...props} />
				<Skeleton className="h-8 w-20 rounded-md" {...props} />
			</div>
		</div>
	);
}

export function TiptapEditorSkeleton({
	className,
	lines = 12,
	...props
}: {
	className?: string;
	lines?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 p-4 space-y-3", className)}>
			<div className="flex items-center gap-2">
				<Skeleton className="h-6 w-24 rounded-md" {...props} />
				<Skeleton className="h-6 w-32 rounded-md" {...props} />
			</div>
			<div className="border border-border/50 rounded-lg p-4 space-y-3 min-h-50">
				{Array.from({ length: lines }).map((_, i) => (
					<Skeleton
						key={i}
						className={cn(
							"h-5 rounded",
							i % 4 === 0
								? "w-full"
								: i % 4 === 1
									? "w-3/4"
									: i % 4 === 2
										? "w-1/2"
										: "w-5/6",
						)}
						{...props}
					/>
				))}
			</div>
		</div>
	);
}

export function CollabDrawSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex flex-col", className)}>
			<div className="flex items-center justify-between p-2 border-b border-border/50">
				<Skeleton className="h-6 w-32 rounded-md" {...props} />
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
					<Skeleton className="h-8 w-8 rounded-lg" {...props} />
				</div>
			</div>
			<div className="flex-1 bg-muted/20 rounded-xl m-4 flex items-center justify-center">
				<Skeleton className="w-32 h-8 rounded-md" {...props} />
			</div>
		</div>
	);
}

export function MonacoEditorSkeleton({
	className,
	lines = 20,
	showMinimap = true,
	...props
}: {
	className?: string;
	lines?: number;
	showMinimap?: boolean;
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
			{showMinimap && (
				<div className="w-16 bg-muted/30 border-l border-border/50">
					<div className="h-full bg-linear-to-b from-transparent via-primary/10 to-transparent rounded-r-lg" />
				</div>
			)}
		</div>
	);
}

export function ResizableSplitPaneSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex-1 flex", className)}>
			<EditorContentSkeleton className="flex-1" {...props} />
			<Skeleton className="w-px h-full bg-border/50" {...props} />
			<PreviewPaneSkeleton {...props} />
		</div>
	);
}
