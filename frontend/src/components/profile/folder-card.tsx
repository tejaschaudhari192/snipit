import React, { useState } from "react";
import { Folder, MoreVertical, Edit2, Move, Trash2 } from "lucide-react";
import type { FolderData } from "@/types";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateFolderDialog } from "./create-folder-dialog";
import { MoveFolderDialog } from "./move-folder-dialog";
import { useFolders } from "@/context/FolderContext";

interface FolderCardProps {
	folder: FolderData;
	index: number;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, index }) => {
	const { deleteFolder, setActiveFolderId } = useFolders();
	const [renameOpen, setRenameOpen] = useState(false);
	const [moveOpen, setMoveOpen] = useState(false);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (
			window.confirm(
				"Are you sure you want to delete this folder? All child folders will be deleted, and snippets inside will be moved to Root.",
			)
		) {
			await deleteFolder(folder._id);
		}
	};

	return (
		<div
			className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both relative group"
			style={{ animationDelay: `${index * 40}ms` }}
		>
			<div
				onClick={() => setActiveFolderId(folder._id)}
				className="w-full flex items-center justify-between p-4 rounded-2xl glass-card border border-border/45 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
			>
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/10">
						<Folder
							className="w-5 h-5 shrink-0"
							style={{ color: folder.color || undefined }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
							{folder.name}
						</h4>
						<span className="text-[10px] font-medium text-muted-foreground">
							Folder
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
								onClick={() => setRenameOpen(true)}
								className="gap-2 cursor-pointer"
							>
								<Edit2 className="w-3.5 h-3.5" />
								<span>Rename</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setMoveOpen(true)}
								className="gap-2 cursor-pointer"
							>
								<Move className="w-3.5 h-3.5" />
								<span>Move To</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
								variant="destructive"
								className="gap-2 cursor-pointer"
							>
								<Trash2 className="w-3.5 h-3.5" />
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<CreateFolderDialog
				open={renameOpen}
				onOpenChange={setRenameOpen}
				folderToEdit={folder}
			/>

			<MoveFolderDialog
				open={moveOpen}
				onOpenChange={setMoveOpen}
				itemId={folder._id}
				itemType="folder"
				currentParentId={folder.parentId}
			/>
		</div>
	);
};
