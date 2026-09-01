import React from "react";
import { Folder, MoreVertical, Edit2, Move, Trash2 } from "lucide-react";
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

interface FolderCardProps {
	folder: FolderData;
	index: number;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, index }) => {
	const { t } = useTranslation();
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

	return (
		<div
			className="min-w-0 h-full animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both relative group"
			style={{ animationDelay: `${index * 30}ms` }}
		>
			<div
				onClick={() => setActiveFolderId(folder._id)}
				className="w-full h-full flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 relative overflow-hidden"
			>
				{/* Color Accent Indicator Strip */}
				<div
					className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-opacity"
					style={{
						backgroundColor: folder.color || "var(--color-primary)",
					}}
				/>

				<div className="flex items-center gap-3 min-w-0 flex-1 pl-1.5">
					<div
						className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
						style={{
							backgroundColor: folder.color
								? `${folder.color}15`
								: "var(--color-primary-10)",
						}}
					>
						<Folder
							className="w-4.5 h-4.5 shrink-0"
							style={{
								color: folder.color || "var(--color-primary)",
							}}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
							{folder.name}
						</h4>
						<span className="text-[10px] font-semibold text-muted-foreground/80">
							{t("folders.subfolders", "Folder")}
						</span>
					</div>
				</div>

				{/* Dropdown Menu */}
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
								className="gap-2 cursor-pointer text-xs font-bold"
							>
								<Trash2 className="w-3.5 h-3.5" />
								<span>{t("folders.delete")}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

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
		</div>
	);
};
