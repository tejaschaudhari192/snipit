import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

/**
 * Basic reusable skeleton components for common UI patterns
 */

export function TextSkeleton({
	className,
	lines = 1,
	...props
}: {
	className?: string;
	lines?: number;
	width?: string | number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton key={i} className="h-4 rounded" {...props} />
			))}
		</div>
	);
}

export function CardSkeleton({
	className,
	showImage = true,
	showTitle = true,
	showDescription = true,
	showFooter = false,
	...props
}: {
	className?: string;
	showImage?: boolean;
	showTitle?: boolean;
	showDescription?: boolean;
	showFooter?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex flex-col space-y-4 p-4 border border-border rounded-xl bg-card",
				className,
			)}
		>
			{showImage && (
				<Skeleton
					className="aspect-video w-full rounded-lg"
					{...props}
				/>
			)}
			{showTitle && <Skeleton className="h-6 w-3/4 rounded" {...props} />}
			{showDescription && (
				<Skeleton className="h-4 w-full rounded" {...props} />
			)}
			{showFooter && (
				<div className="flex items-center justify-end gap-2 pt-2">
					<Skeleton className="h-8 w-20 rounded-md" {...props} />
					<Skeleton className="h-8 w-20 rounded-md" {...props} />
				</div>
			)}
		</div>
	);
}

export function AvatarSkeleton({
	className,
	size = "md",
	...props
}: {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
} & React.ComponentProps<typeof Skeleton>) {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-10 h-10",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};
	return (
		<Skeleton
			className={cn("rounded-full", sizeClasses[size], className)}
			{...props}
		/>
	);
}

export function ButtonSkeleton({
	className,
	size = "md",
	...props
}: {
	className?: string;
	size?: "sm" | "md" | "lg" | "icon";
} & React.ComponentProps<typeof Skeleton>) {
	const sizeClasses = {
		sm: "h-8 px-3",
		md: "h-9 px-4",
		lg: "h-10 px-6",
		icon: "h-9 w-9",
	};
	return (
		<Skeleton
			className={cn("rounded-md", sizeClasses[size], className)}
			{...props}
		/>
	);
}

export function InputSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton
			className={cn("h-9 w-full rounded-md", className)}
			{...props}
		/>
	);
}

export function SelectSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton className={cn("h-9 w-40 rounded-md", className)} {...props} />
	);
}

export function BadgeSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton
			className={cn("h-5 w-16 rounded-full", className)}
			{...props}
		/>
	);
}

export function TableRowSkeleton({
	className,
	columns = 4,
	...props
}: {
	className?: string;
	columns?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-4", className)}>
			{Array.from({ length: columns }).map((_, i) => (
				<Skeleton key={i} className="h-4 flex-1 rounded" {...props} />
			))}
		</div>
	);
}

export function ListItemSkeleton({
	className,
	showAvatar = true,
	showTitle = true,
	showDescription = false,
	...props
}: {
	className?: string;
	showAvatar?: boolean;
	showTitle?: boolean;
	showDescription?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("flex items-center gap-3 p-2", className)}>
			{showAvatar && <AvatarSkeleton size="md" {...props} />}
			<div className="flex-1 space-y-1 min-w-0">
				{showTitle && (
					<Skeleton className="h-4 w-3/4 rounded" {...props} />
				)}
				{showDescription && (
					<Skeleton className="h-3 w-1/2 rounded" {...props} />
				)}
			</div>
		</div>
	);
}

export function DividerSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<Skeleton
			className={cn("h-px w-full bg-border", className)}
			{...props}
		/>
	);
}

export function SpinnerSkeleton({
	className,
	size = "md",
	...props
}: {
	className?: string;
	size?: "sm" | "md" | "lg";
} & React.ComponentProps<typeof Skeleton>) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};
	return (
		<Skeleton
			className={cn(
				"rounded-full animate-pulse",
				sizeClasses[size],
				className,
			)}
			{...props}
		/>
	);
}
