import { GlassBadge } from "@/components/common/core/glass-badge";
import { cn } from "@/utils";

interface StatusBadgeProps {
	icon: React.ReactNode;
	label: React.ReactNode;
	className?: string;
	labelClassName?: string;
}

export const StatusBadge = ({
	icon,
	label,
	className,
	labelClassName,
}: StatusBadgeProps) => (
	<GlassBadge icon={icon} className={className}>
		<span className={cn("hidden sm:inline", labelClassName)}>{label}</span>
	</GlassBadge>
);
