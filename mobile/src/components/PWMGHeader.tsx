import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Sparkles, User, Lock, LayoutGrid, List } from "lucide-react-native";
import { ThemeColors } from "../config/theme";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface PWMGHeaderProps {
	c?: ThemeColors;
	title?: string;
	subtitle?: string;
	activeBottomTab?: "passwords" | "folders" | "notes" | "settings";
	activeFilter?: "all" | "favorites" | "login" | "card" | "apikey" | "note" | "identity";
	folders?: { id: string; name: string }[];
	selectedFolderId?: string | null;
	totalFilteredCount?: number;
	syncStatus?: "local" | "synced" | "pending_offline" | "syncing";
	isGridView?: boolean;
	onToggleGridView?: () => void;
	onOpenProfile?: () => void;
	onOpenGenerator: () => void;
	onLock: () => void;
	onAdd?: () => void;
}

export function PWMGHeader({
	title,
	subtitle,
	syncStatus,
	activeBottomTab = "passwords",
	activeFilter = "all",
	folders = [],
	selectedFolderId,
	totalFilteredCount = 0,
	isGridView,
	onToggleGridView,
	onOpenProfile,
	onOpenGenerator,
	onLock,
}: PWMGHeaderProps) {
	// Automatically compute title if not explicitly provided
	const displayTitle =
		title ??
		(activeBottomTab === "folders"
			? "Folders"
			: activeBottomTab === "settings"
				? "Vault Settings"
				: selectedFolderId
					? folders.find((f) => f.id === selectedFolderId)?.name || "Folder"
					: activeFilter === "favorites"
						? "Favorites"
						: activeFilter === "all"
							? "Passwords"
							: activeFilter === "card"
								? "Cards"
								: activeFilter === "apikey"
									? "API Keys"
									: activeFilter === "note"
										? "Notes"
										: "Identities");

	// Automatically compute subtitle if not explicitly provided
	const syncStatusText =
		syncStatus === "syncing"
			? "Syncing with cloud..."
			: syncStatus === "pending_offline"
				? "Changes saved locally • Pending sync"
				: syncStatus === "synced"
					? "Synced with Snipit Cloud"
					: "Stored locally & encrypted";

	const displaySubtitle =
		subtitle ??
		(activeBottomTab === "folders"
			? `${folders.length} folders organized`
			: activeBottomTab === "settings"
				? "Data, maintenance & security"
				: `${syncStatusText} • ${totalFilteredCount} items`);
	return (
		<View className="bg-background border-b border-border">
			<View className="flex-row items-center justify-between px-4 py-3">
				{/* Top-Left: Title & Subtitle */}
				<View className="flex-1 pr-3">
					<Text className="text-xl font-bold tracking-tight text-foreground" numberOfLines={1}>
						{displayTitle}
					</Text>
					<TouchableOpacity
						className="flex-row items-center gap-1.5 mt-0.5"
						onPress={onOpenProfile}
						activeOpacity={0.7}
					>
						<View className="w-1.5 h-1.5 rounded-full bg-foreground" />
						<Text className="text-xs text-muted-foreground" numberOfLines={1}>
							{displaySubtitle}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Top-Right Actions */}
				<View className="flex-row items-center gap-1.5">
					{/* Grid / List toggle on notes tab */}
					{activeBottomTab === "notes" && onToggleGridView && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onPress={onToggleGridView}
						>
							{isGridView ? (
								<List className="text-foreground" size={16} />
							) : (
								<LayoutGrid className="text-foreground" size={16} />
							)}
						</Button>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onPress={onOpenGenerator}
					>
						<Sparkles className="text-foreground" size={16} />
					</Button>

					{onOpenProfile && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onPress={onOpenProfile}
						>
							<User className="text-foreground" size={16} />
						</Button>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onPress={onLock}
					>
						<Lock className="text-muted-foreground" size={16} />
					</Button>
				</View>
			</View>
		</View>
	);
}
