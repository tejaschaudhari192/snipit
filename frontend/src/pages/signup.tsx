import { useState } from "react";
import { AxiosError } from "axios";
import { registerUser } from "@/lib/api/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordStrengthMeter } from "@/components/common/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";

const SignupPage = () => {
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
		<AuthCard
			icon={<UserPlus className="h-6 w-6" />}
			title={t("auth.signup_title")}
			subtitle={t("auth.signup_subtitle")}
			footer={
				<AuthFooterLink
					dividerText={t("auth.or")}
					promptText={t("auth.already_have_account")}
					linkText={t("auth.login_here")}
					linkTo="/login"
				/>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3.5">
				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
					<Label htmlFor="username" className="section-label">
						{t("auth.username_label")}
					</Label>
					<InputGroup className="input-glass">
						<InputGroupAddon align="inline-start">
							<User className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within/input-group:text-primary ml-1" />
						</InputGroupAddon>
						<InputGroupInput
							id="username"
							type="text"
							placeholder={t("auth.username_placeholder")}
							required
							className="font-medium"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</InputGroup>
				</div>

				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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

				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
					<Label htmlFor="password" className="section-label">
						{t("auth.password_label")}
					</Label>
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
					<PasswordStrengthMeter password={password} />
				</div>

				<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
					<Label htmlFor="confirmPassword" className="section-label">
						{t("auth.reset_password_confirm_password_label")}
					</Label>
					<div className="relative group">
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
							<Lock className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
						</div>
						<PasswordInput
							id="confirmPassword"
							placeholder={t("auth.password_placeholder")}
							required
							className={`pl-10.5 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium ${
								confirmPassword && password !== confirmPassword
									? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
									: ""
							}`}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
					{confirmPassword && password !== confirmPassword && (
						<p className="text-xs text-destructive font-medium ml-1 mt-1 animate-in fade-in">
							{t("auth.reset_password_mismatch_toast")}
						</p>
					)}
				</div>

				<div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
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
									{t("auth.creating_account")}
								</span>
							</>
						) : (
							<>
								{t("auth.signup_button")}
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

export default SignupPage;
