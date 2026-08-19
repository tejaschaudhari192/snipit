import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

/**
 * Toolbar-specific skeleton components
 */

export function ToolbarSkeleton({
	className,
	showTitle = true,
	showActions = true,
	showSearch = false,
	...props
}: {
	className?: string;
	showTitle?: boolean;
	showActions?: boolean;
	showSearch?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center justify-between p-4", className)}>
			{showTitle && (
				<Skeleton className="h-6 w-48 rounded-md" {...props} />
			)}
			<div className="flex items-center gap-2">
				{showSearch && (
					<Skeleton className="h-9 w-64 rounded-md" {...props} />
				)}
				{showActions && (
					<>
						<Skeleton className="h-9 w-9 rounded-md" {...props} />
						<Skeleton className="h-9 w-9 rounded-md" {...props} />
						<Skeleton className="h-9 w-9 rounded-md" {...props} />
					</>
				)}
			</div>
		</div>
	);
}

export function ToolbarButtonSkeleton({
	className,
	variant = "default",
	...props
}: {
	className?: string;
	variant?: "default" | "outline" | "ghost" | "icon";
} & React.ComponentProps<typeof Skeleton>) {
	const variantClasses = {
		default: "h-9 px-4",
		outline: "h-9 px-4",
		ghost: "h-9 px-4",
		icon: "h-9 w-9",
	};
	return (
		<Skeleton
			className={cn("rounded-md", variantClasses[variant], className)}
			{...props}
		/>
	);
}

export function ToolbarSelectorSkeleton({
	className,
	width = "w-40",
	...props
}: {
	className?: string;
	width?: string;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton
			className={cn("h-9 rounded-md", width, className)}
			{...props}
		/>
	);
}

export function ToolbarGroupSkeleton({
	className,
	buttons = 3,
	showDivider = true,
	...props
}: {
	className?: string;
	buttons?: number;
	showDivider?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-1", className)}>
			{Array.from({ length: buttons }).map((_, i) => (
				<ToolbarButtonSkeleton key={i} variant="ghost" {...props} />
			))}
			{showDivider && (
				<Skeleton className="w-px h-6 bg-border mx-1" {...props} />
			)}
		</div>
	);
}

export function ToolbarSectionSkeleton({
	className,
	groups = 2,
	...props
}: {
	className?: string;
	groups?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			{Array.from({ length: groups }).map((_, i) => (
				<ToolbarGroupSkeleton key={i} buttons={3} {...props} />
			))}
		</div>
	);
}

export function MainToolbarSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"h-16 w-full animate-pulse bg-muted/20 border-b border-border/50 rounded-xl",
				className,
			)}
			{...props}
		/>
	);
}

export function LanguageSelectorSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Skeleton className="w-24 h-9 rounded-lg" {...props} />
			<Skeleton className="w-9 h-9 rounded-lg" {...props} />
		</div>
	);
}

export function AiButtonSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton
			className={cn("h-9 w-24 rounded-lg shrink-0", className)}
			{...props}
		/>
	);
}

export function WriterToolbarSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Skeleton className="h-9 w-9 rounded-lg" {...props} />
			<Skeleton className="h-9 w-32 rounded-lg" {...props} />
			<div className="w-px h-6 bg-border/20 mx-1" {...props} />
			<Skeleton className="h-9 w-9 rounded-lg" {...props} />
			<Skeleton className="h-9 w-20 rounded-lg" {...props} />
		</div>
	);
}
