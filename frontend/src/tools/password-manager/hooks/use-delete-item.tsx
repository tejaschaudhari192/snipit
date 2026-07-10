import { useState, useCallback } from "react";
import { useAppDispatch } from "@/tools/password-manager/store";
import {
	deleteItem,
	persistVault,
} from "@/tools/password-manager/store/password-slice";

export function useDeleteItem() {
	const dispatch = useAppDispatch();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	const confirmDelete = useCallback((id: string) => {
		setDeleteTargetId(id);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirm = useCallback(() => {
		if (deleteTargetId) {
			dispatch(deleteItem(deleteTargetId));
			dispatch(persistVault());
		}
		setIsDeleteDialogOpen(false);
		setDeleteTargetId(null);
	}, [deleteTargetId, dispatch]);

	const cancelDelete = useCallback(() => {
		setIsDeleteDialogOpen(false);
		setDeleteTargetId(null);
	}, []);

	return {
		isDeleteDialogOpen,
		deleteTargetId,
		confirmDelete,
		handleConfirm,
		cancelDelete,
		setIsDeleteDialogOpen,
		setDeleteTargetId,
	};
}
