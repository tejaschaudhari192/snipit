import { useState, useCallback } from "react";
import { useAppDispatch } from "@/tools/password-manager/store";
import { toast } from "@/components/ui/toast";
import { deleteItem } from "../store/thunks";

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
				toast.add({
					title:
						typeof error === "string"
							? error
							: (error as Error).message ||
								"Failed to delete item",
					type: "error",
				});
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
