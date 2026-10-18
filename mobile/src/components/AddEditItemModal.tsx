import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Key, CreditCard, FileCode, StickyNote, User, ChevronDown, ChevronUp, RefreshCw, Tag, Plus, Trash2, Eye, EyeOff } from "lucide-react-native";
import { PasswordItem, Folder, CustomField } from "../core/vault-storage";
import { getCategoryItemLabel } from "./IosDetailInspectorModal";
import { useThemeVars } from "../config/theme";

interface Props {
	visible: boolean;
	editingItem: PasswordItem | null;
	itemCategory: PasswordItem["category"];
	itemFolderId: string | undefined;
	folders: Folder[];
	theme?: "dark" | "light";
	newTitle: string;
	newUsername: string;
	newPassword: string;
	newUrl: string;
	newNotes: string;
	cardHolder: string;
	cardNumber: string;
	cardExp: string;
	cardCvv: string;
	cardPin: string;
	cardZip: string;
	apiKeyId: string;
	apiSecret: string;
	apiEnv: string;
	identityName: string;
	identityEmail: string;
	identityPhone: string;
	identityAddress: string;
	customFields: CustomField[];
	isFolderDropdownOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	onOpenGenerator: (target: "password" | "apikey") => void;
	setItemCategory: (cat: PasswordItem["category"]) => void;
	setItemFolderId: (id: string | undefined) => void;
	setIsFolderDropdownOpen: (open: boolean) => void;
	setNewTitle: (t: string) => void;
	setNewUsername: (u: string) => void;
	setNewPassword: (p: string) => void;
	setNewUrl: (url: string) => void;
	setNewNotes: (n: string) => void;
	setCardHolder: (v: string) => void;
	setCardNumber: (v: string) => void;
	setCardExp: (v: string) => void;
	setCardCvv: (v: string) => void;
	setCardPin: (v: string) => void;
	setCardZip: (v: string) => void;
	setApiKeyId: (v: string) => void;
	setApiSecret: (v: string) => void;
	setApiEnv: (v: string) => void;
	setIdentityName: (v: string) => void;
	setIdentityEmail: (v: string) => void;
	setIdentityPhone: (v: string) => void;
	setIdentityAddress: (v: string) => void;
	setCustomFields: (fields: CustomField[]) => void;
}

