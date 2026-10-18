import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
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
			style={{ flex: 1 }}
			contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 110 }}
			showsVerticalScrollIndicator={false}
		>
			<Text style={[styles.sectionHeader, { color: c.textSecondary }]}>TYPES</Text>
			<View style={[styles.groupedCard, { backgroundColor: c.bgSecondary }]}>
				{typeItems.map((t, idx) => {
					const IconComponent = t.icon;
					return (
						<TouchableOpacity
							key={t.id}
							style={[styles.row, idx > 0 && { borderTopWidth: 0.5, borderTopColor: c.border }]}
							onPress={() => onSelectType(t.id)}
							activeOpacity={0.7}
						>
							<View style={styles.rowLeft}>
								<View style={[styles.iconBox, { backgroundColor: t.color }]}>
									<IconComponent color="#ffffff" size={17} strokeWidth={2.2} />
								</View>
								<Text style={[styles.rowTitle, { color: c.text }]}>{t.label}</Text>
							</View>
							<View style={styles.rowRight}>
								<Text style={[styles.badgeText, { color: c.textSecondary }]}>{t.count}</Text>
								<ChevronRight color={c.textSecondary} size={16} />
							</View>
						</TouchableOpacity>
					);
				})}
			</View>

			<View style={styles.folderHeaderRow}>
				<Text style={[styles.sectionHeader, { color: c.textSecondary, marginBottom: 0 }]}>FOLDERS</Text>
				<TouchableOpacity style={styles.newFolderBtn} onPress={onCreateFolder} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
					<FolderPlus color={c.blue} size={16} />
					<Text style={{ color: c.blue, fontSize: 14, fontWeight: "600" }}>New Folder</Text>
				</TouchableOpacity>
			</View>

			<View style={[styles.groupedCard, { backgroundColor: c.bgSecondary }]}>
				{folders.map((f, idx) => {
					const count = items.filter((i) => i.folderId === f.id).length;
					return (
						<TouchableOpacity
							key={f.id}
							style={[styles.row, idx > 0 && { borderTopWidth: 0.5, borderTopColor: c.border }]}
							onPress={() => onSelectFolder(f.id)}
							onLongPress={() => onDeleteFolder(f.id, f.name)}
							activeOpacity={0.7}
						>
							<View style={styles.rowLeft}>
								<View style={[styles.iconBox, { backgroundColor: f.color || c.indigo }]}>
									<FolderIcon color="#ffffff" size={16} strokeWidth={2} />
								</View>
								<Text style={[styles.rowTitle, { color: c.text }]}>{f.name}</Text>
							</View>
							<View style={styles.rowRight}>
								<Text style={[styles.badgeText, { color: c.textSecondary }]}>{count}</Text>
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
					<TouchableOpacity style={styles.row} onPress={onCreateFolder} activeOpacity={0.7}>
						<View style={styles.rowLeft}>
							<View style={[styles.iconBox, { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}>
								<FolderPlus color={c.blue} size={17} />
							</View>
							<Text style={[styles.rowTitle, { color: c.blue }]}>Create Your First Folder</Text>
						</View>
						<ChevronRight color={c.textSecondary} size={16} />
					</TouchableOpacity>
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	sectionHeader: {
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: -0.1,
		paddingHorizontal: 4,
		marginBottom: 7,
		marginTop: 14,
		textTransform: "uppercase",
	},
	groupedCard: {
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 14,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 13,
	},
	rowLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	rowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	iconBox: {
		width: 30,
		height: 30,
		borderRadius: 7,
		justifyContent: "center",
		alignItems: "center",
	},
	rowTitle: {
		fontSize: 17,
		fontWeight: "600",
		letterSpacing: -0.2,
	},
	badgeText: {
		fontSize: 15,
		fontWeight: "400",
	},
	folderHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 22,
		marginBottom: 8,
		paddingHorizontal: 4,
	},
	newFolderBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
});
