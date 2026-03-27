import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolbarActionButtonsProps {
	isEdit: boolean;
	canEdit: boolean;
	canDelete: boolean;
	content: string;
	onEdit: (val: boolean) => void;
	onDelete: () => void;
	onSave: () => void;
	onCancel: () => void;
	isSaving?: boolean;
	isAutosave?: boolean;
}

export const ToolbarActionButtons = ({
	isEdit,
	canEdit,
	canDelete,
	content,
	onEdit,
	onDelete,
	onSave,
	onCancel,
	isSaving,
	isAutosave,
}: ToolbarActionButtonsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-2">
			{!isEdit ? (
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
					<CopyButton
						variant="outline"
						content={content}
						className="gap-2 px-3 h-9 w-auto rounded-md text-sm font-medium shrink-0"
					>
						<span>{t("display.copy_button")}</span>
					</CopyButton>
					{canEdit && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(true)}
							className="gap-2 h-9 shrink-0"
						>
							<Edit className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("display.edit_button")}
							</span>
						</Button>
					)}
					{canDelete && (
						<Button
							variant="outline"
							size="sm"
							onClick={onDelete}
							className="gap-2 h-9 shrink-0 text-destructive hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("display.delete_button")}
							</span>
						</Button>
					)}
				</div>
			) : (
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
					{!isAutosave && (
						<Button
							variant="default"
							size="sm"
							onClick={onSave}
							disabled={isSaving}
							className="gap-2 h-9 font-bold min-w-[120px]"
						>
							{isSaving ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									<span>{t("common.saving")}</span>
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									<span className="hidden sm:inline">
										{t("display.save_button")}
									</span>
								</>
							)}
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="gap-2 h-9"
					>
						<X className="h-4 w-4" />
						<span className="hidden sm:inline">
							{t("history.cancel")}
						</span>
					</Button>
				</div>
			)}
		</div>
	);
};
