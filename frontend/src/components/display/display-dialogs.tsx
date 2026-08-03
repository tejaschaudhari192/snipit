import React, { Suspense } from "react";
import { CustomExpiryDialog } from "@/components/home/custom-expiry-dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
const AiEnhanceDialog = React.lazy(() =>
	import("@/components/editor/ai-enhance-dialog").then((m) => ({
		default: m.AiEnhanceDialog,
	})),
);

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
	// AI Dialog Props
	isAiDialogOpen: boolean;
	setIsAiDialogOpen: (val: boolean) => void;
	selectedText: string;
	prefillInstruction: string;
	applyEnhancedText: (text: string) => void;
	contentType?: string;
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
	isAiDialogOpen,
	setIsAiDialogOpen,
	selectedText,
	prefillInstruction,
	applyEnhancedText,
	contentType,
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
			<AiEnhanceDialog
				isOpen={isAiDialogOpen}
				onClose={() => setIsAiDialogOpen(false)}
				selectedText={selectedText}
				onApply={applyEnhancedText}
				initialInstruction={prefillInstruction}
				contentType={contentType}
			/>
		</Suspense>
	);
};
