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
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
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

	return (
		<div className="relative flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 md:py-12 overflow-hidden">
			<div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
					<CardHeader className="space-y-2 pb-6">
						<div className="flex items-center justify-center mb-6">
							<div className="relative flex items-center justify-center w-20 h-20">
								<div className="relative z-10 p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm text-primary">
									<LogIn className="h-8 w-8 drop-shadow-sm" />
								</div>
							</div>
						</div>
						<CardTitle className="text-3xl font-black tracking-tight text-center">
							{t("auth.login_title")}
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground text-center">
							{t("auth.login_subtitle")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									{t("auth.email_label")}
								</Label>
								<div className="relative group">
									<Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="email"
										type="email"
										placeholder={t(
											"auth.email_placeholder",
										)}
										required
										className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-medium"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="password"
										className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
									>
										{t("auth.password_label")}
									</Label>
									<Link
										to="/forgot-password"
										className="text-xs font-semibold text-primary hover:underline transition-colors"
									>
										{t("auth.forgot_password")}
									</Link>
								</div>
								<div className="relative group">
									<Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder={t(
											"auth.password_placeholder",
										)}
										required
										className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
										aria-label={
											showPassword
												? t("auth.hide_password")
												: t("auth.show_password")
										}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
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
										{t("auth.logging_in")}
									</>
								) : (
									<>
										{t("auth.login_button")}
										<ArrowRight className="h-5 w-5" />
									</>
								)}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex flex-col gap-4 pt-2">
						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-border/50"></span>
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background/0 px-2 text-muted-foreground">
									{t("auth.or")}
								</span>
							</div>
						</div>
						<p className="text-sm text-muted-foreground text-center">
							{t("auth.new_to_snipit")}{" "}
							<Link
								to="/signup"
								className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
							>
								{t("auth.create_account")}
								<ArrowRight className="h-3 w-3" />
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
