import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Star, Folder as FolderIcon } from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { ThemeColors } from "../config/theme";

interface NoteGridCardProps {
	item: PasswordItem;
	folders?: Folder[];
	c: ThemeColors;
	isLight: boolean;
	onPress: () => void;
}

export function NoteGridCard({ item, folders = [], c, isLight, onPress }: NoteGridCardProps) {
	const content = item.notes?.trim() || "";
	const dateStr = item.updatedAt
		? new Date(item.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })
		: "";

	const assignedFolder = item.folderId ? folders.find((f) => f.id === item.folderId) : null;

	return (
		<View className="flex-1 max-w-[50%] p-1.5" style={{ boxSizing: "border-box" as any }}>
			<TouchableOpacity
				className={`flex-1 rounded-2xl p-3.5 min-h-[140px] justify-between border shadow-sm ${
					isLight
						? "bg-white border-slate-200"
						: "bg-slate-900 border-slate-800"
				}`}
				activeOpacity={0.7}
				onPress={onPress}
			>
				{/* Header: Title & Star */}
				<View className="flex-row items-center justify-between mb-1.5">
					<Text
						className={`text-[16px] font-bold flex-1 mr-1.5 ${
							isLight ? "text-slate-900" : "text-white"
						}`}
						numberOfLines={1}
					>
						{item.title || "Untitled Note"}
					</Text>
					{item.isFavorite && <Star color="#eab308" fill="#eab308" size={12} />}
				</View>

				{/* Date & Note Preview */}
				<Text
					className={`text-[13px] leading-4 flex-1 ${
						isLight ? "text-slate-500" : "text-slate-400"
					}`}
					numberOfLines={5}
				>
					{dateStr ? (
						<Text className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
							{dateStr}{" "}
						</Text>
					) : null}
					{content || "No additional text"}
				</Text>

				{/* Bottom Folder Badge / Indicator */}
				<View
					className={`flex-row items-center mt-2 pt-2 border-t ${
						isLight ? "border-slate-100" : "border-slate-800"
					}`}
				>
					{assignedFolder ? (
						<View className="flex-row items-center gap-1.5">
							<View
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: assignedFolder.color || "#3b82f6" }}
							/>
							<Text
								className={`text-[11px] font-medium ${
									isLight ? "text-slate-500" : "text-slate-400"
								}`}
								numberOfLines={1}
							>
								{assignedFolder.name}
							</Text>
						</View>
					) : (
						<View className="flex-row items-center gap-1">
							<FolderIcon color={isLight ? "#94a3b8" : "#64748b"} size={12} />
							<Text
								className={`text-[11px] ${
									isLight ? "text-slate-400" : "text-slate-500"
								}`}
							>
								Notes
							</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
		</View>
	);
}
