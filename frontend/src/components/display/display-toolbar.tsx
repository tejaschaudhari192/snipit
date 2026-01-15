import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Edit, Trash2, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FontSizeControls } from "@/components/editor/font-size-controls";

interface DisplayToolbarProps {
	isEdit: boolean;
	content: string;
	onEdit: (val: boolean) => void;
	onDelete: () => void;
	onSave: () => void;
	onCancel: () => void;
	fontSize: number;
	setFontSize: (v: number | ((p: number) => number)) => void;
	showFontControls: boolean;
}

export const DisplayToolbar = ({
	isEdit,
	content,
	onEdit,
	onDelete,
	onSave,
	onCancel,
	fontSize,
	setFontSize,
	showFontControls,
}: DisplayToolbarProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
			<div className="flex items-center gap-2">
				{!isEdit ? (
					<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
						<CopyButton
							variant="outline"
							content={content}
							className="gap-2 px-3 h-9 w-auto rounded-md text-sm font-medium shrink-0"
						>
							<span className="hidden sm:inline">
								{t("display.copy_button")}
							</span>
						</CopyButton>
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
					</div>
				) : (
					<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
						<Button
							variant="default"
							size="sm"
							onClick={onSave}
							className="gap-2 h-9 font-bold"
						>
							<Save className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("display.save_button")}
							</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onCancel}
							className="gap-2 h-9"
						>
							<X className="h-4 w-4" />
							<span className="hidden sm:inline">Cancel</span>
						</Button>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2 ml-auto">
				{showFontControls && (
					<FontSizeControls
						fontSize={fontSize}
						setFontSize={setFontSize}
					/>
				)}
			</div>
		</div>
	);
};
