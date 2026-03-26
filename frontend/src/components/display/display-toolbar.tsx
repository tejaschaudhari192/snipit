import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Edit, Trash2, Save, X, MessageSquare, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FontSizeControls } from "@/components/editor/font-size-controls";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { CommentsSection } from "@/components/display/comments-section";
import { useAuth } from "@/context/AuthContext";
import type { PasteData } from "@/types";

interface DisplayToolbarProps {
	isEdit: boolean;
	content: string;
	onEdit: (val: boolean) => void;
	onDelete: () => void;
	onSave: () => void;
	onCancel: () => void;
	isSaving?: boolean;
	fontSize: number;
	setFontSize: (v: number | ((p: number) => number)) => void;
	showFontControls: boolean;
	allowComments: boolean;
	commentCount: number;
	paste: PasteData | undefined;
	onCommentAdded: (updatedPaste: PasteData) => void;
}

export const DisplayToolbar = ({
	isEdit,
	content,
	onEdit,
	onDelete,
	onSave,
	onCancel,
	isSaving,
	fontSize,
	setFontSize,
	showFontControls,
	allowComments,
	commentCount,
	paste,
	onCommentAdded,
}: DisplayToolbarProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const isOwner = !paste?.owner || (user && paste.owner === user._id);

	const getUserRole = (): "admin" | "editor" | "viewer" | "commenter" => {
		if (isOwner) return "admin";

		if (paste?.shareList && user?.email) {
			const shareEntry = paste.shareList.find(
				(s) => s.email === user.email,
			);
			if (shareEntry) return shareEntry.role;
		}

		return paste?.publicRole || "viewer";
	};

	const userRole = getUserRole();
	const canEdit =
		userRole === "admin" ||
		userRole === "editor" ||
		paste?.editPermission === "public";
	const canDelete = isOwner || userRole === "admin";

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 bg-background/40 backdrop-blur-xl relative z-20 shadow-sm border-b border-border/50">
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

			<div className="flex items-center gap-2 ml-auto">
				{showFontControls && (
					<FontSizeControls
						fontSize={fontSize}
						setFontSize={setFontSize}
					/>
				)}

				{(allowComments || (paste && !paste.owner)) && (
					<Sheet modal={false}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 text-primary font-semibold hover:bg-primary/5"
							>
								<MessageSquare className="h-4 w-4" />
								<span className="hidden sm:inline">
									{t("common.discussion")}
								</span>
								{commentCount > 0 && (
									<span className="bg-primary/10 px-1.5 py-0.5 rounded text-[10px] animate-in zoom-in-50">
										{commentCount}
									</span>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent
							hideOverlay
							className="flex flex-col h-full sm:max-w-md w-full border-l shadow-2xl p-0 overflow-hidden"
						>
							<SheetHeader className="p-6 pb-2 border-b">
								<SheetTitle className="flex items-center gap-2 text-xl">
									<MessageSquare className="w-5 h-5 text-primary" />
									{t("common.discussion_title")}
								</SheetTitle>
								<SheetDescription>
									{t("common.discussion_desc")}
								</SheetDescription>
							</SheetHeader>
							<div className="flex-1 min-h-0 p-6">
								{paste && (
									<CommentsSection
										paste={paste}
										onCommentAdded={onCommentAdded}
									/>
								)}
							</div>
						</SheetContent>
					</Sheet>
				)}
			</div>
		</div>
	);
};
