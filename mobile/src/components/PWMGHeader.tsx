import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Sparkles, User, Lock, LayoutGrid, List } from "lucide-react-native";
import { ThemeColors } from "../config/theme";

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
	c,
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
		<View>
			{/* Top Bar Navigation */}
			<View
				className="flex-row items-center justify-between px-4 pt-2 pb-1.5"
				style={{ backgroundColor: c.bg }}
			>
				<TouchableOpacity
					onPress={onBack}
					className="flex-row items-center gap-1"
					hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
					activeOpacity={0.7}
				>
					<ArrowLeft color={c.text} size={22} />
					<Text className="text-[17px] font-medium" style={{ color: c.text }}>
						Hub
					</Text>
				</TouchableOpacity>

				<View className="flex-row items-center gap-2.5">
					{/* Grid / List toggle button shown on notes tab */}
					{activeBottomTab === "notes" && onToggleGridView && (
						<TouchableOpacity
							onPress={onToggleGridView}
							className="w-9 h-9 rounded-full justify-center items-center bg-slate-500/15"
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							{isGridView ? <List color={c.text} size={19} /> : <LayoutGrid color={c.text} size={19} />}
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={onOpenGenerator}
						className="w-9 h-9 rounded-full justify-center items-center bg-slate-500/15"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Sparkles color={c.text} size={19} />
					</TouchableOpacity>

					{onOpenProfile && (
						<TouchableOpacity
							onPress={onOpenProfile}
							className="w-9 h-9 rounded-full justify-center items-center bg-slate-500/15"
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<User color={c.text} size={20} />
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={onLock}
						className="w-9 h-9 rounded-full justify-center items-center bg-slate-500/15"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Lock color={c.textSecondary} size={19} />
					</TouchableOpacity>
				</View>
			</View>

			{/* Large Title & Sync Status Header */}
			<View className="px-4 py-2.5">
				<Text
					className="text-[34px] font-extrabold tracking-tight"
					style={{ color: c.text }}
				>
					{title}
				</Text>
				<TouchableOpacity
					className="flex-row items-center gap-1.5 mt-1"
					onPress={onOpenProfile}
					activeOpacity={0.7}
				>
					<View
						className="w-1.5 h-1.5 rounded-full"
						style={{
							backgroundColor:
								syncStatus === "syncing"
									? c.blue
									: syncStatus === "pending_offline"
										? c.orange
										: syncStatus === "synced"
											? c.green
											: userToken
												? c.green
												: c.textMuted,
						}}
					/>
					<Text className="text-[13px] font-medium" style={{ color: c.textSecondary }}>
						{subtitle}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
