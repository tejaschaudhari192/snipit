import React, { useState } from "react";
import { Tree } from "react-arborist";
import {
	Folder,
	FolderOpen,
	ChevronRight,
	ChevronDown,
	Plus,
	Trash2,
	Edit,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFolders } from "@/context/FolderContext";
import { CreateFolderDialog } from "./create-folder-dialog";

export const FolderTree: React.FC = () => {
	const { t } = useTranslation();
	const {
		folders,
		foldersTree,
		activeFolderId,
		setActiveFolderId,
		renameFolder,
		moveFolder,
		deleteFolder,
	} = useFolders();

	const [createOpen, setCreateOpen] = useState(false);
	const [createParentId, setCreateParentId] = useState<string | null>(null);

	// Handle tree actions
	const onMove = async ({
		dragIds,
		parentId,
	}: {
		dragIds: string[];
		parentId: string | null;
	}) => {
		const dragId = dragIds[0];
		if (!dragId) return;
		await moveFolder(dragId, parentId);
	};

	const onRename = async ({ id, name }: { id: string; name: string }) => {
		if (!name.trim()) return;
		const folder = folders.find((f) => f._id === id);
		if (folder) {
			await renameFolder(id, name.trim(), folder.color, folder.icon);
		}
	};

	return (
		<div className="w-full select-none py-1">
			<div className="flex items-center justify-between mb-2 px-1">
				<span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
					<Folder className="w-3.5 h-3.5 text-primary" />
					{t("folders.explorer")}
				</span>
				<button
					onClick={() => {
						setCreateParentId(activeFolderId);
						setCreateOpen(true);
					}}
					className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer"
					title={t("folders.create_new")}
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>

			{folders.length === 0 ? (
				<div className="text-center py-6 text-sm text-muted-foreground italic">
					{t("folders.empty_hint")}
				</div>
			) : (
				<div className="w-full text-sm font-medium overflow-hidden">
					<Tree
						data={foldersTree}
						onMove={onMove}
						onRename={onRename}
						width="100%"
						height={Math.max(folders.length * 38, 140)}
						indent={16}
						rowHeight={36}
						openByDefault={false}
					>
						{({ node, style, dragHandle }) => {
							const isSelected = activeFolderId === node.id;
							const hasChildren =
								node.children && node.children.length > 0;

							return (
								<div
									style={style}
									ref={dragHandle}
									onClick={(e) => {
										e.stopPropagation();
										setActiveFolderId(node.id);
									}}
									className={`flex items-center justify-between group/node h-9 px-2 rounded-xl transition-all cursor-pointer ${
										isSelected
											? "bg-primary/10 text-primary font-bold shadow-xs"
											: "hover:bg-muted/40 text-foreground/90 hover:text-foreground"
									}`}
								>
									<div className="flex items-center gap-2 min-w-0 flex-1">
										{/* Expanded/Collapsed state indicators */}
										<div
											onClick={(e) => {
												e.stopPropagation();
												node.toggle();
											}}
											className="w-4 h-4 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded transition-colors shrink-0"
										>
											{hasChildren ? (
												node.isOpen ? (
													<ChevronDown className="w-3.5 h-3.5" />
												) : (
													<ChevronRight className="w-3.5 h-3.5" />
												)
											) : null}
										</div>

										{/* Folder Icon */}
										{node.isOpen ? (
											<FolderOpen
												className="w-4 h-4 shrink-0"
												style={{
													color:
														node.data.color ||
														undefined,
												}}
											/>
										) : (
											<Folder
												className="w-4 h-4 shrink-0"
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
												autoFocus
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
												className="bg-background border border-border/80 rounded-md px-1.5 py-0.5 text-sm outline-none w-full"
											/>
										) : (
											<span className="truncate text-sm font-semibold">
												{node.data.name}
											</span>
										)}
									</div>

									{/* Hover Actions */}
									<div className="hidden group-hover/node:flex items-center gap-1.5 shrink-0 pr-1 select-none">
										<button
											onClick={(e) => {
												e.stopPropagation();
												setCreateParentId(node.id);
												setCreateOpen(true);
											}}
											className="p-0.5 text-muted-foreground/50 hover:text-primary hover:bg-muted rounded transition-colors"
											title={t(
												"folders.create_subfolder",
											)}
										>
											<Plus className="w-2.5 h-2.5" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												node.edit();
											}}
											className="p-0.5 text-muted-foreground/50 hover:text-primary hover:bg-muted rounded transition-colors"
											title={t("folders.rename")}
										>
											<Edit className="w-2.5 h-2.5" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												deleteFolder(node.id);
											}}
											className="p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-muted rounded transition-colors"
											title={t("folders.delete")}
										>
											<Trash2 className="w-2.5 h-2.5" />
										</button>
									</div>
								</div>
							);
						}}
					</Tree>
				</div>
			)}

			<CreateFolderDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				parentId={createParentId}
			/>
		</div>
	);
};
