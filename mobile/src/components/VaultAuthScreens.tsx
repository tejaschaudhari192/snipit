import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView, ActivityIndicator, Platform, StatusBar } from "react-native";
import { ArrowLeft, Lock, Shield, KeyRound, Check, Copy, Download } from "lucide-react-native";
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
		<SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: c.text }]}>Account Recovery</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView contentContainerStyle={styles.authContainer}>
				<View style={[styles.iconContainer, { backgroundColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)" }]}>
					<KeyRound color={c.text} size={36} strokeWidth={2} />
				</View>
				<Text style={[styles.title, { color: c.text }]}>Restore via Recovery Key</Text>
				<Text style={[styles.subText, { color: c.textSecondary }]}>
					Enter your 12-word recovery mnemonic phrase separated by spaces to restore your master password.
				</Text>
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				<TextInput
					style={[styles.input, { height: 100, backgroundColor: c.bgSecondary, color: c.text, borderColor: c.border }]}
					placeholder="e.g. apple banana cherry dog elephant fish grape horse..."
					placeholderTextColor={c.textSecondary}
					multiline
					value={inputMnemonic}
					onChangeText={setInputMnemonic}
				/>
				<TouchableOpacity
					style={[
						styles.primaryBtn,
						{ backgroundColor: isLight ? "#000000" : "#ffffff" },
						isRecovering && { opacity: 0.7 },
					]}
					onPress={onRecover}
					disabled={isRecovering}
				>
					{isRecovering ? (
						<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
							<ActivityIndicator size="small" color={isLight ? "#ffffff" : "#000000"} />
							<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Recovering Vault...</Text>
						</View>
					) : (
						<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Recover Master Password</Text>
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
	return (
		<SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: c.text }]}>Unlock Vault</Text>
				<TouchableOpacity onPress={user && onOpenProfile ? onOpenProfile : onOpenAuth} style={[styles.accountBtn, { borderColor: c.border, backgroundColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)" }]}>
					<Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>{user ? user.username : "Sign In"}</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.authContainer}>
				<View style={[styles.iconContainer, { backgroundColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)" }]}>
					<Lock color={c.text} size={36} strokeWidth={2} />
				</View>
				<Text style={[styles.title, { color: c.text }]}>Welcome Back</Text>
				<Text style={[styles.subText, { color: c.textSecondary }]}>
					{user ? `Account: ${user.email}\n` : ""}Enter your master password to decrypt your credentials.
				</Text>
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				<TextInput
					style={[styles.input, { backgroundColor: c.bgSecondary, color: c.text, borderColor: c.border }]}
					placeholder="Master Password"
					placeholderTextColor={c.textSecondary}
					secureTextEntry
					value={masterPassword}
					onChangeText={setMasterPassword}
					onSubmitEditing={onUnlock}
					editable={!isDecrypting}
				/>
				<TouchableOpacity
					style={[
						styles.primaryBtn,
						{ backgroundColor: isLight ? "#000000" : "#ffffff" },
						isDecrypting && { opacity: 0.7 },
					]}
					onPress={onUnlock}
					disabled={isDecrypting}
				>
					{isDecrypting ? (
						<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
							<ActivityIndicator size="small" color={isLight ? "#ffffff" : "#000000"} />
							<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Decrypting Vault...</Text>
						</View>
					) : (
						<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Unlock Vault</Text>
					)}
				</TouchableOpacity>
				{hasRecovery && (
					<TouchableOpacity style={{ marginTop: 18, padding: 8 }} onPress={onForgotPassword}>
						<Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: "500", textDecorationLine: "underline" }}>Forgot password? Use recovery key</Text>
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
}) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";
	return (
		<SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
					<ArrowLeft color={c.text} size={20} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: c.text }]}>Setup Vault</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView contentContainerStyle={styles.authContainer}>
				<View style={[styles.iconContainer, { backgroundColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)" }]}>
					<Shield color={c.text} size={36} strokeWidth={2} />
				</View>

				{step === 1 && (
					<>
						<Text style={[styles.title, { color: c.text }]}>Zero-Knowledge Vault</Text>
						<Text style={[styles.subText, { color: c.textSecondary }]}>
							Your passwords are encrypted on this device using XSalsa20-Poly1305 before anything is saved.
						</Text>
						<View style={[styles.featureBox, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
							<Text style={[styles.featureItem, { color: c.text }]}>🔒 Military-grade XSalsa20 encryption</Text>
							<Text style={[styles.featureItem, { color: c.text }]}>🔑 BIP-39 12-word mnemonic backup phrase</Text>
							<Text style={[styles.featureItem, { color: c.text }]}>💳 Logins, Credit Cards, API Keys & Notes</Text>
							<Text style={[styles.featureItem, { color: c.text }]}>⚡ 100% offline & zero cloud dependency</Text>
						</View>
						<TouchableOpacity
							style={[styles.primaryBtn, { backgroundColor: isLight ? "#000000" : "#ffffff" }]}
							onPress={() => setStep(2)}
						>
							<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Create Master Password</Text>
						</TouchableOpacity>
					</>
				)}

				{step === 2 && (
					<>
						<Text style={[styles.title, { color: c.text }]}>Set Master Password</Text>
						<Text style={[styles.subText, { color: c.textSecondary }]}>
							This password derives your encryption key. We cannot restore your vault if lost.
						</Text>
						{error ? <Text style={styles.errorText}>{error}</Text> : null}
						<TextInput
							style={[styles.input, { backgroundColor: c.bgSecondary, color: c.text, borderColor: c.border }]}
							placeholder="Master Password (min 8 chars)"
							placeholderTextColor={c.textSecondary}
							secureTextEntry
							value={masterPassword}
							onChangeText={setMasterPassword}
						/>
						<TextInput
							style={[styles.input, { backgroundColor: c.bgSecondary, color: c.text, borderColor: c.border }]}
							placeholder="Confirm Master Password"
							placeholderTextColor={c.textSecondary}
							secureTextEntry
							value={confirmPassword}
							onChangeText={setConfirmPassword}
						/>
						<TouchableOpacity
							style={[styles.primaryBtn, { backgroundColor: isLight ? "#000000" : "#ffffff" }]}
							onPress={onNextToRecovery}
						>
							<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Generate Recovery Phrase</Text>
						</TouchableOpacity>
					</>
				)}

				{step === 3 && (
					<>
						<Text style={[styles.title, { color: c.text }]}>Your 12-Word Recovery Key</Text>
						<Text style={[styles.subText, { color: c.textSecondary }]}>
							Write down these 12 words in order. You can use them to recover your master password.
						</Text>
						<View style={[styles.mnemonicBox, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
							<Text style={[styles.mnemonicText, { color: c.text }]}>{recoveryMnemonic}</Text>
						</View>
						<View style={{ flexDirection: "row", gap: 10, width: "100%", marginBottom: 16 }}>
							<TouchableOpacity style={[styles.recoveryBtn, { borderColor: c.border }]} onPress={onCopyMnemonic}>
								{copiedField === "mnemonic" ? <Check color={c.green} size={16} /> : <Copy color={c.text} size={16} />}
								<Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>{copiedField === "mnemonic" ? "Copied" : "Copy"}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.recoveryBtn, { borderColor: c.border }]} onPress={onDownloadRecovery}>
								<Download color={c.text} size={16} />
								<Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>Download</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }} onPress={() => setRecoveryConfirmed(!recoveryConfirmed)}>
							<View style={[styles.checkbox, recoveryConfirmed && { backgroundColor: isLight ? "#000" : "#fff", borderColor: isLight ? "#000" : "#fff" }]}>
								{recoveryConfirmed && <Check color={isLight ? "#fff" : "#000"} size={12} />}
							</View>
							<Text style={{ color: c.textSecondary, fontSize: 13, flex: 1 }}>I have safely backed up my 12-word recovery key.</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.primaryBtn, { backgroundColor: isLight ? "#000000" : "#ffffff" }]}
							onPress={onFinish}
						>
							<Text style={[styles.btnText, { color: isLight ? "#ffffff" : "#000000" }]}>Complete Setup & Unlock</Text>
						</TouchableOpacity>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
	headerTitle: { fontSize: 17, fontWeight: "600" },
	iconBtn: { padding: 6 },
	accountBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
	authContainer: { padding: 24, alignItems: "center" },
	iconContainer: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginVertical: 18 },
	title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
	subText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 18 },
	input: { width: "100%", borderRadius: 10, padding: 13, fontSize: 15, marginBottom: 12 },
	primaryBtn: { width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
	btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	errorText: { color: "#ff453a", fontSize: 13, marginBottom: 10, textAlign: "center" },
	featureBox: { width: "100%", borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 0.5, gap: 10 },
	featureItem: { fontSize: 14, lineHeight: 20 },
	mnemonicBox: { borderRadius: 12, padding: 16, borderWidth: 0.5, width: "100%", marginBottom: 14 },
	mnemonicText: { fontFamily: "monospace", fontSize: 15, lineHeight: 24, textAlign: "center" },
	recoveryBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 0.5 },
	checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: "#8e8e93", justifyContent: "center", alignItems: "center" },
});
