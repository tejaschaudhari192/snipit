import React, { useState, useMemo } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Platform,
	Switch,
} from "react-native";
import {
	Upload,
	Download,
	CopyX,
	ShieldCheck,
	Trash2,
	ChevronRight,
	Key,
	Lock,
	CheckCircle2,
	AlertTriangle,
	Folder as FolderIcon,
	FileText,
	Fingerprint,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { offlineVault, PasswordItem, Folder } from "../core/vault-storage";
import { useThemeVars } from "../config/theme";

interface PWMGSettingsScreenProps {
	items: PasswordItem[];
	folders: Folder[];
	theme?: "dark" | "light";
	onReloadData: () => void;
	onResetVault: () => void;
	onSelectTab: (tab: "passwords" | "folders" | "notes") => void;
	showAlert: (
		title: string,
		message?: string,
		type?: "info" | "success" | "warning" | "error",
		buttons?: any[],
	) => void;
	isBiometricAvailable?: boolean;
	biometricsEnabled?: boolean;
	onToggleBiometrics?: (enable: boolean) => void;
}

export function PWMGSettingsScreen({
	items,
	folders,
	theme = "dark",
	onReloadData,
	onResetVault,
	onSelectTab,
	showAlert,
	isBiometricAvailable = false,
	biometricsEnabled = false,
	onToggleBiometrics,
}: PWMGSettingsScreenProps) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";

	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isDeduplicating, setIsDeduplicating] = useState(false);

	// ─── VAULT HEALTH COMPUTATIONS ─────────────────────────────────────────────
	const health = useMemo(() => {
		const total = items.length;
		const logins = items.filter((i) => i.category === "login" || !i.category);
		const cards = items.filter((i) => i.category === "card");
		const notes = items.filter((i) => i.category === "note");
		const apiKeys = items.filter((i) => i.category === "apikey");

		// Password reuse map
		const passwordMap = new Map<string, number>();
		let weakCount = 0;

		logins.forEach((item) => {
			const pass = item.password || "";
			if (pass) {
				passwordMap.set(pass, (passwordMap.get(pass) || 0) + 1);
				if (pass.length < 10) weakCount++;
			}
		});

		let reusedCount = 0;
		passwordMap.forEach((count) => {
			if (count > 1) reusedCount += count;
		});

		// Find potential duplicate entries by identical (title + username/url)
		const duplicateGroups = new Map<string, PasswordItem[]>();
		items.forEach((item) => {
			const key = `${(item.title || "").toLowerCase().trim()}|${(item.username || "").toLowerCase().trim()}|${(item.url || "").toLowerCase().trim()}`;
			if (!duplicateGroups.has(key)) duplicateGroups.set(key, []);
			duplicateGroups.get(key)!.push(item);
		});

		let duplicateItemsCount = 0;
		duplicateGroups.forEach((group) => {
			if (group.length > 1) duplicateItemsCount += group.length;
		});

		return {
			total,
			loginsCount: logins.length,
			cardsCount: cards.length,
			notesCount: notes.length,
			apiKeysCount: apiKeys.length,
			reusedCount,
			weakCount,
			duplicateItemsCount,
			duplicateGroups,
		};
	}, [items]);

	// ─── EXPORT BACKUP ─────────────────────────────────────────────────────────
	const handleExportVault = async () => {
		if (items.length === 0) {
			showAlert("Empty Vault", "There are no credentials or notes to export.", "warning");
			return;
		}

		setIsExporting(true);
		try {
			const exportData = {
				version: "1.0",
				generator: "snipit-password-manager",
				exportedAt: new Date().toISOString(),
				folders: folders.map((f) => ({
					id: f.id,
					name: f.name,
					color: f.color,
					iconName: f.iconName,
				})),
				items: items.map((item) => ({
					id: item.id,
					title: item.title,
					username: item.username,
					password: item.password,
					url: item.url,
					notes: item.notes,
					isFavorite: item.isFavorite,
					folderId: item.folderId,
					category: item.category,
					metadata: item.metadata,
					customFields: item.customFields,
					createdAt: item.createdAt,
					updatedAt: item.updatedAt,
				})),
			};

			const jsonStr = JSON.stringify(exportData, null, 2);
			const fileName = `snipit-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;

			if (Platform.OS === "web") {
				const blob = new Blob([jsonStr], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = fileName;
				a.click();
				URL.revokeObjectURL(url);
				showAlert("Export Complete", "Vault backup has been downloaded.", "success");
			} else {
				const filePath = `${FileSystem.documentDirectory}${fileName}`;
				await FileSystem.writeAsStringAsync(filePath, jsonStr, {
					encoding: FileSystem.EncodingType.UTF8,
				});

				const canShare = await Sharing.isAvailableAsync();
				if (canShare) {
					await Sharing.shareAsync(filePath, {
						mimeType: "application/json",
						dialogTitle: "Save Vault Backup",
						UTI: "public.json",
					});
				} else {
					showAlert("Export Complete", `Saved to ${filePath}`, "success");
				}
			}
		} catch (err: any) {
			console.log("Export error:", err);
			showAlert("Export Failed", err.message || "Failed to create vault export.", "error");
		} finally {
			setIsExporting(false);
		}
	};

	// ─── IMPORT BACKUP ─────────────────────────────────────────────────────────
	const handleImportVault = async () => {
		setIsImporting(true);
		try {
			const res = await DocumentPicker.getDocumentAsync({
				type: ["application/json", "text/plain", "*/*"],
				copyToCacheDirectory: true,
			});

			if (res.canceled || !res.assets || res.assets.length === 0) {
				setIsImporting(false);
				return;
			}

			const fileUri = res.assets[0].uri;
			let content = "";
			if (Platform.OS === "web") {
				const fileRes = await fetch(fileUri);
				content = await fileRes.text();
			} else {
				content = await FileSystem.readAsStringAsync(fileUri);
			}

			const parsed = JSON.parse(content);
			const incomingItems: any[] = Array.isArray(parsed)
				? parsed
				: Array.isArray(parsed.items)
				? parsed.items
				: [];

			const incomingFolders: any[] = Array.isArray(parsed.folders) ? parsed.folders : [];

			if (incomingItems.length === 0 && incomingFolders.length === 0) {
				showAlert("Invalid File", "No recognizable vault items or folders found in this file.", "error");
				setIsImporting(false);
				return;
			}

			// Save Folders first
			for (const f of incomingFolders) {
				if (f.name) {
					await offlineVault.saveFolder({
						id: f.id,
						name: f.name,
						color: f.color || "#3b82f6",
						iconName: f.iconName,
					});
				}
			}

			// Save Items
			let importedCount = 0;
			for (const item of incomingItems) {
				if (item.title || item.username || item.password || item.notes) {
					await offlineVault.saveItem({
						title: item.title || "Imported Item",
						username: item.username,
						password: item.password,
						url: item.url,
						notes: item.notes,
						category: item.category || item.itemType || "login",
						folderId: item.folderId,
						isFavorite: !!item.isFavorite,
						metadata: item.metadata || {},
						customFields: Array.isArray(item.customFields) ? item.customFields : [],
					});
					importedCount++;
				}
			}

			onReloadData();
			showAlert(
				"Import Successful",
				`Imported ${importedCount} items and ${incomingFolders.length} folders into your vault.`,
				"success"
			);
		} catch (err: any) {
			console.log("Import error:", err);
			showAlert("Import Failed", "Could not parse file. Ensure it is a valid Snipit JSON backup.", "error");
		} finally {
			setIsImporting(false);
		}
	};

	// ─── AUTO-MERGE DUPLICATES ─────────────────────────────────────────────────
	const handleMergeDuplicates = async () => {
		if (health.duplicateItemsCount === 0) {
			showAlert("No Duplicates", "Your vault has zero duplicate credentials.", "info");
			return;
		}

		showAlert(
			"Merge Duplicates",
			`Found ${health.duplicateItemsCount} duplicate entries with matching titles and usernames. Would you like to merge them into single entries?`,
			"warning",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Merge All",
					style: "default",
					onPress: async () => {
						setIsDeduplicating(true);
						try {
							let mergedCount = 0;
							for (const [_, group] of health.duplicateGroups) {
								if (group.length > 1) {
									// Keep the first item (or the one updated most recently)
									const sorted = [...group].sort(
										(a, b) =>
											new Date(b.updatedAt || 0).getTime() -
											new Date(a.updatedAt || 0).getTime()
									);
									const primary = sorted[0];

									// Delete the redundant duplicates
									for (let i = 1; i < sorted.length; i++) {
										await offlineVault.deleteItem(sorted[i].id);
										mergedCount++;
									}
								}
							}

							onReloadData();
							showAlert("Deduplication Complete", `Merged ${mergedCount} duplicate entries.`, "success");
						} catch (err: any) {
							showAlert("Error", err.message || "Failed to merge duplicates.", "error");
						} finally {
							setIsDeduplicating(false);
						}
					},
				},
			]
		);
	};

	// ─── CONFIRM RESET VAULT ───────────────────────────────────────────────────
	const handleConfirmReset = () => {
		showAlert(
			"Reset Encrypted Vault",
			"WARNING: This will permanently erase all local passwords, cards, and secure notes from this device. If you are signed in, you can re-sync from cloud after unlocking.",
			"error",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Wipe Vault",
					style: "destructive",
					onPress: async () => {
						await offlineVault.resetVault();
						onResetVault();
					},
				},
			]
		);
	};

	return (
		<ScrollView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			contentContainerClassName="px-4 pt-2 pb-36"
			showsVerticalScrollIndicator={false}
		>
			{/* Section Header: Vault Summary */}
			<View className="mb-4 mt-2 px-1">
				<Text className={`text-[13px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					VAULT OVERVIEW
				</Text>
			</View>

			{/* Health Stats Grid */}
			<View className="flex-row gap-2.5 mb-5">
				<View
					className={`flex-1 rounded-2xl p-3.5 border ${
						isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
					}`}
				>
					<Text className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
						TOTAL ITEMS
					</Text>
					<Text className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
						{health.total}
					</Text>
					<Text className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
						{health.loginsCount} logins • {health.notesCount} notes
					</Text>
				</View>

				<View
					className={`flex-1 rounded-2xl p-3.5 border ${
						isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
					}`}
				>
					<Text className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
						HEALTH AUDIT
					</Text>
					<Text
						className={`text-2xl font-bold ${
							health.reusedCount > 0 || health.weakCount > 0 ? "text-amber-500" : "text-green-500"
						}`}
					>
						{health.reusedCount > 0 || health.weakCount > 0
							? `${health.reusedCount + health.weakCount} Alerts`
							: "Safe"}
					</Text>
					<Text className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
						{health.reusedCount} reused • {health.weakCount} weak
					</Text>
				</View>
			</View>

			{/* Section: Security & Biometrics */}
			{isBiometricAvailable && onToggleBiometrics && (
				<>
					<View className="mb-2 px-1">
						<Text className={`text-[13px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							SECURITY & UNLOCK
						</Text>
					</View>

					<View
						className={`rounded-2xl border overflow-hidden mb-5 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}
					>
						<View className="flex-row items-center justify-between px-4 py-3.5">
							<View className="flex-row items-center gap-3 flex-1 pr-3">
								<View className="w-8 h-8 rounded-xl bg-blue-500/15 justify-center items-center">
									<Fingerprint color="#0a84ff" size={18} strokeWidth={2.2} />
								</View>
								<View className="flex-1">
									<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
										Biometric Unlock
									</Text>
									<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
										Unlock vault with fingerprint or Face ID
									</Text>
								</View>
							</View>
							<Switch
								value={biometricsEnabled}
								onValueChange={onToggleBiometrics}
								trackColor={{
									false: isLight ? "#cbd5e1" : "#475569",
									true: "#0a84ff",
								}}
								thumbColor={
									Platform.OS === "android"
										? biometricsEnabled
											? "#ffffff"
											: isLight
											? "#ffffff"
											: "#94a3b8"
										: undefined
								}
								ios_backgroundColor={isLight ? "#cbd5e1" : "#334155"}
							/>
						</View>
					</View>
				</>
			)}

			{/* Section: Data & Transfer (Web Match) */}
			<View className="mb-2 px-1">
				<Text className={`text-[13px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					DATA & BACKUP
				</Text>
			</View>

			<View
				className={`rounded-2xl border overflow-hidden mb-5 ${
					isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
				}`}
			>
				{/* Import Vault */}
				<TouchableOpacity
					className={`flex-row items-center justify-between px-4 py-3.5 border-b ${
						isLight ? "border-slate-100" : "border-slate-800"
					}`}
					onPress={handleImportVault}
					disabled={isImporting}
					activeOpacity={0.7}
				>
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 rounded-xl bg-blue-500/15 justify-center items-center">
							<Upload color="#3b82f6" size={17} />
						</View>
						<View>
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Import Passwords & Data
							</Text>
							<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
								Restore from Snipit JSON backup file
							</Text>
						</View>
					</View>
					{isImporting ? <ActivityIndicator size="small" color="#3b82f6" /> : <ChevronRight color={c.textSecondary} size={16} />}
				</TouchableOpacity>

				{/* Export Vault */}
				<TouchableOpacity
					className="flex-row items-center justify-between px-4 py-3.5"
					onPress={handleExportVault}
					disabled={isExporting}
					activeOpacity={0.7}
				>
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 rounded-xl bg-purple-500/15 justify-center items-center">
							<Download color="#a855f7" size={17} />
						</View>
						<View>
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Export Vault Backup
							</Text>
							<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
								Save an unencrypted JSON snapshot
							</Text>
						</View>
					</View>
					{isExporting ? <ActivityIndicator size="small" color="#a855f7" /> : <ChevronRight color={c.textSecondary} size={16} />}
				</TouchableOpacity>
			</View>

			{/* Section: Vault Maintenance */}
			<View className="mb-2 px-1">
				<Text className={`text-[13px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					VAULT MAINTENANCE
				</Text>
			</View>

			<View
				className={`rounded-2xl border overflow-hidden mb-5 ${
					isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
				}`}
			>
				{/* Merge Duplicates */}
				<TouchableOpacity
					className={`flex-row items-center justify-between px-4 py-3.5 border-b ${
						isLight ? "border-slate-100" : "border-slate-800"
					}`}
					onPress={handleMergeDuplicates}
					disabled={isDeduplicating}
					activeOpacity={0.7}
				>
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 rounded-xl bg-amber-500/15 justify-center items-center">
							<CopyX color="#f59e0b" size={17} />
						</View>
						<View>
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Find & Merge Duplicates
							</Text>
							<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
								{health.duplicateItemsCount > 0
									? `${health.duplicateItemsCount} matching duplicate items found`
									: "No duplicate credentials detected"}
							</Text>
						</View>
					</View>
					{isDeduplicating ? (
						<ActivityIndicator size="small" color="#f59e0b" />
					) : (
						<ChevronRight color={c.textSecondary} size={16} />
					)}
				</TouchableOpacity>

				{/* Quick Navigate to Folders */}
				<TouchableOpacity
					className="flex-row items-center justify-between px-4 py-3.5"
					onPress={() => onSelectTab("folders")}
					activeOpacity={0.7}
				>
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 rounded-xl bg-indigo-500/15 justify-center items-center">
							<FolderIcon color="#6366f1" size={17} />
						</View>
						<View>
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Manage Folders
							</Text>
							<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
								{folders.length} active categories
							</Text>
						</View>
					</View>
					<ChevronRight color={c.textSecondary} size={16} />
				</TouchableOpacity>
			</View>

			{/* Section: Danger Zone */}
			<View className="mb-2 px-1">
				<Text className={`text-[13px] font-bold uppercase tracking-wider ${isLight ? "text-red-500" : "text-red-400"}`}>
					DANGER ZONE
				</Text>
			</View>

			<View
				className={`rounded-2xl border overflow-hidden ${
					isLight ? "bg-white border-red-200" : "bg-slate-900 border-red-950/60"
				}`}
			>
				<TouchableOpacity
					className="flex-row items-center justify-between px-4 py-3.5"
					onPress={handleConfirmReset}
					activeOpacity={0.7}
				>
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 rounded-xl bg-red-500/15 justify-center items-center">
							<Trash2 color="#ef4444" size={17} />
						</View>
						<View>
							<Text className="text-[15px] font-semibold text-red-500">
								Reset Local Vault
							</Text>
							<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
								Permanently erase local keys & encrypted entries
							</Text>
						</View>
					</View>
					<ChevronRight color="#ef4444" size={16} />
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
