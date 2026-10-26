import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Key, Folder as FolderIcon, StickyNote, Settings as SettingsIcon } from "lucide-react-native";
import { Text } from "./ui/text";

export type BottomTabType = "passwords" | "folders" | "notes" | "settings";

interface Props {
	activeTab: BottomTabType;
	onTabChange: (tab: BottomTabType) => void;
	theme?: "dark" | "light";
}

export function IosBottomTabBar({ activeTab, onTabChange, theme = "dark" }: Props) {
	const isLight = theme === "light";

	const activeColor = isLight ? "#09090b" : "#f4f4f5";
	const inactiveColor = isLight ? "#71717a" : "#71717a";

	return (
		<View
			className={`absolute bottom-0 left-0 right-0 flex-row justify-around items-center border-t border-border bg-background/95 z-20 pt-2 ${
				Platform.OS === "ios" ? "h-[84px] pb-5" : "h-[88px] pb-5"
			}`}
		>
			<TouchableOpacity
				className="items-center justify-center gap-0.5 flex-1"
				onPress={() => onTabChange("passwords")}
				activeOpacity={0.7}
			>
				<Key
					color={activeTab === "passwords" ? activeColor : inactiveColor}
					size={20}
					strokeWidth={activeTab === "passwords" ? 2.2 : 1.8}
				/>
				<Text
					className={`text-[11px] font-medium ${
						activeTab === "passwords"
							? "text-foreground"
							: "text-muted-foreground"
					}`}
				>
					Passwords
				</Text>
			</TouchableOpacity>

			{/* 2nd Tab: Notes */}
			<TouchableOpacity
				className="items-center justify-center gap-0.5 flex-1"
				onPress={() => onTabChange("notes")}
				activeOpacity={0.7}
			>
				<StickyNote
					color={activeTab === "notes" ? activeColor : inactiveColor}
					size={20}
					strokeWidth={activeTab === "notes" ? 2.2 : 1.8}
				/>
				<Text
					className={`text-[11px] font-medium ${
						activeTab === "notes"
							? "text-foreground"
							: "text-muted-foreground"
					}`}
				>
					Notes
				</Text>
			</TouchableOpacity>

			{/* 3rd Tab: Folders */}
			<TouchableOpacity
				className="items-center justify-center gap-0.5 flex-1"
				onPress={() => onTabChange("folders")}
				activeOpacity={0.7}
			>
				<FolderIcon
					color={activeTab === "folders" ? activeColor : inactiveColor}
					size={20}
					strokeWidth={activeTab === "folders" ? 2.2 : 1.8}
				/>
				<Text
					className={`text-[11px] font-medium ${
						activeTab === "folders"
							? "text-foreground"
							: "text-muted-foreground"
					}`}
				>
					Folders
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				className="items-center justify-center gap-0.5 flex-1"
				onPress={() => onTabChange("settings")}
				activeOpacity={0.7}
			>
				<SettingsIcon
					color={activeTab === "settings" ? activeColor : inactiveColor}
					size={20}
					strokeWidth={activeTab === "settings" ? 2.2 : 1.8}
				/>
				<Text
					className={`text-[11px] font-medium ${
						activeTab === "settings"
							? "text-foreground"
							: "text-muted-foreground"
					}`}
				>
					Settings
				</Text>
			</TouchableOpacity>
		</View>
	);
}
