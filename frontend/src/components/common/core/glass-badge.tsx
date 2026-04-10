import { cn } from "@/lib/utils";

interface BadgeProps {
	children: React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
	variant?: "glass" | "solid" | "outline";
	size?: "xs" | "sm" | "md";
	rounded?: "sm" | "md" | "lg" | "full";
}

export const GlassBadge = ({
	children,
	icon,
	className,
	variant = "glass",
	size = "sm",
	rounded = "full",
}: BadgeProps) => {
	const variants = {
		glass: "bg-background/50 backdrop-blur-md border-border/50 shadow-sm",
		solid: "bg-primary text-primary-foreground border-transparent",
		outline: "bg-transparent border-border hover:bg-muted/50",
	};

	const sizes = {
		xs: "px-2 py-0.5 text-[9px] gap-1",
		sm: "px-3 py-1.5 text-[10px] gap-1.5",
		md: "px-4 py-2 text-xs gap-2",
	};

	const roundness = {
		sm: "rounded-sm",
		md: "rounded-md",
		lg: "rounded-lg",
		full: "rounded-full",
	};

	return (
		<div
			className={cn(
				"flex items-center border font-bold transition-all duration-300 shrink-0",
				variants[variant],
				sizes[size],
				roundness[rounded],
				className,
			)}
		>
			{icon && (
				<div className="relative flex items-center justify-center shrink-0">
					{icon}
				</div>
			)}
			<span className="truncate">{children}</span>
		</div>
	);
};
