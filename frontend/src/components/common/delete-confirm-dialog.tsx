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
import TextGradient from "@/components/text-gradient";
import { Skeleton } from "@/components/ui/skeleton";

interface DeleteConfirmDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	isDeleting?: boolean;
}

export const DeleteConfirmDialog = ({
	isOpen,
	onOpenChange,
	onConfirm,
	title,
	description,
	isDeleting = false,
}: DeleteConfirmDialogProps) => {
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
						{title || t("display.delete_button")}
					</AlertDialogTitle>
					<AlertDialogTitle className="sr-only">
						Confirm Deletion
					</AlertDialogTitle>
					<AlertDialogDescription>
						{description || t("messages.delete_confirm")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost" disabled={isDeleting}>
						{t("history.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={isDeleting}
						className="font-bold min-w-[100px] gap-2 flex items-center justify-center"
					>
						{isDeleting ? (
							<>
								<Skeleton className="h-3 w-3 rounded-full bg-white/40 shrink-0" />
								<TextGradient
									highlightColor="var(--foreground)"
									baseColor="var(--muted-foreground)"
									spread={20}
									duration={2}
									className="font-medium"
								>
									{t("common.submitting")}
								</TextGradient>
							</>
						) : (
							t("display.delete_button")
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
