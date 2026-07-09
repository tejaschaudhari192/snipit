import { useState } from "react";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import TextGradient from "@/components/text-gradient";
import { useTranslation } from "react-i18next";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { PasswordInput } from "@/components/ui/password-input";

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
			const response = await api.post("/auth/login", { email, password });
			login(response.data);
			toast.success(t("auth.login_success"));
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message || t("auth.login_failed"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSuccess = async (
		credentialResponse: CredentialResponse,
	) => {
		setIsLoading(true);
		try {
			const response = await api.post("/auth/google", {
				idToken: credentialResponse.credential,
			});
			login(response.data);
			toast.success(t("auth.login_success"));
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message || t("auth.login_failed"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleError = () => {
		toast.error(t("auth.google_login_failed"));
	};

	return (
		<div className="flex-1 w-full min-h-full flex flex-col items-center justify-center bg-background px-4 py-8 transition-colors duration-500">
			{/* Dynamic Background Accents - Theme Aware */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[100px] animate-pulse-subtle"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="w-full max-w-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
				<Card className="glass-card border-border/40 overflow-hidden shadow-2xl rounded-3xl">
					<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />

					<CardHeader className="space-y-1.5 pb-5 pt-7">
						<div className="flex items-center justify-center mb-4">
							<div className="relative group">
								<div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-500 group-hover:scale-105">
									<LogIn className="h-6 w-6" />
								</div>
							</div>
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-center">
							{t("auth.login_title")}
						</CardTitle>
						<CardDescription className="text-sm text-muted-foreground text-center font-medium">
							{t("auth.login_subtitle")}
						</CardDescription>
					</CardHeader>

					<CardContent className="px-7">
						<form onSubmit={handleSubmit} className="space-y-3.5">
							<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
								<Label
									htmlFor="email"
									className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1"
								>
									{t("auth.email_label")}
								</Label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<Mail className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
									</div>
									<Input
										id="email"
										type="email"
										placeholder={t(
											"auth.email_placeholder",
										)}
										required
										className="pl-10.5 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
									/>
								</div>
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
										placeholder={t(
											"auth.password_placeholder",
										)}
										required
										className="pl-10.5 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
									/>
								</div>
							</div>

							<div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
								<Button
									className="w-full h-11 text-sm font-bold transition-all gap-2 rounded-xl bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] duration-200"
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
												{t("auth.logging_in")}
											</TextGradient>
										</>
									) : (
										<>
											{t("auth.login_button")}
											<ArrowRight className="h-4 w-4" />
										</>
									)}
								</Button>
							</div>

							<div className="pt-1.5 w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
								<GoogleLogin
									onSuccess={handleGoogleSuccess}
									onError={handleGoogleError}
									useOneTap
									theme="outline"
									shape="rectangular"
									width="346"
								/>
							</div>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col gap-4 pb-7 pt-5 px-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
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

						<p className="text-sm text-muted-foreground/80 text-center font-medium">
							{t("auth.new_to_snipit")}{" "}
							<Link
								to="/signup"
								className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
							>
								{t("auth.create_account")}
								<ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
