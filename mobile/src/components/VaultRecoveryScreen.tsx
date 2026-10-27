import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, KeyRound, Upload, ClipboardPaste } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
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

interface VaultRecoveryScreenProps {
	onBack: () => void;
	theme?: "dark" | "light";
	error: string;
	inputMnemonic: string;
	setInputMnemonic: (val: string) => void;
	onRecover: () => void;
	isRecovering?: boolean;
}

export function VaultRecoveryScreen({
	onBack,
	error,
	inputMnemonic,
	setInputMnemonic,
	onRecover,
	isRecovering = false,
}: VaultRecoveryScreenProps) {
	return (
		<SafeAreaView
			className="flex-1 bg-background"
			edges={["top", "bottom", "left", "right"]}
		>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				<Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
					<ArrowLeft className="text-foreground" size={18} />
				</Button>
				<Text className="text-sm font-semibold tracking-tight">Recovery</Text>
				<View className="w-9" />
			</View>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
				contentContainerClassName="p-4 max-w-sm w-full mx-auto"
				showsVerticalScrollIndicator={false}
			>
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
											const match = content.match(/RECOVERY KEY:\s*([a-z\s]+)/i);
											if (match && match[1]) {
												setInputMnemonic(match[1].trim());
											} else {
												setInputMnemonic(content.trim());
											}
										}
									} catch (err) {
										console.log("File read error:", err);
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
							placeholder="apple banana cherry dog elephant..."
							value={inputMnemonic}
							onChangeText={setInputMnemonic}
							autoCapitalize="none"
							autoCorrect={false}
							className="h-20 text-xs py-2"
							multiline
						/>

						<Button
							className="w-full mt-2"
							disabled={isRecovering}
							onPress={onRecover}
						>
							<Text className="font-semibold text-primary-foreground">
								{isRecovering ? "Decrypting Vault..." : "Restore Vault"}
							</Text>
						</Button>
					</CardContent>
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}
