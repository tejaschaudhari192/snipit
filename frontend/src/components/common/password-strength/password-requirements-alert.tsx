import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { AlertCircleIcon, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface PasswordRequirementItem {
	key: string;
	label: string;
	met: boolean;
}

interface PasswordRequirementsAlertProps {
	requirements: PasswordRequirementItem[];
	className?: string;
}

export function PasswordRequirementsAlert({
	requirements,
	className,
}: PasswordRequirementsAlertProps) {
	const { t } = useTranslation();
	const allRequirementsMet = requirements.every((item) => item.met);

	return (
		<Alert
			variant={allRequirementsMet ? "default" : "destructive"}
			className={className}
		>
			{allRequirementsMet ? (
				<CheckCircle2 className="size-4" />
			) : (
				<AlertCircleIcon className="size-4" />
			)}
			<AlertTitle>
				{allRequirementsMet
					? t("auth.requirements.all_met")
					: t("auth.reset_password_weak_toast")}
			</AlertTitle>
			<AlertDescription>
				<ul className="list-inside list-disc text-sm">
					{requirements.map((item) => (
						<li
							key={item.key}
							className={cn(
								"transition-colors duration-200",
								item.met && "text-teal-400!",
							)}
						>
							{item.label}
						</li>
					))}
				</ul>
			</AlertDescription>
		</Alert>
	);
}

export default PasswordRequirementsAlert;
