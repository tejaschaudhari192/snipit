import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
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
		<View style={styles.iosSearchWrapper}>
			<View style={[styles.iosSearchBox, isLight && styles.lightIosSearchBox]}>
				<Search color="#8e8e93" size={17} style={styles.iosSearchIcon} />
				<TextInput
					style={[styles.iosSearchTextInput, isLight && styles.lightIosSearchTextInput]}
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

const styles = StyleSheet.create({
	iosSearchWrapper: {
		paddingHorizontal: 16,
		paddingBottom: 10,
	},
	iosSearchBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#1c1c1e",
		borderRadius: 11,
		paddingHorizontal: 10,
		height: 38,
	},
	lightIosSearchBox: {
		backgroundColor: "#e5e5ea",
	},
	iosSearchIcon: {
		marginRight: 6,
	},
	iosSearchTextInput: {
		flex: 1,
		color: "#ffffff",
		fontSize: 16,
		paddingVertical: 0,
	},
	lightIosSearchTextInput: {
		color: "#000000",
	},
});
