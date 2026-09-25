import { cn } from "cn";
import type { PasswordStrengthDetails } from "@/hooks/use-password-strength";

interface PasswordStrengthBarsProps {
	score: number;
	details: PasswordStrengthDetails;
	hasPassword: boolean;
	className?: string;
}

export function PasswordStrengthBars({
	score,
	details,
	hasPassword,
	className,
}: PasswordStrengthBarsProps) {
	return (
		<div className={cn("flex gap-1.5 h-1.5 w-full", className)}>
			{[0, 1, 2, 3].map((index) => {
				let isActive = false;
				if (hasPassword) {
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
	);
}

export default PasswordStrengthBars;
