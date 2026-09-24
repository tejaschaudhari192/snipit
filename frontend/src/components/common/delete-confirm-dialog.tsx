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
				className="border border-border/60 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-border/50 overflow-hidden"
			>
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/15 text-destructive dark:bg-destructive/20">
						<Trash2 className="size-8" />
					</AlertDialogMedia>
					<AlertDialogTitle className="text-foreground font-semibold">
						{title || t("display.actions.delete")}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-muted-foreground/90 font-normal">
						{description || t("messages.confirm.delete")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						variant="ghost"
						disabled={isDeleting}
						className="hover:bg-muted text-muted-foreground hover:text-foreground"
					>
						{t("history.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							onOpenChange(false);
							onConfirm();
						}}
						disabled={isDeleting}
						className="font-bold min-w-25 gap-2 flex items-center justify-center cursor-pointer shadow-sm hover:opacity-90"
					>
						{isDeleting ? (
							<>
								<span
									style={
										{
											"--highlight-color":
												"var(--foreground)",
											"--base-color":
												"var(--muted-foreground)",
											"--spread": "20px",
											"--duration": "2s",
										} as React.CSSProperties
									}
									className="shimmer font-medium"
								>
									{t("common.states.submitting")}
								</span>
							</>
						) : (
							t("display.actions.delete")
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
