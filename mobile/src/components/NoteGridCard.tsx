import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Star, Folder as FolderIcon, Check } from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { ThemeColors } from "../config/theme";

interface NoteGridCardProps {
	item: PasswordItem;
	folders?: Folder[];
	c: ThemeColors;
	isLight: boolean;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onPress: () => void;
	onLongPress?: () => void;
}

export function NoteGridCard({
	item,
	folders = [],
	c,
	isLight,
	isSelectionMode = false,
	isSelected = false,
	onPress,
	onLongPress,
}: NoteGridCardProps) {
	const content = item.notes?.trim() || "";

	// Format friendly mobile timestamps (like Samsung / Apple Notes)
	const getDisplayDate = () => {
		if (!item.updatedAt) return "";
		const date = new Date(item.updatedAt);
		const now = new Date();
		const isToday =
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear();

		if (isToday) {
			return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
		}

		const yesterday = new Date();
		yesterday.setDate(now.getDate() - 1);
		const isYesterday =
			date.getDate() === yesterday.getDate() &&
			date.getMonth() === yesterday.getMonth() &&
			date.getFullYear() === yesterday.getFullYear();

		if (isYesterday) {
			return "Yesterday";
		}

		return date.toLocaleDateString([], { month: "short", day: "numeric" });
	};

	const dateStr = getDisplayDate();
	const assignedFolder = item.folderId ? folders.find((f) => f.id === item.folderId) : null;

	return (
		<View className="flex-1 max-w-[50%] p-1.5" style={{ boxSizing: "border-box" as any }}>
			<TouchableOpacity
				className={`flex-1 rounded-2xl p-4 min-h-[145px] justify-between border shadow-sm ${
					isSelected
						? isLight
							? "bg-amber-50/60 border-amber-400 shadow-amber-100"
							: "bg-amber-950/20 border-amber-500 shadow-black"
						: isLight
							? "bg-white border-slate-200/90 shadow-slate-100"
							: "bg-slate-900/95 border-slate-800 shadow-black"
				}`}
				activeOpacity={0.75}
				onPress={onPress}
				onLongPress={onLongPress}
				delayLongPress={300}
			>
				{/* Top: Title & Selection Circle or Favorite Star */}
				<View>
					<View className="flex-row items-start justify-between gap-1 mb-1.5">
						<Text
							className={`text-[16px] font-bold leading-5 flex-1 tracking-tight ${
								isLight ? "text-slate-900" : "text-white"
							}`}
							numberOfLines={2}
						>
							{item.title || "Untitled Note"}
						</Text>
						{isSelectionMode ? (
							<View
								className={`w-5 h-5 rounded-full items-center justify-center border ${
									isSelected
										? "bg-amber-500 border-amber-500"
										: isLight
											? "border-slate-300 bg-slate-50"
											: "border-slate-600 bg-slate-800"
								}`}
							>
								{isSelected && <Check color="#ffffff" size={12} strokeWidth={3} />}
							</View>
						) : item.isFavorite ? (
							<View className="pt-0.5">
								<Star color="#eab308" fill="#eab308" size={13} />
							</View>
						) : null}
					</View>

					{/* Note Body Snippet */}
					<Text
						className={`text-[13px] leading-[18px] ${
							isLight ? "text-slate-600" : "text-slate-400"
						}`}
						numberOfLines={4}
					>
						{content || "No text"}
					</Text>
				</View>

				{/* Bottom: Date & Folder Pill */}
				<View
					className={`flex-row items-center justify-between mt-3 pt-2.5 border-t ${
						isLight ? "border-slate-100" : "border-slate-800/80"
					}`}
				>
					<Text
						className={`text-[11px] font-medium tracking-tight ${
							isLight ? "text-slate-400" : "text-slate-500"
						}`}
					>
						{dateStr}
					</Text>

					{assignedFolder ? (
						<View
							className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full border ${
								isLight
									? "bg-slate-50 border-slate-200"
									: "bg-slate-800/80 border-slate-700/80"
							}`}
						>
							<View
								className="w-1.5 h-1.5 rounded-full"
								style={{ backgroundColor: assignedFolder.color || "#3b82f6" }}
							/>
							<Text
								className={`text-[10px] font-semibold max-w-[65px] ${
									isLight ? "text-slate-600" : "text-slate-300"
								}`}
								numberOfLines={1}
							>
								{assignedFolder.name}
							</Text>
						</View>
					) : (
						<View className="flex-row items-center gap-1 opacity-60">
							<FolderIcon color={isLight ? "#94a3b8" : "#64748b"} size={11} />
							<Text
								className={`text-[10px] ${
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
