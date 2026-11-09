import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	trend?: {
		label: string;
		isPositive?: boolean;
	};
	badge?: {
		text: string;
		variant: "default" | "success" | "warning" | "destructive" | "info";
	};
	onClick?: () => void;
	className?: string;
	progressValue?: number; // 0 - 100 for a subtle bottom progress indicator
	progressColor?: string;
}

const BADGE_STYLES = {
	default: "bg-muted text-muted-foreground border-border",
	success:
		"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
	warning:
		"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
	destructive:
		"bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
	info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

export function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	badge,
	onClick,
	className,
	progressValue,
	progressColor = "bg-primary",
}: MetricCardProps) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"relative group flex flex-col justify-between p-5 rounded-2xl bg-card border border-border/70 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden",
				onClick &&
					"cursor-pointer hover:border-primary/40 active:scale-[0.99]",
				className,
			)}
		>
			{/* Top Bar: Title & Icon */}
			<div className="flex items-center justify-between gap-3 mb-2">
				<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					{title}
				</span>
				<div className="w-8 h-8 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
					<Icon className="w-4 h-4" />
				</div>
			</div>

			{/* Center Value */}
			<div className="my-1">
				<div className="flex items-baseline gap-2.5">
					<span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						{value}
					</span>
					{badge && (
						<span
							className={cn(
								"text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
								BADGE_STYLES[badge.variant],
							)}
						>
							{badge.text}
						</span>
					)}
				</div>

				{subtitle && (
					<p className="text-xs text-muted-foreground mt-1 truncate">
						{subtitle}
					</p>
				)}
			</div>

			{/* Footer / Trend */}
			{trend && (
				<div className="mt-3 pt-2.5 border-t border-border/50 flex items-center text-xs">
					<span
						className={cn(
							"font-medium",
							trend.isPositive
								? "text-emerald-600 dark:text-emerald-400"
								: "text-muted-foreground",
						)}
					>
						{trend.label}
					</span>
				</div>
			)}

			{/* Subtle Bottom Accent Indicator */}
			{progressValue !== undefined && (
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/40">
					<div
						className={cn(
							"h-full transition-all duration-500",
							progressColor,
						)}
						style={{
							width: `${Math.min(100, Math.max(0, progressValue))}%`,
						}}
					/>
				</div>
			)}
		</div>
	);
}
