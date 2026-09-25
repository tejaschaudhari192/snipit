import { useTranslation } from "react-i18next";
import { cn } from "cn";
import type { PasswordStrengthDetails } from "@/hooks/use-password-strength";

interface PasswordStrengthBadgeProps {
	details: PasswordStrengthDetails;
	warning?: string;
	className?: string;
}

export function PasswordStrengthBadge({
	details,
	warning,
	className,
}: PasswordStrengthBadgeProps) {
	const { t } = useTranslation();
	const Icon = details.icon;

	return (
		<div
			className={cn("flex items-center justify-between px-1", className)}
		>
			<div
				className={cn(
					"flex items-center gap-1.5 text-[12px] font-bold tracking-wide transition-colors duration-300",
					details.textColor,
				)}
			>
				<Icon className="w-3.5 h-3.5" />
				<span>{t(details.label)}</span>
			</div>
			{warning && (
				<span className="text-[11px] font-medium text-muted-foreground/80 italic max-w-[60%] truncate text-right">
					{warning}
				</span>
			)}
		</div>
	);
}

export default PasswordStrengthBadge;
