import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	setVault,
	selectVault,
} from "@/tools/password-manager/store/password-slice";
import type { Folder } from "@/tools/password-manager/types";
import { toast } from "@/components/ui/toast";
import { deleteFolderAsync, persistFolders } from "../store/thunks";

export function useFolderMutations() {
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);

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
				.catch((err) =>
					toast.add({
						title: err.message || "Failed to create folder",
						type: "error",
					}),
				);
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
				.catch((err) =>
					toast.add({
						title: err.message || "Failed to update folder",
						type: "error",
					}),
				);
		},
		[vault, dispatch],
	);

	const deleteFolder = useCallback(
		(id: string, deletePasswordsInside = false) => {
			if (!vault) return;
			dispatch(deleteFolderAsync({ id, deletePasswordsInside }))
				.unwrap()
				.catch((err) =>
					toast.add({
						title: err || "Failed to delete folder",
						type: "error",
					}),
				);
		},
		[vault, dispatch],
	);

	return { createFolder, editFolder, deleteFolder };
}
