import { useMemo } from "react";
import zxcvbn from "zxcvbn";
import {
	ShieldCheck,
	ShieldAlert,
	Shield,
	type LucideIcon,
} from "lucide-react";
import { CONFIG } from "@/configurations";

export interface PasswordStrengthDetails {
	label: string;
	color: string;
	textColor: string;
	icon: LucideIcon;
}

export interface PasswordRequirements {
	length: boolean;
	upper: boolean;
	number: boolean;
	special: boolean;
}

export interface PasswordStrengthResult {
	score: number;
	details: PasswordStrengthDetails;
	requirements: PasswordRequirements;
	isStrongEnough: boolean;
	feedback?: {
		warning: string;
		suggestions: string[];
	};
}

const getStrengthDetails = (score: number): PasswordStrengthDetails => {
	switch (score) {
		case 0:
			return {
				label: "tools.password_generator_strength_risky",
				color: "bg-destructive shadow-[0_0_10px_rgba(220,38,38,0.5)]",
				textColor: "text-destructive",
				icon: ShieldAlert,
			};
		case 1:
			return {
				label: "tools.password_generator_strength_weak",
				color: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
				textColor: "text-orange-500",
				icon: ShieldAlert,
			};
		case 2:
			return {
				label: "tools.password_generator_strength_fair",
				color: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
				textColor: "text-yellow-500",
				icon: Shield,
			};
		case 3:
			return {
				label: "tools.password_generator_strength_strong",
				color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
				textColor: "text-emerald-400",
				icon: ShieldCheck,
			};
		case 4:
			return {
				label: "tools.password_generator_strength_secure",
				color: "bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.5)]",
				textColor: "text-emerald-600",
				icon: ShieldCheck,
			};
		default:
			return {
				label: "tools.password_generator_strength_unknown",
				color: "bg-muted",
				textColor: "text-muted-foreground",
				icon: Shield,
			};
	}
};

export function usePasswordStrength(password: string): PasswordStrengthResult {
	const evaluation = useMemo(() => {
		if (!password) return null;
		return zxcvbn(password);
	}, [password]);

	const score = evaluation ? evaluation.score : -1;
	const details = getStrengthDetails(score === -1 ? 0 : score);

	const requirements: PasswordRequirements = {
		length: password.length >= CONFIG.password.minLength,
		upper: CONFIG.password.requireUppercase ? /[A-Z]/.test(password) : true,
		number: CONFIG.password.requireNumber ? /[0-9]/.test(password) : true,
		special: CONFIG.password.requireSpecial
			? /[^A-Za-z0-9]/.test(password)
			: true,
	};

	const isStrongEnough =
		score >= CONFIG.password.minZxcvbnScore &&
		requirements.length &&
		requirements.upper &&
		requirements.number &&
		requirements.special;

	return {
		score,
		details,
		requirements,
		isStrongEnough: !!isStrongEnough,
		feedback: evaluation?.feedback,
	};
}
