import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Text, View, SafeAreaView, BackHandler, Platform, StatusBar, Share, TouchableOpacity, ActivityIndicator, Dimensions, PanResponder, ScrollView, Animated } from "react-native";
import { Plus, Shield, Lock, X, CheckCheck } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { offlineVault, PasswordItem, Folder, UserSession } from "../core/vault-storage";
import { searchVaultItems } from "../core/vault-search";
import { IosBottomTabBar } from "../components/IosBottomTabBar";
import { IosDetailInspectorModal, getCategoryItemLabel } from "../components/IosDetailInspectorModal";
import { generatePassword, generatePassphrase, SeparatorType } from "../core/crypto";
import { generateRecoveryMnemonic, isValidMnemonic } from "../core/recovery";
import { useThemeVars } from "../config/theme";
import { useVaultItemForm } from "../hooks/useVaultItemForm";
import { useCustomAlert } from "../hooks/useCustomAlert";

// Modular views
import { PWMGHeader } from "../components/PWMGHeader";
import { PWMGListView } from "../components/PWMGListView";
import { IosFoldersView } from "../components/IosFoldersView";
import { PasswordGeneratorModal } from "../components/PasswordGeneratorModal";
import { CreateFolderModal } from "../components/CreateFolderModal";
import { AddEditItemModal } from "../components/AddEditItemModal";
import { NoteEditorModal } from "../components/NoteEditorModal";
import { PWMGSettingsScreen } from "../components/PWMGSettingsScreen";
import { NotesBulkActionBar } from "../components/NotesBulkActionBar";
import {
	VaultUnlockScreen,
	VaultRecoveryScreen,
	VaultOnboardingScreen,
} from "../components/VaultAuthScreens";

interface Props {
	onBack: () => void;
	onOpenAuth: () => void;
	onOpenProfile?: () => void;
	theme?: "dark" | "light";
}

type FilterCategory = "all" | "favorites" | "login" | "card" | "apikey" | "note" | "identity";

