import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

interface SkeletonProps {
	className?: string;
	width?: string | number;
	height?: string | number;
	rounded?: string;
}

const Skeleton = ({
	className,
	width,
	height,
	rounded = "rounded-md",
}: SkeletonProps) => {
	const style: React.CSSProperties = {
		width: typeof width === "number" ? `${width}px` : width,
		height: typeof height === "number" ? `${height}px` : height,
	};

	return <div className={cn("skeleton", rounded, className)} style={style} />;
};

const CardShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"group block glass-card p-5 space-y-5 transition-all duration-300",
			className,
		)}
	>
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<Skeleton height={24} width={80} rounded="rounded-md" />
				<Skeleton height={16} width={60} rounded="rounded-sm" />
			</div>
			<div className="flex items-center gap-3">
				<Skeleton height={16} width={100} rounded="rounded-sm" />
			</div>
		</div>
		<div className="bg-muted/30 rounded-lg p-4 border border-border/20 space-y-2">
			<Skeleton height={14} width="90%" />
			<Skeleton height={14} width="70%" />
		</div>
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Skeleton height={20} width={70} rounded="rounded-md" />
				<Skeleton height={20} width={80} rounded="rounded-md" />
			</div>
			<Skeleton height={16} width={40} rounded="rounded-sm" />
		</div>
	</div>
);

const EditorShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex-1 p-6 space-y-6 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/20 shadow-sm ring-1 ring-border/5 min-h-[500px]",
			className,
		)}
	>
		<div className="flex items-center gap-2 border-b pb-4 border-border/20">
			{[...Array(6)].map((_, i) => (
				<Skeleton key={i} height={32} width={32} rounded="rounded-lg" />
			))}
			<div className="flex-1" />
			<Skeleton height={32} width={100} rounded="rounded-lg" />
		</div>
		<div className="space-y-4 py-4">
			{[...Array(15)].map((_, i) => (
				<Skeleton
					key={i}
					height={14}
					width={i % 2 === 0 ? "100%" : i % 3 === 0 ? "85%" : "95%"}
				/>
			))}
		</div>
	</div>
);

const ToolbarShimmer = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex items-center justify-between gap-4 p-2.5 px-4 rounded-2xl bg-muted/60 dark:bg-muted/20 border border-border/30 dark:border-border/20 shadow-sm transition-all duration-300",
			className,
		)}
	>
		<div className="flex items-center gap-2">
			<Skeleton height={36} width={100} rounded="rounded-lg" />
			<Skeleton
				height={36}
				width={80}
				rounded="rounded-lg"
				className="hidden sm:block"
			/>
			<Skeleton
				height={36}
				width={80}
				rounded="rounded-lg"
				className="hidden sm:block"
			/>
		</div>
		<div className="flex items-center gap-2">
			<Skeleton height={36} width={120} rounded="rounded-lg" />
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
		<Skeleton height={18} width={120} rounded="rounded-sm" />
		<div className="w-px h-3 bg-border/40 hidden sm:block" />
		<Skeleton height={18} width={150} rounded="rounded-sm" />
		<div className="w-px h-3 bg-border/40 hidden sm:block" />
		<Skeleton height={18} width={80} rounded="rounded-sm" />
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
				<Skeleton
					height={40}
					width={120}
					rounded="rounded-lg"
					className={className}
				/>
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
							height={14}
							width={
								i === lines - 1 && lines > 1 ? "60%" : "100%"
							}
						/>
					))}
				</div>
			);
	}
};
