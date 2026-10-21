import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";

interface Props {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	theme?: "dark" | "light";
}

export function IosSearchBar({
	value,
	onChangeText,
	placeholder = "Search Passwords",
	theme = "dark",
}: Props) {
	const isLight = theme === "light";

	return (
		<View className="px-4 pb-2.5">
			<View
				className={`flex-row items-center rounded-xl px-2.5 h-[38px] ${
					isLight ? "bg-slate-200" : "bg-slate-900"
				}`}
			>
				<Search color="#8e8e93" size={17} style={{ marginRight: 6 }} />
				<TextInput
					className={`flex-1 text-[16px] py-0 ${
						isLight ? "text-slate-900" : "text-white"
					}`}
					placeholder={placeholder}
					placeholderTextColor="#8e8e93"
					value={value}
					onChangeText={onChangeText}
					clearButtonMode="while-editing"
				/>
				{value.length > 0 && (
					<TouchableOpacity
						onPress={() => onChangeText("")}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<X color="#8e8e93" size={16} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
