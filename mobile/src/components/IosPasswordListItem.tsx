import React, { memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Star, Copy, Check } from "lucide-react-native";
import { Icon } from "./ui/icon";
import { PasswordItem } from "../core/vault-storage";
import { ItemAvatar } from "./ItemAvatar";
import { Text } from "./ui/text";

interface Props {
	item: PasswordItem;
	index: number;
	totalItems: number;
	subtitle: string;
	copied: boolean;
	theme?: "dark" | "light";
	fallbackIcon?: React.ReactNode;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onPress: () => void;
	onLongPress?: () => void;
	onCopyPassword?: (password: string) => void;
}

export const IosPasswordListItem = memo(function IosPasswordListItem({
	item,
	index,
	totalItems,
	subtitle,
	copied,
	theme = "dark",
	fallbackIcon,
	isSelectionMode = false,
	isSelected = false,
	onPress,
	onLongPress,
	onCopyPassword,
}: Props) {
	const isFirst = index === 0;
	const isLast = index === totalItems - 1;

	return (
		<TouchableOpacity
			className={`flex-row items-center px-4 py-3.5 ${
				isSelected
					? "bg-muted/80"
					: "bg-card"
			} ${isFirst ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""} ${
				!isLast ? "border-b border-border" : ""
			}`}
			activeOpacity={0.65}
			onPress={onPress}
			onLongPress={onLongPress}
			delayLongPress={300}
		>
			{/* Squircle App/Site Avatar */}
			<ItemAvatar item={item} size={40} fallbackIcon={fallbackIcon} />

			<View className="flex-1 ml-3.5 justify-center">
				<View className="flex-row items-center gap-1.5">
					<Text
						className="text-base font-semibold tracking-tight text-foreground"
						numberOfLines={1}
					>
						{item.title}
					</Text>
					{item.isFavorite && (
						<Icon as={Star} className="text-foreground fill-foreground" size={12} />
					)}
				</View>
				<Text
					className="text-xs text-muted-foreground mt-0.5"
					numberOfLines={1}
				>
					{subtitle}
				</Text>
			</View>

			{/* Selection Checkmark OR Quick Actions */}
			{isSelectionMode ? (
				<View
					className={`w-5 h-5 rounded-md items-center justify-center border mr-1 ${
						isSelected
							? "bg-primary border-primary"
							: "border-border bg-muted"
					}`}
				>
					{isSelected && <Icon as={Check} className="text-primary-foreground" size={12} strokeWidth={3} />}
				</View>
			) : item.password && onCopyPassword ? (
				<TouchableOpacity
					className="p-1.5"
					onPress={() => onCopyPassword(item.password!)}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
				>
					{copied ? (
						<Icon as={Check} className="text-foreground" size={16} />
					) : (
						<Icon as={Copy} className="text-muted-foreground" size={16} />
					)}
				</TouchableOpacity>
			) : null}
		</TouchableOpacity>
	);
});
