import { useCallback } from "react";
import { useAppDispatch } from "@/tools/password-manager/store";
import { handleSelect } from "@/tools/password-manager/store/password-slice";
import type { PasswordItem } from "@/tools/password-manager/types";

import { toast } from "@/components/ui/toast";
import { persistItem } from "../store/thunks";

export function useItemMutations() {
	const dispatch = useAppDispatch();

	const saveItem = useCallback(
		async (item: PasswordItem) => {
			try {
				dispatch(handleSelect(item));
				await dispatch(persistItem(item)).unwrap();
			} catch (error: unknown) {
				toast.add({
					title:
						typeof error === "string"
							? error
							: (error as Error).message || "Failed to save item",
					type: "error",
				});
			}
		},
		[dispatch],
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
