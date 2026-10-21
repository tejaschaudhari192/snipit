import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Props {
	title?: string;
	onSave: () => void;
	onClose: () => void;
	saveLabel?: string;
	closeLabel?: string;
	theme?: "dark" | "light";
}

export function IosModalHeader({
	title,
	onSave,
	onClose,
	saveLabel = "Done",
	closeLabel = "Cancel",
	theme = "dark",
}: Props) {
	const isLight = theme === "light";

	return (
		<View
			className={`flex-row items-center justify-between px-4 py-3.5 border-b ${
				isLight ? "border-slate-200" : "border-slate-800"
			}`}
		>
			<TouchableOpacity
				onPress={onClose}
				hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
			>
				<Text className="text-[#0a84ff] text-[17px] font-normal">{closeLabel}</Text>
			</TouchableOpacity>

			<Text
				className={`text-[17px] font-semibold text-center flex-1 mx-3 ${
					isLight ? "text-slate-900" : "text-white"
				}`}
				numberOfLines={1}
			>
				{title}
			</Text>

			<TouchableOpacity
				onPress={onSave}
				hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
			>
				<Text className="text-[#0a84ff] text-[17px] font-bold">{saveLabel}</Text>
			</TouchableOpacity>
		</View>
	);
}
