import { useState } from "react";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useAuth } from "@/context/AuthContext";

const ResetPasswordPage = () => {
	const { token } = useParams<{ token: string }>();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { resetPassword } = useApiHelpers();
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);
		try {
			if (!token) {
				toast.error("Invalid token");
				return;
			}
			const data = await resetPassword(token, password);
			login(data);
			toast.success("Password reset successfully");
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message ||
					"Failed to reset password",
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
									<CheckCircle2 className="h-8 w-8 drop-shadow-sm" />
								</div>
							</div>
						</div>
						<CardTitle className="text-3xl font-black tracking-tight text-center">
							Reset Password
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground text-center">
							Enter your new password below
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									New Password
								</Label>
								<div className="relative group">
									<Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Abc.12345"
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
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									Confirm Password
								</Label>
								<div className="relative group">
									<Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="confirmPassword"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Abc.12345"
										required
										className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all font-mono"
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
										Resetting...
									</>
								) : (
									<>
										Reset Password
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
									or
								</span>
							</div>
						</div>
						<p className="text-sm text-muted-foreground text-center">
							<Link
								to="/login"
								className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 mx-auto"
							>
								Back to Login
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
