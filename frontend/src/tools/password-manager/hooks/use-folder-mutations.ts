import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	setVault,
	setActiveFilter,
	selectVault,
	selectActiveFilter,
	persistFolders,
} from "@/tools/password-manager/store/password-slice";
import type { Folder, PasswordItem } from "@/tools/password-manager/types";
import { toast } from "sonner";

export function useFolderMutations() {
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const activeFilter = useAppSelector(selectActiveFilter);

	const createFolder = useCallback(
		(name: string, color: string) => {
			if (!name.trim() || !vault) return;
			const newFolder: Folder = {
				id: crypto.randomUUID(),
				name: name.trim(),
				color,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			const newFolders = [...(vault.folders || []), newFolder];
			dispatch(
				setVault({
					folders: newFolders,
				}),
			);
			dispatch(persistFolders(newFolders))
				.unwrap()
				.catch((err) => toast.error(err.message || "Failed to create folder"));
		},
		[vault, dispatch],
	);

	const editFolder = useCallback(
		(id: string, name: string, color: string) => {
			if (!name.trim() || !vault) return;
			const newFolders = (vault.folders || []).map((f: Folder) =>
				f.id === id
					? {
							...f,
							name: name.trim(),
							color,
							updatedAt: new Date().toISOString(),
						}
					: f,
			);
			dispatch(
				setVault({
					folders: newFolders,
				}),
			);
			dispatch(persistFolders(newFolders))
				.unwrap()
				.catch((err) => toast.error(err.message || "Failed to update folder"));
		},
		[vault, dispatch],
	);

	const deleteFolder = useCallback(
		(id: string, deletePasswordsInside = false) => {
			if (!vault) return;
			const newFolders = (vault.folders || []).filter((f: Folder) => f.id !== id);
			let newItems = vault.items || [];
			if (deletePasswordsInside) {
				newItems = newItems.filter((item: PasswordItem) => item.folderId !== id);
			} else {
				newItems = newItems.map((item: PasswordItem) =>
					item.folderId === id
						? {
								...item,
								folderId: undefined,
								updatedAt: new Date().toISOString(),
							}
						: item,
				);
			}
			dispatch(
				setVault({
					folders: newFolders,
					items: newItems,
				}),
			);
			dispatch(persistFolders(newFolders))
				.unwrap()
				.catch((err) => toast.error(err.message || "Failed to delete folder"));
			if (activeFilter === id) dispatch(setActiveFilter("all"));
		},
		[vault, dispatch, activeFilter],
	);

	return { createFolder, editFolder, deleteFolder };
}
