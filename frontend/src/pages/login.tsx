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

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await api.post("/auth/login", { email, password });
			login(response.data);
			toast.success("Logged in successfully");
			navigate("/");
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast.error(axiosError.response?.data?.message || "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<Button
							className="w-full"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<div className="text-sm text-muted-foreground text-center w-full">
						Don't have an account?{" "}
						<Link to="/signup" className="underline text-primary">
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default LoginPage;
