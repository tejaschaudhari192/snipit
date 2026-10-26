import React, { useState } from "react";
import {
	View,
	ScrollView,
	SafeAreaView,
	Platform,
	StatusBar,
	TouchableOpacity,
} from "react-native";
import {
	ArrowLeft,
	Lock,
	KeyRound,
	Check,
	Copy,
	Download,
	Upload,
	ClipboardPaste,
	Fingerprint,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
import { UserSession } from "../core/vault-storage";
import { ModernToggle } from "./ModernToggle";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FormInput, FormPasswordInput } from "./FormControls";

interface AuthProps {
	onBack: () => void;
	theme?: "dark" | "light";
}

export function VaultRecoveryScreen({
	onBack,
	error,
	inputMnemonic,
	setInputMnemonic,
	onRecover,
	isRecovering = false,
}: AuthProps & {
	error: string;
	inputMnemonic: string;
	setInputMnemonic: (val: string) => void;
	onRecover: () => void;
	isRecovering?: boolean;
}) {
	return (
		<SafeAreaView
			className="flex-1 bg-background"
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				<Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
					<ArrowLeft className="text-foreground" size={18} />
				</Button>
				<Text className="text-sm font-semibold tracking-tight">Recovery</Text>
				<View className="w-9" />
			</View>

			<ScrollView contentContainerClassName="p-4 flex-1 justify-center max-w-sm w-full mx-auto">
				<Card className="w-full border-border bg-card">
					<CardHeader className="text-center pb-2">
						<View className="w-12 h-12 rounded-full bg-muted justify-center items-center mx-auto mb-2">
							<KeyRound className="text-foreground" size={24} />
						</View>
						<CardTitle className="text-xl font-bold tracking-tight text-center">
							Restore Vault
						</CardTitle>
						<CardDescription className="text-center text-xs">
							Enter your 12-word recovery mnemonic key to restore your vault.
						</CardDescription>
					</CardHeader>

					<CardContent className="gap-3 pt-2">
						{error ? (
							<Text className="text-destructive text-xs text-center">{error}</Text>
						) : null}

						<View className="flex-row gap-2">
							<Button
								variant="outline"
								className="flex-1 h-9 flex-row gap-1.5"
								onPress={async () => {
									try {
										const res = await DocumentPicker.getDocumentAsync({
											type: ["application/json", "text/plain", "*/*"],
											copyToCacheDirectory: true,
										});
										if (!res.canceled && res.assets && res.assets.length > 0) {
											const fileUri = res.assets[0].uri;
											const content = await FileSystem.readAsStringAsync(fileUri);
											const parsed = JSON.parse(content);
											if (parsed.mnemonic) setInputMnemonic(parsed.mnemonic);
											else if (typeof parsed === "string") setInputMnemonic(parsed.trim());
										}
									} catch (e) {
										console.log("Could not read file:", e);
									}
								}}
							>
								<Upload className="text-foreground" size={14} />
								<Text className="text-xs">Upload File</Text>
							</Button>

							<Button
								variant="outline"
								className="flex-1 h-9 flex-row gap-1.5"
								onPress={async () => {
									const text = await Clipboard.getStringAsync();
									if (text) setInputMnemonic(text.trim());
								}}
							>
								<ClipboardPaste className="text-foreground" size={14} />
								<Text className="text-xs">Paste Key</Text>
							</Button>
						</View>

						<Input
							multiline
							placeholder="word1 word2 word3..."
							value={inputMnemonic}
							onChangeText={setInputMnemonic}
							className="h-24 p-3 text-sm"
						/>

						<Button
							className="w-full mt-2"
							disabled={isRecovering}
							onPress={onRecover}
						>
							<Text className="font-semibold text-primary-foreground">
								{isRecovering ? "Recovering..." : "Restore Password"}
							</Text>
						</Button>
					</CardContent>
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}

export function VaultUnlockScreen({
	onBack,
	user,
	error,
	hasRecovery,
	masterPassword,
	setMasterPassword,
	onUnlock,
	onOpenAuth,
	onOpenProfile,
	onForgotPassword,
	isDecrypting = false,
	isBiometricAvailable = false,
	biometricsEnabled = false,
	onBiometricUnlock,
	onToggleBiometrics,
}: AuthProps & {
	user: UserSession | null;
	error: string;
	hasRecovery: boolean;
	masterPassword: string;
	setMasterPassword: (p: string) => void;
	onUnlock: () => void;
	onOpenAuth: () => void;
	onOpenProfile?: () => void;
	onForgotPassword: () => void;
	isDecrypting?: boolean;
	isBiometricAvailable?: boolean;
	biometricsEnabled?: boolean;
	onBiometricUnlock?: () => void;
	onToggleBiometrics?: (val: boolean) => void;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<SafeAreaView
			className="flex-1 bg-background"
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				<Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
					<ArrowLeft className="text-foreground" size={18} />
				</Button>
				<Text className="text-sm font-semibold tracking-tight">Unlock Vault</Text>
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-2.5"
					onPress={user && onOpenProfile ? onOpenProfile : onOpenAuth}
				>
					<Text className="text-xs">{user ? user.username : "Sign In"}</Text>
				</Button>
			</View>

			<ScrollView contentContainerClassName="p-4 flex-1 justify-center max-w-sm w-full mx-auto">
				<Card className="w-full border-border bg-card">
					<CardHeader className="text-center pb-2">
						<View className="w-12 h-12 rounded-full bg-muted justify-center items-center mx-auto mb-2">
							<Lock className="text-foreground" size={24} />
						</View>
						<CardTitle className="text-xl font-bold tracking-tight text-center">
							Welcome Back
						</CardTitle>
						<CardDescription className="text-center text-xs">
							{user ? `${user.email} • ` : ""}Enter master password to unlock
						</CardDescription>
					</CardHeader>

					<CardContent className="gap-3 pt-2">
						{error ? (
							<Text className="text-destructive text-xs text-center">{error}</Text>
						) : null}

						<FormPasswordInput
							placeholder="Master Password"
							value={masterPassword}
							onChangeText={setMasterPassword}
							showPassword={showPassword}
							onToggleShowPassword={() => setShowPassword(!showPassword)}
							onSubmitEditing={onUnlock}
							editable={!isDecrypting}
						/>

						<View className="flex-row gap-2">
							<Button
								className="flex-1"
								disabled={isDecrypting}
								onPress={onUnlock}
							>
								<Text className="font-semibold text-primary-foreground">
									{isDecrypting ? "Decrypting..." : "Unlock Vault"}
								</Text>
							</Button>

							{isBiometricAvailable && biometricsEnabled && onBiometricUnlock && (
								<Button
									variant="outline"
									size="icon"
									className="h-10 w-10 shrink-0"
									disabled={isDecrypting}
									onPress={onBiometricUnlock}
								>
									<Fingerprint className="text-foreground" size={20} />
								</Button>
							)}
						</View>

						{hasRecovery && (
							<Button
								variant="link"
								className="h-auto p-0 mt-1"
								onPress={onForgotPassword}
							>
								<Text className="text-xs text-muted-foreground text-center">
									Forgot master password? Use recovery key
								</Text>
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Biometric toggle card */}
				{isBiometricAvailable && onToggleBiometrics && (
					<Card className="w-full mt-4 border-border bg-card py-3 px-4">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center gap-2.5 flex-1 pr-2">
								<Fingerprint className="text-foreground" size={18} />
								<View className="flex-1">
									<Text className="text-xs font-semibold">Biometric Unlock</Text>
									<Text className="text-[11px] text-muted-foreground">
										Unlock with fingerprint or face ID
									</Text>
								</View>
							</View>
							<ModernToggle
								value={biometricsEnabled}
								onValueChange={onToggleBiometrics}
							/>
						</View>
					</Card>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

export function VaultOnboardingScreen({
	onBack,
	step,
	masterPassword,
	confirmPassword,
	recoveryMnemonic,
	recoveryConfirmed,
	copiedField,
	error,
	setMasterPassword,
	setConfirmPassword,
	setRecoveryConfirmed,
	onNextToRecovery,
	onDownloadRecovery,
	onCopyMnemonic,
	onFinish,
	setStep,
	isCreatingVault = false,
}: AuthProps & {
	step: number;
	masterPassword: string;
	confirmPassword: string;
	recoveryMnemonic: string | null;
	recoveryConfirmed: boolean;
	copiedField: string | null;
	error: string;
	setMasterPassword: (p: string) => void;
	setConfirmPassword: (p: string) => void;
	setRecoveryConfirmed: (b: boolean) => void;
	onNextToRecovery: () => void;
	onDownloadRecovery: () => void;
	onCopyMnemonic: () => void;
	onFinish: () => void;
	setStep: (s: number) => void;
	isCreatingVault?: boolean;
}) {
	const [showMasterPassword, setShowMasterPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<SafeAreaView
			className="flex-1 bg-background"
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				<Button
					variant="ghost"
					size="icon"
					onPress={step === 1 ? onBack : () => setStep(step - 1)}
					className="h-9 w-9"
				>
					<ArrowLeft className="text-foreground" size={18} />
				</Button>
				<Text className="text-sm font-semibold tracking-tight">
					Step {step} of 3
				</Text>
				<View className="w-9" />
			</View>

			<ScrollView contentContainerClassName="p-4 flex-1 justify-center max-w-sm w-full mx-auto">
				<Card className="w-full border-border bg-card">
					{step === 1 && (
						<>
							<CardHeader className="text-center pb-2">
								<View className="w-12 h-12 rounded-full bg-muted justify-center items-center mx-auto mb-2">
									<Lock className="text-foreground" size={24} />
								</View>
								<CardTitle className="text-xl font-bold tracking-tight text-center">
									Zero-Knowledge Vault
								</CardTitle>
								<CardDescription className="text-center text-xs">
									All passwords and secure notes are encrypted on this device with XSalsa20-Poly1305.
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-2">
								<Button className="w-full" onPress={() => setStep(2)}>
									<Text className="font-semibold text-primary-foreground">
										Create Local Vault
									</Text>
								</Button>
							</CardContent>
						</>
					)}

					{step === 2 && (
						<>
							<CardHeader className="text-center pb-2">
								<CardTitle className="text-xl font-bold tracking-tight text-center">
									Set Master Password
								</CardTitle>
								<CardDescription className="text-center text-xs">
									Derives your encryption key. Cannot be recovered without your key.
								</CardDescription>
							</CardHeader>
							<CardContent className="gap-2.5 pt-2">
								{error ? (
									<Text className="text-destructive text-xs text-center">{error}</Text>
								) : null}

								<FormPasswordInput
									placeholder="Master Password (min 8 chars)"
									value={masterPassword}
									onChangeText={setMasterPassword}
									showPassword={showMasterPassword}
									onToggleShowPassword={() => setShowMasterPassword(!showMasterPassword)}
								/>

								<FormPasswordInput
									placeholder="Confirm Master Password"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									showPassword={showConfirmPassword}
									onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
								/>

								<Button className="w-full mt-2" onPress={onNextToRecovery}>
									<Text className="font-semibold text-primary-foreground">
										Generate Recovery Phrase
									</Text>
								</Button>
							</CardContent>
						</>
					)}

					{step === 3 && (
						<>
							<CardHeader className="text-center pb-2">
								<CardTitle className="text-xl font-bold tracking-tight text-center">
									12-Word Recovery Key
								</CardTitle>
								<CardDescription className="text-center text-xs">
									Save these words safely to restore your master password.
								</CardDescription>
							</CardHeader>
							<CardContent className="gap-3 pt-2">
								<View className="rounded-lg border border-border bg-muted p-3.5">
									<Text className="font-mono text-xs text-center leading-5 select-all">
										{recoveryMnemonic}
									</Text>
								</View>

								<View className="flex-row gap-2">
									<Button
										variant="outline"
										className="flex-1 h-9 flex-row gap-1.5"
										onPress={onCopyMnemonic}
									>
										{copiedField === "mnemonic" ? (
											<Check className="text-foreground" size={14} />
										) : (
											<Copy className="text-foreground" size={14} />
										)}
										<Text className="text-xs">
											{copiedField === "mnemonic" ? "Copied" : "Copy"}
										</Text>
									</Button>
									<Button
										variant="outline"
										className="flex-1 h-9 flex-row gap-1.5"
										onPress={onDownloadRecovery}
									>
										<Download className="text-foreground" size={14} />
										<Text className="text-xs">Download</Text>
									</Button>
								</View>

								<TouchableOpacity
									className="flex-row items-center gap-2 mt-2"
									onPress={() => setRecoveryConfirmed(!recoveryConfirmed)}
								>
									<View
										className={`w-4 h-4 rounded border border-border items-center justify-center ${
											recoveryConfirmed ? "bg-primary" : "bg-background"
										}`}
									>
										{recoveryConfirmed && (
											<Check className="text-primary-foreground" size={12} />
										)}
									</View>
									<Text className="text-xs text-muted-foreground flex-1">
										I have written down or saved my recovery phrase
									</Text>
								</TouchableOpacity>

								<Button
									className="w-full mt-2"
									disabled={!recoveryConfirmed || isCreatingVault}
									onPress={onFinish}
								>
									<Text className="font-semibold text-primary-foreground">
										{isCreatingVault ? "Creating Vault..." : "Complete & Enter Vault"}
									</Text>
								</Button>
							</CardContent>
						</>
					)}
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}
