import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions, Pressable } from "react-native";
import { Key, CreditCard, FileCode, StickyNote, User, ChevronDown, ChevronUp, RefreshCw, Tag, Plus, Trash2, Eye, EyeOff } from "lucide-react-native";
import { PasswordItem, Folder, CustomField } from "../core/vault-storage";
import { getCategoryItemLabel } from "./IosDetailInspectorModal";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { CreatableCombobox } from "./ui/creatable-combobox";

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
	onCreateFolder?: (name: string, color?: string) => Promise<Folder | void>;
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
	onCreateFolder,
}: Props) {
	const SCREEN_HEIGHT = Dimensions.get("window").height;
	const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (visible) {
			setMounted(true);
			translateY.setValue(SCREEN_HEIGHT);
			Animated.spring(translateY, {
				toValue: 0,
				useNativeDriver: true,
				bounciness: 0,
				speed: 22,
			}).start();
		} else if (mounted) {
			Animated.timing(translateY, {
				toValue: SCREEN_HEIGHT,
				duration: 180,
				useNativeDriver: true,
			}).start(() => {
				setMounted(false);
			});
		}
	}, [visible]);

	const handleRequestClose = useCallback(() => {
		Animated.timing(translateY, {
			toValue: SCREEN_HEIGHT,
			duration: 180,
			useNativeDriver: true,
		}).start(() => {
			onClose();
			setMounted(false);
		});
	}, [onClose, translateY, SCREEN_HEIGHT]);

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

	if (!mounted) return null;

	return (
		<View
			className="absolute inset-0 z-50 justify-end"
			pointerEvents={visible ? "auto" : "none"}
		>
			<Pressable className="absolute inset-0 bg-black/70" onPress={handleRequestClose} />
			<KeyboardAvoidingView
				className="flex-1 justify-end"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				pointerEvents="box-none"
			>
				<Animated.View
					style={{ transform: [{ translateY }] }}
					className="rounded-t-2xl px-4 pt-3 max-h-[92%] flex-1 bg-card border-t border-border z-10"
				>
					{/* Modal Navigation Header */}
					<View className="flex-row items-center justify-between py-3 border-b border-border mb-3">
						<Button variant="ghost" size="sm" onPress={handleRequestClose} className="px-2">
							<Text className="text-sm font-semibold text-foreground">Cancel</Text>
						</Button>
						<Text className="text-base font-semibold text-center text-foreground">
							{editingItem ? `Edit ${getCategoryItemLabel(itemCategory)}` : `New ${getCategoryItemLabel(itemCategory)}`}
						</Text>
						<Button variant="default" size="sm" onPress={onSave} className="px-3">
							<Text className="text-sm font-semibold text-primary-foreground">Save</Text>
						</Button>
					</View>

					{/* Category Picker Tabs */}
					<Tabs
						value={itemCategory}
						onValueChange={(val) => setItemCategory(val as PasswordItem["category"])}
						className="mb-3.5"
					>
						<TabsList className="w-full flex-row">
							{categories.map((cat) => {
								const IconComponent = cat.icon;
								const active = itemCategory === cat.id;
								return (
									<TabsTrigger
										key={cat.id}
										value={cat.id}
										className="flex-1 flex-row items-center justify-center gap-1.5"
									>
										<IconComponent
											className={active ? "text-foreground" : "text-muted-foreground"}
											size={14}
										/>
										<Text className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>
											{cat.label}
										</Text>
									</TabsTrigger>
								);
							})}
						</TabsList>
					</Tabs>

					<ScrollView
						className="flex-1"
						contentContainerStyle={{ paddingBottom: 280 }}
						automaticallyAdjustKeyboardInsets={true}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="interactive"
					>
						{/* Folder Assignment with CreatableCombobox */}
						<View className="mb-3.5">
							<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
								Folder (Optional)
							</Text>
							<CreatableCombobox
								options={folders.map((f) => ({ id: f.id, label: f.name, color: f.color }))}
								selectedId={itemFolderId}
								onSelect={(id) => setItemFolderId(id)}
								onCreate={onCreateFolder ? async (name, color) => {
									const created = await onCreateFolder(name, color);
									if (created && created.id) {
										return { id: created.id, label: created.name, color: created.color };
									}
								} : undefined}
								placeholder="Select a folder..."
								noneLabel="No Folder (Root)"
								createLabel="Create new folder"
							/>
						</View>

						{/* Item Title */}
						<View className="mb-3">
							<Input
								placeholder="Item Title (e.g. GitHub, Chase Visa)"
								value={newTitle}
								onChangeText={setNewTitle}
							/>
						</View>

						{/* Login Form */}
						{itemCategory === "login" && (
							<>
								<View className="mb-3">
									<Input
										placeholder="Username or Email"
										value={newUsername}
										onChangeText={setNewUsername}
										autoCapitalize="none"
									/>
								</View>
								<View className="flex-row gap-2 mb-3">
									<View className="flex-1 flex-row items-center border border-input rounded-md pr-2 bg-background">
										<Input
											placeholder="Password"
											secureTextEntry={!showLoginPassword}
											value={newPassword}
											onChangeText={setNewPassword}
											autoCapitalize="none"
											className="flex-1 border-0 shadow-none bg-transparent"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
											onPress={() => setShowLoginPassword(!showLoginPassword)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showLoginPassword ? (
												<EyeOff size={16} className="text-muted-foreground" />
											) : (
												<Eye size={16} className="text-muted-foreground" />
											)}
										</TouchableOpacity>
									</View>
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10"
										onPress={() => onOpenGenerator("password")}
									>
										<RefreshCw className="text-foreground" size={16} />
									</Button>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Website URL (optional)"
										value={newUrl}
										onChangeText={setNewUrl}
										autoCapitalize="none"
									/>
								</View>
							</>
						)}

						{/* Card Form */}
						{itemCategory === "card" && (
							<>
								<View className="mb-3">
									<Input
										placeholder="Cardholder Name"
										value={cardHolder}
										onChangeText={setCardHolder}
									/>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Card Number (16 digits)"
										keyboardType="numeric"
										value={cardNumber}
										onChangeText={setCardNumber}
									/>
								</View>
								<View className="flex-row gap-2 mb-3">
									<View className="flex-1">
										<Input
											placeholder="Exp (MM/YY)"
											value={cardExp}
											onChangeText={setCardExp}
										/>
									</View>
									<View className="flex-1 flex-row items-center border border-input rounded-md pr-2 bg-background">
										<Input
											placeholder="CVV"
											keyboardType="numeric"
											secureTextEntry={!showCardCvv}
											value={cardCvv}
											onChangeText={setCardCvv}
											className="flex-1 border-0 shadow-none bg-transparent"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
											onPress={() => setShowCardCvv(!showCardCvv)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showCardCvv ? (
												<EyeOff size={16} className="text-muted-foreground" />
											) : (
												<Eye size={16} className="text-muted-foreground" />
											)}
										</TouchableOpacity>
									</View>
								</View>
								<View className="flex-row gap-2 mb-3">
									<View className="flex-1 flex-row items-center border border-input rounded-md pr-2 bg-background">
										<Input
											placeholder="PIN (optional)"
											keyboardType="numeric"
											secureTextEntry={!showCardPin}
											value={cardPin}
											onChangeText={setCardPin}
											className="flex-1 border-0 shadow-none bg-transparent"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
											onPress={() => setShowCardPin(!showCardPin)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showCardPin ? (
												<EyeOff size={16} className="text-muted-foreground" />
											) : (
												<Eye size={16} className="text-muted-foreground" />
											)}
										</TouchableOpacity>
									</View>
									<View className="flex-1">
										<Input
											placeholder="Billing Zip Code"
											value={cardZip}
											onChangeText={setCardZip}
										/>
									</View>
								</View>
							</>
						)}

						{/* API Key Form */}
						{itemCategory === "apikey" && (
							<>
								<View className="mb-3">
									<Input
										placeholder="Key ID / Key Name"
										value={apiKeyId}
										onChangeText={setApiKeyId}
									/>
								</View>
								<View className="flex-row gap-2 mb-3">
									<View className="flex-1 flex-row items-center border border-input rounded-md pr-2 bg-background">
										<Input
											placeholder="API Secret Key"
											secureTextEntry={!showApiSecret}
											value={apiSecret}
											onChangeText={setApiSecret}
											autoCapitalize="none"
											className="flex-1 border-0 shadow-none bg-transparent"
										/>
										<TouchableOpacity
											className="p-1.5 items-center justify-center"
											onPress={() => setShowApiSecret(!showApiSecret)}
											hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										>
											{showApiSecret ? (
												<EyeOff size={16} className="text-muted-foreground" />
											) : (
												<Eye size={16} className="text-muted-foreground" />
											)}
										</TouchableOpacity>
									</View>
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10"
										onPress={() => onOpenGenerator("apikey")}
									>
										<RefreshCw className="text-foreground" size={16} />
									</Button>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Base URL / Endpoint"
										value={newUrl}
										onChangeText={setNewUrl}
										autoCapitalize="none"
									/>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Environment (Production, Staging, etc.)"
										value={apiEnv}
										onChangeText={setApiEnv}
									/>
								</View>
							</>
						)}

						{/* Identity Form */}
						{itemCategory === "identity" && (
							<>
								<View className="mb-3">
									<Input
										placeholder="Full Name"
										value={identityName}
										onChangeText={setIdentityName}
									/>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Email"
										keyboardType="email-address"
										autoCapitalize="none"
										value={identityEmail}
										onChangeText={setIdentityEmail}
									/>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Phone Number"
										keyboardType="phone-pad"
										value={identityPhone}
										onChangeText={setIdentityPhone}
									/>
								</View>
								<View className="mb-3">
									<Input
										placeholder="Street Address, City, State, Zip"
										multiline
										value={identityAddress}
										onChangeText={setIdentityAddress}
										className="h-16 py-2"
									/>
								</View>
							</>
						)}

						{/* Common Notes */}
						<View className="mb-3">
							<Input
								placeholder={itemCategory === "note" ? "Write your secure note..." : "Notes (optional)"}
								multiline
								value={newNotes}
								onChangeText={setNewNotes}
								className={itemCategory === "note" ? "h-28 py-2" : "h-16 py-2"}
							/>
						</View>

						{/* Custom Fields */}
						<View className="mt-2 mb-3">
							<View className="flex-row justify-between items-center mb-2">
								<View className="flex-row items-center gap-1.5">
									<Tag className="text-muted-foreground" size={14} />
									<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Custom Fields
									</Text>
								</View>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 px-2 flex-row gap-1"
									onPress={() => setCustomFields([...customFields, { id: Math.random().toString(36).substring(2, 9), name: "", value: "", type: "text" }])}
								>
									<Plus className="text-foreground" size={13} />
									<Text className="text-xs font-semibold">Add Field</Text>
								</Button>
							</View>
							{customFields.map((cf, index) => (
								<View key={cf.id || index} className="flex-row items-center gap-2 mb-2">
									<View className="flex-1">
										<Input
											placeholder="Field Name"
											value={cf.name}
											onChangeText={(text) => {
												const updated = [...customFields];
												updated[index] = { ...updated[index], name: text };
												setCustomFields(updated);
											}}
										/>
									</View>
									<View className="flex-[1.2]">
										<Input
											placeholder="Field Value"
											value={cf.value}
											onChangeText={(text) => {
												const updated = [...customFields];
												updated[index] = { ...updated[index], value: text };
												setCustomFields(updated);
											}}
										/>
									</View>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9"
										onPress={() => setCustomFields(customFields.filter((_, i) => i !== index))}
									>
										<Trash2 className="text-destructive" size={16} />
									</Button>
								</View>
							))}
						</View>

						<Button className="w-full h-11 mt-2 mb-5" onPress={onSave}>
							<Text className="font-semibold text-primary-foreground">{editingItem ? "Update Credential" : "Save Item"}</Text>
						</Button>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</View>
	);
}
