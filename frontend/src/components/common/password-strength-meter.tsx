import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { usePasswordStrength } from "@/hooks/use-password-strength";

interface PasswordStrengthMeterProps {
	password?: string;
	className?: string;
}

export function PasswordStrengthMeter({
	password = "",
	className,
}: PasswordStrengthMeterProps) {
	const { t } = useTranslation();
	const { score, details, feedback } = usePasswordStrength(password);

	const Icon = details.icon;

	return (
		<div
			className={cn(
				"w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-300",
				className,
			)}
		>
			<div className="flex gap-1.5 h-1.5 w-full">
				{[0, 1, 2, 3].map((index) => {
					let isActive = false;
					if (password) {
						if (score === 0 && index === 0) isActive = true;
						else if (score > 0 && index < score) isActive = true;
					}

					return (
						<div
							key={index}
							className={cn(
								"h-full flex-1 rounded-full transition-all duration-500",
								isActive ? details.color : "bg-muted/50",
							)}
						/>
					);
				})}
			</div>
			{password && (
				<div className="flex items-center justify-between px-1">
					<div
						className={cn(
							"flex items-center gap-1.5 text-[12px] font-bold tracking-wide transition-colors duration-300",
							details.textColor,
						)}
					>
						<Icon className="w-3.5 h-3.5" />
						<span>{t(details.label)}</span>
					</div>
					{feedback?.warning && (
						<span className="text-[11px] font-medium text-muted-foreground/80 italic max-w-[60%] truncate text-right">
							{feedback.warning}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
