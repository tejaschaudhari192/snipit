import { useState, useCallback } from "react";
import { PasswordItem, offlineVault } from "../core/vault-storage";

export function useVaultMultiSelect(
	items: PasswordItem[],
	filteredItems: PasswordItem[],
	onReloadData: () => Promise<void> | void,
	showAlert: (
		title: string,
		message?: string,
		type?: "info" | "success" | "warning" | "error",
		buttons?: any[]
	) => void
) {
	const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
	const isSelectionMode = selectedItemIds.length > 0;

	const clearSelection = useCallback(() => {
		setSelectedItemIds([]);
	}, []);

	const toggleSelectItem = useCallback((item: PasswordItem) => {
		setSelectedItemIds((prev) =>
			prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
		);
	}, []);

	const longPressItem = useCallback((item: PasswordItem) => {
		setSelectedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
	}, []);

	const selectAllVisible = useCallback(() => {
		const visibleIds = filteredItems.map((i) => i.id);
		setSelectedItemIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds));
	}, [filteredItems]);

	const bulkPin = useCallback(async () => {
		if (selectedItemIds.length === 0) return;
		const targetItems = items.filter((i) => selectedItemIds.includes(i.id));
		const allPinned = targetItems.every((n) => n.isFavorite);
		for (const item of targetItems) {
			await offlineVault.saveItem({
				...item,
				isFavorite: !allPinned,
			});
		}
		setSelectedItemIds([]);
		await onReloadData();
	}, [selectedItemIds, items, onReloadData]);

	const bulkMove = useCallback(
		async (folderId: string | null) => {
			if (selectedItemIds.length === 0) return;
			const targetItems = items.filter((i) => selectedItemIds.includes(i.id));
			for (const item of targetItems) {
				await offlineVault.saveItem({
					...item,
					folderId: folderId || undefined,
				});
			}
			setSelectedItemIds([]);
			await onReloadData();
		},
		[selectedItemIds, items, onReloadData]
	);

	const bulkDelete = useCallback(() => {
		if (selectedItemIds.length === 0) return;
		const count = selectedItemIds.length;
		showAlert(
			"Delete Items",
			`Are you sure you want to delete ${count} item${count > 1 ? "s" : ""}? This cannot be undone.`,
			"warning",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						for (const id of selectedItemIds) {
							await offlineVault.deleteItem(id);
						}
						setSelectedItemIds([]);
						await onReloadData();
					},
				},
			]
		);
	}, [selectedItemIds, showAlert, onReloadData]);

	return {
		selectedItemIds,
		setSelectedItemIds,
		isSelectionMode,
		clearSelection,
		toggleSelectItem,
		longPressItem,
		selectAllVisible,
		bulkPin,
		bulkMove,
		bulkDelete,
	};
}
