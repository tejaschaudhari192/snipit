import { useState } from "react";
import { AxiosError } from "axios";
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
import { motion } from "motion/react";
import {
	UserPlus,
	Mail,
	Lock,
	User,
	ArrowRight,
	Eye,
	EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SignupPage = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

	// Redirect if already logged in
	if (user) {
		navigate("/");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await api.post("/auth/register", {
				username,
				email,
				password,
			});
			toast.success("Account created successfully. Please login.");
			navigate("/login");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(axiosError.response?.data?.message || "Signup failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background px-4 py-8 md:py-12">
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
								<UserPlus className="h-6 w-6" />
							</div>
						</div>
						<CardTitle className="text-3xl font-black tracking-tight">
							Join Snipit
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground">
							Create an account to start managing your snippets.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="username"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									Username
								</Label>
								<div className="relative group">
									<User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="username"
										type="text"
										placeholder="johndoe"
										required
										className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/30 transition-all"
										value={username}
										onChange={(e) =>
											setUsername(e.target.value)
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									Email
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
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70"
								>
									Password
								</Label>
								<div className="relative group">
									<Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="••••••••"
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
												? "Hide password"
												: "Show password"
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
										Creating...
									</>
								) : (
									<>
										Sign Up
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
									Or
								</span>
							</div>
						</div>
						<p className="text-sm text-muted-foreground text-center">
							Already have an account?{" "}
							<Link
								to="/login"
								className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
							>
								Login here
								<ArrowRight className="h-3 w-3" />
							</Link>
						</p>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
};

export default SignupPage;
