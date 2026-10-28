import React from "react";
import { View, ScrollView, TouchableOpacity, Modal } from "react-native";
import { X, Star, Eye, EyeOff, Copy, Check, Trash2 } from "lucide-react-native";
import { Icon } from "./ui/icon";
import { PasswordItem } from "../core/vault-storage";
import { ItemAvatar } from "./ItemAvatar";
import { CreditCardVisual } from "./CreditCardVisual";
import { DetailGroupedRow, DetailGroupedCard } from "./DetailGroupedRow";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Card } from "./ui/card";

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

	return (
		<Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
			<View className="flex-1 bg-black/70 justify-end">
				<View className="rounded-t-2xl max-h-[92%] min-h-[75%] bg-card border-t border-border">
					{/* Header */}
					<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
						<Button
							variant="ghost"
							size="icon"
							onPress={onClose}
							className="h-8 w-8"
						>
							<X className="text-foreground" size={18} />
						</Button>

						<Text className="text-base font-semibold text-center flex-1 mx-3 text-foreground" numberOfLines={1}>
							{item.title}
						</Text>

						<Button
							variant="ghost"
							size="sm"
							onPress={() => onOpenEdit(item)}
							className="px-2"
						>
							<Text className="text-sm font-semibold">Edit</Text>
						</Button>
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
								size={64}
								fallbackIcon={
									<View className="w-16 h-16 rounded-xl bg-muted items-center justify-center border border-border">
										{getCategoryIcon(item.category, 32)}
									</View>
								}
							/>
							<Text className="text-xl font-bold mt-3 text-center text-foreground">{item.title}</Text>
							{item.isFavorite && (
								<View className="flex-row items-center gap-1 bg-muted px-2.5 py-0.5 rounded-full mt-1.5 border border-border">
									<Star className="text-foreground fill-foreground" size={12} />
									<Text className="text-foreground text-xs font-medium">Favorite</Text>
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
													{showPassword ? <EyeOff className="text-muted-foreground" size={18} /> : <Eye className="text-muted-foreground" size={18} />}
												</TouchableOpacity>
												<TouchableOpacity onPress={() => onCopyToClipboard(item.password!, "pass")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
													{copiedField === "pass" ? <Check className="text-foreground" size={18} /> : <Copy className="text-muted-foreground" size={18} />}
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
						<Card className="border-border bg-card overflow-hidden mt-4">
							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={() => onToggleFavorite(item)} activeOpacity={0.7}>
								<Icon
									as={Star}
									className={item.isFavorite ? "text-foreground fill-foreground" : "text-muted-foreground"}
									size={18}
								/>
								<Text className="text-sm font-medium text-foreground">
									{item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
								</Text>
							</TouchableOpacity>

							<View className="border-t border-border" />

							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={() => onDeleteItem(item.id)} activeOpacity={0.7}>
								<Icon as={Trash2} className="text-destructive" size={18} />
								<Text className="text-sm font-medium text-destructive">
									Delete {getCategoryItemLabel(item.category)}
								</Text>
							</TouchableOpacity>
						</Card>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
