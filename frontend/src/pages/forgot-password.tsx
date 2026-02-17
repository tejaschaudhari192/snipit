import { useState } from "react";
import { AxiosError } from "axios";
import { useApiHelpers } from "@/lib/api";
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
import { motion } from "motion/react";
import { Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { Particles } from "@/components/ui/shadcn-io/particles";
import { useTheme } from "@/hooks/use-theme";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { forgotPassword } = useApiHelpers();
	const { theme } = useTheme();
	const particleColor = theme === "dark" ? "#818cf8" : "#4f46e5";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await forgotPassword(email);
			setIsSubmitted(true);
			toast.success("Reset link sent to your email");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(
				axiosError.response?.data?.message ||
					"Failed to send reset link",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background px-4 py-8 md:py-12 overflow-hidden">
			{/* Particles Background */}
			<Particles
				className="absolute inset-0 z-0"
				quantity={80}
				staticity={40}
				ease={60}
				size={0.4}
				color={particleColor}
				vx={0.02}
				vy={0.02}
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-sm relative z-10"
			>
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
					<CardHeader className="space-y-1 pb-6">
						<div className="flex items-center justify-between mb-2">
							<div className="p-2 rounded-lg bg-primary/10 text-primary">
								<KeyRound className="h-6 w-6" />
							</div>
						</div>
						<CardTitle className="text-3xl font-black tracking-tight">
							Forgot Password
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground">
							{isSubmitted
								? "Check your email for the reset link"
								: "Enter your email to receive a reset link"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!isSubmitted ? (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
									>
										Email Address
									</Label>
									<div className="relative group">
										<Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
										<Input
											id="email"
											type="email"
											placeholder="name@example.com"
											required
											className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all"
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
										/>
									</div>
								</div>

								<Button
									className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
									type="submit"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													repeat: Infinity,
													duration: 1,
													ease: "linear",
												}}
												className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
											/>
											Sending...
										</>
									) : (
										<>
											Send Reset Link
											<ArrowRight className="h-5 w-5" />
										</>
									)}
								</Button>
							</form>
						) : (
							<div className="flex flex-col items-center space-y-4">
								<div className="p-4 rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
									<Mail className="w-8 h-8" />
								</div>
								<p className="text-center text-muted-foreground">
									We've sent a password reset link to{" "}
									<span className="font-semibold text-foreground">
										{email}
									</span>
									. Please check your inbox and follow the
									instructions.
								</p>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => setIsSubmitted(false)}
								>
									Try another email
								</Button>
							</div>
						)}
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
						<Link
							to="/login"
							className="font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-sm"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Login
						</Link>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
