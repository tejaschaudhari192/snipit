import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

/**
 * Sidebar-specific skeleton components
 */

export function SidebarSkeleton({
	className,
	showHeader = true,
	showSearch = true,
	showSections = 3,
	itemsPerSection = 4,
	showFooter = true,
	...props
}: {
	className?: string;
	showHeader?: boolean;
	showSearch?: boolean;
	showSections?: number;
	itemsPerSection?: number;
	showFooter?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex flex-col h-full border-r border-border/50 bg-card",
				className,
			)}
		>
			{showHeader && <SidebarHeaderSkeleton {...props} />}
			{showSearch && <SidebarSearchSkeleton {...props} />}
			<div className="flex-1 overflow-y-auto p-2 space-y-4">
				{Array.from({ length: showSections }).map((_, sectionIndex) => (
					<SidebarSectionSkeleton
						key={sectionIndex}
						items={itemsPerSection}
						{...props}
					/>
				))}
			</div>
			{showFooter && <SidebarFooterSkeleton {...props} />}
		</div>
	);
}

export function SidebarHeaderSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("p-4 border-b border-border/50", className)}>
			<div className="flex items-center justify-between">
				<Skeleton className="h-6 w-32 rounded-md" {...props} />
				<Skeleton className="h-8 w-8 rounded-lg" {...props} />
			</div>
		</div>
	);
}

export function SidebarSearchSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("p-4 border-b border-border/50", className)}>
			<Skeleton className="h-9 w-full rounded-md" {...props} />
		</div>
	);
}

export function SidebarSectionSkeleton({
	className,
	items = 4,
	showTitle = true,
	...props
}: {
	className?: string;
	items?: number;
	showTitle?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("space-y-2", className)}>
			{showTitle && (
				<Skeleton
					className="h-4 w-24 rounded-md px-2 text-muted-foreground"
					{...props}
				/>
			)}
			{Array.from({ length: items }).map((_, i) => (
				<SidebarItemSkeleton key={i} {...props} />
			))}
		</div>
	);
}

export function SidebarItemSkeleton({
	className,
	showIcon = true,
	showBadge = false,
	...props
}: {
	className?: string;
	showIcon?: boolean;
	showBadge?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors",
				className,
			)}
		>
			{showIcon && <Skeleton className="h-5 w-5 rounded" {...props} />}
			<Skeleton className="h-4 w-28 flex-1 rounded truncate" {...props} />
			{showBadge && (
				<Skeleton className="h-4 w-8 rounded-full" {...props} />
			)}
		</div>
	);
}

export function SidebarFooterSkeleton({
	className,
	...props
}: React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("p-4 border-t border-border/50", className)}>
			<div className="flex items-center gap-3">
				<Skeleton className="h-8 w-8 rounded-full" {...props} />
				<div className="flex-1 space-y-1 min-w-0">
					<Skeleton
						className="h-4 w-24 rounded truncate"
						{...props}
					/>
					<Skeleton
						className="h-3 w-16 rounded text-muted-foreground"
						{...props}
					/>
				</div>
			</div>
		</div>
	);
}

export function SidebarMenuSkeleton({
	className,
	sections = 2,
	itemsPerSection = 3,
	...props
}: {
	className?: string;
	sections?: number;
	itemsPerSection?: number;
} & React.ComponentProps<typeof Skeleton>) {
	return (
		<div className={cn("space-y-4", className)}>
			{Array.from({ length: sections }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="space-y-2">
					<Skeleton
						className="h-4 w-20 rounded-md px-2 text-muted-foreground"
						{...props}
					/>
					{Array.from({ length: itemsPerSection }).map((_, i) => (
						<SidebarItemSkeleton
							key={i}
							showIcon={true}
							showBadge={i === 0}
							{...props}
						/>
					))}
				</div>
			))}
		</div>
	);
}

export function CollapsibleSidebarSkeleton({
	className,
	isCollapsed = false,
	...props
}: {
	className?: string;
	isCollapsed?: boolean;
} & React.ComponentProps<typeof Skeleton>) {
	if (isCollapsed) {
		return (
			<div
				className={cn(
					"w-14 border-r border-border/50 bg-card flex flex-col",
					className,
				)}
			>
				<div className="p-2 border-b border-border/50">
					<Skeleton
						className="h-8 w-8 rounded-lg mx-auto"
						{...props}
					/>
				</div>
				<div className="flex-1 p-2 space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-8 w-8 rounded-lg mx-auto"
							{...props}
						/>
					))}
				</div>
				<div className="p-2 border-t border-border/50">
					<Skeleton
						className="h-8 w-8 rounded-full mx-auto"
						{...props}
					/>
				</div>
			</div>
		);
	}

	return <SidebarSkeleton className={cn("w-72", className)} {...props} />;
}
