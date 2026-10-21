import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Text, View, SafeAreaView, BackHandler, Platform, StatusBar, Share, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { offlineVault, PasswordItem, Folder, UserSession } from "../core/vault-storage";
import { IosBottomTabBar } from "../components/IosBottomTabBar";
import { IosDetailInspectorModal, getCategoryItemLabel } from "../components/IosDetailInspectorModal";
import { generatePassword, generatePassphrase, SeparatorType } from "../core/crypto";
import { generateRecoveryMnemonic, isValidMnemonic } from "../core/recovery";
import { useThemeVars } from "../config/theme";
import { useVaultItemForm } from "../hooks/useVaultItemForm";
import { CustomAlertModal, CustomAlertConfig } from "../components/CustomAlertModal";

// Modular views
import { PWMGHeader } from "../components/PWMGHeader";
import { PWMGListView } from "../components/PWMGListView";
import { IosFoldersView } from "../components/IosFoldersView";
import { PasswordGeneratorModal } from "../components/PasswordGeneratorModal";
import { CreateFolderModal } from "../components/CreateFolderModal";
import { AddEditItemModal } from "../components/AddEditItemModal";
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
	const [activeBottomTab, setActiveBottomTab] = useState<"passwords" | "folders" | "notes" | "settings">("passwords");
	const [isNotesGridView, setIsNotesGridView] = useState(true);

	// Custom Alert State
	const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
		visible: false,
		title: "",
	});

	const showAlert = (
		title: string,
		message?: string,
		type: "info" | "success" | "warning" | "error" = "info",
		buttons?: CustomAlertConfig["buttons"],
	) => {
		setAlertConfig({
			visible: true,
			title,
			message,
			type,
			buttons,
			onDismiss: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
		});
	};

	// Add/Edit Form State Hook
	const form = useVaultItemForm();

	useEffect(() => {
		checkVaultStatus();
	}, []);

	// Hardware and gesture back handler
	useEffect(() => {
		const handleHardwareBack = () => {
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
	}, [isGeneratorOpen, isFolderModalOpen, form.isAddModalOpen, selectedItem, isRecoveryMode, onBack]);

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

	const loadData = useCallback(async () => {
		try {
			const vaultItems = await offlineVault.getItems();
			const vaultFolders = await offlineVault.getFolders();
			setItems(vaultItems);
			setFolders(vaultFolders);
		} catch (err) {
			console.log("Error loading vault data:", err);
		}
	}, []);

	const checkVaultStatus = async () => {
		const u = await offlineVault.getUser();
		setUser(u);
		if (u?.token) await offlineVault.checkCloudVault();
		const exists = await offlineVault.hasVault();
		const rec = await offlineVault.hasRecoveryRecord();
		setHasVault(exists);
		setHasRecovery(rec);
		setIsUnlocked(offlineVault.isUnlocked());
		if (offlineVault.isUnlocked()) loadData();
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

	const handleSaveFolder = async () => {
		if (!newFolderName.trim()) {
			showAlert("Validation", "Folder name is required.", "warning");
			return;
		}
		await offlineVault.saveFolder({ name: newFolderName.trim(), color: newFolderColor });
		setNewFolderName("");
		setIsFolderModalOpen(false);
		loadData();
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

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				item.title.toLowerCase().includes(query) ||
				(item.username && item.username.toLowerCase().includes(query)) ||
				(item.notes && item.notes.toLowerCase().includes(query)) ||
				(item.url && item.url.toLowerCase().includes(query));

			if (!matchesSearch) return false;
			if (selectedFolderId && item.folderId !== selectedFolderId) return false;
			if (activeFilter === "favorites") return !!item.isFavorite;
			if (activeFilter !== "all") return item.category === activeFilter;
			return true;
		});
	}, [items, searchQuery, activeFilter, selectedFolderId]);

	// Render Auth/Onboarding Screens
	if (hasVault === null) {
		return (
			<SafeAreaView className={`flex-1 justify-center items-center p-5 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}>
				<Text className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>Checking vault...</Text>
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
			/>
		);
	}

	const headerTitle =
		activeBottomTab === "folders"
			? "Folders"
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

	const headerSubtitle =
		activeBottomTab === "folders"
			? `${folders.length} folders organized`
			: `${user?.token ? "Synced with Snipit Cloud" : "Stored locally & encrypted"} • ${filteredItems.length} items`;

	return (
		<SafeAreaView
			className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
			style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
		>
			{/* Header */}
			<PWMGHeader
				c={c}
				title={headerTitle}
				subtitle={headerSubtitle}
				userToken={user?.token}
				activeBottomTab={activeBottomTab}
				isGridView={isNotesGridView}
				onToggleGridView={() => setIsNotesGridView((prev) => !prev)}
				onBack={onBack}
				onOpenProfile={onOpenProfile}
				onOpenGenerator={() => setIsGeneratorOpen(true)}
				onLock={handleLock}
				onAdd={() => {
					form.resetForm();
					if (activeBottomTab === "notes") form.setItemCategory("note");
					form.setIsAddModalOpen(true);
				}}
			/>

			{/* Body */}
			{activeBottomTab === "folders" ? (
				<IosFoldersView
					folders={folders}
					items={items}
					theme={theme}
					onSelectFolder={(folderId) => {
						setSelectedFolderId(folderId);
						setActiveFilter("all");
						setActiveBottomTab("passwords");
					}}
					onSelectType={(category) => {
						setSelectedFolderId(null);
						setActiveFilter(category as FilterCategory);
						setActiveBottomTab(category === "note" ? "notes" : "passwords");
					}}
					onCreateFolder={() => setIsFolderModalOpen(true)}
					onDeleteFolder={handleDeleteFolder}
				/>
			) : (
				<PWMGListView
					c={c}
					theme={theme}
					items={filteredItems}
					folders={folders}
					activeBottomTab={activeBottomTab}
					searchQuery={searchQuery}
					activeFilter={activeFilter}
					selectedFolderId={selectedFolderId}
					copiedField={copiedField}
					isGridView={isNotesGridView}
					onSearchChange={setSearchQuery}
					onResetFilter={() => {
						setSelectedFolderId(null);
						setActiveFilter("all");
					}}
					onSelectItem={(item) => {
						setShowDetailPassword(false);
						setShowCardNumber(false);
						setShowCardCVV(false);
						setSelectedItem(item);
					}}
					onCopyPassword={(pass, id) => copyToClipboard(pass, id)}
				/>
			)}

			{/* Right-Bottom Floating Action Button (FAB) to Create New Item */}
			{activeBottomTab !== "folders" && activeBottomTab !== "settings" && (
				<TouchableOpacity
					className={`absolute right-5 w-14 h-14 rounded-full justify-center items-center shadow-lg elevation-8 z-30 ${
						isLight ? "bg-slate-900" : "bg-white"
					}`}
					style={{ bottom: Platform.OS === "ios" ? 102 : 106 }}
					onPress={() => {
						form.resetForm();
						if (activeBottomTab === "notes") form.setItemCategory("note");
						form.setIsAddModalOpen(true);
					}}
					activeOpacity={0.85}
					accessibilityLabel="Create New Item"
				>
					<Plus color={isLight ? "#ffffff" : "#020617"} size={26} strokeWidth={2.6} />
				</TouchableOpacity>
			)}

			{/* Floating Tab Bar */}
			<IosBottomTabBar
				activeTab={activeBottomTab}
				theme={theme}
				onTabChange={(tab) => {
					setActiveBottomTab(tab);
					if (tab === "passwords") {
						setActiveFilter("all");
						setSelectedFolderId(null);
					} else if (tab === "folders") {
						setSelectedFolderId(null);
					} else if (tab === "notes") {
						setActiveFilter("note");
						setSelectedFolderId(null);
					} else if (tab === "settings") {
						if (onOpenProfile) onOpenProfile();
					}
				}}
			/>

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

			{/* Custom Theme-matched Alert Modal */}
			<CustomAlertModal config={alertConfig} theme={theme} />
		</SafeAreaView>
	);
}
