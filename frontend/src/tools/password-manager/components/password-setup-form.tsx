import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/common/password-strength-meter";
import { Eye, EyeOff } from "lucide-react";

interface PasswordSetupFormProps {
	password: string;
	onPasswordChange: (value: string) => void;
	confirmPassword: string;
	onConfirmPasswordChange: (value: string) => void;
	className?: string;
}

export default function PasswordSetupForm({
	password,
	onPasswordChange,
	confirmPassword,
	onConfirmPasswordChange,
	className,
}: PasswordSetupFormProps) {
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="space-y-3">
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						placeholder={t(
							"tools.password_manager.master_password_placeholder",
						)}
						value={password}
						onChange={(e) => onPasswordChange(e.target.value)}
						className="pr-10 h-12"
						autoFocus
					/>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-1 top-1/2 -translate-y-1/2 active:-translate-y-1/2 h-10 w-10 text-muted-foreground"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>

				{password && (
					<div className="pt-2">
						<PasswordStrengthMeter password={password} />
					</div>
				)}
			</div>

			<div className="relative">
				<Input
					type={showPassword ? "text" : "password"}
					placeholder={t(
						"tools.password_manager.confirm_password_placeholder",
					)}
					value={confirmPassword}
					onChange={(e) => onConfirmPasswordChange(e.target.value)}
					className={`h-12 ${
						confirmPassword && password !== confirmPassword
							? "border-destructive/50 focus-visible:ring-destructive/20"
							: ""
					}`}
				/>
				{confirmPassword && password !== confirmPassword && (
					<p className="text-xs text-destructive font-medium mt-1.5 animate-in fade-in">
						{t("auth.reset_password_mismatch_toast")}
					</p>
				)}
			</div>
		</div>
	);
}
