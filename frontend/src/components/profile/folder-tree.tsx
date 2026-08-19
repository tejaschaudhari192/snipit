import React from "react";
import { Tree, NodeApi } from "react-arborist";
import {
	Plus,
	Edit,
	Trash2,
	Folder,
	FolderOpen,
	ChevronRight,
	ChevronDown,
	FolderPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFolders, type FolderTreeNode } from "@/context/FolderContext";
import { CreateFolderDialog } from "./create-folder-dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { useFolderActions } from "@/hooks/use-folder-actions";

export const FolderTree: React.FC = () => {
	const { t } = useTranslation();
	const {
		folders,
		foldersTree,
		activeFolderId,
		setActiveFolderId,
		moveFolder,
		renameFolder,
	} = useFolders();

	const {
		isCreateOpen,
		createParentId,
		openCreateDialog,
		closeCreateDialog,
		isFolderDeleteDialogOpen,
		folderDeleteTitle,
		folderDeleteDescription,
		confirmDeleteFolder,
		executeDeleteFolder,
		cancelDeleteFolder,
	} = useFolderActions();

	// Handle tree actions
	const onMove = async ({
		dragIds,
		parentId,
	}: {
		dragIds: string[];
		parentId: string | null;
	}) => {
		if (dragIds.length > 0) {
			await moveFolder(dragIds[0], parentId);
		}
	};

	const onRename = async ({ id, name }: { id: string; name: string }) => {
		if (name.trim()) {
			await renameFolder(id, name.trim());
		}
	};

	return (
		<div className="w-full space-y-3">
			{/* Explorer Section Header */}
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
						{t("folders.explorer")}
					</span>
					{folders.length > 0 && (
						<span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
							{folders.length}
						</span>
					)}
				</div>
				<button
					onClick={() => openCreateDialog(null)}
					className="p-1.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
					title={t("folders.create_new")}
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>

			{foldersTree.length === 0 ? (
				<div className="text-center py-8 px-4 border border-dashed rounded-2xl border-border/60 bg-muted/10 transition-all hover:bg-muted/20">
					<FolderPlus className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2.5" />
					<p className="text-xs text-muted-foreground font-medium mb-3">
						{t("folders.empty_hint")}
					</p>
					<button
						onClick={() => openCreateDialog(null)}
						className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						<span>{t("folders.create_new")}</span>
					</button>
				</div>
			) : (
				<div className="w-full text-sm font-medium">
					<Tree
						data={foldersTree}
						openByDefault={false}
						width="100%"
						indent={16}
						rowHeight={40}
						onMove={onMove}
						onRename={onRename}
					>
						{({
							node,
							style,
							dragHandle,
						}: {
							node: NodeApi<FolderTreeNode>;
							style: React.CSSProperties;
							dragHandle?: (el: HTMLDivElement | null) => void;
						}) => {
							const isSelected = activeFolderId === node.id;
							const hasChildren =
								node.children && node.children.length > 0;

							return (
								<div
									style={style}
									ref={dragHandle}
									onClick={() => setActiveFolderId(node.id)}
									className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
										isSelected
											? "bg-primary/15 text-primary font-extrabold shadow-xs"
											: "hover:bg-muted/60 text-foreground/85"
									}`}
								>
									<div className="flex items-center gap-2 min-w-0 flex-1">
										{/* Expand / Collapse Indicator */}
										{hasChildren ? (
											<button
												onClick={(e) => {
													e.stopPropagation();
													node.toggle();
												}}
												className="p-1 text-muted-foreground hover:text-foreground rounded-md"
											>
												{node.isOpen ? (
													<ChevronDown className="w-4 h-4 shrink-0" />
												) : (
													<ChevronRight className="w-4 h-4 shrink-0" />
												)}
											</button>
										) : (
											<span className="w-5 shrink-0" />
										)}

										{/* Folder Icon */}
										{node.isOpen ? (
											<FolderOpen
												className="w-4.5 h-4.5 shrink-0 text-primary transition-transform group-hover:scale-105"
												style={{
													color:
														node.data.color ||
														undefined,
												}}
											/>
										) : (
											<Folder
												className="w-4.5 h-4.5 shrink-0 text-primary/80 transition-transform group-hover:scale-105"
												style={{
													color:
														node.data.color ||
														undefined,
												}}
											/>
										)}

										{/* Folder Name */}
										{node.isEditing ? (
											<input
												type="text"
												defaultValue={node.data.name}
												onFocus={(e) =>
													e.target.select()
												}
												onBlur={(e) =>
													node.submit(e.target.value)
												}
												onKeyDown={(e) => {
													if (e.key === "Enter")
														node.submit(
															e.currentTarget
																.value,
														);
													if (e.key === "Escape")
														node.reset();
												}}
												autoFocus
												className="bg-background border border-primary text-xs px-2 py-0.5 rounded-md w-full outline-none font-medium"
											/>
										) : (
											<span className="truncate text-xs font-semibold">
												{node.data.name}
											</span>
										)}
									</div>

									{/* Action buttons on hover */}
									<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
										<button
											onClick={(e) => {
												e.stopPropagation();
												openCreateDialog(node.id);
											}}
											className="p-1 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-md transition-colors"
											title={t(
												"folders.create_subfolder",
											)}
										>
											<Plus className="w-3.5 h-3.5" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												node.edit();
											}}
											className="p-1 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-md transition-colors"
											title={t("folders.rename")}
										>
											<Edit className="w-3.5 h-3.5" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												confirmDeleteFolder(node.id);
											}}
											className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted/80 rounded-md transition-colors"
											title={t("folders.delete")}
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							);
						}}
					</Tree>
				</div>
			)}

			<CreateFolderDialog
				open={isCreateOpen}
				onOpenChange={(open) => !open && closeCreateDialog()}
				parentId={createParentId}
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
