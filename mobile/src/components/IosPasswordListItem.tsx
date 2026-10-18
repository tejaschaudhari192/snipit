import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Star, MoreVertical, Copy, Check } from "lucide-react-native";
import { PasswordItem } from "../core/vault-storage";
import { ItemAvatar } from "./ItemAvatar";

interface Props {
	item: PasswordItem;
	index: number;
	totalItems: number;
	subtitle: string;
	copied: boolean;
	theme?: "dark" | "light";
	fallbackIcon?: React.ReactNode;
	onPress: () => void;
	onCopyPassword?: (password: string) => void;
}

export function IosPasswordListItem({
	item,
	index,
	totalItems,
	subtitle,
	copied,
	theme = "dark",
	fallbackIcon,
	onPress,
	onCopyPassword,
}: Props) {
	const isLight = theme === "light";
	const isFirst = index === 0;
	const isLast = index === totalItems - 1;

	return (
		<TouchableOpacity
			style={[
				styles.iosListItem,
				isLight && styles.lightIosListItem,
				isFirst && styles.iosListItemFirst,
				isLast && styles.iosListItemLast,
				!isLast && styles.iosListItemSeparator,
			]}
			activeOpacity={0.65}
			onPress={onPress}
		>
			{/* Squircle App/Site Avatar */}
			<ItemAvatar item={item} size={42} fallbackIcon={fallbackIcon} />

			<View style={styles.iosListItemContent}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
					<Text
						style={[styles.iosItemTitleText, isLight && styles.lightText]}
						numberOfLines={1}
					>
						{item.title}
					</Text>
					{item.isFavorite && (
						<Star color="#eab308" fill="#eab308" size={13} />
					)}
				</View>
				<Text style={styles.iosItemSubtitleText} numberOfLines={1}>
					{subtitle}
				</Text>
			</View>

			{/* iOS 3-dots / Quick Context Action */}
			<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
				{item.password && onCopyPassword ? (
					<TouchableOpacity
						style={styles.iosQuickCopyBtn}
						onPress={() => onCopyPassword(item.password!)}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					>
						{copied ? (
							<Check color="#34c759" size={18} />
						) : (
							<Copy color="#8e8e93" size={18} />
						)}
					</TouchableOpacity>
				) : null}
				<MoreVertical color="#8e8e93" size={18} />
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	iosListItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#1c1c1e",
		paddingHorizontal: 14,
		paddingVertical: 11,
	},
	lightIosListItem: {
		backgroundColor: "#ffffff",
	},
	iosListItemFirst: {
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	iosListItemLast: {
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	iosListItemSeparator: {
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(84, 84, 88, 0.4)",
	},
	iosListItemContent: {
		flex: 1,
		marginLeft: 14,
		justifyContent: "center",
	},
	iosItemTitleText: {
		color: "#ffffff",
		fontSize: 17,
		fontWeight: "600",
		letterSpacing: -0.2,
	},
	lightText: {
		color: "#000000",
	},
	iosItemSubtitleText: {
		color: "#8e8e93",
		fontSize: 14,
		marginTop: 2,
	},
	iosQuickCopyBtn: {
		padding: 6,
	},
});
