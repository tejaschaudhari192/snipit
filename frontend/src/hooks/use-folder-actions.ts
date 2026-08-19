import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFolders } from "@/context/FolderContext";
import type { FolderData } from "@/types";

interface PendingFolderDelete {
	id: string;
	title?: string;
	description?: string;
}

interface PendingFolderCreate {
	parentId: string | null;
}

interface PendingFolderRename {
	folder: FolderData;
}

interface PendingFolderMove {
	itemId: string;
	itemType: "folder" | "snippet";
	currentParentId: string | null;
}

export function useFolderActions() {
	const { t } = useTranslation();
	const {
		folders,
		createFolder,
		renameFolder,
		moveFolder,
		deleteFolder,
		setActiveFolderId,
	} = useFolders();

	const [deleteState, setDeleteState] = useState<PendingFolderDelete | null>(
		null,
	);
	const [createState, setCreateState] = useState<PendingFolderCreate | null>(
		null,
	);
	const [renameState, setRenameState] = useState<PendingFolderRename | null>(
		null,
	);
	const [moveState, setMoveState] = useState<PendingFolderMove | null>(null);

	// Create Dialog Handlers
	const openCreateDialog = useCallback((parentId: string | null = null) => {
		setCreateState({ parentId });
	}, []);

	const closeCreateDialog = useCallback(() => {
		setCreateState(null);
	}, []);

	const handleCreateFolder = useCallback(
		(name: string, color?: string | null, icon?: string | null) => {
			const parentId = createState?.parentId || null;
			setCreateState(null);
			return createFolder(name, parentId, color, icon);
		},
		[createState, createFolder],
	);

	// Rename Dialog Handlers
	const openRenameDialog = useCallback((folder: FolderData) => {
		setRenameState({ folder });
	}, []);

	const closeRenameDialog = useCallback(() => {
		setRenameState(null);
	}, []);

	const handleRenameFolder = useCallback(
		(name: string, color?: string | null, icon?: string | null) => {
			if (!renameState) return;
			const id = renameState.folder._id;
			setRenameState(null);
			return renameFolder(id, name, color, icon);
		},
		[renameState, renameFolder],
	);

	// Move Dialog Handlers
	const openMoveDialog = useCallback(
		(
			itemId: string,
			itemType: "folder" | "snippet" = "folder",
			currentParentId: string | null = null,
		) => {
			setMoveState({ itemId, itemType, currentParentId });
		},
		[],
	);

	const closeMoveDialog = useCallback(() => {
		setMoveState(null);
	}, []);

	const handleMoveFolder = useCallback(
		(targetParentId: string | null) => {
			if (!moveState) return;
			const { itemId, itemType } = moveState;
			setMoveState(null);
			if (itemType === "folder") {
				return moveFolder(itemId, targetParentId);
			}
		},
		[moveState, moveFolder],
	);

	// Delete Confirmation Dialog Handlers
	const confirmDeleteFolder = useCallback(
		(id: string, title?: string, description?: string) => {
			setDeleteState({ id, title, description });
		},
		[],
	);

	const executeDeleteFolder = useCallback(async () => {
		if (!deleteState) return;
		const targetId = deleteState.id;
		setDeleteState(null);
		await deleteFolder(targetId);
	}, [deleteState, deleteFolder]);

	const cancelDeleteFolder = useCallback(() => {
		setDeleteState(null);
	}, []);

	return {
		folders,
		setActiveFolderId,

		// Create
		isCreateOpen: !!createState,
		createParentId: createState?.parentId || null,
		openCreateDialog,
		closeCreateDialog,
		handleCreateFolder,

		// Rename
		isRenameOpen: !!renameState,
		folderToEdit: renameState?.folder,
		openRenameDialog,
		closeRenameDialog,
		handleRenameFolder,

		// Move
		isMoveOpen: !!moveState,
		moveItemId: moveState?.itemId,
		moveItemType: moveState?.itemType || "folder",
		moveCurrentParentId: moveState?.currentParentId || null,
		openMoveDialog,
		closeMoveDialog,
		handleMoveFolder,

		// Delete
		isFolderDeleteDialogOpen: !!deleteState,
		folderDeleteTitle: deleteState?.title || t("folders.delete"),
		folderDeleteDescription:
			deleteState?.description || t("folders.delete_confirm"),
		confirmDeleteFolder,
		executeDeleteFolder,
		cancelDeleteFolder,
	};
}
