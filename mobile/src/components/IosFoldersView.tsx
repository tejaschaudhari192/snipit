import React from "react";
import { View, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Key, CreditCard, FileCode, StickyNote, User, Star, ChevronRight, Folder as FolderIcon, FolderPlus, Trash2, Layers } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Folder, PasswordItem } from "../core/vault-storage";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface Props {
	folders: Folder[];
	items: PasswordItem[];
	theme?: "dark" | "light";
	isRefreshing?: boolean;
	onRefresh?: () => void;
	onSelectFolder: (folderId: string | null) => void;
	onSelectType: (category: string) => void;
	onCreateFolder: () => void;
	onDeleteFolder: (folderId: string, folderName: string) => void;
}

export function IosFoldersView({
	folders,
	items,
	isRefreshing = false,
	onRefresh,
	onSelectFolder,
	onSelectType,
	onCreateFolder,
	onDeleteFolder,
}: Props) {
	const typeItems = [
		{ id: "all", label: "All Items", icon: Layers, count: items.length },
		{ id: "favorites", label: "Favorites", icon: Star, count: items.filter((i) => i.isFavorite).length },
		{ id: "login", label: "Logins", icon: Key, count: items.filter((i) => i.category === "login").length },
		{ id: "card", label: "Payment Cards", icon: CreditCard, count: items.filter((i) => i.category === "card").length },
		{ id: "apikey", label: "API Keys", icon: FileCode, count: items.filter((i) => i.category === "apikey").length },
		{ id: "note", label: "Secure Notes", icon: StickyNote, count: items.filter((i) => i.category === "note").length },
		{ id: "identity", label: "Identities", icon: User, count: items.filter((i) => i.category === "identity").length },
	];

	return (
		<ScrollView
			className="flex-1"
			contentContainerClassName="px-4 pt-1 pb-32"
			showsVerticalScrollIndicator={false}
			refreshControl={
				onRefresh ? (
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={onRefresh}
					/>
				) : undefined
			}
		>
			<Text className="text-[12px] font-semibold tracking-wider px-1 mb-2 mt-3.5 uppercase text-muted-foreground">
				Types
			</Text>
			<Card className="p-0 py-0 overflow-hidden mb-4 border-border bg-card">
				{typeItems.map((t, idx) => {
					const IconComponent = t.icon;
					return (
						<TouchableOpacity
							key={t.id}
							className={cn(
								"flex-row items-center justify-between px-4 py-3.5",
								idx > 0 && "border-t border-border"
							)}
							onPress={() => onSelectType(t.id)}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center gap-3">
								<View className="w-[32px] h-[32px] rounded-lg items-center justify-center bg-muted/60 border border-border">
									<Icon as={IconComponent} className="text-foreground" size={16} strokeWidth={2} />
								</View>
								<Text className="text-[16px] font-medium tracking-tight text-foreground">
									{t.label}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text className="text-[14px] text-muted-foreground">
									{t.count}
								</Text>
								<Icon as={ChevronRight} className="text-muted-foreground" size={16} />
							</View>
						</TouchableOpacity>
					);
				})}
			</Card>

			<View className="flex-row justify-between items-center mt-4 mb-2 px-1">
				<Text className="text-[12px] font-semibold tracking-wider uppercase text-muted-foreground">
					Folders
				</Text>
				<TouchableOpacity
					className="flex-row items-center gap-1.5"
					onPress={onCreateFolder}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Icon as={FolderPlus} className="text-foreground" size={15} />
					<Text className="text-xs font-semibold text-foreground">New Folder</Text>
				</TouchableOpacity>
			</View>

			<Card className="p-0 py-0 overflow-hidden mb-4 border-border bg-card">
				{folders.map((f, idx) => {
					const count = items.filter((i) => i.folderId === f.id).length;
					return (
						<TouchableOpacity
							key={f.id}
							className={cn(
								"flex-row items-center justify-between px-4 py-3.5",
								idx > 0 && "border-t border-border"
							)}
							onPress={() => onSelectFolder(f.id)}
							onLongPress={() => onDeleteFolder(f.id, f.name)}
							activeOpacity={0.7}
						>
							<View className="flex-row items-center gap-3">
								<View className="w-[32px] h-[32px] rounded-lg items-center justify-center bg-muted/60 border border-border">
									<Icon as={FolderIcon} className="text-foreground" size={16} strokeWidth={2} />
								</View>
								<Text className="text-[16px] font-medium tracking-tight text-foreground">
									{f.name}
								</Text>
							</View>
							<View className="flex-row items-center gap-3">
								<Text className="text-[14px] text-muted-foreground">
									{count}
								</Text>
								<TouchableOpacity
									onPress={() => onDeleteFolder(f.id, f.name)}
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<Icon as={Trash2} className="text-muted-foreground" size={15} />
								</TouchableOpacity>
								<Icon as={ChevronRight} className="text-muted-foreground" size={16} />
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
							<View className="w-[32px] h-[32px] rounded-lg items-center justify-center bg-muted/60 border border-border">
								<Icon as={FolderPlus} className="text-foreground" size={16} />
							</View>
							<Text className="text-[15px] font-medium text-foreground">Create Your First Folder</Text>
						</View>
						<Icon as={ChevronRight} className="text-muted-foreground" size={16} />
					</TouchableOpacity>
				)}
			</Card>
		</ScrollView>
	);
}
