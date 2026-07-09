import { cn } from "@/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CardShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"group block glass-card p-5 space-y-5 transition-all duration-300",
			className,
		)}
	>
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-6 w-20 rounded-md" />
				<Skeleton className="h-4 w-14 rounded-sm" />
			</div>
			<div className="flex items-center gap-3">
				<Skeleton className="h-4 w-24 rounded-sm" />
			</div>
		</div>
		<div className="bg-muted/30 rounded-lg p-4 border border-border/20 space-y-2">
			<Skeleton className="h-3.5 w-[90%]" />
			<Skeleton className="h-3.5 w-[70%]" />
		</div>
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Skeleton className="h-5 w-16 rounded-md" />
				<Skeleton className="h-5 w-20 rounded-md" />
			</div>
			<Skeleton className="h-4 w-10 rounded-sm" />
		</div>
	</div>
);

const EditorShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex-1 p-6 space-y-6 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/20 shadow-sm ring-1 ring-border/5 min-h-125",
			className,
		)}
	>
		<div className="space-y-4 py-4">
			{[...Array(15)].map((_, i) => (
				<Skeleton
					key={i}
					className={cn(
						"h-3.5",
						i % 2 === 0
							? "w-full"
							: i % 3 === 0
								? "w-[85%]"
								: "w-[95%]",
					)}
				/>
			))}
		</div>
	</div>
);

const ToolbarShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex flex-row items-center justify-between gap-4 px-4 py-1.5 md:px-6 bg-background/40 backdrop-blur-xl border-b border-border/50 w-full overflow-x-auto no-scrollbar select-none transition-all duration-300",
			className,
		)}
	>
		{/* Left actions & Language Selector Row */}
		<div className="flex items-center gap-2 justify-start shrink-0">
			<Skeleton className="h-9 w-16 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-24 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-28 rounded-lg shrink-0 hidden sm:block" />
			<div className="w-px h-6 bg-border/20 mx-1 hidden sm:block" />
			<Skeleton className="h-9 w-32 rounded-lg shrink-0" />
		</div>

		{/* Right options Row */}
		<div className="flex items-center justify-end gap-2.5 shrink-0">
			<Skeleton className="h-9 w-24 rounded-lg shrink-0" />
			<Skeleton className="h-8 w-16 rounded-full shrink-0" />
			<Skeleton className="h-9 w-28 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-32 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
			<Skeleton className="h-9 w-16 rounded-lg shrink-0" />
		</div>
	</div>
);

const MetadataShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex items-center gap-4 py-3 px-6 bg-muted/30 dark:bg-muted/10 border-y border-border/20 transition-all duration-300",
			className,
		)}
	>
		<Skeleton className="h-4 w-32 rounded-sm" />
		<div className="w-px h-3 bg-border/40 hidden sm:block" />
		<Skeleton className="h-4 w-40 rounded-sm" />
		<div className="w-px h-3 bg-border/40 hidden sm:block" />
		<Skeleton className="h-4 w-20 rounded-sm" />
	</div>
);

interface ShimmerSectionProps {
	type?:
		| "card"
		| "text"
		| "editor"
		| "toolbar"
		| "button"
		| "loader"
		| "mini-loader"
		| "metadata";
	className?: string;
	lines?: number;
}

export const ShimmerSection = ({
	type = "text",
	className,
	lines = 3,
}: ShimmerSectionProps) => {
	switch (type) {
		case "card":
			return <CardShimmer className={className} />;
		case "editor":
			return <EditorShimmer className={className} />;
		case "toolbar":
			return <ToolbarShimmer className={className} />;
		case "metadata":
			return <MetadataShimmer className={className} />;
		case "button":
			return (
				<Skeleton className={cn("h-10 w-32 rounded-lg", className)} />
			);
		case "loader":
			return (
				<div
					className={cn(
						"flex items-center justify-center p-4",
						className,
					)}
				>
					<Loader2 className="animate-spin text-primary h-10 w-10" />
				</div>
			);
		case "mini-loader":
			return (
				<Loader2
					className={cn(
						"animate-spin text-current h-4 w-4",
						className,
					)}
				/>
			);
		case "text":
		default:
			return (
				<div className={cn("space-y-2.5 w-full", className)}>
					{[...Array(lines)].map((_, i) => (
						<Skeleton
							key={i}
							className={cn(
								"h-3.5",
								i === lines - 1 && lines > 1
									? "w-[60%]"
									: "w-full",
							)}
						/>
					))}
				</div>
			);
	}
};
