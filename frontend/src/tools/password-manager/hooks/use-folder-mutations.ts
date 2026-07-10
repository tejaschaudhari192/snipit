import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	setVault,
	setActiveFilter,
	selectVault,
	selectActiveFilter,
} from "@/tools/password-manager/store/password-slice";
import type { Folder } from "@/tools/password-manager/types";

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
			dispatch(
				setVault({
					...vault,
					folders: [...(vault.folders || []), newFolder],
					updatedAt: new Date().toISOString(),
				}),
			);
		},
		[vault, dispatch],
	);

	const editFolder = useCallback(
		(id: string, name: string, color: string) => {
			if (!name.trim() || !vault) return;
			const newFolders = (vault.folders || []).map((f) =>
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
					...vault,
					folders: newFolders,
					updatedAt: new Date().toISOString(),
				}),
			);
		},
		[vault, dispatch],
	);

	const deleteFolder = useCallback(
		(id: string, deletePasswordsInside = false) => {
			if (!vault) return;
			const newFolders = (vault.folders || []).filter((f) => f.id !== id);
			let newItems = vault.items || [];
			if (deletePasswordsInside) {
				newItems = newItems.filter((item) => item.folderId !== id);
			} else {
				newItems = newItems.map((item) =>
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
					...vault,
					folders: newFolders,
					items: newItems,
					updatedAt: new Date().toISOString(),
				}),
			);
			if (activeFilter === id) dispatch(setActiveFilter("all"));
		},
		[vault, dispatch, activeFilter],
	);

	return { createFolder, editFolder, deleteFolder };
}