export function AddEditItemModal({
	visible,
	editingItem,
	itemCategory,
	itemFolderId,
	folders,
	theme = "dark",
	newTitle,
	newUsername,
	newPassword,
	newUrl,
	newNotes,
	cardHolder,
	cardNumber,
	cardExp,
	cardCvv,
	cardPin,
	cardZip,
	apiKeyId,
	apiSecret,
	apiEnv,
	identityName,
	identityEmail,
	identityPhone,
	identityAddress,
	customFields,
	isFolderDropdownOpen,
	onClose,
	onSave,
	onOpenGenerator,
	setItemCategory,
	setItemFolderId,
	setIsFolderDropdownOpen,
	setNewTitle,
	setNewUsername,
	setNewPassword,
	setNewUrl,
	setNewNotes,
	setCardHolder,
	setCardNumber,
	setCardExp,
	setCardCvv,
	setCardPin,
	setCardZip,
	setApiKeyId,
	setApiSecret,
	setApiEnv,
	setIdentityName,
	setIdentityEmail,
	setIdentityPhone,
	setIdentityAddress,
	setCustomFields,
}: Props) {
	if (!visible) return null;
	const c = useThemeVars(theme);

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showCardCvv, setShowCardCvv] = useState(false);
	const [showCardPin, setShowCardPin] = useState(false);
	const [showApiSecret, setShowApiSecret] = useState(false);

	const categories: Array<{ id: PasswordItem["category"]; label: string; icon: any }> = [
		{ id: "login", label: "Login", icon: Key },
		{ id: "card", label: "Card", icon: CreditCard },
		{ id: "apikey", label: "API Key", icon: FileCode },
		{ id: "note", label: "Note", icon: StickyNote },
		{ id: "identity", label: "Identity", icon: User },
	];

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlay}>
				<View style={[styles.modalContent, { backgroundColor: c.bgSecondary }]}>
					{/* iOS Navigation Header */}
					<View style={[styles.navHeader, { borderBottomColor: c.border }]}>
						<TouchableOpacity onPress={onClose} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
							<Text style={{ color: c.blue, fontSize: 17, fontWeight: "400" }}>Cancel</Text>
						</TouchableOpacity>
						<Text style={[styles.navTitle, { color: c.text }]}>
							{editingItem ? `Edit ${getCategoryItemLabel(itemCategory)}` : `New ${getCategoryItemLabel(itemCategory)}`}
						</Text>
						<TouchableOpacity onPress={onSave} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
							<Text style={{ color: c.blue, fontSize: 17, fontWeight: "700" }}>Done</Text>
						</TouchableOpacity>
					</View>

					{/* Category Picker Tabs */}
					<View style={[styles.categoryTabs, { backgroundColor: c.bgTertiary }]}>
						{categories.map((cat) => {
							const IconComponent = cat.icon;
							const active = itemCategory === cat.id;
							return (
								<TouchableOpacity
									key={cat.id}
									style={[styles.categoryTab, active && { backgroundColor: c.blue }]}
									onPress={() => setItemCategory(cat.id)}
								>
									<IconComponent color={active ? "#fff" : c.textSecondary} size={15} />
									<Text style={[styles.categoryTabText, { color: active ? "#fff" : c.textSecondary }]}>
										{cat.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					<ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
						{/* Folder Assignment */}
						{folders.length > 0 && (
							<View style={{ marginBottom: 14 }}>
								<Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Folder (Optional)</Text>
								<TouchableOpacity
									style={[styles.dropdownHeader, { backgroundColor: c.bgTertiary }]}
									onPress={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
									activeOpacity={0.8}
								>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
										<View
											style={[
												styles.folderDot,
												{ backgroundColor: folders.find((f) => f.id === itemFolderId)?.color || c.textSecondary },
											]}
										/>
										<Text style={{ color: c.text, fontSize: 14, fontWeight: "600" }}>
											{folders.find((f) => f.id === itemFolderId)?.name || "No Folder"}
										</Text>
									</View>
									{isFolderDropdownOpen ? <ChevronUp color={c.textSecondary} size={18} /> : <ChevronDown color={c.textSecondary} size={18} />}
								</TouchableOpacity>

								{isFolderDropdownOpen && (
									<View style={[styles.dropdownList, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
										<TouchableOpacity
											style={[styles.dropdownItem, itemFolderId === undefined && { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}
											onPress={() => {
												setItemFolderId(undefined);
												setIsFolderDropdownOpen(false);
											}}
										>
											<View style={[styles.folderDot, { backgroundColor: c.textSecondary }]} />
											<Text style={{ color: c.text, fontSize: 13, fontWeight: "500" }}>No Folder</Text>
										</TouchableOpacity>
										{folders.map((f) => (
											<TouchableOpacity
												key={f.id}
												style={[styles.dropdownItem, itemFolderId === f.id && { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}
												onPress={() => {
													setItemFolderId(f.id);
													setIsFolderDropdownOpen(false);
												}}
											>
												<View style={[styles.folderDot, { backgroundColor: f.color }]} />
												<Text style={{ color: c.text, fontSize: 13, fontWeight: "500" }}>{f.name}</Text>
											</TouchableOpacity>
										))}
									</View>
								)}
							</View>
						)}

						{/* Item Title */}
						<TextInput
							style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
							placeholder="Item Title (e.g. GitHub, Chase Visa)"
							placeholderTextColor={c.textSecondary}
							value={newTitle}
							onChangeText={setNewTitle}
						/>

						{/* Login Form */}
						{itemCategory === "login" && (
							<>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Username or Email"
									placeholderTextColor={c.textSecondary}
									value={newUsername}
									onChangeText={setNewUsername}
								/>
								<View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
									<View style={[styles.inputWithIcon, { flex: 1, backgroundColor: c.bgTertiary }]}>
										<TextInput
											style={[styles.inputInside, { color: c.text }]}
											placeholder="Password"
											placeholderTextColor={c.textSecondary}
											secureTextEntry={!showLoginPassword}
											value={newPassword}
											onChangeText={setNewPassword}
											autoCapitalize="none"
										/>
										<TouchableOpacity
											style={styles.inlineEyeBtn}
											onPress={() => setShowLoginPassword(!showLoginPassword)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showLoginPassword ? (
												<EyeOff size={18} color={c.textSecondary} />
											) : (
												<Eye size={18} color={c.textSecondary} />
											)}
										</TouchableOpacity>
									</View>
									<TouchableOpacity style={[styles.genBtn, { backgroundColor: c.blue, marginBottom: 0 }]} onPress={() => onOpenGenerator("password")}>
										<RefreshCw color="#fff" size={18} />
									</TouchableOpacity>
								</View>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Website URL (optional)"
									placeholderTextColor={c.textSecondary}
									value={newUrl}
									onChangeText={setNewUrl}
								/>
							</>
						)}

						{/* Card Form */}
						{itemCategory === "card" && (
							<>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Cardholder Name"
									placeholderTextColor={c.textSecondary}
									value={cardHolder}
									onChangeText={setCardHolder}
								/>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Card Number (16 digits)"
									placeholderTextColor={c.textSecondary}
									keyboardType="numeric"
									value={cardNumber}
									onChangeText={setCardNumber}
								/>
								<View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
									<TextInput
										style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: c.bgTertiary, color: c.text }]}
										placeholder="Exp (MM/YY)"
										placeholderTextColor={c.textSecondary}
										value={cardExp}
										onChangeText={setCardExp}
									/>
									<View style={[styles.inputWithIcon, { flex: 1, backgroundColor: c.bgTertiary }]}>
										<TextInput
											style={[styles.inputInside, { color: c.text }]}
											placeholder="CVV"
											placeholderTextColor={c.textSecondary}
											keyboardType="numeric"
											secureTextEntry={!showCardCvv}
											value={cardCvv}
											onChangeText={setCardCvv}
										/>
										<TouchableOpacity
											style={styles.inlineEyeBtn}
											onPress={() => setShowCardCvv(!showCardCvv)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showCardCvv ? (
												<EyeOff size={18} color={c.textSecondary} />
											) : (
												<Eye size={18} color={c.textSecondary} />
											)}
										</TouchableOpacity>
									</View>
								</View>
								<View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
									<View style={[styles.inputWithIcon, { flex: 1, backgroundColor: c.bgTertiary }]}>
										<TextInput
											style={[styles.inputInside, { color: c.text }]}
											placeholder="PIN (optional)"
											placeholderTextColor={c.textSecondary}
											keyboardType="numeric"
											secureTextEntry={!showCardPin}
											value={cardPin}
											onChangeText={setCardPin}
										/>
										<TouchableOpacity
											style={styles.inlineEyeBtn}
											onPress={() => setShowCardPin(!showCardPin)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showCardPin ? (
												<EyeOff size={18} color={c.textSecondary} />
											) : (
												<Eye size={18} color={c.textSecondary} />
											)}
										</TouchableOpacity>
									</View>
									<TextInput
										style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: c.bgTertiary, color: c.text }]}
										placeholder="Billing Zip Code"
										placeholderTextColor={c.textSecondary}
										value={cardZip}
										onChangeText={setCardZip}
									/>
								</View>
							</>
						)}

						{/* API Key Form */}
						{itemCategory === "apikey" && (
							<>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Key ID / Key Name"
									placeholderTextColor={c.textSecondary}
									value={apiKeyId}
									onChangeText={setApiKeyId}
								/>
								<View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
									<View style={[styles.inputWithIcon, { flex: 1, backgroundColor: c.bgTertiary }]}>
										<TextInput
											style={[styles.inputInside, { color: c.text }]}
											placeholder="API Secret Key"
											placeholderTextColor={c.textSecondary}
											secureTextEntry={!showApiSecret}
											value={apiSecret}
											onChangeText={setApiSecret}
											autoCapitalize="none"
										/>
										<TouchableOpacity
											style={styles.inlineEyeBtn}
											onPress={() => setShowApiSecret(!showApiSecret)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showApiSecret ? (
												<EyeOff size={18} color={c.textSecondary} />
											) : (
												<Eye size={18} color={c.textSecondary} />
											)}
										</TouchableOpacity>
									</View>
									<TouchableOpacity style={[styles.genBtn, { backgroundColor: c.blue, marginBottom: 0 }]} onPress={() => onOpenGenerator("apikey")}>
										<RefreshCw color="#fff" size={18} />
									</TouchableOpacity>
								</View>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Base URL / Endpoint"
									placeholderTextColor={c.textSecondary}
									value={newUrl}
									onChangeText={setNewUrl}
								/>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Environment (Production, Staging, etc.)"
									placeholderTextColor={c.textSecondary}
									value={apiEnv}
									onChangeText={setApiEnv}
								/>
							</>
						)}

						{/* Identity Form */}
						{itemCategory === "identity" && (
							<>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Full Name"
									placeholderTextColor={c.textSecondary}
									value={identityName}
									onChangeText={setIdentityName}
								/>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Email"
									placeholderTextColor={c.textSecondary}
									value={identityEmail}
									onChangeText={setIdentityEmail}
								/>
								<TextInput
									style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Phone Number"
									placeholderTextColor={c.textSecondary}
									value={identityPhone}
									onChangeText={setIdentityPhone}
								/>
								<TextInput
									style={[styles.input, { height: 60, backgroundColor: c.bgTertiary, color: c.text }]}
									placeholder="Street Address, City, State, Zip"
									placeholderTextColor={c.textSecondary}
									multiline
									value={identityAddress}
									onChangeText={setIdentityAddress}
								/>
							</>
						)}

						{/* Common Notes */}
						<TextInput
							style={[styles.input, { height: itemCategory === "note" ? 120 : 60, backgroundColor: c.bgTertiary, color: c.text }]}
							placeholder={itemCategory === "note" ? "Write your secure note..." : "Notes (optional)"}
							placeholderTextColor={c.textSecondary}
							multiline
							value={newNotes}
							onChangeText={setNewNotes}
						/>

						{/* Custom Fields */}
						<View style={{ marginTop: 8, marginBottom: 12 }}>
							<View style={styles.customFieldsHeader}>
								<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
									<Tag color={c.blue} size={15} />
									<Text style={[styles.fieldLabel, { color: c.textSecondary, marginBottom: 0 }]}>Custom Fields</Text>
								</View>
								<TouchableOpacity
									style={[styles.addFieldBtn, { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}
									onPress={() => setCustomFields([...customFields, { id: Math.random().toString(36).substring(2, 9), name: "", value: "", type: "text" }])}
								>
									<Plus color={c.blue} size={14} />
									<Text style={{ color: c.blue, fontSize: 12, fontWeight: "600" }}>Add Field</Text>
								</TouchableOpacity>
							</View>
							{customFields.map((cf, index) => (
								<View key={cf.id || index} style={styles.customFieldRow}>
									<TextInput
										style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: c.bgTertiary, color: c.text }]}
										placeholder="Field Name"
										placeholderTextColor={c.textSecondary}
										value={cf.name}
										onChangeText={(text) => {
											const updated = [...customFields];
											updated[index] = { ...updated[index], name: text };
											setCustomFields(updated);
										}}
									/>
									<TextInput
										style={[styles.input, { flex: 1.2, marginBottom: 0, backgroundColor: c.bgTertiary, color: c.text }]}
										placeholder="Field Value"
										placeholderTextColor={c.textSecondary}
										value={cf.value}
										onChangeText={(text) => {
											const updated = [...customFields];
											updated[index] = { ...updated[index], value: text };
											setCustomFields(updated);
										}}
									/>
									<TouchableOpacity
										style={styles.removeFieldBtn}
										onPress={() => setCustomFields(customFields.filter((_, i) => i !== index))}
									>
										<Trash2 color={c.red} size={16} />
									</TouchableOpacity>
								</View>
							))}
						</View>

						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: c.blue }]} onPress={onSave}>
							<Text style={styles.btnText}>{editingItem ? "Update Credential" : "Save Item"}</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.65)",
		justifyContent: "flex-end",
	},
	modalContent: {
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		padding: 16,
		maxHeight: "92%",
	},
	navHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		marginBottom: 12,
	},
	navTitle: {
		fontSize: 17,
		fontWeight: "600",
		textAlign: "center",
	},
	categoryTabs: {
		flexDirection: "row",
		borderRadius: 10,
		padding: 3,
		marginBottom: 14,
	},
	categoryTab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		paddingVertical: 7,
		borderRadius: 8,
	},
	categoryTabText: {
		fontSize: 12,
		fontWeight: "600",
	},
	fieldLabel: {
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
		marginBottom: 6,
		letterSpacing: 0.5,
	},
	input: {
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 11,
		fontSize: 15,
		marginBottom: 10,
	},
	inputWithIcon: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 10,
		paddingRight: 8,
	},
	inputInside: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 11,
		fontSize: 15,
	},
	inlineEyeBtn: {
		padding: 6,
		justifyContent: "center",
		alignItems: "center",
	},
	genBtn: {
		paddingHorizontal: 16,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		marginBottom: 10,
	},
	dropdownHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 10,
	},
	dropdownList: {
		borderRadius: 10,
		borderWidth: 1,
		marginTop: 6,
		overflow: "hidden",
	},
	dropdownItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	folderDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	customFieldsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	addFieldBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	customFieldRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	removeFieldBtn: {
		padding: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	primaryBtn: {
		width: "100%",
		paddingVertical: 13,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 10,
		marginBottom: 20,
	},
	btnText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "700",
	},
});
