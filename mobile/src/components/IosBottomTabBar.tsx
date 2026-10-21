import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
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
		<View
			className={`absolute bottom-0 left-0 right-0 flex-row justify-around items-center border-t z-20 pt-2 ${
				Platform.OS === "ios" ? "h-[84px] pb-5" : "h-[88px] pb-5"
			} ${
				isLight
					? "bg-white/95 border-slate-200"
					: "bg-slate-950/95 border-slate-800"
			}`}
		>
			<TouchableOpacity
				className="items-center justify-center gap-0.5 flex-1"
				onPress={() => onTabChange("passwords")}
				activeOpacity={0.7}
			>
				<Key
					color={activeTab === "passwords" ? activeColor : inactiveColor}
					size={22}
					strokeWidth={activeTab === "passwords" ? 2.4 : 1.8}
				/>
				<Text
					className={`text-[10px] font-semibold ${
						activeTab === "passwords"
							? isLight ? "text-slate-900" : "text-white"
							: "text-slate-500"
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
					size={22}
					strokeWidth={activeTab === "notes" ? 2.4 : 1.8}
				/>
				<Text
					className={`text-[10px] font-semibold ${
						activeTab === "notes"
							? isLight ? "text-slate-900" : "text-white"
							: "text-slate-500"
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
					size={22}
					strokeWidth={activeTab === "folders" ? 2.4 : 1.8}
				/>
				<Text
					className={`text-[10px] font-semibold ${
						activeTab === "folders"
							? isLight ? "text-slate-900" : "text-white"
							: "text-slate-500"
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
					size={22}
					strokeWidth={activeTab === "settings" ? 2.4 : 1.8}
				/>
				<Text
					className={`text-[10px] font-semibold ${
						activeTab === "settings"
							? isLight ? "text-slate-900" : "text-white"
							: "text-slate-500"
					}`}
				>
					Settings
				</Text>
			</TouchableOpacity>
		</View>
	);
}
