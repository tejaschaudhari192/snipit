import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { CheckCircle2, Circle, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface PasswordSetupFormProps {
	password: string;
	onPasswordChange: (value: string) => void;
	confirmPassword: string;
	onConfirmPasswordChange: (value: string) => void;
	showRequirements?: boolean;
	className?: string;
}

export default function PasswordSetupForm({
	password,
	onPasswordChange,
	confirmPassword,
	onConfirmPasswordChange,
	showRequirements = true,
	className,
}: PasswordSetupFormProps) {
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);
	const { requirements: reqs } = usePasswordStrength(password);

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="space-y-3">
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						placeholder={t(
							"tools.password_manager_master_password_placeholder",
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
						className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
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
						"tools.password_manager_confirm_password_placeholder",
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
						{t(
							"auth.reset_password_mismatch_toast",
							"Passwords do not match",
						)}
					</p>
				)}
			</div>

			{showRequirements && (
				<Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
					<CardContent className="p-4">
						<div className="flex items-center gap-2 mb-4">
							<ShieldCheck className="h-4 w-4 text-primary" />
							<h4 className="text-sm font-medium">
								{t("tools.password_manager_requirements")}
							</h4>
						</div>

						<div className="space-y-2">
							{[
								{
									key: "length",
									label: t(
										"tools.password_manager_req_length",
									),
								},
								{
									key: "upper",
									label: t(
										"tools.password_manager_req_uppercase",
									),
								},
								{
									key: "number",
									label: t(
										"tools.password_manager_req_number",
									),
								},
								{
									key: "special",
									label: t(
										"tools.password_manager_req_special",
									),
								},
							].map(({ key, label }) => {
								const met = reqs[key as keyof typeof reqs];

								return (
									<div
										key={key}
										className={`
                                flex items-center gap-3 rounded-lg p-2
                                transition-all duration-300
                                ${
									met
										? "bg-green-500/10 border border-green-500/20"
										: "bg-muted/50 border border-transparent"
								}
                            `}
									>
										{met ? (
											<CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
										) : (
											<Circle className="h-4 w-4 text-muted-foreground shrink-0" />
										)}

										<span
											className={`text-sm transition-colors ${
												met
													? "text-foreground font-medium"
													: "text-muted-foreground"
											}`}
										>
											{label}
										</span>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
