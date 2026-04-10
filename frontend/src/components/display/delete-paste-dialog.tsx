import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeletePasteDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const DeletePasteDialog = ({
	isOpen,
	onOpenChange,
	onConfirm,
}: DeletePasteDialogProps) => {
	const { t } = useTranslation();

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent
				size="sm"
				className="border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden"
			>
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/10 text-destructive">
						<Trash2 className="size-8" />
					</AlertDialogMedia>
					<AlertDialogTitle>
						{t("display.delete_button")}
					</AlertDialogTitle>
					<AlertDialogTitle className="sr-only">
						Confirm Deletion
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("messages.delete_confirm")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						{t("history.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={onConfirm}
						className="font-bold"
					>
						{t("display.delete_button")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
