import { useState, useEffect } from "react";
import { usePasswordStrength } from "@/hooks/use-password-strength";

import UnlockStandard from "./unlock-steps/unlock-standard";
import UnlockRecovery from "./unlock-steps/unlock-recovery";
import UnlockReset from "./unlock-steps/unlock-reset";

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
	const [password, setPassword] = useState("");
	const [shake, setShake] = useState(false);

	// Recovery mode
	const [showRecovery, setShowRecovery] = useState(false);
	const [recoveryPhrase, setRecoveryPhrase] = useState("");

	// New password mode (after successful recovery)
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	const { isStrongEnough: isNewPwStrong } = usePasswordStrength(newPassword);

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

	const newPwMatch =
		newPassword === confirmNewPassword && newPassword.length > 0;

	if (recoveryMode) {
		return (
			<UnlockReset
				newPassword={newPassword}
				onNewPasswordChange={setNewPassword}
				confirmNewPassword={confirmNewPassword}
				onConfirmNewPasswordChange={setConfirmNewPassword}
				isNewPwStrong={isNewPwStrong}
				newPwMatch={newPwMatch}
				recoveryLoading={recoveryLoading}
				recoveryError={recoveryError}
				onSubmit={handleSetNewPassword}
				onBack={() => onSetRecoveryMode(false)}
			/>
		);
	}

	if (showRecovery) {
		return (
			<UnlockRecovery
				recoveryPhrase={recoveryPhrase}
				onRecoveryPhraseChange={setRecoveryPhrase}
				onSubmit={handleRecover}
				recoveryError={recoveryError}
				recoveryLoading={recoveryLoading}
				onBack={() => {
					setShowRecovery(false);
					setRecoveryPhrase("");
				}}
			/>
		);
	}

	return (
		<UnlockStandard
			password={password}
			onPasswordChange={setPassword}
			onSubmit={handleSubmit}
			error={error}
			loading={loading}
			hasRecoveryKey={hasRecoveryKey}
			onShowRecovery={() => setShowRecovery(true)}
			shake={shake}
		/>
	);
}
