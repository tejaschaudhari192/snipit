import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Cloud, CheckCircle2, AlertCircle, User, RefreshCw, Shield, ChevronRight, Download } from "lucide-react-native";
import { CONFIG } from "../config/configuration";
import { ThemeColors } from "../config/theme";

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
		<View style={styles.section}>
			<Text style={[styles.sectionHeader, { color: c.textSecondary }]}>CLOUD SYNCHRONIZATION</Text>
			<View style={[styles.actionCard, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
				<View style={styles.actionRow}>
					<View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
						<Cloud color="#3b82f6" size={20} />
					</View>
					<View style={{ flex: 1, marginLeft: 12 }}>
						<Text style={[styles.actionTitle, { color: c.text }]}>Cloud Sync Status</Text>
						<Text style={[styles.actionSubtitle, { color: c.textSecondary }]}>
							{userToken
								? syncStatus === "synced"
									? "Fully synchronized with Snipit cloud"
									: "Changes pending sync — will upload when online"
								: "Not connected to cloud — sign in to sync"}
						</Text>
					</View>
					{syncStatus === "synced" && userToken ? (
						<CheckCircle2 color="#22c55e" size={20} />
					) : (
						<AlertCircle color="#eab308" size={20} />
					)}
				</View>

				{!userToken && onOpenAuth && (
					<TouchableOpacity style={[styles.syncBtn, { backgroundColor: c.purple }]} onPress={onOpenAuth}>
						<User color="#fff" size={16} />
						<Text style={styles.syncBtnText}>Sign In / Register to Sync</Text>
					</TouchableOpacity>
				)}

				{userToken && syncStatus !== "synced" && (
					<TouchableOpacity style={styles.syncBtn} onPress={onSyncNow} disabled={isSyncing}>
						{isSyncing ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<RefreshCw color="#fff" size={16} />
								<Text style={styles.syncBtnText}>Sync with Cloud Now</Text>
							</>
						)}
					</TouchableOpacity>
				)}
			</View>
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
		<View style={styles.section}>
			<Text style={[styles.sectionHeader, { color: c.textSecondary }]}>VAULT & SECURITY</Text>
			<TouchableOpacity
				style={[styles.actionCard, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: isLight ? "#e2e8f0" : "#1e293b" }]}
				onPress={onOpenPasswordManager}
			>
				<View style={styles.actionRow}>
					<View style={[styles.iconBox, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
						<Shield color="#8b5cf6" size={20} />
					</View>
					<View style={{ flex: 1, marginLeft: 12 }}>
						<Text style={[styles.actionTitle, { color: c.text }]}>Snipit Password Vault</Text>
						<Text style={[styles.actionSubtitle, { color: c.textSecondary }]}>
							Zero-knowledge encrypted passwords and cards
						</Text>
					</View>
					<ChevronRight color={c.textSecondary} size={18} />
				</View>
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
		<View style={styles.section}>
			<Text style={[styles.sectionHeader, { color: c.textSecondary }]}>APP & UPDATES</Text>
			<View style={[styles.actionCard, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: updateError ? "#ef4444" : isLight ? "#e2e8f0" : "#1e293b" }]}>
				<View style={styles.actionRow}>
					<View style={[styles.iconBox, { backgroundColor: updateError ? "rgba(239, 68, 68, 0.15)" : "rgba(168, 85, 247, 0.15)" }]}>
						<Download color={updateError ? "#ef4444" : "#a855f7"} size={20} />
					</View>
					<View style={{ flex: 1, marginLeft: 12 }}>
						<Text style={[styles.actionTitle, { color: c.text }]}>Version {CONFIG.APP_VERSION}</Text>
						<Text style={[styles.actionSubtitle, { color: updateError ? "#ef4444" : c.textSecondary }]}>
							{updateError ? updateError : "Check for latest release & APK update"}
						</Text>
					</View>
					<TouchableOpacity
						style={[styles.miniCheckBtn, { backgroundColor: updateError ? "#ef4444" : c.purple }]}
						onPress={onCheckUpdate}
						disabled={checkingUpdate}
					>
						{checkingUpdate ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text style={styles.miniCheckBtnText}>{updateError ? "Retry" : "Check"}</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginBottom: 16,
	},
	sectionHeader: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.8,
		marginBottom: 8,
		marginLeft: 4,
	},
	actionCard: {
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	actionTitle: {
		fontSize: 15,
		fontWeight: "600",
	},
	actionSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	syncBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: "#2563eb",
		borderRadius: 12,
		paddingVertical: 10,
		marginTop: 14,
	},
	syncBtnText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	miniCheckBtn: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	miniCheckBtnText: {
		color: "#ffffff",
		fontSize: 13,
		fontWeight: "600",
	},
});
