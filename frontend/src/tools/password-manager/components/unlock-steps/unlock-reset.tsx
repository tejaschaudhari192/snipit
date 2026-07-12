import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { KeyRound, LockOpen, Loader2 } from "lucide-react";
import PasswordSetupForm from "../password-setup-form";

interface UnlockResetProps {
	newPassword: string;
	onNewPasswordChange: (val: string) => void;
	confirmNewPassword: string;
	onConfirmNewPasswordChange: (val: string) => void;
	isNewPwStrong: boolean;
	newPwMatch: boolean;
	recoveryLoading: boolean;
	recoveryError: string | null;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
}

export default function UnlockReset({
	newPassword,
	onNewPasswordChange,
	confirmNewPassword,
	onConfirmNewPasswordChange,
	isNewPwStrong,
	newPwMatch,
	recoveryLoading,
	recoveryError,
	onSubmit,
	onBack,
}: UnlockResetProps) {
	const { t } = useTranslation();

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
					<form onSubmit={onSubmit} className="space-y-4">
						<PasswordSetupForm
							password={newPassword}
							onPasswordChange={onNewPasswordChange}
							confirmPassword={confirmNewPassword}
							onConfirmPasswordChange={onConfirmNewPasswordChange}
						/>
						<Button
							type="submit"
							className="w-full h-12 rounded-xl text-base font-semibold"
							disabled={
								!isNewPwStrong || !newPwMatch || recoveryLoading
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
							onClick={onBack}
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
