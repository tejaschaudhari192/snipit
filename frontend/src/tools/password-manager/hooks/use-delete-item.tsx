import { useState, useCallback } from "react";
import { useAppDispatch } from "@/tools/password-manager/store";
import { deleteItem } from "@/tools/password-manager/store/password-slice";
import { toast } from "sonner";

export function useDeleteItem() {
	const dispatch = useAppDispatch();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	const confirmDelete = useCallback((id: string) => {
		setDeleteTargetId(id);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirm = useCallback(async () => {
		if (deleteTargetId) {
			try {
				await dispatch(deleteItem(deleteTargetId)).unwrap();
			} catch (error: unknown) {
				toast.error(
					typeof error === "string" 
						? error 
						: (error as Error).message || "Failed to delete item"
				);
			}
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
