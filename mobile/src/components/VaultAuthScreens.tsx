import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, ActivityIndicator, Platform, StatusBar } from "react-native";
import { ArrowLeft, Lock, Shield, KeyRound, Check, Copy, Download, Eye, EyeOff, Upload, ClipboardPaste } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
import { UserSession } from "../core/vault-storage";
import { useThemeVars } from "../config/theme";

interface AuthProps {
	onBack: () => void;
	theme?: "dark" | "light";
}

export function VaultRecoveryScreen({
	onBack,
	theme = "dark",
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
	const c = useThemeVars(theme);
	const isLight = theme === "light";
	return (
		<SafeAreaView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className={`flex-row items-center justify-between px-4 py-3 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
				<TouchableOpacity onPress={onBack} className="p-1.5" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text className={`text-[17px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Account Recovery</Text>
				<View className="w-10" />
			</View>

			<ScrollView contentContainerClassName="p-6 items-center">
				<View className={`w-[72px] h-[72px] rounded-full justify-center items-center my-4.5 ${isLight ? "bg-black/5" : "bg-white/10"}`}>
					<KeyRound color={c.text} size={36} strokeWidth={2} />
				</View>
				<Text className={`text-[22px] font-bold text-center mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>Restore via Recovery Key</Text>
				<Text className={`text-sm text-center leading-5 mb-4.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					Enter your 12-word recovery mnemonic phrase separated by spaces to restore your master password.
				</Text>
				{error ? <Text className="text-red-500 text-[13px] mb-2.5 text-center">{error}</Text> : null}

				{/* Quick Actions: Upload File or Paste */}
				<View className="flex-row gap-2.5 w-full mb-3">
					<TouchableOpacity
						className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
							isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
						}`}
						onPress={async () => {
							try {
								const res = await DocumentPicker.getDocumentAsync({
									type: ["text/plain", "*/*"],
									copyToCacheDirectory: true,
								});
								if (!res.canceled && res.assets && res.assets.length > 0) {
									const fileUri = res.assets[0].uri;
									let text = "";
									if (Platform.OS === "web") {
										const fileRes = await fetch(fileUri);
										text = await fileRes.text();
									} else {
										text = await FileSystem.readAsStringAsync(fileUri);
									}
									const clean = text.trim();
									setInputMnemonic(clean);
								}
							} catch (e) {
								console.log("Could not pick or read file:", e);
							}
						}}
						activeOpacity={0.7}
					>
						<Upload color={c.text} size={16} />
						<Text className={`text-[13px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Upload Key File</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
							isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
						}`}
						onPress={async () => {
							const text = await Clipboard.getStringAsync();
							if (text) setInputMnemonic(text.trim());
						}}
						activeOpacity={0.7}
					>
						<ClipboardPaste color={c.text} size={16} />
						<Text className={`text-[13px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Paste Key</Text>
					</TouchableOpacity>
				</View>

				<TextInput
					className={`w-full h-[100px] rounded-xl p-3 text-[15px] mb-3 border ${
						isLight ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-white border-slate-800"
					}`}
					placeholder="Enter or paste your 12-word recovery key..."
					placeholderTextColor={c.textSecondary}
					multiline
					value={inputMnemonic}
					onChangeText={setInputMnemonic}
				/>
				<TouchableOpacity
					className={`w-full py-3.5 rounded-xl items-center mt-2 ${
						isLight ? "bg-slate-950" : "bg-white"
					} ${isRecovering ? "opacity-70" : ""}`}
					onPress={onRecover}
					disabled={isRecovering}
				>
					{isRecovering ? (
						<View className="flex-row items-center gap-2">
							<ActivityIndicator size="small" color={isLight ? "#ffffff" : "#000000"} />
							<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Recovering Vault...</Text>
						</View>
					) : (
						<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Recover Master Password</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

export function VaultUnlockScreen({
	onBack,
	theme = "dark",
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
}) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";
	const [showPassword, setShowPassword] = useState(false);

	return (
		<SafeAreaView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className={`flex-row items-center justify-between px-4 py-3 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
				<TouchableOpacity onPress={onBack} className="p-1.5" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text className={`text-[17px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Unlock Vault</Text>
				<TouchableOpacity
					onPress={user && onOpenProfile ? onOpenProfile : onOpenAuth}
					className={`px-3 py-1.5 rounded-full border ${
						isLight ? "border-slate-200 bg-black/5" : "border-slate-800 bg-white/10"
					}`}
				>
					<Text className={`text-[13px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{user ? user.username : "Sign In"}</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerClassName="p-6 items-center">
				<View className={`w-[72px] h-[72px] rounded-full justify-center items-center my-4.5 ${isLight ? "bg-black/5" : "bg-white/10"}`}>
					<Lock color={c.text} size={36} strokeWidth={2} />
				</View>
				<Text className={`text-[22px] font-bold text-center mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>Welcome Back</Text>
				<Text className={`text-sm text-center leading-5 mb-4.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					{user ? `Account: ${user.email}\n` : ""}Enter your master password to decrypt your credentials.
				</Text>
				{error ? <Text className="text-red-500 text-[13px] mb-2.5 text-center">{error}</Text> : null}
				<View className={`w-full flex-row items-center rounded-xl border mb-3 pr-2.5 ${
					isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
				}`}>
					<TextInput
						className={`flex-1 p-3 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
						placeholder="Master Password"
						placeholderTextColor={c.textSecondary}
						secureTextEntry={!showPassword}
						value={masterPassword}
						onChangeText={setMasterPassword}
						onSubmitEditing={onUnlock}
						editable={!isDecrypting}
						autoCapitalize="none"
					/>
					<TouchableOpacity
						className="p-1.5 justify-center items-center"
						onPress={() => setShowPassword(!showPassword)}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						{showPassword ? (
							<EyeOff size={18} color={c.textSecondary} />
						) : (
							<Eye size={18} color={c.textSecondary} />
						)}
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					className={`w-full py-3.5 rounded-xl items-center mt-2 ${
						isLight ? "bg-slate-950" : "bg-white"
					} ${isDecrypting ? "opacity-70" : ""}`}
					onPress={onUnlock}
					disabled={isDecrypting}
				>
					{isDecrypting ? (
						<View className="flex-row items-center gap-2">
							<ActivityIndicator size="small" color={isLight ? "#ffffff" : "#000000"} />
							<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Decrypting Vault...</Text>
						</View>
					) : (
						<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Unlock Vault</Text>
					)}
				</TouchableOpacity>
				{hasRecovery && (
					<TouchableOpacity className="mt-4.5 p-2" onPress={onForgotPassword}>
						<Text className={`text-sm font-medium underline ${isLight ? "text-slate-500" : "text-slate-400"}`}>Forgot password? Use recovery key</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

export function VaultOnboardingScreen({
	onBack,
	theme = "dark",
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
	const c = useThemeVars(theme);
	const isLight = theme === "light";
	const [showMasterPassword, setShowMasterPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<SafeAreaView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			<View className={`flex-row items-center justify-between px-4 py-3 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
				<TouchableOpacity onPress={onBack} className="p-1.5" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text className={`text-[17px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Setup Vault</Text>
				<View className="w-10" />
			</View>

			<ScrollView contentContainerClassName="p-6 items-center">
				<View className={`w-[72px] h-[72px] rounded-full justify-center items-center my-4.5 ${isLight ? "bg-black/5" : "bg-white/10"}`}>
					<Shield color={c.text} size={36} strokeWidth={2} />
				</View>

				{step === 1 && (
					<>
						<Text className={`text-[22px] font-bold text-center mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>Zero-Knowledge Vault</Text>
						<Text className={`text-sm text-center leading-5 mb-4.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							Your passwords are encrypted on this device using XSalsa20-Poly1305 before anything is saved.
						</Text>
						<View className={`w-full rounded-xl p-4 mb-5 border gap-2.5 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}>
							<Text className={`text-sm leading-5 ${isLight ? "text-slate-900" : "text-white"}`}>🔒 Military-grade XSalsa20 encryption</Text>
							<Text className={`text-sm leading-5 ${isLight ? "text-slate-900" : "text-white"}`}>🔑 BIP-39 12-word mnemonic backup phrase</Text>
							<Text className={`text-sm leading-5 ${isLight ? "text-slate-900" : "text-white"}`}>💳 Logins, Credit Cards, API Keys & Notes</Text>
							<Text className={`text-sm leading-5 ${isLight ? "text-slate-900" : "text-white"}`}>⚡ 100% offline & zero cloud dependency</Text>
						</View>
						<TouchableOpacity
							className={`w-full py-3.5 rounded-xl items-center mt-2 ${isLight ? "bg-slate-950" : "bg-white"}`}
							onPress={() => setStep(2)}
						>
							<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Create Master Password</Text>
						</TouchableOpacity>
					</>
				)}

				{step === 2 && (
					<>
						<Text className={`text-[22px] font-bold text-center mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>Set Master Password</Text>
						<Text className={`text-sm text-center leading-5 mb-4.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							This password derives your encryption key. We cannot restore your vault if lost.
						</Text>
						{error ? <Text className="text-red-500 text-[13px] mb-2.5 text-center">{error}</Text> : null}
						<View className={`w-full flex-row items-center rounded-xl border mb-3 pr-2.5 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}>
							<TextInput
								className={`flex-1 p-3 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
								placeholder="Master Password (min 8 chars)"
								placeholderTextColor={c.textSecondary}
								secureTextEntry={!showMasterPassword}
								value={masterPassword}
								onChangeText={setMasterPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								className="p-1.5 justify-center items-center"
								onPress={() => setShowMasterPassword(!showMasterPassword)}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								{showMasterPassword ? (
									<EyeOff size={18} color={c.textSecondary} />
								) : (
									<Eye size={18} color={c.textSecondary} />
								)}
							</TouchableOpacity>
						</View>
						<View className={`w-full flex-row items-center rounded-xl border mb-3 pr-2.5 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}>
							<TextInput
								className={`flex-1 p-3 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
								placeholder="Confirm Master Password"
								placeholderTextColor={c.textSecondary}
								secureTextEntry={!showConfirmPassword}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								className="p-1.5 justify-center items-center"
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								{showConfirmPassword ? (
									<EyeOff size={18} color={c.textSecondary} />
								) : (
									<Eye size={18} color={c.textSecondary} />
								)}
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							className={`w-full py-3.5 rounded-xl items-center mt-2 ${isLight ? "bg-slate-950" : "bg-white"}`}
							onPress={onNextToRecovery}
						>
							<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Generate Recovery Phrase</Text>
						</TouchableOpacity>
					</>
				)}

				{step === 3 && (
					<>
						<Text className={`text-[22px] font-bold text-center mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>Your 12-Word Recovery Key</Text>
						<Text className={`text-sm text-center leading-5 mb-4.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							Write down these 12 words in order. You can use them to recover your master password.
						</Text>
						<View className={`rounded-xl p-4 border w-full mb-3.5 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}>
							<Text className={`font-mono text-[15px] leading-6 text-center ${isLight ? "text-slate-900" : "text-white"}`}>{recoveryMnemonic}</Text>
						</View>
						<View className="flex-row gap-2.5 w-full mb-4">
							<TouchableOpacity
								className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
									isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
								}`}
								onPress={onCopyMnemonic}
							>
								{copiedField === "mnemonic" ? <Check color={c.green} size={16} /> : <Copy color={c.text} size={16} />}
								<Text className={`text-[13px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{copiedField === "mnemonic" ? "Copied" : "Copy"}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
									isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
								}`}
								onPress={onDownloadRecovery}
							>
								<Download color={c.text} size={16} />
								<Text className={`text-[13px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Download</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							className="flex-row items-center gap-2.5 mb-4"
							onPress={() => setRecoveryConfirmed(!recoveryConfirmed)}
						>
							<View className={`w-[18px] h-[18px] rounded border justify-center items-center ${
								recoveryConfirmed
									? isLight
										? "bg-slate-950 border-slate-950"
										: "bg-white border-white"
									: "border-slate-400"
							}`}>
								{recoveryConfirmed && <Check color={isLight ? "#fff" : "#000"} size={12} />}
							</View>
							<Text className={`text-[13px] flex-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>I have safely backed up my 12-word recovery key.</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`w-full py-3.5 rounded-xl items-center mt-2 ${
								isLight ? "bg-slate-950" : "bg-white"
							} ${isCreatingVault ? "opacity-70" : ""}`}
							onPress={onFinish}
							disabled={isCreatingVault}
						>
							{isCreatingVault ? (
								<View className="flex-row items-center gap-2">
									<ActivityIndicator size="small" color={isLight ? "#ffffff" : "#000000"} />
									<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Creating Vault...</Text>
								</View>
							) : (
								<Text className={`text-base font-bold ${isLight ? "text-white" : "text-slate-950"}`}>Complete Setup & Unlock</Text>
							)}
						</TouchableOpacity>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
