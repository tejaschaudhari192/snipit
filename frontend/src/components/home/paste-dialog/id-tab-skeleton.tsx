import {
	InputSkeleton,
	ButtonSkeleton,
	TextSkeleton,
} from "@/components/common/skeletons";
import { cn } from "@/utils";

interface IdTabSkeletonProps {
	rows?: number;
	className?: string;
}

export const IdTabSkeleton = ({ rows = 1, className }: IdTabSkeletonProps) => {
	return (
		<div
			className={cn(
				"w-full space-y-4 animate-in fade-in duration-500",
				className,
			)}
		>
			{/* Input & Button Skeleton */}
			<div className="flex gap-2">
				<InputSkeleton className="h-10 w-full bg-muted/40" />
				<ButtonSkeleton className="h-10 w-10 shrink-0 bg-muted/40" />
			</div>

			{/* Content Skeletons */}
			<div className="space-y-2">
				{Array.from({ length: rows }).map((_, i) => (
					<TextSkeleton
						key={i}
						className="h-4 bg-muted/20"
						style={{ width: `${Math.random() * 40 + 60}%` }}
					/>
				))}
			</div>
		</div>
	);
};

export default IdTabSkeleton;
