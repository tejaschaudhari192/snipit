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
}: Props) {
	return (
		<View className="px-4 pb-2.5">
			<View className="flex-row items-center rounded-md px-3 h-9 bg-muted/60 border border-border">
				<Search className="text-muted-foreground mr-2" size={16} />
				<TextInput
					className="flex-1 text-sm py-0 text-foreground"
					placeholder={placeholder}
					placeholderTextColor="#71717a"
					value={value}
					onChangeText={onChangeText}
				/>
				{value.length > 0 && (
					<TouchableOpacity
						onPress={() => onChangeText("")}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<X className="text-muted-foreground" size={16} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
