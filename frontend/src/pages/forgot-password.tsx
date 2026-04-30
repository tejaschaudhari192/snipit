import { useState } from "react";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { t } = useTranslation();
	const { forgotPassword } = useApiHelpers();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await forgotPassword(email);
			setIsSubmitted(true);
			toast.success(t("auth.forgot_password_success_toast"));
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message ||
					t("auth.forgot_password_failed_toast"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 w-full flex flex-col items-center justify-center bg-background px-4 py-8 transition-colors duration-500">
			{/* Dynamic Background Accents - Theme Aware */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute top-[-10%] left-[-20%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
				<div
					className="absolute bottom-[-10%] right-[-20%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[100px] animate-pulse-subtle"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
				<Card className="glass-card border-border/40 overflow-hidden shadow-2xl rounded-3xl gap-0 py-0">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

					<CardHeader className="space-y-1.5 pb-5 pt-7">
						<div className="flex items-center justify-center mb-4">
							<div className="relative group">
								<div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-500 group-hover:scale-105">
									<KeyRound className="h-6 w-6" />
								</div>
							</div>
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-center">
							{t("auth.forgot_password_title")}
						</CardTitle>
						<CardDescription className="text-sm text-muted-foreground text-center font-medium">
							{isSubmitted
								? t("auth.forgot_password_success_subtitle")
								: t("auth.forgot_password_subtitle")}
						</CardDescription>
					</CardHeader>

					<CardContent className="px-7">
						{!isSubmitted ? (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
									<Label
										htmlFor="email"
										className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1"
									>
										{t("auth.forgot_password_email_label")}
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

								<div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
									<Button
										className="w-full h-11 text-sm font-bold transition-all gap-2 rounded-xl bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200"
										type="submit"
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<ShimmerSection type="mini-loader" />
												{t(
													"auth.forgot_password_sending",
												)}
											</>
										) : (
											<>
												{t(
													"auth.forgot_password_button",
												)}
												<ArrowRight className="h-4 w-4" />
											</>
										)}
									</Button>
								</div>
							</form>
						) : (
							<div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
								<div className="relative">
									<div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
									<div className="relative p-4 rounded-2xl bg-green-500/10 text-green-500 ring-1 ring-green-500/20 border border-green-500/10">
										<Mail className="w-8 h-8" />
									</div>
								</div>
								<div className="space-y-2 text-center">
									<p className="text-sm text-muted-foreground leading-relaxed font-medium">
										{t(
											"auth.forgot_password_success_message",
										)}{" "}
										<span className="font-bold text-foreground">
											{email}
										</span>
									</p>
									<p className="text-[13px] text-muted-foreground/60">
										{t(
											"auth.forgot_password_success_check_inbox",
										)}
									</p>
								</div>
								<Button
									variant="outline"
									className="w-full h-10 rounded-xl border-border/40 hover:bg-background/80 transition-all"
									onClick={() => setIsSubmitted(false)}
								>
									{t("auth.forgot_password_try_another")}
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
							to="/login"
							className="font-bold text-primary/80 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm mx-auto group"
						>
							<ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
							{t("auth.back_to_login")}
						</Link>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
