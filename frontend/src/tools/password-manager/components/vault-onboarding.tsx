import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePasswordStrength } from "@/hooks/use-password-strength";

import Step1FeatureOverview from "./onboarding-steps/step1-feature-overview";
import Step2CreatePassword from "./onboarding-steps/step2-create-password";
import Step3Warning from "./onboarding-steps/step3-warning";
import Step4RecoveryKey from "./onboarding-steps/step4-recovery-key";

interface VaultOnboardingProps {
	onComplete: (password: string) => void;
	onGenerateRecoveryKey: (password: string) => void;
	recoveryMnemonic: string | null;
	recoveryLoading: boolean;
	onClearRecoveryMnemonic: () => void;
}

export default function VaultOnboarding({
	onComplete,
	onGenerateRecoveryKey,
	recoveryMnemonic,
	recoveryLoading,
	onClearRecoveryMnemonic,
}: VaultOnboardingProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState(1);

	// Step 2 State
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Step 3 State
	const [understandWarning, setUnderstandWarning] = useState(false);

	// Step 4 State
	const [recoverySaved, setRecoverySaved] = useState(false);

	const { score, isStrongEnough } = usePasswordStrength(password);

	// When recoveryMnemonic is set, advance to step 4
	useEffect(() => {
		if (recoveryMnemonic) {
			setStep(4);
		}
	}, [recoveryMnemonic]);

	const handleCopy = useCallback(async () => {
		if (!recoveryMnemonic) return;
		await navigator.clipboard.writeText(recoveryMnemonic);
		toast.success(t("tools.password_manager_recovery_copied"));
	}, [recoveryMnemonic, t]);

	const handleDownload = useCallback(() => {
		if (!recoveryMnemonic) return;
		const blob = new Blob([recoveryMnemonic], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "snipit-recovery-key.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success(
			t(
				"tools.password_manager_recovery_downloaded",
				"Downloaded recovery key",
			),
		);
	}, [recoveryMnemonic, t]);

	const handleCreateVault = useCallback(() => {
		onGenerateRecoveryKey(password);
	}, [onGenerateRecoveryKey, password]);

	const handleFinish = useCallback(() => {
		onComplete(password);
		onClearRecoveryMnemonic();
	}, [onComplete, onClearRecoveryMnemonic, password]);

	const handleSkip = useCallback(() => {
		onComplete(password);
		onClearRecoveryMnemonic();
	}, [onComplete, onClearRecoveryMnemonic, password]);

	const passwordsMatch = password === confirmPassword && password.length > 0;

	return (
		<div className="h-full w-full overflow-y-auto flex flex-col items-center justify-center p-4 md:p-8">
			<div className="w-full my-auto py-8">
				{step === 1 && (
					<Step1FeatureOverview onNext={() => setStep(2)} />
				)}
				{step === 2 && (
					<Step2CreatePassword
						password={password}
						onPasswordChange={setPassword}
						confirmPassword={confirmPassword}
						onConfirmPasswordChange={setConfirmPassword}
						strengthScore={score}
						isStrongEnough={isStrongEnough}
						passwordsMatch={passwordsMatch}
						onBack={() => setStep(1)}
						onNext={() => setStep(3)}
					/>
				)}
				{step === 3 && (
					<Step3Warning
						understandWarning={understandWarning}
						onUnderstandChange={setUnderstandWarning}
						onBack={() => setStep(2)}
						onNext={handleCreateVault}
						recoveryLoading={recoveryLoading}
					/>
				)}
				{step === 4 && (
					<Step4RecoveryKey
						recoveryMnemonic={recoveryMnemonic}
						recoverySaved={recoverySaved}
						onRecoverySavedChange={setRecoverySaved}
						onCopy={handleCopy}
						onDownload={handleDownload}
						onFinish={handleFinish}
						onSkip={handleSkip}
					/>
				)}
			</div>
		</div>
	);
}
