import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Star, Folder as FolderIcon, Check } from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface NoteGridCardProps {
	item: PasswordItem;
	folders?: Folder[];
	c?: any;
	isLight?: boolean;
	isSelectionMode?: boolean;
	isSelected?: boolean;
	onPress: () => void;
	onLongPress?: () => void;
}

export function NoteGridCard({
	item,
	folders = [],
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
				activeOpacity={0.75}
				onPress={onPress}
				onLongPress={onLongPress}
				delayLongPress={300}
				className="flex-1"
			>
				<Card
					className={cn(
						"flex-1 p-4 py-4 min-h-[145px] justify-between border shadow-sm",
						isSelected
							? "border-foreground bg-accent/40"
							: "border-border bg-card"
					)}
				>
					{/* Top: Title & Selection Circle or Favorite Star */}
					<View>
						<View className="flex-row items-start justify-between gap-1 mb-1.5">
							<Text
								className="text-[16px] font-bold leading-5 flex-1 tracking-tight text-foreground"
								numberOfLines={2}
							>
								{item.title || "Untitled Note"}
							</Text>
							{isSelectionMode ? (
								<View
									className={cn(
										"w-5 h-5 rounded-full items-center justify-center border",
										isSelected
											? "bg-foreground border-foreground"
											: "border-border bg-muted/50"
									)}
								>
									{isSelected && <Check className="text-background" size={12} strokeWidth={3} />}
								</View>
							) : item.isFavorite ? (
								<View className="pt-0.5">
									<Star className="text-foreground fill-foreground" size={13} />
								</View>
							) : null}
						</View>

						{/* Note Body Snippet */}
						<Text
							className="text-[13px] leading-[18px] text-muted-foreground"
							numberOfLines={4}
						>
							{content || "No text"}
						</Text>
					</View>

					{/* Bottom: Date & Folder Pill */}
					<View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-border">
						<Text className="text-[11px] font-medium tracking-tight text-muted-foreground">
							{dateStr}
						</Text>

						{assignedFolder ? (
							<View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-muted/40">
								<View
									className="w-1.5 h-1.5 rounded-full bg-foreground"
								/>
								<Text
									className="text-[10px] font-semibold max-w-[65px] text-foreground"
									numberOfLines={1}
								>
									{assignedFolder.name}
								</Text>
							</View>
						) : (
							<View className="flex-row items-center gap-1 opacity-70">
								<FolderIcon className="text-muted-foreground" size={11} />
								<Text className="text-[10px] text-muted-foreground">
									Notes
								</Text>
							</View>
						)}
					</View>
				</Card>
			</TouchableOpacity>
		</View>
	);
}
