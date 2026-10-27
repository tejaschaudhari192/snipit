import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Cloud, CheckCircle2, AlertCircle, User, RefreshCw, Shield, ChevronRight, Download } from "lucide-react-native";
import { CONFIG } from "../config/configuration";
import { ThemeColors } from "../config/theme";
import { Card } from "./ui/card";
import { Text as UIText } from "./ui/text";

interface CloudSyncSectionProps {
	c: ThemeColors;
	isLight: boolean;
	userToken?: string;
	syncStatus: "synced" | "syncing" | "pending_offline" | "error";
	isSyncing: boolean;
	onOpenAuth?: () => void;
	onSyncNow: () => void;
}

export function CloudSyncCard({
	c,
	isLight,
	userToken,
	syncStatus,
	isSyncing,
	onOpenAuth,
	onSyncNow,
}: CloudSyncSectionProps) {
	return (
		<View className="mb-4">
			<Text className={`text-[11px] font-bold tracking-wider mb-2 ml-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
				CLOUD SYNCHRONIZATION
			</Text>
			<Card className="p-4">
				<View className="flex-row items-center">
					<View className="w-10 h-10 rounded-xl justify-center items-center bg-blue-500/15">
						<Cloud color="#3b82f6" size={20} />
					</View>
					<View className="flex-1 ml-3">
						<UIText className="text-[15px] font-semibold text-foreground">
							Cloud Sync Status
						</UIText>
						<UIText className="text-xs mt-0.5 text-muted-foreground">
							{userToken
								? syncStatus === "synced"
									? "Fully synchronized with Snipit cloud"
									: "Changes pending sync — will upload when online"
								: "Not connected to cloud — sign in to sync"}
						</UIText>
					</View>
					{syncStatus === "synced" && userToken ? (
						<CheckCircle2 color="#22c55e" size={20} />
					) : (
						<AlertCircle color="#eab308" size={20} />
					)}
				</View>

				{!userToken && onOpenAuth && (
					<TouchableOpacity
						className="flex-row items-center justify-center gap-2 bg-violet-600 rounded-xl py-2.5 mt-3.5"
						onPress={onOpenAuth}
					>
						<User color="#fff" size={16} />
						<Text className="text-white text-sm font-semibold">Sign In / Register to Sync</Text>
					</TouchableOpacity>
				)}

				{userToken && syncStatus !== "synced" && (
					<TouchableOpacity
						className="flex-row items-center justify-center gap-2 bg-blue-600 rounded-xl py-2.5 mt-3.5"
						onPress={onSyncNow}
						disabled={isSyncing}
					>
						{isSyncing ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<RefreshCw color="#fff" size={16} />
								<Text className="text-white text-sm font-semibold">Sync with Cloud Now</Text>
							</>
						)}
					</TouchableOpacity>
				)}
			</Card>
		</View>
	);
}

interface VaultSecurityCardProps {
	c: ThemeColors;
	isLight: boolean;
	onOpenPasswordManager: () => void;
}

export function VaultSecurityCard({ c, isLight, onOpenPasswordManager }: VaultSecurityCardProps) {
	return (
		<View className="mb-4">
			<Text className={`text-[11px] font-bold tracking-wider mb-2 ml-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
				VAULT & SECURITY
			</Text>
			<TouchableOpacity activeOpacity={0.8} onPress={onOpenPasswordManager}>
				<Card className="p-4">
					<View className="flex-row items-center">
						<View className="w-10 h-10 rounded-xl justify-center items-center bg-violet-500/15">
							<Shield color="#8b5cf6" size={20} />
						</View>
						<View className="flex-1 ml-3">
							<UIText className="text-[15px] font-semibold text-foreground">
								Snipit Password Vault
							</UIText>
							<UIText className="text-xs mt-0.5 text-muted-foreground">
								Zero-knowledge encrypted passwords and cards
							</UIText>
						</View>
						<ChevronRight color={isLight ? "#94a3b8" : "#64748b"} size={18} />
					</View>
				</Card>
			</TouchableOpacity>
		</View>
	);
}

interface AppVersionCardProps {
	c: ThemeColors;
	isLight: boolean;
	checkingUpdate: boolean;
	updateError?: string | null;
	onCheckUpdate: () => void;
}

export function AppVersionCard({ c, isLight, checkingUpdate, updateError, onCheckUpdate }: AppVersionCardProps) {
	return (
		<View className="mb-4">
			<Text className={`text-[11px] font-bold tracking-wider mb-2 ml-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
				APP & UPDATES
			</Text>
			<Card className={`p-4 ${updateError ? "border-red-500" : ""}`}>
				<View className="flex-row items-center">
					<View
						className={`w-10 h-10 rounded-xl justify-center items-center ${
							updateError ? "bg-red-500/15" : "bg-violet-500/15"
						}`}
					>
						<Download color={updateError ? "#ef4444" : "#a855f7"} size={20} />
					</View>
					<View className="flex-1 ml-3">
						<UIText className="text-[15px] font-semibold text-foreground">
							Version {CONFIG.APP_VERSION}
						</UIText>
						<UIText className={`text-xs mt-0.5 ${updateError ? "text-red-500" : "text-muted-foreground"}`}>
							{updateError ? updateError : "Check for latest release & APK update"}
						</UIText>
					</View>
					<TouchableOpacity
						className={`px-3.5 py-1.5 rounded-lg items-center justify-center ${
							updateError ? "bg-red-500" : "bg-violet-600"
						}`}
						onPress={onCheckUpdate}
						disabled={checkingUpdate}
					>
						{checkingUpdate ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text className="text-white text-[13px] font-semibold">
								{updateError ? "Retry" : "Check"}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</Card>
		</View>
	);
}
