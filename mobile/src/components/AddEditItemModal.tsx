import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
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
	const isLight = theme === "light";

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

	const inputClass = `rounded-xl px-3 py-2.5 text-[15px] mb-2.5 ${
		isLight ? "bg-slate-200/60 text-slate-900" : "bg-slate-800 text-white"
	}`;

	const containerBg = isLight ? "bg-slate-100" : "bg-slate-900";
	const tertiaryBg = isLight ? "bg-slate-200/70" : "bg-slate-800";
	const borderColor = isLight ? "border-slate-200" : "border-slate-800";

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<KeyboardAvoidingView
				className="flex-1 bg-black/65 justify-end"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View className={`rounded-t-[18px] p-4 max-h-[92%] ${containerBg}`}>
					{/* iOS Navigation Header */}
					<View className={`flex-row items-center justify-between py-3 border-b mb-3 ${borderColor}`}>
						<TouchableOpacity onPress={onClose} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
							<Text className={`text-[17px] font-normal ${isLight ? "text-blue-600" : "text-blue-400"}`}>Cancel</Text>
						</TouchableOpacity>
						<Text className={`text-[17px] font-semibold text-center ${isLight ? "text-slate-900" : "text-white"}`}>
							{editingItem ? `Edit ${getCategoryItemLabel(itemCategory)}` : `New ${getCategoryItemLabel(itemCategory)}`}
						</Text>
						<TouchableOpacity onPress={onSave} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
							<Text className={`text-[17px] font-bold ${isLight ? "text-blue-600" : "text-blue-400"}`}>Done</Text>
						</TouchableOpacity>
					</View>

					{/* Category Picker Tabs */}
					<View className={`flex-row rounded-xl p-1 mb-3.5 ${tertiaryBg}`}>
						{categories.map((cat) => {
							const IconComponent = cat.icon;
							const active = itemCategory === cat.id;
							return (
								<TouchableOpacity
									key={cat.id}
									className={`flex-1 flex-row items-center justify-center gap-1 py-1.5 rounded-lg ${
										active ? "bg-blue-600" : ""
									}`}
									onPress={() => setItemCategory(cat.id)}
								>
									<IconComponent color={active ? "#fff" : c.textSecondary} size={15} />
									<Text className={`text-xs font-semibold ${active ? "text-white" : isLight ? "text-slate-500" : "text-slate-400"}`}>
										{cat.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					<ScrollView
						className="max-h-[440px]"
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="interactive"
					>
						{/* Folder Assignment */}
						{folders.length > 0 && (
							<View className="mb-3.5">
								<Text className={`text-[11px] font-bold uppercase mb-1.5 tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
									Folder (Optional)
								</Text>
								<TouchableOpacity
									className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl ${tertiaryBg}`}
									onPress={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
									activeOpacity={0.8}
								>
									<View className="flex-row items-center gap-2">
										<View
											style={{ backgroundColor: folders.find((f) => f.id === itemFolderId)?.color || c.textSecondary }}
											className="w-2 h-2 rounded-full"
										/>
										<Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
											{folders.find((f) => f.id === itemFolderId)?.name || "No Folder"}
										</Text>
									</View>
									{isFolderDropdownOpen ? <ChevronUp color={c.textSecondary} size={18} /> : <ChevronDown color={c.textSecondary} size={18} />}
								</TouchableOpacity>

								{isFolderDropdownOpen && (
									<View className={`rounded-xl border mt-1.5 overflow-hidden ${tertiaryBg} ${borderColor}`}>
										<TouchableOpacity
											className={`flex-row items-center gap-2.5 px-3 py-2.5 ${itemFolderId === undefined ? "bg-blue-500/15" : ""}`}
											onPress={() => {
												setItemFolderId(undefined);
												setIsFolderDropdownOpen(false);
											}}
										>
											<View style={{ backgroundColor: c.textSecondary }} className="w-2 h-2 rounded-full" />
											<Text className={`text-[13px] font-medium ${isLight ? "text-slate-900" : "text-white"}`}>No Folder</Text>
										</TouchableOpacity>
										{folders.map((f) => (
											<TouchableOpacity
												key={f.id}
												className={`flex-row items-center gap-2.5 px-3 py-2.5 ${itemFolderId === f.id ? "bg-blue-500/15" : ""}`}
												onPress={() => {
													setItemFolderId(f.id);
													setIsFolderDropdownOpen(false);
												}}
											>
												<View style={{ backgroundColor: f.color }} className="w-2 h-2 rounded-full" />
												<Text className={`text-[13px] font-medium ${isLight ? "text-slate-900" : "text-white"}`}>{f.name}</Text>
											</TouchableOpacity>
										))}
									</View>
								)}
							</View>
						)}

						{/* Item Title */}
						<TextInput
							className={inputClass}
							placeholder="Item Title (e.g. GitHub, Chase Visa)"
							placeholderTextColor={c.textSecondary}
							value={newTitle}
							onChangeText={setNewTitle}
						/>

						{/* Login Form */}
						{itemCategory === "login" && (
							<>
								<TextInput
									className={inputClass}
									placeholder="Username or Email"
									placeholderTextColor={c.textSecondary}
									value={newUsername}
									onChangeText={setNewUsername}
								/>
								<View className="flex-row gap-2 mb-2.5">
									<View className={`flex-1 flex-row items-center rounded-xl pr-2 ${tertiaryBg}`}>
										<TextInput
											className={`flex-1 px-3 py-2.5 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
											placeholder="Password"
											placeholderTextColor={c.textSecondary}
											secureTextEntry={!showLoginPassword}
											value={newPassword}
											onChangeText={setNewPassword}
											autoCapitalize="none"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
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
									<TouchableOpacity
										className="px-4 items-center justify-center rounded-xl bg-blue-600 mb-0"
										onPress={() => onOpenGenerator("password")}
									>
										<RefreshCw color="#fff" size={18} />
									</TouchableOpacity>
								</View>
								<TextInput
									className={inputClass}
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
									className={inputClass}
									placeholder="Cardholder Name"
									placeholderTextColor={c.textSecondary}
									value={cardHolder}
									onChangeText={setCardHolder}
								/>
								<TextInput
									className={inputClass}
									placeholder="Card Number (16 digits)"
									placeholderTextColor={c.textSecondary}
									keyboardType="numeric"
									value={cardNumber}
									onChangeText={setCardNumber}
								/>
								<View className="flex-row gap-2 mb-2.5">
									<TextInput
										className={`flex-1 ${inputClass} mb-0`}
										placeholder="Exp (MM/YY)"
										placeholderTextColor={c.textSecondary}
										value={cardExp}
										onChangeText={setCardExp}
									/>
									<View className={`flex-1 flex-row items-center rounded-xl pr-2 ${tertiaryBg}`}>
										<TextInput
											className={`flex-1 px-3 py-2.5 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
											placeholder="CVV"
											placeholderTextColor={c.textSecondary}
											keyboardType="numeric"
											secureTextEntry={!showCardCvv}
											value={cardCvv}
											onChangeText={setCardCvv}
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
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
								<View className="flex-row gap-2 mb-2.5">
									<View className={`flex-1 flex-row items-center rounded-xl pr-2 ${tertiaryBg}`}>
										<TextInput
											className={`flex-1 px-3 py-2.5 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
											placeholder="PIN (optional)"
											placeholderTextColor={c.textSecondary}
											keyboardType="numeric"
											secureTextEntry={!showCardPin}
											value={cardPin}
											onChangeText={setCardPin}
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
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
										className={`flex-1 ${inputClass} mb-0`}
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
									className={inputClass}
									placeholder="Key ID / Key Name"
									placeholderTextColor={c.textSecondary}
									value={apiKeyId}
									onChangeText={setApiKeyId}
								/>
								<View className="flex-row gap-2 mb-2.5">
									<View className={`flex-1 flex-row items-center rounded-xl pr-2 ${tertiaryBg}`}>
										<TextInput
											className={`flex-1 px-3 py-2.5 text-[15px] ${isLight ? "text-slate-900" : "text-white"}`}
											placeholder="API Secret Key"
											placeholderTextColor={c.textSecondary}
											secureTextEntry={!showApiSecret}
											value={apiSecret}
											onChangeText={setApiSecret}
											autoCapitalize="none"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
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
									<TouchableOpacity
										className="px-4 items-center justify-center rounded-xl bg-blue-600 mb-0"
										onPress={() => onOpenGenerator("apikey")}
									>
										<RefreshCw color="#fff" size={18} />
									</TouchableOpacity>
								</View>
								<TextInput
									className={inputClass}
									placeholder="Base URL / Endpoint"
									placeholderTextColor={c.textSecondary}
									value={newUrl}
									onChangeText={setNewUrl}
								/>
								<TextInput
									className={inputClass}
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
									className={inputClass}
									placeholder="Full Name"
									placeholderTextColor={c.textSecondary}
									value={identityName}
									onChangeText={setIdentityName}
								/>
								<TextInput
									className={inputClass}
									placeholder="Email"
									placeholderTextColor={c.textSecondary}
									value={identityEmail}
									onChangeText={setIdentityEmail}
								/>
								<TextInput
									className={inputClass}
									placeholder="Phone Number"
									placeholderTextColor={c.textSecondary}
									value={identityPhone}
									onChangeText={setIdentityPhone}
								/>
								<TextInput
									className={`h-[60px] ${inputClass}`}
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
							className={`${itemCategory === "note" ? "h-[120px]" : "h-[60px]"} ${inputClass}`}
							placeholder={itemCategory === "note" ? "Write your secure note..." : "Notes (optional)"}
							placeholderTextColor={c.textSecondary}
							multiline
							value={newNotes}
							onChangeText={setNewNotes}
						/>

						{/* Custom Fields */}
						<View className="mt-2 mb-3">
							<View className="flex-row justify-between items-center mb-2">
								<View className="flex-row items-center gap-1.5">
									<Tag color={c.blue} size={15} />
									<Text className={`text-[11px] font-bold uppercase tracking-wider mb-0 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
										Custom Fields
									</Text>
								</View>
								<TouchableOpacity
									className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/15"
									onPress={() => setCustomFields([...customFields, { id: Math.random().toString(36).substring(2, 9), name: "", value: "", type: "text" }])}
								>
									<Plus color={c.blue} size={14} />
									<Text className="text-blue-500 text-xs font-semibold">Add Field</Text>
								</TouchableOpacity>
							</View>
							{customFields.map((cf, index) => (
								<View key={cf.id || index} className="flex-row items-center gap-2 mb-2">
									<TextInput
										className={`flex-1 ${inputClass} mb-0`}
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
										className={`flex-[1.2] ${inputClass} mb-0`}
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
										className="p-2 items-center justify-center"
										onPress={() => setCustomFields(customFields.filter((_, i) => i !== index))}
									>
										<Trash2 color={c.red} size={16} />
									</TouchableOpacity>
								</View>
							))}
						</View>

						<TouchableOpacity className="w-full py-3.5 rounded-xl items-center mt-2.5 mb-5 bg-blue-600" onPress={onSave}>
							<Text className="text-white text-base font-bold">{editingItem ? "Update Credential" : "Save Item"}</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
