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
import { Progress } from "@/components/ui/progress";
import { Shield, LockOpen, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import TextGradient from "@/components/text-gradient";
import ReadMoreDialog from "./ReadMoreDialog";
import zxcvbn from "zxcvbn";

interface VaultUnlockProps {
	onUnlock: (password: string) => void;
	error: string | null;
	loading: boolean;
	hasRecoveryKey: boolean;
	recoveryLoading: boolean;
	recoveryError: string | null;
	recoveryMode: boolean;
	onRecoverWithMnemonic: (mnemonic: string) => void;
	onResetMasterPassword: (newPassword: string) => void;
	onSetRecoveryMode: (mode: boolean) => void;
}

export default function VaultUnlock({
	onUnlock,
	error,
	loading,
	hasRecoveryKey,
	recoveryLoading,
	recoveryError,
	recoveryMode,
	onRecoverWithMnemonic,
	onResetMasterPassword,
	onSetRecoveryMode,
}: VaultUnlockProps) {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [shake, setShake] = useState(false);

	// Recovery mode
	const [showRecovery, setShowRecovery] = useState(false);
	const [recoveryPhrase, setRecoveryPhrase] = useState("");

	// New password mode (after successful recovery)
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [showNewPw, setShowNewPw] = useState(false);
	const [newStrengthScore, setNewStrengthScore] = useState(0);

	useEffect(() => {
		if (error) {
			setShake(true);
			const timer = setTimeout(() => setShake(false), 500);
			return () => clearTimeout(timer);
		}
	}, [error]);

	useEffect(() => {
		if (newPassword) {
			setNewStrengthScore(zxcvbn(newPassword).score);
		} else {
			setNewStrengthScore(0);
		}
	}, [newPassword]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password.trim()) {
			onUnlock(password);
		}
	};

	const handleRecover = (e: React.FormEvent) => {
		e.preventDefault();
		if (recoveryPhrase.trim()) {
			onRecoverWithMnemonic(recoveryPhrase.trim().toLowerCase());
		}
	};

	const handleSetNewPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword && newPassword === confirmNewPassword) {
			onResetMasterPassword(newPassword);
		}
	};

	const newPwReqs = {
		length: newPassword.length >= 8,
		upper: /[A-Z]/.test(newPassword),
		number: /[0-9]/.test(newPassword),
		special: /[^A-Za-z0-9]/.test(newPassword),
	};

	const isNewPwStrong =
		newStrengthScore >= 2 &&
		newPwReqs.length &&
		newPwReqs.upper &&
		newPwReqs.number &&
		newPwReqs.special;
	const newPwMatch =
		newPassword === confirmNewPassword && newPassword.length > 0;

	// ── New password form (after successful recovery) ───────────────────

	if (recoveryMode) {
		return (
			<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
				<Card className="w-full max-w-lg bg-background/60 backdrop-blur-xl border-border shadow-2xl">
					<CardHeader className="space-y-4 pb-6 text-center">
						<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
							<KeyRound className="h-8 w-8 text-primary" />
						</div>
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold tracking-tight">
								{t(
									"tools.password_manager_recovery_new_password_title",
								)}
							</CardTitle>
							<CardDescription className="text-base">
								{t(
									"tools.password_manager_recovery_new_password_desc",
								)}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSetNewPassword}
							className="space-y-4"
						>
							<div className="space-y-2">
								<div className="relative">
									<Input
										type={showNewPw ? "text" : "password"}
										placeholder={t(
											"tools.password_manager_master_password_placeholder",
										)}
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										className="pr-10 h-12"
										autoFocus
									/>
									<Button
										variant="ghost"
										size="icon"
										type="button"
										onClick={() => setShowNewPw(!showNewPw)}
										className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
									>
										{showNewPw ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{newPassword && (
									<Progress
										value={(newStrengthScore + 1) * 20}
										indicatorClassName={
											newStrengthScore < 2
												? "bg-red-500"
												: newStrengthScore === 2
													? "bg-yellow-500"
													: "bg-green-500"
										}
									/>
								)}
							</div>
							<Input
								type={showNewPw ? "text" : "password"}
								placeholder={t(
									"tools.password_manager_confirm_password_placeholder",
								)}
								value={confirmNewPassword}
								onChange={(e) =>
									setConfirmNewPassword(e.target.value)
								}
								className="h-12"
							/>
							<Button
								type="submit"
								className="w-full h-12 rounded-xl text-base font-semibold"
								disabled={
									!isNewPwStrong ||
									!newPwMatch ||
									recoveryLoading
								}
							>
								{recoveryLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										{t(
											"tools.password_manager_recovery_decrypting",
										)}
									</>
								) : (
									<>
										<LockOpen className="mr-2 h-5 w-5" />
										{t(
											"tools.password_manager_recovery_success",
										)}
									</>
								)}
							</Button>
							{recoveryError && (
								<p className="text-sm text-red-500 text-center">
									{recoveryError}
								</p>
							)}
						</form>

						<div className="mt-6 text-center">
							<Button
								variant="link"
								onClick={() => onSetRecoveryMode(false)}
								className="text-sm"
							>
								{t("tools.password_manager_back")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (showRecovery) {
		return (
			<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
				<Card className="w-full max-w-lg bg-background/60 backdrop-blur-xl border-border shadow-2xl">
					<CardHeader className="space-y-4 pb-6 text-center">
						<div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center ring-8 ring-amber-500/5">
							<KeyRound className="h-8 w-8 text-amber-500" />
						</div>
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold tracking-tight">
								{t("tools.password_manager_recovery_use_title")}
							</CardTitle>
							<CardDescription className="text-base">
								{t("tools.password_manager_recovery_use_desc")}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleRecover} className="space-y-4">
							<div className="space-y-2">
								<Input
									placeholder={t(
										"tools.password_manager_recovery_placeholder",
									)}
									value={recoveryPhrase}
									onChange={(e) =>
										setRecoveryPhrase(e.target.value)
									}
									className="h-12 text-center"
									autoFocus
									disabled={recoveryLoading}
								/>
								{recoveryError && (
									<p className="text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1">
										{recoveryError}
									</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full h-12 rounded-xl text-base font-semibold"
								disabled={
									!recoveryPhrase.trim() || recoveryLoading
								}
							>
								{recoveryLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										{t(
											"tools.password_manager_recovery_decrypting",
										)}
									</>
								) : (
									<>
										<LockOpen className="mr-2 h-5 w-5" />
										{t(
											"tools.password_manager_recovery_unlock",
										)}
									</>
								)}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<Button
								variant="link"
								onClick={() => {
									setShowRecovery(false);
									setRecoveryPhrase("");
								}}
								className="text-sm"
							>
								{t("tools.password_manager_back")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// ── Normal unlock form ──────────────────────────────────────────────

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
			<Card
				className={`w-full max-w-lg bg-background/60 backdrop-blur-xl border-border shadow-2xl transition-all duration-300 ${shake ? "animate-shake border-red-500/50" : ""}`}
			>
				<CardHeader className="space-y-4 pb-6 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
						<Shield className="h-8 w-8 text-primary" />
					</div>
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight">
							{t("tools.password_manager_unlock_title")}
						</CardTitle>
						<CardDescription className="text-base">
							{t("tools.password_manager_unlock_subtitle")}
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
									<TextGradient
										highlightColor="var(--foreground)"
										baseColor="var(--muted-foreground)"
										spread={20}
										duration={2}
										className="font-medium"
									>
										{t("tools.password_manager_decrypting")}
									</TextGradient>
								</>
							) : (
								<>
									<LockOpen className="mr-2 h-5 w-5" />
									{t("tools.password_manager_unlock_vault")}
								</>
							)}
						</Button>
					</form>

					<div className="mt-6 text-center space-y-2">
						<p className="text-xs text-muted-foreground">
							{t("tools.password_manager_forgot_password")}{" "}
							{hasRecoveryKey ? (
								<button
									onClick={() => setShowRecovery(true)}
									className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
								>
									{t("tools.password_manager_recovery_title")}
								</button>
							) : (
								<ReadMoreDialog />
							)}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
