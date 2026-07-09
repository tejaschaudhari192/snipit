import { useState } from "react";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import TextGradient from "@/components/text-gradient";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";

const ResetPasswordPage = () => {
	const { token } = useParams<{ token: string }>();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { resetPassword } = useApiHelpers();
	const { login } = useAuth();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error(t("auth.reset_password_mismatch_toast"));
			return;
		}

		if (password.length < 6) {
			toast.error(t("auth.reset_password_min_length_toast"));
			return;
		}

		setIsLoading(true);
		try {
			if (!token) {
				toast.error(t("auth.reset_password_invalid_token_toast"));
				return;
			}
			const data = await resetPassword(token, password);
			login(data);
			toast.success(t("auth.reset_password_success_toast"));
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message ||
					t("auth.reset_password_failed_toast"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 md:py-12">
			<div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<Card className="glass-card border-border/40 overflow-hidden shadow-2xl rounded-3xl gap-0 py-0">
					<CardHeader className="space-y-1.5 pb-5 pt-7">
						<div className="flex items-center justify-center mb-6">
							<div className="relative flex items-center justify-center w-20 h-20">
								<div className="relative z-10 p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm text-primary">
									<CheckCircle2 className="h-8 w-8 drop-shadow-sm" />
								</div>
							</div>
						</div>
						<CardTitle className="text-3xl font-black tracking-tight text-center">
							{t("auth.reset_password_title")}
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground text-center">
							{t("auth.reset_password_subtitle")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1"
								>
									{t(
										"auth.reset_password_new_password_label",
									)}
								</Label>
								<div className="relative group">
									<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
										<Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									</div>
									<PasswordInput
										id="password"
										placeholder={t(
											"auth.password_placeholder",
										)}
										required
										className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1"
								>
									{t(
										"auth.reset_password_confirm_password_label",
									)}
								</Label>
								<div className="relative group">
									<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
										<Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									</div>
									<PasswordInput
										id="confirmPassword"
										placeholder={t(
											"auth.password_placeholder",
										)}
										required
										className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
									/>
								</div>
							</div>

							<Button
								className="w-full h-11 text-base font-bold transition-all gap-2"
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<ShimmerSection type="mini-loader" />
										<TextGradient
											highlightColor="var(--foreground)"
											baseColor="var(--muted-foreground)"
											spread={20}
											duration={2}
											className="font-medium"
										>
											{t("auth.reset_password_resetting")}
										</TextGradient>
									</>
								) : (
									<>
										{t("auth.reset_password_button")}
										<ArrowRight className="h-5 w-5" />
									</>
								)}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex flex-col gap-4 pb-7 pt-5 px-7">
						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-border/50"></span>
							</div>
							<div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
								<span className="bg-background/80 backdrop-blur-sm px-4">
									{t("auth.or")}
								</span>
							</div>
						</div>
						<p className="text-sm text-muted-foreground text-center">
							<Link
								to="/login"
								className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 mx-auto"
							>
								{t("auth.back_to_login")}
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
