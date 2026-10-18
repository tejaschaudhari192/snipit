import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Shield } from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { IosSearchBar } from "./IosSearchBar";
import { IosPasswordListItem } from "./IosPasswordListItem";
import { NoteGridCard } from "./NoteGridCard";
import { maskCardNumber } from "./CreditCardVisual";
import { ThemeColors } from "../config/theme";

interface PWMGListViewProps {
	c: ThemeColors;
	theme: "dark" | "light";
	items: PasswordItem[];
	folders: Folder[];
	activeBottomTab: "passwords" | "folders" | "notes" | "settings";
	searchQuery: string;
	activeFilter: string;
	selectedFolderId: string | null;
	copiedField: string | null;
	isGridView?: boolean;
	onSearchChange: (q: string) => void;
	onResetFilter: () => void;
	onSelectItem: (item: PasswordItem) => void;
	onCopyPassword: (password: string, id: string) => void;
}

export function PWMGListView({
	c,
	theme,
	items,
	folders,
	activeBottomTab,
	searchQuery,
	activeFilter,
	selectedFolderId,
	copiedField,
	isGridView = false,
	onSearchChange,
	onResetFilter,
	onSelectItem,
	onCopyPassword,
}: PWMGListViewProps) {
	const isLight = theme === "light";
	const isNotesTab = activeBottomTab === "notes";
	const showGrid = isNotesTab && isGridView;

	return (
		<>
			<IosSearchBar
				value={searchQuery}
				onChangeText={onSearchChange}
				placeholder={isNotesTab ? "Search Notes" : "Search Passwords"}
				theme={theme}
			/>

			{(selectedFolderId || activeFilter !== "all") && (
				<View style={styles.filterResetBanner}>
					<Text style={[styles.filterResetText, { color: c.textSecondary }]}>
						Filtering by: {selectedFolderId ? folders.find((f) => f.id === selectedFolderId)?.name : activeFilter}
					</Text>
					<TouchableOpacity onPress={onResetFilter}>
						<Text style={[styles.filterResetAction, { color: c.text, textDecorationLine: "underline" }]}>Show All</Text>
					</TouchableOpacity>
				</View>
			)}

			{items.length === 0 ? (
				<View style={styles.centerContainer}>
					<Shield color={c.textMuted} size={54} strokeWidth={1.5} />
					<Text style={[styles.emptyTitle, { color: c.text }]}>
						{searchQuery ? "No Results" : isNotesTab ? "No Notes" : "No Passwords"}
					</Text>
					<Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
						{searchQuery
							? "Check spelling or search for another term."
							: isNotesTab
								? "Tap + to write your first secure note."
								: "Tap + to add your first password or account."}
					</Text>
				</View>
			) : showGrid ? (
				<FlatList
					key="notes-grid"
					data={items}
					numColumns={2}
					keyExtractor={(item) => item.id}
					columnWrapperStyle={{ justifyContent: "space-between" }}
					contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 4, paddingBottom: 125 }}
					renderItem={({ item }) => (
						<NoteGridCard
							item={item}
							folders={folders}
							c={c}
							isLight={isLight}
							onPress={() => onSelectItem(item)}
						/>
					)}
				/>
			) : (
				<FlatList
					key="items-list"
					data={items}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 125 }}
					renderItem={({ item, index }) => {
						const isCard = item.category === "card";
						const isNote = item.category === "note";
						const cardMeta = item.metadata || {};
						const subtitle = isCard
							? cardMeta.cardNumber
								? maskCardNumber(cardMeta.cardNumber)
								: cardMeta.cardholderName || "Credit Card"
							: isNote
								? item.notes?.trim() || "Empty note"
								: item.username || item.url || (item.notes ? item.notes.trim() : "Encrypted Entry");

						return (
							<IosPasswordListItem
								item={item}
								index={index}
								totalItems={items.length}
								subtitle={subtitle}
								copied={copiedField === item.id}
								theme={theme}
								onPress={() => onSelectItem(item)}
								onCopyPassword={(pass) => onCopyPassword(pass, item.id)}
							/>
						);
					}}
				/>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	filterResetBanner: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 6,
		marginBottom: 4,
	},
	filterResetText: {
		fontSize: 13,
	},
	filterResetAction: {
		fontSize: 13,
		fontWeight: "600",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		marginTop: 16,
		marginBottom: 6,
	},
	emptySubtitle: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		maxWidth: 280,
	},
});
