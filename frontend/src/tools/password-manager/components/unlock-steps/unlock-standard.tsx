import { useTranslation } from "react-i18next";
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
import TextGradient from "@/components/text-gradient";
import ReadMoreDialog from "../ReadMoreDialog";

interface UnlockStandardProps {
	password: string;
	onPasswordChange: (val: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	error: string | null;
	loading: boolean;
	hasRecoveryKey: boolean;
	onShowRecovery: () => void;
	shake: boolean;
}

export default function UnlockStandard({
	password,
	onPasswordChange,
	onSubmit,
	error,
	loading,
	hasRecoveryKey,
	onShowRecovery,
	shake,
}: UnlockStandardProps) {
	const { t } = useTranslation();

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
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2 relative">
							<Input
								type="password"
								placeholder={t(
									"tools.password_manager_master_placeholder",
								)}
								value={password}
								onChange={(e) =>
									onPasswordChange(e.target.value)
								}
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
									onClick={onShowRecovery}
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
