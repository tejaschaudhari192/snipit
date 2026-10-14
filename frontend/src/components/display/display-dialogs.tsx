import React, { Suspense } from "react";
import { CustomExpiryDialog } from "@/components/home/custom-expiry-dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

interface DisplayDialogsProps {
	isCustomExpiryDialogOpen: boolean;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	customExpiryDate: Date | undefined;
	setCustomExpiryDate: (val: Date | undefined) => void;
	onCustomExpiryConfirm: () => void;
	isDeleteDialogOpen: boolean;
	setIsDeleteDialogOpen: (val: boolean) => void;
	onDeleteConfirm: () => void;
	isDeleting: boolean;
}

export const DisplayDialogs: React.FC<DisplayDialogsProps> = ({
	isCustomExpiryDialogOpen,
	setIsCustomExpiryDialogOpen,
	customExpiryDate,
	setCustomExpiryDate,
	onCustomExpiryConfirm,
	isDeleteDialogOpen,
	setIsDeleteDialogOpen,
	onDeleteConfirm,
	isDeleting,
}) => {
	return (
		<Suspense fallback={null}>
			<CustomExpiryDialog
				isOpen={isCustomExpiryDialogOpen}
				onOpenChange={setIsCustomExpiryDialogOpen}
				customExpiryDate={customExpiryDate}
				setCustomExpiryDate={setCustomExpiryDate}
				onConfirm={onCustomExpiryConfirm}
			/>
			<DeleteConfirmDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={onDeleteConfirm}
				isDeleting={isDeleting}
			/>
		</Suspense>
	);
};
