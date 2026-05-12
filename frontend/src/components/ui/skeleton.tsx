import { cn } from "@/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("skeleton rounded-md", className)} {...props} />;
}

export { Skeleton };