export function PWMGScreen({ onBack, onOpenAuth, onOpenProfile, theme = "dark" }: Props) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";

	const [hasVault, setHasVault] = useState<boolean | null>(null);
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [hasRecovery, setHasRecovery] = useState(false);
	const [user, setUser] = useState<UserSession | null>(null);

	// Onboarding states
	const [onboardingStep, setOnboardingStep] = useState(1);
	const [masterPassword, setMasterPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [recoveryMnemonic, setRecoveryMnemonic] = useState<string | null>(null);
	const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
	const [error, setError] = useState("");

	// Recovery Mode State
	const [isRecoveryMode, setIsRecoveryMode] = useState(false);
	const [inputMnemonic, setInputMnemonic] = useState("");
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [isRecovering, setIsRecovering] = useState(false);
	const [isCreatingVault, setIsCreatingVault] = useState(false);

	// Biometric State
	const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
	const [biometricsEnabled, setBiometricsEnabled] = useState(false);

	// Vault items & Folders state
	const [items, setItems] = useState<PasswordItem[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedItem, setSelectedItem] = useState<PasswordItem | null>(null);
	const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderColor, setNewFolderColor] = useState("#0a84ff");
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [checkingVaultStage, setCheckingVaultStage] = useState<string>("Initializing secure vault...");

	// Sensitives
	const [showDetailPassword, setShowDetailPassword] = useState(false);
	const [showCardNumber, setShowCardNumber] = useState(false);
	const [showCardCVV, setShowCardCVV] = useState(false);

	// Generator Modal State
	const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
	const [genTargetField, setGenTargetField] = useState<"password" | "apikey" | null>(null);
	const [genLength, setGenLength] = useState(15);
	const [genWordCount, setGenWordCount] = useState(3);
	const [genPronounceable, setGenPronounceable] = useState(true);
	const [genUpper, setGenUpper] = useState(true);
	const [genNumbers, setGenNumbers] = useState(true);
	const [genSeparator, setGenSeparator] = useState<SeparatorType>("hyphen");
	const [generatedPass, setGeneratedPass] = useState("");

	// Bottom Tab Bar
	const [activeBottomTab, setActiveBottomTab] = useState<"passwords" | "notes" | "folders" | "settings">("passwords");
	const [isNotesGridView, setIsNotesGridView] = useState(true);

	const TAB_ORDER: ("passwords" | "notes" | "folders" | "settings")[] = useMemo(
		() => ["passwords", "notes", "folders", "settings"],
		[]
	);

	const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
	const tabScrollViewRef = useRef<any>(null);
	const isManualScroll = useRef(false);

	useEffect(() => {
		const sub = Dimensions.addEventListener("change", ({ window }: { window: { width: number; height: number; scale: number; fontScale: number } }) => {
			setScreenWidth(window.width);
		});
		return () => sub.remove();
	}, []);

	const switchTab = useCallback(
		(targetTab: "passwords" | "notes" | "folders" | "settings", animateScroll = true) => {
			setActiveBottomTab(targetTab);
			if (targetTab === "passwords") {
				setActiveFilter("all");
				setSelectedFolderId(null);
			} else if (targetTab === "notes") {
				setActiveFilter("note");
				setSelectedFolderId(null);
			} else if (targetTab === "folders") {
				setSelectedFolderId(null);
			}

			if (animateScroll) {
				const targetIndex = TAB_ORDER.indexOf(targetTab);
				if (targetIndex >= 0 && tabScrollViewRef.current) {
					isManualScroll.current = true;
					tabScrollViewRef.current.scrollTo({
						x: targetIndex * screenWidth,
						animated: true,
					});
					setTimeout(() => {
						isManualScroll.current = false;
					}, 350);
				}
			}
		},
		[TAB_ORDER, screenWidth]
	);

	const handleScrollEnd = useCallback(
		(e: any) => {
			if (isManualScroll.current) return;
			const offsetX = e.nativeEvent.contentOffset.x;
			const pageIndex = Math.round(offsetX / screenWidth);
			const targetTab = TAB_ORDER[pageIndex];
			if (targetTab && targetTab !== activeBottomTab) {
				switchTab(targetTab, false);
			}
		},
		[screenWidth, TAB_ORDER, activeBottomTab, switchTab]
	);

	// Dedicated Fullscreen Note Editor State (Samsung/MI Notes style)
	const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
	const [editingNoteItem, setEditingNoteItem] = useState<PasswordItem | null>(null);

	// Multi-select state for Vault Items (passwords, cards, logins, notes)
	const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
	const isSelectionMode = selectedItemIds.length > 0;

	// Reset selection mode whenever activeBottomTab changes
	useEffect(() => {
		setSelectedItemIds([]);
	}, [activeBottomTab]);

	const handleToggleSelectItem = useCallback((item: PasswordItem) => {
		setSelectedItemIds((prev) =>
			prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
		);
	}, []);

	const handleLongPressItem = useCallback((item: PasswordItem) => {
		setSelectedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
	}, []);

	const filteredItems = useMemo(() => {
		// 1. Filter by category & folder
		const baseItems = items.filter((item) => {
			if (selectedFolderId && item.folderId !== selectedFolderId) return false;
			if (activeFilter === "favorites") return !!item.isFavorite;
			if (activeFilter !== "all") return item.category === activeFilter;
			return true;
		});

		// 2. Apply tokenized, ranked relevance search
		return searchVaultItems(baseItems, searchQuery, folders);
	}, [items, searchQuery, activeFilter, selectedFolderId, folders]);

	const handleSelectAllVisible = useCallback(() => {
		const visibleIds = filteredItems.map((i) => i.id);
		setSelectedItemIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds));
	}, [filteredItems]);

	const handleBulkPin = useCallback(async () => {
		if (selectedItemIds.length === 0) return;
		const targetItems = items.filter((i) => selectedItemIds.includes(i.id));
		// If all are already favorite/pinned, unpin them; otherwise pin all
		const allPinned = targetItems.every((n) => n.isFavorite);
		for (const item of targetItems) {
			await offlineVault.saveItem({
				...item,
				isFavorite: !allPinned,
			});
		}
		setSelectedItemIds([]);
		await loadData();
	}, [selectedItemIds, items]);

	const handleBulkMove = useCallback(
		async (folderId: string | null) => {
			if (selectedItemIds.length === 0) return;
			const targetItems = items.filter((i) => selectedItemIds.includes(i.id));
			for (const item of targetItems) {
				await offlineVault.saveItem({
					...item,
					folderId: folderId || undefined,
				});
			}
			setSelectedItemIds([]);
			await loadData();
		},
		[selectedItemIds, items]
	);

	const handleBulkDelete = useCallback(() => {
		if (selectedItemIds.length === 0) return;
		const count = selectedItemIds.length;
		showAlert(
			"Delete Items",
			`Are you sure you want to delete ${count} item${count > 1 ? "s" : ""}? This cannot be undone.`,
			"warning",
			[
				{ text: "Cancel", style: "cancel", onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						setAlertConfig((prev) => ({ ...prev, visible: false }));
						for (const id of selectedItemIds) {
							await offlineVault.deleteItem(id);
						}
						setSelectedItemIds([]);
						await loadData();
					},
				},
			]
		);
	}, [selectedItemIds]);

	// Custom Alert Hook
	const { alertConfig, setAlertConfig, showAlert, alertModal } = useCustomAlert(theme);

	// Add/Edit Form State Hook
	const form = useVaultItemForm();

	useEffect(() => {
		checkVaultStatus();
	}, []);

	// Hardware and gesture back handler
	useEffect(() => {
		const handleHardwareBack = () => {
			if (isNoteEditorOpen) {
				setIsNoteEditorOpen(false);
				setEditingNoteItem(null);
				return true;
			}
			if (isGeneratorOpen) {
				setIsGeneratorOpen(false);
				return true;
			}
			if (isFolderModalOpen) {
				setIsFolderModalOpen(false);
				return true;
			}
			if (form.isAddModalOpen) {
				form.setIsAddModalOpen(false);
				form.setEditingItem(null);
				return true;
			}
			if (selectedItem) {
				setSelectedItem(null);
				return true;
			}
			if (isRecoveryMode) {
				setIsRecoveryMode(false);
				return true;
			}
			onBack();
			return true;
		};

		const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
		return () => subscription.remove();
	}, [isNoteEditorOpen, isGeneratorOpen, isFolderModalOpen, form.isAddModalOpen, selectedItem, isRecoveryMode, onBack]);

	useEffect(() => {
		refreshGenerator();
	}, [genLength, genWordCount, genPronounceable, genUpper, genNumbers, genSeparator]);

	const refreshGenerator = useCallback(() => {
		if (genPronounceable) {
			const pass = generatePassphrase({
				wordCount: genWordCount,
				separator: genSeparator,
				capitalize: genUpper,
				includeNumber: genNumbers,
			});
			setGeneratedPass(pass);
		} else {
			const pass = generatePassword({
				length: genLength,
				uppercase: genUpper,
				numbers: genNumbers,
				symbols: true,
				lowercase: true,
				strict: true,
			});
			setGeneratedPass(pass);
		}
	}, [genPronounceable, genWordCount, genSeparator, genUpper, genNumbers, genLength]);

	const [syncStatus, setSyncStatus] = useState<"local" | "synced" | "pending_offline" | "syncing">("local");

	const refreshSyncStatus = useCallback(async () => {
		try {
			const status = await offlineVault.getSyncStatus();
			setSyncStatus(status);
		} catch (e) {
			console.log("Error checking sync status:", e);
		}
	}, []);

	const loadData = useCallback(async () => {
		try {
			const vaultItems = await offlineVault.getItems();
			const vaultFolders = await offlineVault.getFolders();
			setItems(vaultItems);
			setFolders(vaultFolders);
			await refreshSyncStatus();
		} catch (err) {
			console.log("Error loading vault data:", err);
		}
	}, [refreshSyncStatus]);

	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		setSyncStatus("syncing");
		try {
			await offlineVault.syncFromCloud();
			await loadData();
		} catch (e) {
			console.log("Error during pull-to-refresh sync:", e);
			await refreshSyncStatus();
		} finally {
			setIsRefreshing(false);
		}
	}, [loadData, refreshSyncStatus]);

	useEffect(() => {
		const unsub = offlineVault.onSync(() => {
			if (offlineVault.isUnlocked()) {
				loadData();
			} else {
				refreshSyncStatus();
			}
		});
		return () => {
			unsub();
		};
	}, [loadData, refreshSyncStatus]);

	const checkVaultStatus = async () => {
		try {
			setCheckingVaultStage("Reading session credentials...");
			const u = await offlineVault.getUser();
			setUser(u);
			if (u?.token) {
				setCheckingVaultStage("Verifying cloud encryption keys...");
				await offlineVault.checkCloudVault();
			}
			setCheckingVaultStage("Inspecting encrypted vault database...");
			const exists = await offlineVault.hasVault();
			const rec = await offlineVault.hasRecoveryRecord();
			setHasVault(exists);
			setHasRecovery(rec);

			// Check biometric capability and state
			const hwAvailable = await offlineVault.isBiometricHardwareAvailable();
			const bioEnabled = await offlineVault.isBiometricsEnabled();
			setIsBiometricAvailable(hwAvailable);
			setBiometricsEnabled(bioEnabled);

			const unlocked = offlineVault.isUnlocked();
			setIsUnlocked(unlocked);
			if (unlocked) {
				loadData();
			} else if (exists && bioEnabled) {
				// Automatically prompt for biometric unlock on entry if enabled
				setTimeout(() => {
					handleBiometricUnlock();
				}, 350);
			}
		} catch (e) {
			console.log("Error checking vault status:", e);
			setHasVault(false);
		}
	};

	const handleBiometricUnlock = async () => {
		setError("");
		setIsDecrypting(true);
		try {
			const success = await offlineVault.unlockWithBiometrics();
			if (success) {
				setIsUnlocked(true);
				setMasterPassword("");
				loadData();
			}
		} catch (err: any) {
			console.log("Biometric unlock error:", err);
		} finally {
			setIsDecrypting(false);
		}
	};

	const handleToggleBiometrics = async (enable: boolean) => {
		if (!enable) {
			await offlineVault.setBiometricsEnabled(false);
			setBiometricsEnabled(false);
			showAlert("Biometrics Disabled", "Fingerprint / Face ID unlock has been turned off.", "info");
			return;
		}

		// If turning ON but vault is currently locked, user must enter master password first
		if (!offlineVault.isUnlocked()) {
			showAlert(
				"Unlock Required",
				"Please enter your master password to unlock the vault before enabling biometric quick unlock.",
				"info"
			);
			return;
		}

		const success = await offlineVault.setBiometricsEnabled(true);
		if (success) {
			setBiometricsEnabled(true);
			showAlert("Biometrics Enabled", "You can now unlock your vault with fingerprint or Face ID.", "success");
		} else {
			showAlert("Biometrics Setup", "Could not enable biometrics. Please verify your device security settings.", "warning");
		}
	};

	const handleUnlock = async () => {
		setError("");
		if (!masterPassword) {
			setError("Please enter your master password.");
			return;
		}
		setIsDecrypting(true);
		try {
			const success = await offlineVault.unlockVault(masterPassword);
			if (success) {
				setIsUnlocked(true);
				setMasterPassword("");
				loadData();
			} else {
				setError("Invalid master password. Please try again.");
			}
		} catch (err: any) {
			setError(err.message || "Failed to unlock vault.");
		} finally {
			setIsDecrypting(false);
		}
	};

	const handleNextToRecovery = () => {
		setError("");
		if (!masterPassword || masterPassword.length < 8) {
			setError("Master password must be at least 8 characters.");
			return;
		}
		if (masterPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		const mnemonic = generateRecoveryMnemonic();
		setRecoveryMnemonic(mnemonic);
		setOnboardingStep(3);
	};

	const handleFinishOnboarding = async () => {
		if (!recoveryConfirmed) {
			showAlert("Confirm Key", "Please confirm that you have saved your 12-word recovery key.", "warning");
			return;
		}
		setIsCreatingVault(true);
		try {
			await offlineVault.createVault(masterPassword, recoveryMnemonic || undefined);
			setHasVault(true);
			setIsUnlocked(true);
			setMasterPassword("");
			setConfirmPassword("");
			setRecoveryMnemonic(null);
			loadData();
		} catch (err: any) {
			setError(err.message || "Failed to create vault.");
		} finally {
			setIsCreatingVault(false);
		}
	};

	const handleRecoverWithKey = async () => {
		setError("");
		// Extract lowercase words only in case user pasted or loaded from formatted file
		const words = inputMnemonic
			.toLowerCase()
			.replace(/[^a-z\s]/g, " ")
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0);

		const phrase = words.join(" ");
		if (words.length !== 12 || !isValidMnemonic(phrase)) {
			setError("Invalid 12-word recovery key. Please check that 12 valid words are entered.");
			return;
		}
		setIsRecovering(true);
		try {
			const success = await offlineVault.recoverWithMnemonic(phrase);
			if (success) {
				setIsUnlocked(true);
				setIsRecoveryMode(false);
				setInputMnemonic("");
				loadData();
				showAlert("Vault Recovered", "Vault unlocked. You can now update your master password in Settings.", "success");
			} else {
				setError("Recovery failed. Key does not match this vault.");
			}
		} catch (err: any) {
			setError(err.message || "Recovery failed.");
		} finally {
			setIsRecovering(false);
		}
	};

	const handleLock = () => {
		offlineVault.lockVault();
		setIsUnlocked(false);
		setSelectedItem(null);
	};

	const handleToggleFavorite = async (item: PasswordItem) => {
		await offlineVault.saveItem({ ...item, isFavorite: !item.isFavorite });
		loadData();
		if (selectedItem?.id === item.id) {
			setSelectedItem({ ...selectedItem, isFavorite: !selectedItem.isFavorite });
		}
	};

	const handleDeleteItem = (id: string) => {
		const targetItem = items.find((i) => i.id === id) || (selectedItem?.id === id ? selectedItem : null);
		const typeLabel = targetItem ? getCategoryItemLabel(targetItem.category) : "Item";
		const itemTitle = targetItem?.title ? ` "${targetItem.title}"` : "";

		showAlert(
			`Delete ${typeLabel}`,
			`Are you sure you want to delete this ${typeLabel.toLowerCase()}${itemTitle}?`,
			"warning",
			[
				{ text: "Cancel", style: "cancel", onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						setAlertConfig((prev) => ({ ...prev, visible: false }));
						await offlineVault.deleteItem(id);
						if (selectedItem?.id === id) setSelectedItem(null);
						loadData();
					},
				},
			]
		);
	};

	const handleSaveNewItem = async () => {
		if (!form.newTitle.trim()) {
			showAlert("Validation", "Title is required.", "warning");
			return;
		}

		let metadata: Record<string, string> = {};
		if (form.itemCategory === "card") {
			metadata = { cardholderName: form.cardHolder, cardNumber: form.cardNumber, expiration: form.cardExp, cvv: form.cardCvv, pin: form.cardPin, zipCode: form.cardZip };
		} else if (form.itemCategory === "apikey") {
			metadata = { keyId: form.apiKeyId, apiKey: form.apiSecret, environment: form.apiEnv };
		} else if (form.itemCategory === "identity") {
			metadata = { fullName: form.identityName, email: form.identityEmail, phone: form.identityPhone, address: form.identityAddress };
		}

		await offlineVault.saveItem({
			id: form.editingItem?.id,
			title: form.newTitle,
			username: form.itemCategory === "login" ? form.newUsername : form.identityEmail || form.cardHolder || form.apiKeyId,
			password: form.itemCategory === "login" ? form.newPassword : form.apiSecret || form.cardCvv,
			url: form.newUrl,
			notes: form.newNotes,
			category: form.itemCategory,
			folderId: form.itemFolderId,
			isFavorite: form.editingItem ? form.editingItem.isFavorite : false,
			metadata,
			customFields: form.customFields.filter((cf) => cf.name.trim()),
		});

		form.setIsAddModalOpen(false);
		form.resetForm();
		loadData();
	};

	const handleSaveNote = async (updated: Partial<PasswordItem>): Promise<PasswordItem | void> => {
		const saved = await offlineVault.saveItem({
			id: updated.id,
			title: updated.title || "Untitled Note",
			notes: updated.notes || "",
			category: "note",
			folderId: updated.folderId,
			isFavorite: !!updated.isFavorite,
		});
		await loadData();
		return saved;
	};

	const handleDeleteNote = async (id: string) => {
		await offlineVault.deleteItem(id);
		loadData();
	};

	const handleSaveFolder = async (name?: string, color?: string): Promise<Folder | void> => {
		const targetName = (name !== undefined ? name : newFolderName).trim();
		const targetColor = color || newFolderColor;
		if (!targetName) {
			showAlert("Validation", "Folder name is required.", "warning");
			return;
		}
		const saved = await offlineVault.saveFolder({ name: targetName, color: targetColor });
		setNewFolderName("");
		setIsFolderModalOpen(false);
		await loadData();
		return saved;
	};

	const handleDeleteFolder = (folderId: string, folderName: string) => {
		showAlert(
			"Delete Folder",
			`Are you sure you want to delete "${folderName}"? Items inside will remain in your vault.`,
			"warning",
			[
				{ text: "Cancel", style: "cancel", onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						setAlertConfig((prev) => ({ ...prev, visible: false }));
						await offlineVault.deleteFolder(folderId);
						if (selectedFolderId === folderId) setSelectedFolderId(null);
						loadData();
					},
				},
			]
		);
	};

	const copyToClipboard = async (text: string, field: string) => {
		await Clipboard.setStringAsync(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const handleDownloadRecovery = async (mnemonic: string) => {
		// Clean content: only the exact 12-word mnemonic phrase
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

			// If device supports direct file sharing / save dialog
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
	};

	// Render Auth/Onboarding Screens
	if (hasVault === null) {
		return (
			<SafeAreaView className={`flex-1 justify-center items-center px-6 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}>
				<View className="items-center max-w-[300px]">
					{/* Glowing Shield Visual */}
					<View className={`w-20 h-20 rounded-3xl justify-center items-center mb-6 shadow-xl ${
						isLight ? "bg-blue-50 border border-blue-100" : "bg-blue-950/40 border border-blue-800/50"
					}`}>
						<Shield color="#0a84ff" size={40} strokeWidth={2.2} />
					</View>

					{/* Title */}
					<Text className={`text-xl font-bold tracking-tight mb-2 text-center ${isLight ? "text-slate-900" : "text-white"}`}>
						Snipit Secure Vault
					</Text>

					{/* Subtitle / Description */}
					<Text className={`text-sm text-center leading-5 mb-8 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
						Zero-knowledge encrypted credential store
					</Text>

					{/* Spinner & Active Stage Pill */}
					<View className={`flex-row items-center gap-3 px-4 py-2.5 rounded-full border ${
						isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
					}`}>
						<ActivityIndicator size="small" color="#0a84ff" />
						<Text className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
							{checkingVaultStage}
						</Text>
					</View>

					{/* Security hint footer */}
					<Text className={`text-[11px] font-medium tracking-wide mt-10 uppercase ${isLight ? "text-slate-400" : "text-slate-500"}`}>
						XSalsa20-Poly1305 • End-to-End Encrypted
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (isRecoveryMode) {
		return (
			<VaultRecoveryScreen
				onBack={() => setIsRecoveryMode(false)}
				theme={theme}
				error={error}
				inputMnemonic={inputMnemonic}
				setInputMnemonic={setInputMnemonic}
				onRecover={handleRecoverWithKey}
				isRecovering={isRecovering}
			/>
		);
	}

	if (!hasVault) {
		return (
			<VaultOnboardingScreen
				onBack={onBack}
				theme={theme}
				step={onboardingStep}
				masterPassword={masterPassword}
				confirmPassword={confirmPassword}
				recoveryMnemonic={recoveryMnemonic}
				recoveryConfirmed={recoveryConfirmed}
				copiedField={copiedField}
				error={error}
				setMasterPassword={setMasterPassword}
				setConfirmPassword={setConfirmPassword}
				setRecoveryConfirmed={setRecoveryConfirmed}
				onNextToRecovery={handleNextToRecovery}
				onDownloadRecovery={() => recoveryMnemonic && handleDownloadRecovery(recoveryMnemonic)}
				onCopyMnemonic={() => recoveryMnemonic && copyToClipboard(recoveryMnemonic, "mnemonic")}
				onFinish={handleFinishOnboarding}
				setStep={setOnboardingStep}
				isCreatingVault={isCreatingVault}
			/>
		);
	}

	if (!isUnlocked) {
		return (
			<VaultUnlockScreen
				onBack={onBack}
				theme={theme}
				user={user}
				error={error}
				hasRecovery={hasRecovery}
				masterPassword={masterPassword}
				setMasterPassword={setMasterPassword}
				onUnlock={handleUnlock}
				onOpenAuth={onOpenAuth}
				onOpenProfile={onOpenProfile}
				onForgotPassword={() => setIsRecoveryMode(true)}
				isDecrypting={isDecrypting}
				isBiometricAvailable={isBiometricAvailable}
				biometricsEnabled={biometricsEnabled}
				onBiometricUnlock={handleBiometricUnlock}
				onToggleBiometrics={handleToggleBiometrics}
			/>
		);
	}

	const headerTitle =
		activeBottomTab === "folders"
			? "Folders"
			: activeBottomTab === "settings"
				? "Vault Settings"
				: selectedFolderId
					? folders.find((f) => f.id === selectedFolderId)?.name || "Folder"
					: activeFilter === "favorites"
						? "Favorites"
						: activeFilter === "all"
							? "Passwords"
							: activeFilter === "card"
								? "Cards"
								: activeFilter === "apikey"
									? "API Keys"
									: activeFilter === "note"
										? "Notes"
										: "Identities";

	const syncStatusText =
		syncStatus === "syncing"
			? "Syncing with cloud..."
			: syncStatus === "pending_offline"
				? "Changes saved locally • Pending sync"
				: syncStatus === "synced"
					? "Synced with Snipit Cloud"
					: "Stored locally & encrypted";

	const headerSubtitle =
		activeBottomTab === "folders"
			? `${folders.length} folders organized`
			: activeBottomTab === "settings"
				? "Data, maintenance & security"
				: `${syncStatusText} • ${filteredItems.length} items`;

	return (
		<SafeAreaView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			{/* Header: Normal PWMGHeader OR MI Notes Style Multi-Selection Header */}
			{isSelectionMode ? (
				<View
					className={`flex-row items-center justify-between px-4 py-3.5 border-b z-30 ${
						isLight ? "bg-white border-slate-100" : "bg-slate-950 border-slate-900"
					}`}
				>
					{/* Left: Cancel Selection */}
					<TouchableOpacity
						onPress={() => setSelectedItemIds([])}
						className={`p-2 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-900"}`}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					>
						<X color={isLight ? "#0f172a" : "#f8fafc"} size={22} />
					</TouchableOpacity>

					{/* Center: Selected Counter (MI Notes italicized large counter) */}
					<Text
						className={`text-xl font-bold tracking-tight italic ${
							isLight ? "text-slate-900" : "text-white"
						}`}
					>
						{selectedItemIds.length} item{selectedItemIds.length > 1 ? "s" : ""} selected
					</Text>

					{/* Right: Select All / Deselect All */}
					<TouchableOpacity
						onPress={handleSelectAllVisible}
						className={`p-2 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-900"}`}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					>
						<CheckCheck color={isLight ? "#0f172a" : "#f8fafc"} size={22} />
					</TouchableOpacity>
				</View>
			) : (
				<PWMGHeader
					c={c}
					title={headerTitle}
					subtitle={headerSubtitle}
					userToken={user?.token}
					syncStatus={syncStatus}
					activeBottomTab={activeBottomTab}
					isGridView={isNotesGridView}
					onToggleGridView={() => setIsNotesGridView((prev) => !prev)}
					onBack={onBack}
					onOpenProfile={onOpenProfile}
					onOpenGenerator={() => setIsGeneratorOpen(true)}
					onLock={handleLock}
					onAdd={() => {
						if (activeBottomTab === "notes") {
							setEditingNoteItem(null);
							setIsNoteEditorOpen(true);
						} else {
							form.resetForm();
							form.setIsAddModalOpen(true);
						}
					}}
				/>
			)}

			{/* Body Container with true WhatsApp-style smooth sliding between tabs */}
			<ScrollView
				ref={tabScrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				scrollEnabled={!isSelectionMode}
				onMomentumScrollEnd={handleScrollEnd}
				className="flex-1"
			>
				{/* 1. Passwords Tab */}
				<View style={{ width: screenWidth }} className="flex-1">
					<PWMGListView
						c={c}
						theme={theme}
						items={filteredItems}
						folders={folders}
						activeBottomTab="passwords"
						searchQuery={searchQuery}
						activeFilter={activeFilter}
						selectedFolderId={selectedFolderId}
						copiedField={copiedField}
						isGridView={false}
						selectedItemIds={selectedItemIds}
						isRefreshing={isRefreshing}
						onRefresh={handleRefresh}
						onSearchChange={setSearchQuery}
						onResetFilter={() => {
							setSelectedFolderId(null);
							setActiveFilter("all");
						}}
						onSelectItem={(item) => {
							if (isSelectionMode) {
								handleToggleSelectItem(item);
							} else if (item.category === "note") {
								setEditingNoteItem(item);
								setIsNoteEditorOpen(true);
							} else {
								setShowDetailPassword(false);
								setShowCardNumber(false);
								setShowCardCVV(false);
								setSelectedItem(item);
							}
						}}
						onLongPressItem={handleLongPressItem}
						onToggleSelectItem={handleToggleSelectItem}
						onCopyPassword={(pass, id) => copyToClipboard(pass, id)}
					/>
				</View>

				{/* 2. Notes Tab */}
				<View style={{ width: screenWidth }} className="flex-1">
					<PWMGListView
						c={c}
						theme={theme}
						items={filteredItems}
						folders={folders}
						activeBottomTab="notes"
						searchQuery={searchQuery}
						activeFilter={activeFilter}
						selectedFolderId={selectedFolderId}
						copiedField={copiedField}
						isGridView={isNotesGridView}
						selectedItemIds={selectedItemIds}
						isRefreshing={isRefreshing}
						onRefresh={handleRefresh}
						onSearchChange={setSearchQuery}
						onResetFilter={() => {
							setSelectedFolderId(null);
							setActiveFilter("all");
						}}
						onSelectItem={(item) => {
							if (isSelectionMode) {
								handleToggleSelectItem(item);
							} else if (item.category === "note") {
								setEditingNoteItem(item);
								setIsNoteEditorOpen(true);
							} else {
								setShowDetailPassword(false);
								setShowCardNumber(false);
								setShowCardCVV(false);
								setSelectedItem(item);
							}
						}}
						onLongPressItem={handleLongPressItem}
						onToggleSelectItem={handleToggleSelectItem}
						onCopyPassword={(pass, id) => copyToClipboard(pass, id)}
					/>
				</View>

				{/* 3. Folders Tab */}
				<View style={{ width: screenWidth }} className="flex-1">
					<IosFoldersView
						folders={folders}
						items={items}
						theme={theme}
						isRefreshing={isRefreshing}
						onRefresh={handleRefresh}
						onSelectFolder={(folderId) => {
							setSelectedFolderId(folderId);
							setActiveFilter("all");
							switchTab("passwords");
						}}
						onSelectType={(category) => {
							setSelectedFolderId(null);
							setActiveFilter(category as FilterCategory);
							switchTab(category === "note" ? "notes" : "passwords");
						}}
						onCreateFolder={() => setIsFolderModalOpen(true)}
						onDeleteFolder={handleDeleteFolder}
					/>
				</View>

				{/* 4. Settings Tab */}
				<View style={{ width: screenWidth }} className="flex-1">
					<PWMGSettingsScreen
						items={items}
						folders={folders}
						theme={theme}
						onReloadData={loadData}
						onResetVault={() => {
							setHasVault(false);
							setIsUnlocked(false);
							setItems([]);
							setFolders([]);
							checkVaultStatus();
						}}
						onSelectTab={(tab) => {
							switchTab(tab);
						}}
						showAlert={showAlert}
					/>
				</View>
			</ScrollView>

			{/* Right-Bottom Floating Action Button (FAB) to Create New Item */}
			{!isSelectionMode && activeBottomTab !== "folders" && activeBottomTab !== "settings" && (
				<TouchableOpacity
					className={`absolute right-5 w-14 h-14 rounded-full justify-center items-center shadow-lg elevation-8 z-30 ${
						isLight ? "bg-slate-900" : "bg-white"
					}`}
					style={{ bottom: Platform.OS === "ios" ? 102 : 106 }}
					onPress={() => {
						if (activeBottomTab === "notes") {
							setEditingNoteItem(null);
							setIsNoteEditorOpen(true);
						} else {
							form.resetForm();
							form.setIsAddModalOpen(true);
						}
					}}
					activeOpacity={0.85}
					accessibilityLabel="Create New Item"
				>
					<Plus color={isLight ? "#ffffff" : "#020617"} size={26} strokeWidth={2.6} />
				</TouchableOpacity>
			)}

			{/* Floating Tab Bar OR Bulk Action Bar (Pin, Move to, Delete) */}
			{isSelectionMode ? (
				<NotesBulkActionBar
					selectedCount={selectedItemIds.length}
					totalNotesCount={filteredItems.length}
					allSelected={
						selectedItemIds.length > 0 &&
						selectedItemIds.length === filteredItems.length
					}
					folders={folders}
					theme={theme}
					onSelectAll={handleSelectAllVisible}
					onCancel={() => setSelectedItemIds([])}
					onPin={handleBulkPin}
					onMove={handleBulkMove}
					onDelete={handleBulkDelete}
					onCreateFolder={(name, color) => handleSaveFolder(name, color)}
				/>
			) : (
				<IosBottomTabBar
					activeTab={activeBottomTab}
					theme={theme}
					onTabChange={(tab) => switchTab(tab)}
				/>
			)}

			{/* Detail Inspector Modal */}
			<IosDetailInspectorModal
				visible={!!selectedItem}
				item={selectedItem}
				theme={theme}
				showPassword={showDetailPassword}
				showCardNumber={showCardNumber}
				showCardCVV={showCardCVV}
				copiedField={copiedField}
				onClose={() => setSelectedItem(null)}
				onOpenEdit={(item) => {
					setSelectedItem(null);
					form.populateForm(item);
				}}
				onToggleFavorite={handleToggleFavorite}
				onDeleteItem={handleDeleteItem}
				onTogglePassword={() => setShowDetailPassword(!showDetailPassword)}
				onToggleCardNumber={() => setShowCardNumber(!showCardNumber)}
				onToggleCardCVV={() => setShowCardCVV(!showCardCVV)}
				onCopyToClipboard={copyToClipboard}
				getCategoryBadgeStyle={() => ({ backgroundColor: "rgba(10, 132, 255, 0.15)" })}
				getCategoryIcon={() => null}
			/>

			{/* Add / Edit Item Modal */}
			<AddEditItemModal
				visible={form.isAddModalOpen}
				editingItem={form.editingItem}
				itemCategory={form.itemCategory}
				itemFolderId={form.itemFolderId}
				folders={folders}
				theme={theme}
				newTitle={form.newTitle}
				newUsername={form.newUsername}
				newPassword={form.newPassword}
				newUrl={form.newUrl}
				newNotes={form.newNotes}
				cardHolder={form.cardHolder}
				cardNumber={form.cardNumber}
				cardExp={form.cardExp}
				cardCvv={form.cardCvv}
				cardPin={form.cardPin}
				cardZip={form.cardZip}
				apiKeyId={form.apiKeyId}
				apiSecret={form.apiSecret}
				apiEnv={form.apiEnv}
				identityName={form.identityName}
				identityEmail={form.identityEmail}
				identityPhone={form.identityPhone}
				identityAddress={form.identityAddress}
				customFields={form.customFields}
				isFolderDropdownOpen={form.isFolderDropdownOpen}
				onCreateFolder={(name, color) => handleSaveFolder(name, color)}
				onClose={() => {
					form.setIsAddModalOpen(false);
					form.resetForm();
				}}
				onSave={handleSaveNewItem}
				onOpenGenerator={(field) => {
					setGenTargetField(field);
					setIsGeneratorOpen(true);
				}}
				setItemCategory={form.setItemCategory}
				setItemFolderId={form.setItemFolderId}
				setIsFolderDropdownOpen={form.setIsFolderDropdownOpen}
				setNewTitle={form.setNewTitle}
				setNewUsername={form.setNewUsername}
				setNewPassword={form.setNewPassword}
				setNewUrl={form.setNewUrl}
				setNewNotes={form.setNewNotes}
				setCardHolder={form.setCardHolder}
				setCardNumber={form.setCardNumber}
				setCardExp={form.setCardExp}
				setCardCvv={form.setCardCvv}
				setCardPin={form.setCardPin}
				setCardZip={form.setCardZip}
				setApiKeyId={form.setApiKeyId}
				setApiSecret={form.setApiSecret}
				setApiEnv={form.setApiEnv}
				setIdentityName={form.setIdentityName}
				setIdentityEmail={form.setIdentityEmail}
				setIdentityPhone={form.setIdentityPhone}
				setIdentityAddress={form.setIdentityAddress}
				setCustomFields={form.setCustomFields}
			/>

			{/* Create Folder Modal */}
			<CreateFolderModal
				visible={isFolderModalOpen}
				folderName={newFolderName}
				folderColor={newFolderColor}
				theme={theme}
				onChangeName={setNewFolderName}
				onChangeColor={setNewFolderColor}
				onClose={() => setIsFolderModalOpen(false)}
				onSave={handleSaveFolder}
			/>

			{/* Password Generator Modal */}
			<PasswordGeneratorModal
				visible={isGeneratorOpen}
				theme={theme}
				generatedPass={generatedPass}
				genLength={genLength}
				genWordCount={genWordCount}
				genPronounceable={genPronounceable}
				genUpper={genUpper}
				genNumbers={genNumbers}
				genSeparator={genSeparator}
				genTargetField={genTargetField}
				copiedField={copiedField}
				onClose={() => {
					setIsGeneratorOpen(false);
					setGenTargetField(null);
				}}
				onRefresh={refreshGenerator}
				onCopy={copyToClipboard}
				onApply={(pass) => {
					copyToClipboard(pass, "gen");
					if (genTargetField === "apikey") {
						form.setApiSecret(pass);
					} else {
						form.setNewPassword(pass);
					}
					setIsGeneratorOpen(false);
					setGenTargetField(null);
				}}
				setGenLength={setGenLength}
				setGenWordCount={setGenWordCount}
				setGenPronounceable={setGenPronounceable}
				setGenUpper={setGenUpper}
				setGenNumbers={setGenNumbers}
				setGenSeparator={setGenSeparator}
			/>

			{/* Fullscreen Mobile Note Editor Modal (Samsung/MI Notes experience) */}
			<NoteEditorModal
				visible={isNoteEditorOpen}
				note={editingNoteItem}
				folders={folders}
				theme={theme}
				onClose={() => {
					setIsNoteEditorOpen(false);
					setEditingNoteItem(null);
				}}
				onSave={handleSaveNote}
				onDelete={handleDeleteNote}
				onCreateFolder={(name, color) => handleSaveFolder(name, color)}
			/>

			{/* Custom Theme-matched Alert Modal */}
			{alertModal}
		</SafeAreaView>
	);
}
