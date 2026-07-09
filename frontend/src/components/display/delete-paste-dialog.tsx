import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

interface DeletePasteDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting?: boolean;
}

export const DeletePasteDialog = ({
	isOpen,
	onOpenChange,
	onConfirm,
	isDeleting = false,
}: DeletePasteDialogProps) => {
	return (
		<DeleteConfirmDialog
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
			isDeleting={isDeleting}
		/>
	);
};
