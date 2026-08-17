import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/context/FolderContext";
import { updatePaste } from "@/lib/api/pastes";
import { FolderTreeList } from "@/components/common/folder-tree-list";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

interface MoveFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemId: string;
	itemType: "folder" | "snippet";
	currentParentId?: string | null;
}

export const MoveFolderDialog: React.FC<MoveFolderDialogProps> = ({
	open,
	onOpenChange,
	itemId,
	itemType,
	currentParentId = null,
}) => {
	const { t } = useTranslation();
	const { moveFolder, loadFolderContents, activeFolderId } = useFolders();
	const [targetFolderId, setTargetFolderId] = useState<string | null>(
		currentParentId,
	);
	const [loading, setLoading] = useState(false);

	const handleMove = async () => {
		setLoading(true);
		try {
			if (itemType === "folder") {
				await moveFolder(itemId, targetFolderId);
			} else {
				// Moving a snippet
				await updatePaste(itemId, { folderId: targetFolderId });
				toast.add({
					title:
						t("folders.snippet_moved_success") ||
						"Snippet moved successfully",
					type: "success",
				});
				await loadFolderContents(activeFolderId);
			}
			onOpenChange(false);
		} catch (error: unknown) {
			console.error("Error moving item:", error);
			toast.add({
				title: t("folders.move_failed") || "Failed to move item",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{itemType === "folder"
							? t("folders.move_folder")
							: t("folders.move_snippet")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-3">
					<span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
						{t("folders.select_destination")}
					</span>

					<div className="max-h-[300px] overflow-y-auto border border-border/50 rounded-xl custom-scrollbar bg-card/30 p-1">
						<FolderTreeList
							folderId={targetFolderId}
							setFolderId={setTargetFolderId}
							disableFolderId={
								itemType === "folder" ? itemId : undefined
							}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						{t("common.actions.cancel")}
					</Button>
					<Button
						type="button"
						onClick={handleMove}
						disabled={loading || targetFolderId === currentParentId}
					>
						{loading ? t("folders.moving") : t("folders.move_here")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
