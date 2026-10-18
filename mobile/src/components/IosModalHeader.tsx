import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, X } from "lucide-react-native";

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
		<View style={[styles.iosDetailNavHeader, isLight && styles.lightIosDetailNavHeader]}>
			<TouchableOpacity
				onPress={onClose}
				hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
			>
				<Text style={styles.iosDetailNavCancelText}>{closeLabel}</Text>
			</TouchableOpacity>

			<Text style={[styles.iosDetailNavTitle, isLight && styles.lightText]} numberOfLines={1}>
				{title}
			</Text>

			<TouchableOpacity
				onPress={onSave}
				hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
			>
				<Text style={styles.iosDetailNavDoneText}>{saveLabel}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	iosDetailNavHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(84, 84, 88, 0.35)",
	},
	lightIosDetailNavHeader: {
		borderBottomColor: "rgba(60, 60, 70, 0.18)",
	},
	iosDetailNavTitle: {
		color: "#ffffff",
		fontSize: 17,
		fontWeight: "600",
		textAlign: "center",
		flex: 1,
		marginHorizontal: 12,
	},
	lightText: {
		color: "#000000",
	},
	iosDetailNavCancelText: {
		color: "#0a84ff",
		fontSize: 17,
		fontWeight: "400",
	},
	iosDetailNavDoneText: {
		color: "#0a84ff",
		fontSize: 17,
		fontWeight: "700",
	},
});
