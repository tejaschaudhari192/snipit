import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
			className={`flex-row items-center px-3.5 py-3 ${
				isLight ? "bg-white" : "bg-slate-900"
			} ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""} ${
				!isLast ? isLight ? "border-b border-slate-100" : "border-b border-slate-800" : ""
			}`}
			activeOpacity={0.65}
			onPress={onPress}
		>
			{/* Squircle App/Site Avatar */}
			<ItemAvatar item={item} size={42} fallbackIcon={fallbackIcon} />

			<View className="flex-1 ml-3.5 justify-center">
				<View className="flex-row items-center gap-1.5">
					<Text
						className={`text-[17px] font-semibold tracking-tight ${
							isLight ? "text-slate-900" : "text-white"
						}`}
						numberOfLines={1}
					>
						{item.title}
					</Text>
					{item.isFavorite && (
						<Star color="#eab308" fill="#eab308" size={13} />
					)}
				</View>
				<Text
					className={`text-sm mt-0.5 ${
						isLight ? "text-slate-500" : "text-slate-400"
					}`}
					numberOfLines={1}
				>
					{subtitle}
				</Text>
			</View>

			{/* iOS 3-dots / Quick Context Action */}
			<View className="flex-row items-center gap-2">
				{item.password && onCopyPassword ? (
					<TouchableOpacity
						className="p-1.5"
						onPress={() => onCopyPassword(item.password!)}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					>
						{copied ? (
							<Check color="#22c55e" size={18} />
						) : (
							<Copy color={isLight ? "#94a3b8" : "#64748b"} size={18} />
						)}
					</TouchableOpacity>
				) : null}
				<MoreVertical color={isLight ? "#94a3b8" : "#64748b"} size={18} />
			</View>
		</TouchableOpacity>
	);
}
