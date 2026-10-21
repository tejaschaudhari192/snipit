import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Key, CreditCard, FileCode, StickyNote, User, Star, ChevronRight, Folder as FolderIcon, FolderPlus, Trash2, Layers } from "lucide-react-native";
import { Folder, PasswordItem } from "../core/vault-storage";
import { useThemeVars } from "../config/theme";

interface Props {
	folders: Folder[];
	items: PasswordItem[];
	theme?: "dark" | "light";
	onSelectFolder: (folderId: string | null) => void;
	onSelectType: (category: string) => void;
	onCreateFolder: () => void;
	onDeleteFolder: (folderId: string, folderName: string) => void;
}

export function IosFoldersView({
	folders,
	items,
	theme = "dark",
	onSelectFolder,
	onSelectType,
	onCreateFolder,
	onDeleteFolder,
}: Props) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";

	const typeItems = [
		{ id: "all", label: "All Items", icon: Layers, color: c.blue, count: items.length },
		{ id: "favorites", label: "Favorites", icon: Star, color: c.orange, count: items.filter((i) => i.isFavorite).length },
		{ id: "login", label: "Logins", icon: Key, color: c.blue, count: items.filter((i) => i.category === "login").length },
		{ id: "card", label: "Payment Cards", icon: CreditCard, color: c.purple, count: items.filter((i) => i.category === "card").length },
		{ id: "apikey", label: "API Keys", icon: FileCode, color: c.green, count: items.filter((i) => i.category === "apikey").length },
		{ id: "note", label: "Secure Notes", icon: StickyNote, color: c.cyan, count: items.filter((i) => i.category === "note").length },
		{ id: "identity", label: "Identities", icon: User, color: c.pink, count: items.filter((i) => i.category === "identity").length },
	];

	return (
		<ScrollView
			className="flex-1"
			contentContainerClassName="px-4 pt-1 pb-32"
			showsVerticalScrollIndicator={false}
		>
			<Text className={`text-[13px] font-semibold tracking-tight px-1 mb-[7px] mt-3.5 uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
				TYPES
			</Text>
			<View className={`rounded-xl overflow-hidden mb-3.5 ${isLight ? "bg-white" : "bg-slate-900"}`}>
				{typeItems.map((t, idx) => {
					const IconComponent = t.icon;
					return (
						<TouchableOpacity
							key={t.id}
							className={`flex-row items-center justify-between px-4 py-3.5 ${
								idx > 0 ? (isLight ? "border-t border-slate-100" : "border-t border-slate-800") : ""
							}`}
							onPress={() => onSelectType(t.id)}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center gap-3">
								<View
									style={{ backgroundColor: t.color }}
									className="w-[30px] h-[30px] rounded-lg items-center justify-center"
								>
									<IconComponent color="#ffffff" size={17} strokeWidth={2.2} />
								</View>
								<Text className={`text-[17px] font-semibold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
									{t.label}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text className={`text-[15px] font-normal ${isLight ? "text-slate-500" : "text-slate-400"}`}>
									{t.count}
								</Text>
								<ChevronRight color={c.textSecondary} size={16} />
							</View>
						</TouchableOpacity>
					);
				})}
			</View>

			<View className="flex-row justify-between items-center mt-5 mb-2 px-1">
				<Text className={`text-[13px] font-semibold tracking-tight uppercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
					FOLDERS
				</Text>
				<TouchableOpacity
					className="flex-row items-center gap-1"
					onPress={onCreateFolder}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<FolderPlus color={c.blue} size={16} />
					<Text className="text-blue-500 text-sm font-semibold">New Folder</Text>
				</TouchableOpacity>
			</View>

			<View className={`rounded-xl overflow-hidden mb-3.5 ${isLight ? "bg-white" : "bg-slate-900"}`}>
				{folders.map((f, idx) => {
					const count = items.filter((i) => i.folderId === f.id).length;
					return (
						<TouchableOpacity
							key={f.id}
							className={`flex-row items-center justify-between px-4 py-3.5 ${
								idx > 0 ? (isLight ? "border-t border-slate-100" : "border-t border-slate-800") : ""
							}`}
							onPress={() => onSelectFolder(f.id)}
							onLongPress={() => onDeleteFolder(f.id, f.name)}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center gap-3">
								<View
									style={{ backgroundColor: f.color || c.indigo }}
									className="w-[30px] h-[30px] rounded-lg items-center justify-center"
								>
									<FolderIcon color="#ffffff" size={16} strokeWidth={2} />
								</View>
								<Text className={`text-[17px] font-semibold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
									{f.name}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text className={`text-[15px] font-normal ${isLight ? "text-slate-500" : "text-slate-400"}`}>
									{count}
								</Text>
								<TouchableOpacity
									onPress={() => onDeleteFolder(f.id, f.name)}
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<Trash2 color={c.red} size={16} />
								</TouchableOpacity>
								<ChevronRight color={c.textSecondary} size={16} />
							</View>
						</TouchableOpacity>
					);
				})}

				{folders.length === 0 && (
					<TouchableOpacity
						className="flex-row items-center justify-between px-4 py-3.5"
						onPress={onCreateFolder}
						activeOpacity={0.7}
					>
						<View className="flex-row items-center gap-3">
							<View className="w-[30px] h-[30px] rounded-lg items-center justify-center bg-blue-500/15">
								<FolderPlus color={c.blue} size={17} />
							</View>
							<Text className="text-[17px] font-semibold tracking-tight text-blue-500">Create Your First Folder</Text>
						</View>
						<ChevronRight color={c.textSecondary} size={16} />
					</TouchableOpacity>
				)}
			</View>
		</ScrollView>
	);
}
