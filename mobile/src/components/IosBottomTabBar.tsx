import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Key, Folder as FolderIcon, StickyNote, Settings as SettingsIcon } from "lucide-react-native";

export type BottomTabType = "passwords" | "folders" | "notes" | "settings";

interface Props {
	activeTab: BottomTabType;
	onTabChange: (tab: BottomTabType) => void;
	theme?: "dark" | "light";
}

export function IosBottomTabBar({ activeTab, onTabChange, theme = "dark" }: Props) {
	const isLight = theme === "light";

	const activeColor = isLight ? "#000000" : "#ffffff";
	const inactiveColor = isLight ? "#8e8e93" : "#636366";

	return (
		<View style={[styles.iosBottomTabBar, isLight && styles.lightIosBottomTabBar]}>
			<TouchableOpacity
				style={styles.iosTabButton}
				onPress={() => onTabChange("passwords")}
				activeOpacity={0.7}
			>
				<Key
					color={activeTab === "passwords" ? activeColor : inactiveColor}
					size={22}
					strokeWidth={activeTab === "passwords" ? 2.4 : 1.8}
				/>
				<Text style={[styles.iosTabLabel, { color: activeTab === "passwords" ? activeColor : inactiveColor }]}>
					Passwords
				</Text>
			</TouchableOpacity>

			{/* 2nd Tab: Notes */}
			<TouchableOpacity
				style={styles.iosTabButton}
				onPress={() => onTabChange("notes")}
				activeOpacity={0.7}
			>
				<StickyNote
					color={activeTab === "notes" ? activeColor : inactiveColor}
					size={22}
					strokeWidth={activeTab === "notes" ? 2.4 : 1.8}
				/>
				<Text style={[styles.iosTabLabel, { color: activeTab === "notes" ? activeColor : inactiveColor }]}>
					Notes
				</Text>
			</TouchableOpacity>

			{/* 3rd Tab: Folders */}
			<TouchableOpacity
				style={styles.iosTabButton}
				onPress={() => onTabChange("folders")}
				activeOpacity={0.7}
			>
				<FolderIcon
					color={activeTab === "folders" ? activeColor : inactiveColor}
					size={22}
					strokeWidth={activeTab === "folders" ? 2.4 : 1.8}
				/>
				<Text style={[styles.iosTabLabel, { color: activeTab === "folders" ? activeColor : inactiveColor }]}>
					Folders
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.iosTabButton}
				onPress={() => onTabChange("settings")}
				activeOpacity={0.7}
			>
				<SettingsIcon
					color={activeTab === "settings" ? activeColor : inactiveColor}
					size={22}
					strokeWidth={activeTab === "settings" ? 2.4 : 1.8}
				/>
				<Text style={[styles.iosTabLabel, { color: activeTab === "settings" ? activeColor : inactiveColor }]}>
					Settings
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	iosBottomTabBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 80,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "rgba(18, 18, 20, 0.94)",
		borderTopWidth: 0.5,
		borderTopColor: "rgba(84, 84, 88, 0.4)",
		paddingBottom: Platform.OS === "ios" ? 18 : 8,
		paddingTop: 8,
		zIndex: 20,
	},
	lightIosBottomTabBar: {
		backgroundColor: "rgba(249, 249, 249, 0.94)",
		borderTopColor: "rgba(60, 60, 67, 0.2)",
	},
	iosTabButton: {
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		flex: 1,
	},
	iosTabLabel: {
		color: "#8e8e93",
		fontSize: 10,
		fontWeight: "600",
	},
	iosTabLabelActive: {},
});
