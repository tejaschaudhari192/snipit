import { useState } from "react";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "@/components/common/password-input";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";

const LoginPage = () => {
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
		<AuthCard
			icon={<LogIn className="h-6 w-6" />}
			title={t("auth.login_title")}
			subtitle={t("auth.login_subtitle")}
			footer={
				<AuthFooterLink
					dividerText={t("auth.or")}
					promptText={t("auth.new_to_snipit")}
					linkText={t("auth.create_account")}
					linkTo="/signup"
				/>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3.5">
				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
					<Label htmlFor="email" className="section-label">
						{t("auth.email_label")}
					</Label>
					<InputGroup className="input-glass">
						<InputGroupAddon align="inline-start">
							<Mail className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within/input-group:text-primary ml-1" />
						</InputGroupAddon>
						<InputGroupInput
							id="email"
							type="email"
							placeholder={t("auth.email_placeholder")}
							required
							className="font-medium"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</InputGroup>
				</div>

				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
					<div className="flex items-center justify-between ml-1">
						<Label
							htmlFor="password"
							className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80"
						>
							{t("auth.password_label")}
						</Label>
						<Link
							to="/forgot-password"
							className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
						>
							{t("auth.forgot_password")}
						</Link>
					</div>
					<div className="relative group">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
							<Lock className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
						</div>
						<PasswordInput
							id="password"
							placeholder={t("auth.password_placeholder")}
							required
							className="pl-10.5 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</div>

				<div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
					<Button
						className="btn-primary-bounce"
						type="submit"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<ShimmerSection type="mini-loader" />
								<span
									style={
										{
											"--highlight-color":
												"var(--foreground)",
											"--base-color":
												"var(--muted-foreground)",
											"--spread": "20px",
											"--duration": "2s",
										} as React.CSSProperties
									}
									className="shimmer font-medium"
								>
									{t("auth.logging_in")}
								</span>
							</>
						) : (
							<>
								{t("auth.login_button")}
								<ArrowRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>

				<SocialAuthButtons disabled={isLoading} />
			</form>
		</AuthCard>
	);
};

export default LoginPage;
