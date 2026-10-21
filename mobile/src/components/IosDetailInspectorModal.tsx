import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { X, Star, Eye, EyeOff, Copy, Check, Trash2 } from "lucide-react-native";
import { PasswordItem } from "../core/vault-storage";
import { ItemAvatar } from "./ItemAvatar";
import { CreditCardVisual } from "./CreditCardVisual";
import { DetailGroupedRow, DetailGroupedCard } from "./DetailGroupedRow";
import { useThemeVars } from "../config/theme";

interface Props {
	visible: boolean;
	item: PasswordItem | null;
	theme?: "dark" | "light";
	showPassword: boolean;
	showCardNumber: boolean;
	showCardCVV: boolean;
	copiedField: string | null;
	onClose: () => void;
	onOpenEdit: (item: PasswordItem) => void;
	onToggleFavorite: (item: PasswordItem) => void;
	onDeleteItem: (id: string) => void;
	onTogglePassword: () => void;
	onToggleCardNumber: () => void;
	onToggleCardCVV: () => void;
	onCopyToClipboard: (text: string, fieldId: string) => void;
	getCategoryBadgeStyle: (category: PasswordItem["category"]) => any;
	getCategoryIcon: (category: PasswordItem["category"], size?: number) => React.ReactNode;
}

export function getCategoryItemLabel(cat: PasswordItem["category"]): string {
	switch (cat) {
		case "card":
			return "Card";
		case "apikey":
			return "API Key";
		case "note":
			return "Note";
		case "identity":
			return "Identity";
		case "login":
		default:
			return "Password";
	}
}

