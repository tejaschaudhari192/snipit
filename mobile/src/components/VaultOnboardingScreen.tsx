import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock, KeyRound, Check, Copy, Download } from "lucide-react-native";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { FormPasswordInput } from "./FormControls";

interface VaultOnboardingScreenProps {
	onBack?: () => void;
	theme?: "dark" | "light";
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
}: VaultOnboardingScreenProps) {
	const [showMasterPassword, setShowMasterPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<SafeAreaView
			className="flex-1 bg-background"
			edges={["top", "bottom", "left", "right"]}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				{step > 1 ? (
					<Button
						variant="ghost"
						size="icon"
						onPress={() => setStep(step - 1)}
						className="h-9 w-9"
					>
						<ArrowLeft className="text-foreground" size={18} />
					</Button>
				) : (
					<View className="w-9" />
				)}
				<Text className="text-sm font-semibold tracking-tight">
					Step {step} of 3
				</Text>
				<View className="w-9" />
			</View>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
				contentContainerClassName="p-4 max-w-sm w-full mx-auto"
				showsVerticalScrollIndicator={false}
			>
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

							<CardContent className="gap-3 pt-2">
								{error ? (
									<Text className="text-destructive text-xs text-center">{error}</Text>
								) : null}

								<FormPasswordInput
									label="Master Password"
									placeholder="Min 8 characters"
									value={masterPassword}
									onChangeText={setMasterPassword}
									showPassword={showMasterPassword}
									onToggleShowPassword={() => setShowMasterPassword(!showMasterPassword)}
								/>

								<FormPasswordInput
									label="Confirm Master Password"
									placeholder="Re-enter password"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									showPassword={showConfirmPassword}
									onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
									onSubmitEditing={onNextToRecovery}
								/>

								<Button
									className="w-full mt-2"
									onPress={onNextToRecovery}
								>
									<Text className="font-semibold text-primary-foreground">
										Create Secure Vault
									</Text>
								</Button>
							</CardContent>
						</>
					)}

					{step === 2 && (
						<>
							<CardHeader className="text-center pb-2">
								<View className="w-12 h-12 rounded-full bg-muted justify-center items-center mx-auto mb-2">
									<KeyRound className="text-foreground" size={24} />
								</View>
								<CardTitle className="text-xl font-bold tracking-tight text-center">
									Emergency Key
								</CardTitle>
								<CardDescription className="text-center text-xs">
									Save these 12 words securely. It is the only way to recover your vault if you forget your master password.
								</CardDescription>
							</CardHeader>

							<CardContent className="gap-3 pt-2">
								<View className="p-3 rounded-lg border border-border bg-muted/40">
									<Text className="text-xs font-mono text-foreground leading-5 text-center select-text">
										{recoveryMnemonic}
									</Text>
								</View>

								<View className="flex-row gap-2">
									<Button
										variant="outline"
										className="flex-1 h-9 flex-row gap-1.5"
										onPress={onDownloadRecovery}
									>
										<Download className="text-foreground" size={14} />
										<Text className="text-xs">Save File</Text>
									</Button>

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
											{copiedField === "mnemonic" ? "Copied" : "Copy Words"}
										</Text>
									</Button>
								</View>

								<Button
									className="w-full mt-2"
									onPress={() => setStep(3)}
								>
									<Text className="font-semibold text-primary-foreground">
										I Have Saved It
									</Text>
								</Button>
							</CardContent>
						</>
					)}

					{step === 3 && (
						<>
							<CardHeader className="text-center pb-2">
								<View className="w-12 h-12 rounded-full bg-muted justify-center items-center mx-auto mb-2">
									<Check className="text-foreground" size={24} />
								</View>
								<CardTitle className="text-xl font-bold tracking-tight text-center">
									Ready to Encrypt
								</CardTitle>
								<CardDescription className="text-center text-xs">
									Please confirm you have backed up your recovery key.
								</CardDescription>
							</CardHeader>

							<CardContent className="gap-3 pt-2">
								<Button
									variant={recoveryConfirmed ? "default" : "outline"}
									className="w-full h-10 flex-row gap-2"
									onPress={() => setRecoveryConfirmed(!recoveryConfirmed)}
								>
									<View className={`w-4 h-4 rounded border ${recoveryConfirmed ? "border-primary-foreground bg-primary-foreground" : "border-border"}`} />
									<Text className="text-xs font-medium">
										I have safely backed up my 12 words
									</Text>
								</Button>

								<Button
									className="w-full mt-2"
									disabled={!recoveryConfirmed || isCreatingVault}
									onPress={onFinish}
								>
									<Text className="font-semibold text-primary-foreground">
										{isCreatingVault ? "Creating Vault..." : "Finish Setup"}
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
