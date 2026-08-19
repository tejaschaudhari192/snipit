import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

/**
 * Dialog-specific skeleton components
 */

export function DialogSkeleton({
	className,
	size = "md",
	showHeader = true,
	showContent = true,
	showFooter = true,
	...props
}: {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	showHeader?: boolean;
	showContent?: boolean;
	showFooter?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		full: "max-w-4xl",
	};

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center",
				className,
			)}
		>
			<div className="fixed inset-0 bg-black/50 animate-in fade-in" />
			<div
				className={cn(
					"relative w-full mx-4 bg-background rounded-xl shadow-xl animate-in zoom-in-95 fade-in",
					sizeClasses[size],
				)}
			>
				{showHeader && <DialogHeaderSkeleton {...props} />}
				{showContent && <DialogContentSkeleton {...props} />}
				{showFooter && <DialogFooterSkeleton {...props} />}
			</div>
		</div>
	);
}

export function DialogHeaderSkeleton({
	className,
	showTitle = true,
	showDescription = true,
	showClose = true,
	...props
}: {
	className?: string;
	showTitle?: boolean;
	showDescription?: boolean;
	showClose?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex items-start justify-between p-6 border-b border-border/50",
				className,
			)}
		>
			<div className="space-y-1">
				{showTitle && (
					<Skeleton className="h-6 w-48 rounded-md" {...props} />
				)}
				{showDescription && (
					<Skeleton className="h-4 w-64 rounded-md" {...props} />
				)}
			</div>
			{showClose && (
				<Skeleton className="h-8 w-8 rounded-lg shrink-0" {...props} />
			)}
		</div>
	);
}

export function DialogContentSkeleton({
	className,
	type = "default",
	...props
}: {
	className?: string;
	type?: "default" | "form" | "list" | "confirm" | "editor" | "tabs";
} & React.ComponentProps<typeof Skeleton>) {
	const contentTypes = {
		default: () => (
			<div className={cn("p-6 space-y-4", className)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton
						key={i}
						className="h-4 w-full rounded"
						{...props}
					/>
				))}
			</div>
		),
		form: () => (
			<div className={cn("p-6 space-y-4", className)}>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="space-y-1">
						<Skeleton className="h-4 w-24 rounded" {...props} />
						<Skeleton
							className="h-9 w-full rounded-md"
							{...props}
						/>
					</div>
				))}
				<div className="flex justify-end gap-2 pt-4">
					<Skeleton className="h-9 w-20 rounded-md" {...props} />
					<Skeleton className="h-9 w-20 rounded-md" {...props} />
				</div>
			</div>
		),
		list: () => (
			<div className={cn("p-6 max-h-96 overflow-y-auto", className)}>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
					>
						<Skeleton className="h-8 w-8 rounded" {...props} />
						<div className="flex-1 space-y-1 min-w-0">
							<Skeleton
								className="h-4 w-32 rounded truncate"
								{...props}
							/>
							<Skeleton
								className="h-3 w-20 rounded text-muted-foreground"
								{...props}
							/>
						</div>
					</div>
				))}
			</div>
		),
		confirm: () => (
			<div className={cn("p-6 space-y-6 text-center", className)}>
				<Skeleton
					className="h-12 w-12 rounded-full mx-auto"
					{...props}
				/>
				<div className="space-y-2">
					<Skeleton
						className="h-6 w-48 mx-auto rounded-md"
						{...props}
					/>
					<Skeleton className="h-4 w-64 mx-auto rounded" {...props} />
				</div>
				<div className="flex justify-center gap-3">
					<Skeleton className="h-9 w-20 rounded-md" {...props} />
					<Skeleton className="h-9 w-20 rounded-md" {...props} />
				</div>
			</div>
		),
		editor: () => (
			<div className={cn("p-6 space-y-4", className)}>
				<div className="flex items-center gap-2">
					<Skeleton className="h-6 w-24 rounded-md" {...props} />
					<Skeleton className="h-6 w-32 rounded-md" {...props} />
				</div>
				<div className="border border-border/50 rounded-lg p-4 space-y-3 min-h-50">
					{Array.from({ length: 10 }).map((_, i) => (
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
		),
		tabs: () => (
			<div className={cn("p-6", className)}>
				<div className="flex gap-1 mb-4 border-b border-border/50">
					<Skeleton className="h-9 w-24 rounded-t-md" {...props} />
					<Skeleton className="h-9 w-24 rounded-t-md" {...props} />
					<Skeleton className="h-9 w-24 rounded-t-md" {...props} />
				</div>
				<div className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-4 w-full rounded"
							{...props}
						/>
					))}
				</div>
			</div>
		),
	};

	return contentTypes[type]();
}