export function IosDetailInspectorModal({
	visible,
	item,
	theme = "dark",
	showPassword,
	showCardNumber,
	showCardCVV,
	copiedField,
	onClose,
	onOpenEdit,
	onToggleFavorite,
	onDeleteItem,
	onTogglePassword,
	onToggleCardNumber,
	onToggleCardCVV,
	onCopyToClipboard,
	getCategoryBadgeStyle,
	getCategoryIcon,
}: Props) {
	if (!item) return null;

	const vars = useThemeVars(theme);
	const isLight = theme === "light";

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View className="flex-1 bg-black/65 justify-end">
				<View className={`rounded-t-[18px] max-h-[92%] min-h-[75%] ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
					{/* Header */}
					<View className={`flex-row items-center justify-between px-4 py-3.5 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
						<TouchableOpacity
							onPress={onClose}
							className="w-[30px] h-[30px] rounded-full bg-slate-500/20 items-center justify-center"
							hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
						>
							<X color={vars.textSecondary} size={20} />
						</TouchableOpacity>

						<Text className={`text-[17px] font-semibold text-center flex-1 mx-3 ${isLight ? "text-slate-900" : "text-white"}`} numberOfLines={1}>
							{item.title}
						</Text>

						<TouchableOpacity
							onPress={() => onOpenEdit(item)}
							hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
						>
							<Text className={`text-[17px] font-semibold ${isLight ? "text-blue-600" : "text-blue-400"}`}>Edit</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						className="flex-1"
						contentContainerClassName="px-4 pt-4 pb-10"
						showsVerticalScrollIndicator={false}
					>
						{/* Hero Brand Icon */}
						<View className="items-center my-4">
							<ItemAvatar
								item={item}
								size={72}
								fallbackIcon={
									<View style={getCategoryBadgeStyle(item.category)} className="w-[72px] h-[72px] rounded-[18px] items-center justify-center">
										{getCategoryIcon(item.category, 36)}
									</View>
								}
							/>
							<Text className={`text-[22px] font-bold mt-3 text-center ${isLight ? "text-slate-900" : "text-white"}`}>{item.title}</Text>
							{item.isFavorite && (
								<View className="flex-row items-center gap-1 bg-yellow-500/15 px-2.5 py-0.5 rounded-full mt-1.5">
									<Star color="#eab308" fill="#eab308" size={13} />
									<Text className="text-yellow-500 text-xs font-semibold">Favorite</Text>
								</View>
							)}
						</View>

						{/* Credit Card Visual */}
						{item.category === "card" && (
							<CreditCardVisual
								cardNumber={item.metadata?.cardNumber}
								cardholderName={item.metadata?.cardholderName}
								expiration={item.metadata?.expiration}
								cvv={item.metadata?.cvv}
								showNumber={showCardNumber}
								showCvv={showCardCVV}
								copied={copiedField === "cardnum"}
								onToggleNumber={onToggleCardNumber}
								onToggleCvv={onToggleCardCVV}
								onCopyCard={() =>
									item.metadata?.cardNumber && onCopyToClipboard(item.metadata.cardNumber, "cardnum")
								}
							/>
						)}

						{/* Primary Account Fields */}
						{(item.username || item.password || item.url) && (
							<DetailGroupedCard theme={theme}>
								{item.username && (
									<DetailGroupedRow
										label="Email / Username"
										value={item.username}
										theme={theme}
										onCopy={() => onCopyToClipboard(item.username!, "user")}
										isCopied={copiedField === "user"}
									/>
								)}

								{item.password && (
									<DetailGroupedRow
										label={item.category === "apikey" ? "API Secret Key" : "Password"}
										value={showPassword ? item.password : "••••••••••••••••"}
										theme={theme}
										isDivider={!!item.username}
										isMasked={!showPassword}
										rightAction={
											<View className="flex-row items-center gap-3.5">
												<TouchableOpacity onPress={onTogglePassword} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
													{showPassword ? <EyeOff color={vars.textSecondary} size={20} /> : <Eye color={vars.textSecondary} size={20} />}
												</TouchableOpacity>
												<TouchableOpacity onPress={() => onCopyToClipboard(item.password!, "pass")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
													{copiedField === "pass" ? <Check color={vars.green} size={20} /> : <Copy color={vars.blue} size={20} />}
												</TouchableOpacity>
											</View>
										}
									/>
								)}

								{item.url && (
									<DetailGroupedRow
										label="Website"
										value={item.url}
										theme={theme}
										isDivider={!!(item.username || item.password)}
										isUrl
										onCopy={() => onCopyToClipboard(item.url!, "url")}
										isCopied={copiedField === "url"}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* API Key Metadata */}
						{item.category === "apikey" && item.metadata && (
							<DetailGroupedCard theme={theme}>
								{item.metadata.keyId && (
									<DetailGroupedRow
										label="Key ID / Identifier"
										value={item.metadata.keyId}
										theme={theme}
										onCopy={() => onCopyToClipboard(item.metadata!.keyId, "keyid")}
										isCopied={copiedField === "keyid"}
									/>
								)}
								{item.metadata.environment && (
									<DetailGroupedRow
										label="Environment"
										value={item.metadata.environment}
										theme={theme}
										isDivider={!!item.metadata.keyId}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* Identity Metadata */}
						{item.category === "identity" && item.metadata && (
							<DetailGroupedCard theme={theme}>
								{item.metadata.fullName && (
									<DetailGroupedRow label="Full Name" value={item.metadata.fullName} theme={theme} />
								)}
								{item.metadata.phone && (
									<DetailGroupedRow
										label="Phone Number"
										value={item.metadata.phone}
										theme={theme}
										isDivider={!!item.metadata.fullName}
									/>
								)}
								{item.metadata.address && (
									<DetailGroupedRow
										label="Physical Address"
										value={item.metadata.address}
										theme={theme}
										isDivider={!!(item.metadata.fullName || item.metadata.phone)}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* Notes */}
						{item.notes && (
							<DetailGroupedCard theme={theme}>
								<DetailGroupedRow label="Notes" value={item.notes} theme={theme} />
							</DetailGroupedCard>
						)}

						{/* Custom Fields */}
						{item.customFields && item.customFields.length > 0 && (
							<DetailGroupedCard theme={theme}>
								{item.customFields.map((cf, idx) => (
									<DetailGroupedRow
										key={cf.id || idx}
										label={cf.name || "Field"}
										value={cf.value || "—"}
										theme={theme}
										isDivider={idx > 0}
										onCopy={cf.value ? () => onCopyToClipboard(cf.value, `cf_${idx}`) : undefined}
										isCopied={copiedField === `cf_${idx}`}
									/>
								))}
							</DetailGroupedCard>
						)}

						{/* Actions (Favorite & Delete) */}
						<DetailGroupedCard theme={theme} marginTop={16}>
							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={() => onToggleFavorite(item)} activeOpacity={0.7}>
								<Star
									color={item.isFavorite ? "#eab308" : vars.blue}
									fill={item.isFavorite ? "#eab308" : "transparent"}
									size={18}
								/>
								<Text className={`text-base font-medium ${isLight ? "text-blue-600" : "text-blue-400"}`}>
									{item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
								</Text>
							</TouchableOpacity>

							<View className={`border-t ${isLight ? "border-slate-100" : "border-slate-800"}`} />

							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={() => onDeleteItem(item.id)} activeOpacity={0.7}>
								<Trash2 color={vars.red} size={18} />
								<Text className="text-base font-medium text-red-500">
									Delete {getCategoryItemLabel(item.category)}
								</Text>
							</TouchableOpacity>
						</DetailGroupedCard>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
