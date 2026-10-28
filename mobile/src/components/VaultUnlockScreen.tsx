import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock, Fingerprint } from "lucide-react-native";
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
import { FormPasswordInput } from "./FormControls";

interface VaultUnlockScreenProps {
	onBack: () => void;
	theme?: "dark" | "light";
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
}: VaultUnlockScreenProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<SafeAreaView
			className="flex-1 bg-background"
			edges={["top", "bottom", "left", "right"]}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				<Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
					<ArrowLeft className="text-foreground" size={18} />
				</Button>
				<Text className="text-sm font-semibold tracking-tight">Unlock Vault</Text>
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3 min-w-[72px]"
					onPress={user && onOpenProfile ? onOpenProfile : onOpenAuth}
				>
					<Text className="text-xs font-medium">{user ? (user.username || user.email?.split("@")[0] || "Account") : "Sign In"}</Text>
				</Button>
			</View>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
				contentContainerClassName="max-w-sm w-full mx-auto"
				showsVerticalScrollIndicator={false}
			>
				<Card className="w-full border-border bg-card py-6">
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
