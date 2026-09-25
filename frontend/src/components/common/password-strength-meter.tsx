import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { CONFIG } from "@/configurations";
import {
	PasswordStrengthBars,
	PasswordStrengthBadge,
	PasswordRequirementsAlert,
	type PasswordRequirementItem,
} from "./password-strength";

export interface PasswordStrengthMeterProps {
	password?: string;
	className?: string;
	showRequirements?: boolean;
}

export function PasswordStrengthMeter({
	password = "",
	className,
	showRequirements = false,
}: PasswordStrengthMeterProps) {
	const { t } = useTranslation();
	const { score, details, feedback, requirements } =
		usePasswordStrength(password);

	const requirementItems: PasswordRequirementItem[] = [
		{
			key: "length",
			label: t("auth.requirements.min_length", {
				count: CONFIG.password.minLength,
			}),
			met: requirements.length,
		},
		{
			key: "upper",
			label: t("auth.requirements.uppercase"),
			met: requirements.upper,
		},
		{
			key: "number",
			label: t("auth.requirements.number"),
			met: requirements.number,
		},
		{
			key: "special",
			label: t("auth.requirements.special"),
			met: requirements.special,
		},
	];

	return (
		<div
			className={cn(
				"w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-300",
				className,
			)}
		>
			<PasswordStrengthBars
				score={score}
				details={details}
				hasPassword={!!password}
			/>

			{password && (
				<PasswordStrengthBadge
					details={details}
					warning={feedback?.warning}
				/>
			)}

			{(showRequirements || password) && (
				<PasswordRequirementsAlert requirements={requirementItems} />
			)}
		</div>
	);
}

export default PasswordStrengthMeter;
