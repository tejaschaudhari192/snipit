import React from "react";
import { Tree } from "react-arborist";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFolders } from "@/context/FolderContext";
import { useAuth } from "@/context/AuthContext";
import { CreateFolderDialog } from "./create-folder-dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { GuestFolderPrompt } from "./guest-folder-prompt";
import { EmptyFolderTree } from "./empty-folder-tree";
import { FolderTreeNodeRow } from "./folder-tree-node-row";
import { useFolderActions } from "@/hooks/use-folder-actions";

export const FolderTree: React.FC = () => {
	const { t } = useTranslation();
	const {
		folders,
		foldersTree,
		activeFolderId,
		setActiveFolderId,
		loadingTree,
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

	const containerRef = React.useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

	const { user } = useAuth();

	React.useLayoutEffect(() => {
		if (!containerRef.current) return;
		const updateSize = () => {
			if (containerRef.current) {
				const { clientWidth, clientHeight } = containerRef.current;
				if (clientHeight > 0 || clientWidth > 0) {
					setDimensions({ width: clientWidth, height: clientHeight });
				}
			}
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	if (!user) {
		return <GuestFolderPrompt />;
	}

	return (
		<div className="w-full h-full flex flex-col min-h-0 gap-3">
			{/* Explorer Section Header */}
			<div className="flex items-center justify-between px-1 shrink-0">
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

			{loadingTree ? (
				<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
					<p className="text-xs font-medium">
						{t("folders.loading")}
					</p>
				</div>
			) : foldersTree.length === 0 ? (
				<EmptyFolderTree onCreate={() => openCreateDialog(null)} />
			) : (
				<div
					ref={containerRef}
					className="flex-1 w-full min-h-0 text-sm font-medium overflow-hidden"
				>
					{dimensions.height > 0 && (
						<Tree
							data={foldersTree}
							openByDefault={false}
							width={dimensions.width || "100%"}
							height={dimensions.height}
							indent={16}
							rowHeight={40}
							onMove={onMove}
							onRename={onRename}
						>
							{({ node, style, dragHandle }) => (
								<FolderTreeNodeRow
									node={node}
									style={style}
									dragHandle={dragHandle}
									isSelected={activeFolderId === node.id}
									onSelect={setActiveFolderId}
									onCreateSubfolder={openCreateDialog}
									onDelete={confirmDeleteFolder}
								/>
							)}
						</Tree>
					)}
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
