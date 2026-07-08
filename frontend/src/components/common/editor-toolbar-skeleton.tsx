import { cn } from "@/utils";

interface EditorToolbarSkeletonProps {
	className?: string;
}

export function EditorToolbarSkeleton({
	className,
}: EditorToolbarSkeletonProps) {
	return (
		<div
			className={cn(
				"h-10 w-full animate-pulse bg-muted/20 border-b border-border/50",
				className,
			)}
		/>
	);
}
