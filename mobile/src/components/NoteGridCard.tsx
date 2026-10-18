import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
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
		<View style={styles.cardWrapper}>
			<TouchableOpacity
				style={[
					styles.card,
					{
						backgroundColor: isLight ? "#ffffff" : "#1c1c1e",
						borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
					},
				]}
				activeOpacity={0.7}
				onPress={onPress}
			>
				{/* Header: Title & Star */}
				<View style={styles.header}>
					<Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
						{item.title || "Untitled Note"}
					</Text>
					{item.isFavorite && <Star color="#eab308" fill="#eab308" size={12} />}
				</View>

				{/* Date & Note Preview */}
				<Text style={[styles.body, { color: c.textSecondary }]} numberOfLines={5}>
					{dateStr ? <Text style={[styles.date, { color: c.blue }]}>{dateStr} </Text> : null}
					{content || "No additional text"}
				</Text>

				{/* Bottom Folder Badge / Indicator */}
				<View style={styles.footer}>
					{assignedFolder ? (
						<View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
							<View style={[styles.folderDot, { backgroundColor: assignedFolder.color || c.blue }]} />
							<Text style={[styles.footerText, { color: c.textSecondary }]} numberOfLines={1}>
								{assignedFolder.name}
							</Text>
						</View>
					) : (
						<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
							<FolderIcon color={c.textMuted} size={12} />
							<Text style={[styles.footerText, { color: c.textMuted }]}>Notes</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		flex: 1,
		maxWidth: "50%",
		padding: 5,
		boxSizing: "border-box" as any,
	},
	card: {
		flex: 1,
		borderRadius: 16,
		padding: 14,
		minHeight: 140,
		justifyContent: "space-between",
		borderWidth: 1,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 6,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		flex: 1,
		marginRight: 6,
	},
	date: {
		fontSize: 13,
		fontWeight: "600",
	},
	body: {
		fontSize: 13,
		lineHeight: 18,
		flex: 1,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 0.5,
		borderTopColor: "rgba(142, 142, 147, 0.15)",
	},
	folderDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	footerText: {
		fontSize: 11,
		fontWeight: "500",
	},
});
