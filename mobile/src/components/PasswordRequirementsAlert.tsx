import React, { useMemo } from "react";
import { View } from "react-native";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Text } from "./ui/text";

export interface PasswordRequirements {
	length: boolean;
	upper: boolean;
	number: boolean;
	special: boolean;
}

export interface PasswordRequirementItem {
	key: string;
	label: string;
	met: boolean;
}

export function evaluatePasswordRequirements(password: string) {
	const requirements: PasswordRequirements = {
		length: password.length >= 8,
		upper: /[A-Z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[^A-Za-z0-9]/.test(password),
	};

	let score = 0;
	if (requirements.length) score += 1;
	if (requirements.upper) score += 1;
	if (requirements.number) score += 1;
	if (requirements.special) score += 1;

	const allMet =
		requirements.length &&
		requirements.upper &&
		requirements.number &&
		requirements.special;

	return {
		score,
		requirements,
		allMet,
	};
}

export function PasswordRequirementsAlert({
	password = "",
	className,
}: {
	password?: string;
	className?: string;
}) {
	const { requirements, allMet } = useMemo(
		() => evaluatePasswordRequirements(password),
		[password],
	);

	const requirementItems: PasswordRequirementItem[] = [
		{
			key: "length",
			label: "At least 8 characters",
			met: requirements.length,
		},
		{
			key: "upper",
			label: "At least 1 uppercase letter",
			met: requirements.upper,
		},
		{ key: "number", label: "At least 1 number", met: requirements.number },
		{
			key: "special",
			label: "At least 1 special character",
			met: requirements.special,
		},
	];

	return (
		<Alert
			variant={allMet ? "default" : "destructive"}
			icon={allMet ? CheckCircle2 : AlertCircle}
			className={className}
		>
			<AlertTitle>
				{allMet
					? "All requirements met"
					: "Password does not meet the requirements"}
			</AlertTitle>
			<AlertDescription>
				<View className="gap-1 mt-1">
					{requirementItems.map((item) => (
						<View
							key={item.key}
							className="flex-row items-center gap-2"
						>
							<Text
								className={`text-xs ${
									allMet
										? "text-teal-400"
										: item.met
											? "text-teal-400 font-medium"
											: "text-destructive"
								}`}
							>
								•
							</Text>
							<Text
								className={`text-xs ${
									allMet
										? "text-teal-400"
										: item.met
											? "text-teal-400 font-medium"
											: "text-destructive"
								}`}
							>
								{item.label}
							</Text>
						</View>
					))}
				</View>
			</AlertDescription>
		</Alert>
	);
}

export default PasswordRequirementsAlert;
