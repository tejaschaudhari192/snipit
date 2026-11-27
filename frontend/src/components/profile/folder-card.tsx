import React, { useState } from "react";
import { Folder, MoreVertical, Edit2, Move, Trash2, Users } from "lucide-react";
import type { FolderData } from "@/types";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateFolderDialog } from "./create-folder-dialog";
import { MoveFolderDialog } from "./move-folder-dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { useFolderActions } from "@/hooks/use-folder-actions";
import ShareResourceModal from "@/components/common/share-resource-modal";

interface FolderCardProps {
	folder: FolderData;
	index: number;
	viewMode?: "grid" | "list";
}

export const FolderCard: React.FC<FolderCardProps> = ({
	folder,
	index,
	viewMode = "grid",
}) => {
	const { t } = useTranslation();
	const [isShareOpen, setIsShareOpen] = useState(false);
	const {
		setActiveFolderId,
		isRenameOpen,
		openRenameDialog,
		closeRenameDialog,
		isMoveOpen,
		openMoveDialog,
		closeMoveDialog,
		isFolderDeleteDialogOpen,
		folderDeleteTitle,
		folderDeleteDescription,
		confirmDeleteFolder,
		executeDeleteFolder,
		cancelDeleteFolder,
	} = useFolderActions();

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		confirmDeleteFolder(folder._id);
	};

	const folderColor = folder.color || "var(--color-primary)";

	const actionMenu = (
		<div
			onClick={(e) => e.stopPropagation()}
			className="shrink-0 relative z-20"
		>
			<DropdownMenu>
				<DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
					<MoreVertical className="w-4 h-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem
						onClick={() => setIsShareOpen(true)}
						className="gap-2 cursor-pointer text-xs"
					>
						<Users className="w-3.5 h-3.5" />
						<span>{t("shared.share")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => openRenameDialog(folder)}
						className="gap-2 cursor-pointer text-xs"
					>
						<Edit2 className="w-3.5 h-3.5" />
						<span>{t("folders.rename")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							openMoveDialog(
								folder._id,
								"folder",
								folder.parentId,
							)
						}
						className="gap-2 cursor-pointer text-xs"
					>
						<Move className="w-3.5 h-3.5" />
						<span>{t("folders.move_folder")}</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleDelete}
						variant="destructive"
						className="gap-2 cursor-pointer text-xs font-semibold"
					>
						<Trash2 className="w-3.5 h-3.5" />
						<span>{t("folders.delete")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);

	return (
		<div
			className="min-w-0 animate-in fade-in duration-200 fill-mode-both relative group"
			style={{ animationDelay: `${index * 20}ms` }}
		>
			{viewMode === "list" ? (
				<div
					onClick={() => setActiveFolderId(folder._id)}
					className="w-full flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-3 min-w-0 flex-1">
						<Folder
							className="w-4 h-4 shrink-0"
							style={{
								color: folderColor,
								fill: `${folderColor}20`,
							}}
						/>
						<span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
							{folder.name}
						</span>
					</div>
					<div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
						<span className="w-24">
							{t("folders.folder", { defaultValue: "Folder" })}
						</span>
					</div>
					{actionMenu}
				</div>
			) : (
				<div
					onClick={() => setActiveFolderId(folder._id)}
					className="w-full h-12 flex items-center justify-between gap-2.5 px-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-2.5 min-w-0 flex-1">
						<Folder
							className="w-4 h-4 shrink-0"
							style={{
								color: folderColor,
								fill: `${folderColor}20`,
							}}
						/>
						<span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
							{folder.name}
						</span>
					</div>
					{actionMenu}
				</div>
			)}

			<CreateFolderDialog
				open={isRenameOpen}
				onOpenChange={(open) => !open && closeRenameDialog()}
				folderToEdit={folder}
			/>

			<MoveFolderDialog
				open={isMoveOpen}
				onOpenChange={(open) => !open && closeMoveDialog()}
				itemId={folder._id}
				itemType="folder"
				currentParentId={folder.parentId}
			/>

			<DeleteConfirmDialog
				isOpen={isFolderDeleteDialogOpen}
				onOpenChange={(open) => !open && cancelDeleteFolder()}
				onConfirm={executeDeleteFolder}
				title={folderDeleteTitle}
				description={folderDeleteDescription}
			/>

			<ShareResourceModal
				isOpen={isShareOpen}
				onClose={() => setIsShareOpen(false)}
				resourceType="folder"
				resourceId={folder._id}
				resourceName={folder.name}
			/>
		</div>
	);
};
