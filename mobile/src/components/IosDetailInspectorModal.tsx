import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from "react-native";
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

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlay}>
				<View style={[styles.modalContent, { backgroundColor: vars.bgSecondary }]}>
					{/* Header */}
					<View style={[styles.navHeader, { borderBottomColor: vars.border }]}>
						<TouchableOpacity
							onPress={onClose}
							style={styles.navDismissBtn}
							hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
						>
							<X color={vars.textSecondary} size={20} />
						</TouchableOpacity>

						<Text style={[styles.navTitle, { color: vars.text }]} numberOfLines={1}>
							{item.title}
						</Text>

						<TouchableOpacity
							onPress={() => onOpenEdit(item)}
							hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
						>
							<Text style={[styles.navEditText, { color: vars.blue }]}>Edit</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
						showsVerticalScrollIndicator={false}
					>
						{/* Hero Brand Icon */}
						<View style={styles.heroContainer}>
							<ItemAvatar
								item={item}
								size={72}
								fallbackIcon={
									<View style={[styles.heroFallback, getCategoryBadgeStyle(item.category)]}>
										{getCategoryIcon(item.category, 36)}
									</View>
								}
							/>
							<Text style={[styles.heroTitle, { color: vars.text }]}>{item.title}</Text>
							{item.isFavorite && (
								<View style={styles.favoriteBadge}>
									<Star color="#eab308" fill="#eab308" size={13} />
									<Text style={styles.favoriteBadgeText}>Favorite</Text>
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
										label="Password"
										value={showPassword ? item.password : "••••••••••••••••"}
										theme={theme}
										isDivider={!!item.username}
										isMasked={!showPassword}
										rightAction={
											<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
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
							<TouchableOpacity style={styles.actionRow} onPress={() => onToggleFavorite(item)} activeOpacity={0.7}>
								<Star
									color={item.isFavorite ? "#eab308" : vars.blue}
									fill={item.isFavorite ? "#eab308" : "transparent"}
									size={18}
								/>
								<Text style={[styles.actionTextBlue, { color: vars.blue }]}>
									{item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
								</Text>
							</TouchableOpacity>

							<View style={[styles.divider, { borderTopColor: vars.border }]} />

							<TouchableOpacity style={styles.actionRow} onPress={() => onDeleteItem(item.id)} activeOpacity={0.7}>
								<Trash2 color={vars.red} size={18} />
								<Text style={[styles.actionTextDestructive, { color: vars.red }]}>
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

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.65)",
		justifyContent: "flex-end",
	},
	modalContent: {
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		maxHeight: "92%",
		minHeight: "75%",
	},
	navHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 0.5,
	},
	navDismissBtn: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: "rgba(142, 142, 147, 0.22)",
		justifyContent: "center",
		alignItems: "center",
	},
	navTitle: {
		fontSize: 17,
		fontWeight: "600",
		textAlign: "center",
		flex: 1,
		marginHorizontal: 12,
	},
	navEditText: {
		fontSize: 17,
		fontWeight: "600",
	},
	heroContainer: {
		alignItems: "center",
		marginVertical: 16,
	},
	heroFallback: {
		width: 72,
		height: 72,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	heroTitle: {
		fontSize: 22,
		fontWeight: "700",
		marginTop: 12,
		textAlign: "center",
	},
	favoriteBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "rgba(234, 179, 8, 0.15)",
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 12,
		marginTop: 6,
	},
	favoriteBadgeText: {
		color: "#eab308",
		fontSize: 12,
		fontWeight: "600",
	},
	divider: {
		borderTopWidth: 0.5,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	actionTextBlue: {
		fontSize: 16,
		fontWeight: "500",
	},
	actionTextDestructive: {
		fontSize: 16,
		fontWeight: "500",
	},
});
