import { useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordStrengthMeter } from "@/components/common/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { toast } from "@/components/ui/toast";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { isStrongEnough } = usePasswordStrength(password);

	if (user) {
		navigate("/");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.add({
				title: t("auth.reset_password_mismatch_toast"),
				type: "error",
			});
			return;
		}

		if (!isStrongEnough) {
			toast.add({
				title: t("auth.reset_password_weak_toast"),
				type: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			await registerUser({
				username,
				email,
				password,
			});
			toast.add({ title: t("auth.signup_success"), type: "success" });
			navigate("/login");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.signup_failed"),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("flex flex-col gap-6", className)}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("auth.signup_title")}
					</h1>
					<p className="text-sm text-balance text-muted-foreground">
						{t("auth.signup_subtitle")}
					</p>
				</div>

				<Field>
					<SocialAuthButtons disabled={isLoading} />
				</Field>

				<FieldSeparator>{t("auth.or")}</FieldSeparator>

				<Field>
					<FieldLabel htmlFor="username">
						{t("auth.username_label")}
					</FieldLabel>
					<Input
						id="username"
						type="text"
						placeholder={t("auth.username_placeholder")}
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="email">
						{t("auth.email_label")}
					</FieldLabel>
					<Input
						id="email"
						type="email"
						placeholder={t("auth.email_placeholder")}
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="password">
						{t("auth.password_label")}
					</FieldLabel>
					<PasswordInput
						id="password"
						placeholder={t("auth.password_placeholder")}
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="confirm-password">
						{t("auth.reset_password_confirm_password_label")}
					</FieldLabel>
					<PasswordInput
						id="confirm-password"
						placeholder={t("auth.password_placeholder")}
						required
						className={
							confirmPassword && password !== confirmPassword
								? "border-destructive/60"
								: ""
						}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					{confirmPassword && password !== confirmPassword && (
						<p className="text-xs text-destructive font-medium mt-1">
							{t("auth.reset_password_mismatch_toast")}
						</p>
					)}
				</Field>

				<PasswordStrengthMeter password={password} />

				<Field>
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<ShimmerSection type="mini-loader" />
								<span className="shimmer font-medium ml-1.5">
									{t("auth.creating_account")}
								</span>
							</>
						) : (
							t("auth.signup_button")
						)}
					</Button>
				</Field>

				<FieldDescription className="text-center pt-2">
					{t("auth.already_have_account")}{" "}
					<Link
						to="/login"
						className="underline underline-offset-4 font-medium text-foreground hover:text-primary transition-colors"
					>
						{t("auth.login_here")}
					</Link>
				</FieldDescription>
			</FieldGroup>
		</form>
	);
}