export function DialogFooterSkeleton({
	className,
	actions = 2,
	alignment = "end",
	...props
}: {
	className?: string;
	actions?: number;
	alignment?: "start" | "center" | "end";
} & React.ComponentProps<typeof Skeleton>) {
	const alignmentClasses = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
	};

	return (
		<div
			className={cn(
				"flex items-center gap-2 p-4 border-t border-border/50",
				alignmentClasses[alignment],
				className,
			)}
		>
			{Array.from({ length: actions }).map((_, i) => (
				<Skeleton key={i} className="h-9 w-20 rounded-md" {...props} />
			))}
		</div>
	);
}

export function AlertDialogSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return <DialogSkeleton size="sm" className={className} {...props} />;
}

export function SheetSkeleton({
	className,
	side = "right",
	showHeader = true,
	showContent = true,
	showFooter = false,
	...props
}: {
	className?: string;
	side?: "left" | "right" | "top" | "bottom";
	showHeader?: boolean;
	showContent?: boolean;
	showFooter?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	const sideClasses = {
		left: "left-0 h-full w-96",
		right: "right-0 h-full w-96",
		top: "top-0 w-full h-96",
		bottom: "bottom-0 w-full h-96",
	};

	return (
		<div className={cn("fixed inset-0 z-50 flex", className)}>
			<div className="fixed inset-0 bg-black/50 animate-in fade-in" />
			<div
				className={cn(
					"relative bg-background shadow-xl animate-in slide-in-from-right",
					sideClasses[side],
				)}
			>
				{showHeader && <DialogHeaderSkeleton {...props} />}
				{showContent && (
					<DialogContentSkeleton type="default" {...props} />
				)}
				{showFooter && <DialogFooterSkeleton {...props} />}
			</div>
		</div>
	);
}

export function PopoverSkeleton({
	className,
	align = "center",
	...props
}: {
	className?: string;
	align?: "start" | "center" | "end";
} & React.ComponentProps<typeof Skeleton>) {
	const alignClasses = {
		start: "left-0",
		center: "left-1/2 -translate-x-1/2",
		end: "right-0",
	};

	return (
		<div
			className={cn(
				"fixed z-50 w-72 animate-in fade-in zoom-in-95",
				alignClasses[align],
				className,
			)}
		>
			<div className="bg-popover border border-border rounded-xl shadow-lg p-4 space-y-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
					>
						<Skeleton className="h-5 w-5 rounded" {...props} />
						<Skeleton
							className="h-4 w-24 rounded truncate"
							{...props}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export function IdTabSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center gap-2">
				<Skeleton className="h-6 w-24 rounded-md" {...props} />
				<Skeleton className="h-6 w-24 rounded-md" {...props} />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-9 w-full rounded-md" {...props} />
				<Skeleton className="h-9 w-full rounded-md" {...props} />
			</div>
			<div className="flex justify-end gap-2">
				<Skeleton className="h-9 w-20 rounded-md" {...props} />
				<Skeleton className="h-9 w-20 rounded-md" {...props} />
			</div>
		</div>
	);
}

export function PasteDialogSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return <DialogSkeleton size="lg" className={className} {...props} />;
}

export function ShareDialogSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return <DialogSkeleton size="md" className={className} {...props} />;
}

export function SettingsDialogSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return <DialogSkeleton size="xl" className={className} {...props} />;
}

export function ConfirmDeleteSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return <AlertDialogSkeleton className={className} {...props} />;
}
