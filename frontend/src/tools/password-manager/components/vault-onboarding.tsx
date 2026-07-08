import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Shield,
	Eye,
	EyeOff,
	Lock,
	Cloud,
	KeyRound,
	AlertTriangle,
} from "lucide-react";

import zxcvbn from "zxcvbn";

interface VaultOnboardingProps {
	onComplete: (password: string) => void;
}

export default function VaultOnboarding({ onComplete }: VaultOnboardingProps) {
	const [step, setStep] = useState(1);

	// Step 2 State
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [strengthScore, setStrengthScore] = useState(0);

	// Step 3 State
	const [understandWarning, setUnderstandWarning] = useState(false);

	useEffect(() => {
		if (password) {
			setStrengthScore(zxcvbn(password).score);
		} else {
			setStrengthScore(0);
		}
	}, [password]);

	const reqs = {
		length: password.length >= 8,
		upper: /[A-Z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[^A-Za-z0-9]/.test(password),
	};

	const isStrongEnough =
		strengthScore >= 2 &&
		reqs.length &&
		reqs.upper &&
		reqs.number &&
		reqs.special;
	const passwordsMatch = password === confirmPassword && password.length > 0;

	const renderStep1 = () => (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center space-y-4">
				<div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-2 ring-8 ring-primary/5">
					<Shield className="h-10 w-10 text-primary" />
				</div>
				<h1 className="text-3xl font-bold tracking-tight">
					Welcome to Snipit Vault
				</h1>
				<p className="text-muted-foreground max-w-sm mx-auto">
					Your passwords and secrets, encrypted locally. Only you hold
					the key.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex flex-col items-center text-center space-y-2">
						<Lock className="h-6 w-6 text-primary mb-1" />
						<h3 className="font-semibold text-sm">
							AES-256 Encryption
						</h3>
						<p className="text-xs text-muted-foreground">
							Military-grade protection for your data.
						</p>
					</CardContent>
				</Card>
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex flex-col items-center text-center space-y-2">
						<KeyRound className="h-6 w-6 text-primary mb-1" />
						<h3 className="font-semibold text-sm">
							Zero Knowledge
						</h3>
						<p className="text-xs text-muted-foreground">
							We cannot see or access your passwords.
						</p>
					</CardContent>
				</Card>
				<Card className="bg-background/60 backdrop-blur-sm border-border/50">
					<CardContent className="p-4 flex flex-col items-center text-center space-y-2">
						<Cloud className="h-6 w-6 text-primary mb-1" />
						<h3 className="font-semibold text-sm">Optional Sync</h3>
						<p className="text-xs text-muted-foreground">
							Sync encrypted vaults across devices.
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-center pt-4">
				<Button
					onClick={() => setStep(2)}
					size="lg"
					className="rounded-full px-8"
				>
					Create Master Password <span className="ml-2">→</span>
				</Button>
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto w-full">
			<div className="text-center space-y-2">
				<h2 className="text-2xl font-bold">Create Master Password</h2>
				<p className="text-sm text-muted-foreground">
					Make it strong and memorable. This is the only key to your
					vault.
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							placeholder="Master Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="pr-10 h-12"
							autoFocus
						/>
						<Button
							variant="ghost"
							size="icon"
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					</div>

					{password && (
						<div className="flex gap-1 h-1.5 w-full">
							{[0, 1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className={`h-full flex-1 rounded-full transition-colors ${
										i <= strengthScore
											? strengthScore < 2
												? "bg-red-500"
												: strengthScore === 2
													? "bg-yellow-500"
													: "bg-green-500"
											: "bg-muted"
									}`}
								/>
							))}
						</div>
					)}
				</div>

				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						placeholder="Confirm Password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="h-12"
					/>
				</div>

				<Card className="bg-muted/30 border-dashed">
					<CardContent className="p-4 space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<span
								className={
									reqs.length
										? "text-green-500"
										: "text-muted-foreground"
								}
							>
								{reqs.length ? "✓" : "○"}
							</span>
							<span
								className={
									reqs.length
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								At least 8 characters
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={
									reqs.upper
										? "text-green-500"
										: "text-muted-foreground"
								}
							>
								{reqs.upper ? "✓" : "○"}
							</span>
							<span
								className={
									reqs.upper
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								Contains uppercase letter
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={
									reqs.number
										? "text-green-500"
										: "text-muted-foreground"
								}
							>
								{reqs.number ? "✓" : "○"}
							</span>
							<span
								className={
									reqs.number
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								Contains number
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={
									reqs.special
										? "text-green-500"
										: "text-muted-foreground"
								}
							>
								{reqs.special ? "✓" : "○"}
							</span>
							<span
								className={
									reqs.special
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								Contains special character
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-between items-center pt-4">
				<Button variant="ghost" onClick={() => setStep(1)}>
					Back
				</Button>
				<Button
					onClick={() => setStep(3)}
					disabled={!isStrongEnough || !passwordsMatch}
					className="rounded-full px-6"
				>
					Continue <span className="ml-2">→</span>
				</Button>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto w-full">
			<div className="flex flex-col items-center text-center space-y-4">
				<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-2">
					<AlertTriangle className="h-8 w-8 text-red-500" />
				</div>
				<h2 className="text-2xl font-bold">Important Warning</h2>
				<p className="text-muted-foreground">
					Snipit uses Zero-Knowledge encryption. This means we do not
					store your master password anywhere.
				</p>
				<p className="font-semibold text-foreground bg-muted/50 p-4 rounded-xl border border-border">
					If you forget your master password, your vault data is
					permanently lost and cannot be recovered by anyone.
				</p>
			</div>

			<div className="flex items-start space-x-3 p-4 border border-border rounded-xl bg-background/50">
				<Checkbox
					id="understand"
					checked={understandWarning}
					onCheckedChange={(c) => setUnderstandWarning(!!c)}
					className="mt-1"
				/>
				<div className="space-y-1 leading-none">
					<label
						htmlFor="understand"
						className="text-sm font-medium leading-none cursor-pointer"
					>
						I understand that my master password cannot be
						recovered.
					</label>
				</div>
			</div>

			<div className="flex justify-between items-center pt-4">
				<Button variant="ghost" onClick={() => setStep(2)}>
					Back
				</Button>
				<Button
					onClick={() => onComplete(password)}
					disabled={!understandWarning}
					className="rounded-full px-6"
				>
					Create Vault
				</Button>
			</div>
		</div>
	);

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8">
			<div className="w-full">
				{step === 1 && renderStep1()}
				{step === 2 && renderStep2()}
				{step === 3 && renderStep3()}
			</div>
		</div>
	);
}
