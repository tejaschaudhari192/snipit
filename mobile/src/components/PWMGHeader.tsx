import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ArrowLeft, Sparkles, User, Lock, LayoutGrid, List } from "lucide-react-native";
import { ThemeColors } from "../config/theme";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface PWMGHeaderProps {
	c: ThemeColors;
	title: string;
	subtitle: string;
	userToken?: string;
	syncStatus?: "local" | "synced" | "pending_offline" | "syncing";
	activeBottomTab?: "passwords" | "folders" | "notes" | "settings";
	isGridView?: boolean;
	onToggleGridView?: () => void;
	onBack: () => void;
	onOpenProfile?: () => void;
	onOpenGenerator: () => void;
	onLock: () => void;
	onAdd?: () => void;
}

export function PWMGHeader({
	title,
	subtitle,
	userToken,
	syncStatus,
	activeBottomTab,
	isGridView,
	onToggleGridView,
	onBack,
	onOpenProfile,
	onOpenGenerator,
	onLock,
}: PWMGHeaderProps) {
	return (
		<View className="bg-background border-b border-border">
			{/* Top Bar Navigation */}
			<View className="flex-row items-center justify-between px-4 py-2">
				<Button
					variant="ghost"
					className="h-8 px-2 flex-row gap-1"
					onPress={onBack}
				>
					<ArrowLeft className="text-foreground" size={18} />
					<Text className="text-sm font-medium">Hub</Text>
				</Button>

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

			{/* Large Title & Sync Status Header */}
			<View className="px-4 pb-3 pt-1">
				<Text className="text-2xl font-bold tracking-tight text-foreground">
					{title}
				</Text>
				<TouchableOpacity
					className="flex-row items-center gap-1.5 mt-1"
					onPress={onOpenProfile}
					activeOpacity={0.7}
				>
					<View className="w-1.5 h-1.5 rounded-full bg-foreground" />
					<Text className="text-xs text-muted-foreground">
						{subtitle}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
