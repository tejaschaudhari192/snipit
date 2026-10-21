import React from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Shield, StickyNote } from "lucide-react-native";
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
	selectedItemIds?: string[];
	isRefreshing?: boolean;
	onRefresh?: () => void;
	onSearchChange: (q: string) => void;
	onResetFilter: () => void;
	onSelectItem: (item: PasswordItem) => void;
	onLongPressItem?: (item: PasswordItem) => void;
	onToggleSelectItem?: (item: PasswordItem) => void;
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
	selectedItemIds = [],
	isRefreshing = false,
	onRefresh,
	onSearchChange,
	onResetFilter,
	onSelectItem,
	onLongPressItem,
	onToggleSelectItem,
	onCopyPassword,
}: PWMGListViewProps) {
	const isLight = theme === "light";
	const isNotesTab = activeBottomTab === "notes";
	const showGrid = isNotesTab && isGridView;

	const refreshElem = onRefresh ? (
		<RefreshControl
			refreshing={isRefreshing}
			onRefresh={onRefresh}
			tintColor={isLight ? "#2563eb" : "#60a5fa"}
			colors={["#2563eb"]}
		/>
	) : undefined;

	return (
		<>
			<IosSearchBar
				value={searchQuery}
				onChangeText={onSearchChange}
				placeholder={isNotesTab ? "Search Notes" : "Search Passwords"}
				theme={theme}
			/>

			{(selectedFolderId || activeFilter !== "all") && (
				<View className="flex-row justify-between items-center px-4 py-1.5 mb-1">
					<Text className={`text-[13px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
						Filtering by: {selectedFolderId ? folders.find((f) => f.id === selectedFolderId)?.name : activeFilter}
					</Text>
					<TouchableOpacity onPress={onResetFilter}>
						<Text className={`text-[13px] font-semibold underline ${isLight ? "text-slate-900" : "text-white"}`}>Show All</Text>
					</TouchableOpacity>
				</View>
			)}

			{items.length === 0 ? (
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					contentContainerClassName="justify-center items-center p-5"
					refreshControl={refreshElem}
				>
					{isNotesTab ? (
						<StickyNote color={c.textMuted} size={54} strokeWidth={1.5} />
					) : (
						<Shield color={c.textMuted} size={54} strokeWidth={1.5} />
					)}
					<Text className={`text-xl font-bold mt-4 mb-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
						{searchQuery ? "No Results" : isNotesTab ? "No Notes Yet" : "No Passwords"}
					</Text>
					<Text className={`text-sm text-center leading-5 max-w-[280px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
						{searchQuery
							? "Check spelling or search for another term."
							: isNotesTab
								? "Capture thoughts, ideas, or meeting notes. Tap + to create your first note."
								: "Tap + to add your first password or account."}
					</Text>
				</ScrollView>
			) : showGrid ? (
				<FlatList
					key="notes-grid"
					data={items}
					numColumns={2}
					keyExtractor={(item) => item.id}
					columnWrapperClassName="justify-between"
					contentContainerClassName="px-2.5 pt-1 pb-32"
					refreshControl={refreshElem}
					renderItem={({ item }) => {
						const isSelected = selectedItemIds.includes(item.id);
						const isSelectionMode = isNotesTab && selectedItemIds.length > 0;
						return (
							<NoteGridCard
								item={item}
								folders={folders}
								c={c}
								isLight={isLight}
								isSelectionMode={isSelectionMode}
								isSelected={isSelected}
								onPress={() => {
									if (isSelectionMode && onToggleSelectItem) {
										onToggleSelectItem(item);
									} else {
										onSelectItem(item);
									}
								}}
								onLongPress={() => {
									if (isNotesTab && onLongPressItem) {
										onLongPressItem(item);
									}
								}}
							/>
						);
					}}
				/>
			) : (
				<FlatList
					key="items-list"
					data={items}
					keyExtractor={(item) => item.id}
					contentContainerClassName="px-4 pt-1 pb-32"
					refreshControl={refreshElem}
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

						const isSelected = selectedItemIds.includes(item.id);
						const isSelectionMode = isNotesTab && selectedItemIds.length > 0;

						return (
							<IosPasswordListItem
								item={item}
								index={index}
								totalItems={items.length}
								subtitle={subtitle}
								copied={copiedField === item.id}
								theme={theme}
								isSelectionMode={isSelectionMode}
								isSelected={isSelected}
								onPress={() => {
									if (isSelectionMode && onToggleSelectItem) {
										onToggleSelectItem(item);
									} else {
										onSelectItem(item);
									}
								}}
								onLongPress={() => {
									if (isNotesTab && onLongPressItem) {
										onLongPressItem(item);
									}
								}}
								onCopyPassword={(pass) => onCopyPassword(pass, item.id)}
							/>
						);
					}}
				/>
			)}
		</>
	);
}
