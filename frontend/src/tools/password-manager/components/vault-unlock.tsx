import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Shield, LockOpen, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VaultUnlockProps {
	onUnlock: (password: string) => void;
	error: string | null;
	loading: boolean;
}

export default function VaultUnlock({
	onUnlock,
	error,
	loading,
}: VaultUnlockProps) {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [shake, setShake] = useState(false);

	useEffect(() => {
		if (error) {
			setShake(true);
			const timer = setTimeout(() => setShake(false), 500);
			return () => clearTimeout(timer);
		}
	}, [error]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password.trim()) {
			onUnlock(password);
		}
	};

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
			<Card
				className={`w-full max-w-md bg-background/60 backdrop-blur-xl border-border shadow-2xl transition-all duration-300 ${shake ? "animate-shake border-red-500/50" : ""}`}
			>
				<CardHeader className="space-y-4 pb-6 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
						<Shield className="h-8 w-8 text-primary" />
					</div>
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight">
							Welcome Back
						</CardTitle>
						<CardDescription className="text-base">
							Enter your master password to unlock your vault
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2 relative">
							<Input
								type="password"
								placeholder={t(
									"tools.password_manager_master_placeholder",
									"Master Password",
								)}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={`h-12 text-center text-lg tracking-widest ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
								autoFocus
								disabled={loading}
							/>
							{error && (
								<p className="text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1">
									{error}
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full h-12 rounded-xl text-base font-semibold"
							disabled={!password || loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Decrypting...
								</>
							) : (
								<>
									<LockOpen className="mr-2 h-5 w-5" />
									Unlock Vault
								</>
							)}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-xs text-muted-foreground">
							Forgot your password?{" "}
							<button
								className="text-primary hover:underline font-medium"
								onClick={() =>
									alert(
										"Since this is zero-knowledge encryption, your password cannot be recovered. If you have forgotten it, you must clear your browser data for this site to start over, which will permanently delete your local vault.",
									)
								}
							>
								Read more
							</button>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
