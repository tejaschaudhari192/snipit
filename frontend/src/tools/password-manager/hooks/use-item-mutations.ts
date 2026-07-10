import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	setVault,
	persistVault,
	handleSelect,
	selectVault,
} from "@/tools/password-manager/store/password-slice";
import type { PasswordItem } from "@/tools/password-manager/types";

export function useItemMutations() {
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);

	const saveItem = useCallback(
		(item: PasswordItem) => {
			if (!vault) return;
			const exists = vault.items.find((i) => i.id === item.id);
			const updated = {
				...vault,
				items: exists
					? vault.items.map((i) => (i.id === item.id ? item : i))
					: [...vault.items, item],
				updatedAt: new Date().toISOString(),
			};
			dispatch(setVault(updated));
			dispatch(persistVault());
			dispatch(handleSelect(item));
		},
		[vault, dispatch],
	);

	const toggleFavorite = useCallback(
		(item: PasswordItem) => {
			saveItem({ ...item, isFavorite: !item.isFavorite });
		},
		[saveItem],
	);

	const updateItemFolder = useCallback(
		(item: PasswordItem, folderId: string | undefined) => {
			saveItem({ ...item, folderId });
		},
		[saveItem],
	);

	return { saveItem, toggleFavorite, updateItemFolder };
}
