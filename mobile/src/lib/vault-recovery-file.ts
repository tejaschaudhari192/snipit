import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/**
 * Copies text to system clipboard and sets a temporary field indicator
 */
export async function copyToClipboard(
	text: string,
	field: string,
	setCopiedField: (f: string | null) => void,
	timeoutMs = 2000
) {
	await Clipboard.setStringAsync(text);
	setCopiedField(field);
	setTimeout(() => setCopiedField(null), timeoutMs);
}

/**
 * Downloads or shares the 12-word recovery mnemonic file across web and native platforms
 */
export async function downloadRecoveryKeyFile(
	mnemonic: string,
	showAlert: (title: string, message?: string, type?: "info" | "success" | "warning" | "error") => void
) {
	const backupContent = mnemonic.trim();
	const filename = "snipit-recovery-key.txt";

	if (Platform.OS === "web") {
		try {
			const blob = new Blob([backupContent], { type: "text/plain;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showAlert("Recovery Key Downloaded", "File snipit-recovery-key.txt downloaded.", "success");
		} catch {
			await Clipboard.setStringAsync(backupContent);
			showAlert("Recovery Key Copied", "Recovery key copied to clipboard.", "info");
		}
		return;
	}

	try {
		const fileUri = `${FileSystem.documentDirectory}${filename}`;
		await FileSystem.writeAsStringAsync(fileUri, backupContent, {
			encoding: FileSystem.EncodingType.UTF8,
		});

		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(fileUri, {
				mimeType: "text/plain",
				dialogTitle: "Save Recovery Key File",
				UTI: "public.plain-text",
			});
			showAlert("Key File Ready", "Save snipit-recovery-key.txt to your Files or Drive.", "success");
		} else {
			await Clipboard.setStringAsync(backupContent);
			showAlert("Key Copied", "Key copied to clipboard. Save it securely.", "info");
		}
	} catch (err: any) {
		console.log("Error saving recovery key file:", err);
		await Clipboard.setStringAsync(backupContent);
		showAlert("Key Copied", "Recovery key copied to clipboard.", "info");
	}
}
