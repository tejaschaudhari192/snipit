import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { forgotPassword, resetPassword } from "@/lib/api/auth";
import { useTranslation } from "react-i18next";
import {
	Link,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
	Mail,
	ArrowLeft,
	ArrowRight,
	KeyRound,
	Lock,
	CheckCircle2,
	User,
} from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordStrengthMeter } from "@/components/common/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { useAuth } from "@/context/AuthContext";

export interface PasswordFlowCardProps {
	mode?: "request" | "reset";
}

export const PasswordFlowCard = ({ mode }: PasswordFlowCardProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { login } = useAuth();
	const { token: routeToken } = useParams<{ token?: string }>();
	const [searchParams] = useSearchParams();

	// Check whether we have a token from route or query params
	const activeToken = routeToken || searchParams.get("token") || "";
	const currentMode = mode || (activeToken ? "reset" : "request");

	// Query params for request flow
	const emailParam = searchParams.get("email") || "";
	const fromParam = searchParams.get("from") || "";
	const isFromProfile = fromParam === "profile";

	// Request flow states
	const [email, setEmail] = useState(emailParam);
	const [isRequestLoading, setIsRequestLoading] = useState(false);
	const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

	// Reset flow states
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isResetLoading, setIsResetLoading] = useState(false);
	const { isStrongEnough } = usePasswordStrength(password);

	useEffect(() => {
		if (emailParam && !email) {
			setEmail(emailParam);
		}
	}, [emailParam, email]);

	// Handle request (Forgot / Reset Link) submission
	const handleRequestSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;

		setIsRequestLoading(true);
		try {
			await forgotPassword(email.trim());
			setIsRequestSubmitted(true);
			toast.add({
				title: t("auth.forgot_password_success_toast"),
				type: "success",
			});
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.forgot_password_failed_toast"),
				type: "error",
			});
		} finally {
			setIsRequestLoading(false);
		}
	};

	// Handle password reset submission (when token is present)
	const handleResetSubmit = async (e: React.FormEvent) => {
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

		if (!activeToken) {
			toast.add({
				title: t("auth.reset_password_invalid_token_toast"),
				type: "error",
			});
			return;
		}

		setIsResetLoading(true);
		try {
			const data = await resetPassword(activeToken, password);
			login(data);
			toast.add({
				title: t("auth.reset_password_success_toast"),
				type: "success",
			});
			navigate(isFromProfile ? "/profile" : "/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.add({
				title:
					axiosError.response?.data?.message ||
					t("auth.reset_password_failed_toast"),
				type: "error",
			});
		} finally {
			setIsResetLoading(false);
		}
	};

	// Dynamic text & context based on state
	const getTitle = () => {
		if (currentMode === "reset") {
			return t("auth.reset_password_title");
		}
		if (isFromProfile) {
			return (
				t("auth.send_reset_link_title") ||
				t("profile.reset_password") ||
				"Reset Your Password"
			);
		}
		return t("auth.forgot_password_title");
	};

	const getSubtitle = () => {
		if (currentMode === "reset") {
			return t("auth.reset_password_subtitle");
		}
		if (isRequestSubmitted) {
			return t("auth.forgot_password_success_subtitle");
		}
		if (isFromProfile) {
			return (
				t("auth.send_reset_link_subtitle") ||
				"We'll send a secure password reset link to your email address"
			);
		}
		return t("auth.forgot_password_subtitle");
	};

	const backUrl = isFromProfile ? "/profile" : "/login";
	const backLabel = isFromProfile
		? t("auth.back_to_profile") || "Back to Profile"
		: t("auth.back_to_login");

	return (
		<Card className="glass-card border-border/40 overflow-hidden shadow-2xl rounded-3xl gap-0 py-0 w-full max-w-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
			<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />

			<CardHeader className="space-y-1.5 pb-5 pt-7">
				<div className="flex items-center justify-center mb-4">
					<div className="relative group">
						<div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-500 group-hover:scale-105">
							{currentMode === "reset" ? (
								<CheckCircle2 className="h-6 w-6" />
							) : isFromProfile ? (
								<User className="h-6 w-6" />
							) : (
								<KeyRound className="h-6 w-6" />
							)}
						</div>
					</div>
				</div>
				<CardTitle className="text-2xl font-bold tracking-tight text-center">
					{getTitle()}
				</CardTitle>
				<CardDescription className="text-sm text-muted-foreground text-center font-medium">
					{getSubtitle()}
				</CardDescription>
			</CardHeader>

			<CardContent className="px-7">
				{currentMode === "reset" ? (
					/* RESET PASSWORD FORM (with token) */
					<form onSubmit={handleResetSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password" className="section-label">
								{t("auth.reset_password_new_password_label")}
							</Label>
							<div className="relative group">
								<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
									<Lock className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
								</div>
								<PasswordInput
									id="password"
									placeholder={t("auth.password_placeholder")}
									required
									className="pl-9 h-10 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
							</div>
							{password && (
								<div className="pt-1">
									<PasswordStrengthMeter
										password={password}
									/>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="section-label"
							>
								{t(
									"auth.reset_password_confirm_password_label",
								)}
							</Label>
							<div className="relative group">
								<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
									<Lock className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
								</div>
								<PasswordInput
									id="confirmPassword"
									placeholder={t("auth.password_placeholder")}
									required
									className={`pl-9 h-10 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono ${
										confirmPassword &&
										password !== confirmPassword
											? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
											: ""
									}`}
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
								/>
							</div>
							{confirmPassword &&
								password !== confirmPassword && (
									<p className="text-xs text-destructive font-medium mt-1 animate-in fade-in">
										{t(
											"auth.reset_password_mismatch_toast",
										)}
									</p>
								)}
						</div>

						<div className="pt-2">
							<Button
								className="btn-primary-bounce w-full"
								type="submit"
								disabled={isResetLoading}
							>
								{isResetLoading ? (
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
											{t("auth.reset_password_resetting")}
										</span>
									</>
								) : (
									<>
										{t("auth.reset_password_button")}
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>
						</div>
					</form>
				) : !isRequestSubmitted ? (
					/* REQUEST LINK FORM */
					<form onSubmit={handleRequestSubmit} className="space-y-4">
						<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
							<Label htmlFor="email" className="section-label">
								{t("auth.forgot_password_email_label")}
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

						<div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
							<Button
								className="btn-primary-bounce w-full"
								type="submit"
								disabled={isRequestLoading}
							>
								{isRequestLoading ? (
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
											{t("auth.forgot_password_sending")}
										</span>
									</>
								) : (
									<>
										{t("auth.forgot_password_button")}
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>
						</div>
					</form>
				) : (
					/* SUCCESS STATE */
					<div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
						<div className="relative">
							<div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
							<div className="relative p-4 rounded-2xl bg-green-500/10 text-green-500 ring-1 ring-green-500/20 border border-green-500/10">
								<Mail className="w-8 h-8" />
							</div>
						</div>
						<div className="space-y-2 text-center">
							<p className="text-sm text-muted-foreground leading-relaxed font-medium">
								{t("auth.forgot_password_success_message")}{" "}
								<span className="font-bold text-foreground">
									{email}
								</span>
							</p>
							<p className="text-[13px] text-muted-foreground/60">
								{t("auth.forgot_password_success_check_inbox")}
							</p>
						</div>
						<Button
							variant="outline"
							className="w-full h-10 rounded-xl border-border/40 hover:bg-background/80 transition-all text-xs"
							onClick={() => setIsRequestSubmitted(false)}
						>
							{isFromProfile
								? t("auth.resend_link") || "Resend reset link"
								: t("auth.forgot_password_try_another")}
						</Button>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex flex-col gap-4 pb-7 pt-5 px-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
				<div className="relative w-full">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border/50"></div>
					</div>
					<div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
						<span className="bg-background/80 backdrop-blur-sm px-4">
							{t("auth.or")}
						</span>
					</div>
				</div>

				<Link
					to={backUrl}
					className="font-bold text-primary/80 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm mx-auto group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
					{backLabel}
				</Link>
			</CardFooter>
		</Card>
	);
};
