import { useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api/auth";
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
import { ShimmerSection } from "@/components/common/shimmer-section";
import { toast } from "@/components/ui/toast";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login, user } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();

	if (user) {
		navigate("/");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const data = await loginUser({ email, password });
			login(data);
			toast.add({ title: t("auth.login_success"), type: "success" });
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.login_failed"),
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
						{t("auth.login_title")}
					</h1>
					<p className="text-sm text-balance text-muted-foreground">
						{t("auth.login_subtitle")}
					</p>
				</div>

				<Field>
					<SocialAuthButtons disabled={isLoading} />
				</Field>

				<FieldSeparator>{t("auth.or")}</FieldSeparator>

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
					<div className="flex items-center">
						<FieldLabel htmlFor="password">
							{t("auth.password_label")}
						</FieldLabel>
						<Link
							to="/forgot-password"
							className="ml-auto text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
						>
							{t("auth.forgot_password")}
						</Link>
					</div>
					<PasswordInput
						id="password"
						placeholder={t("auth.password_placeholder")}
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Field>

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
									{t("auth.logging_in")}
								</span>
							</>
						) : (
							t("auth.login_button")
						)}
					</Button>
				</Field>

				<FieldDescription className="text-center pt-2">
					{t("auth.new_to_snipit")}{" "}
					<Link
						to="/signup"
						className="underline underline-offset-4 font-medium text-foreground hover:text-primary transition-colors"
					>
						{t("auth.create_account")}
					</Link>
				</FieldDescription>
			</FieldGroup>
		</form>
	);
}
