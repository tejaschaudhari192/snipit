import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import * as foldersApi from "@/lib/api/folders";
import type { FolderData, PasteData } from "@/types";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

export interface HierarchicalFolderOption {
	_id: string;
	name: string;
	color?: string | null;
	depth: number;
	hasChildren: boolean;
}

export interface FolderTreeNode {
	id: string;
	name: string;
	color?: string | null;
	icon?: string | null;
	children?: FolderTreeNode[];
}

interface FolderContextType {
	folders: FolderData[];
	currentFolderContents: { subfolders: FolderData[]; snippets: PasteData[] };
	activeFolderId: string | null;
	loadingTree: boolean;
	loadingContents: boolean;
	setActiveFolderId: (id: string | null) => void;
	loadTree: () => Promise<void>;
	loadFolderContents: (id: string | null) => Promise<void>;
	createFolder: (
		name: string,
		parentId?: string | null,
		color?: string | null,
		icon?: string | null,
	) => Promise<FolderData | null>;
	renameFolder: (
		id: string,
		name: string,
		color?: string | null,
		icon?: string | null,
	) => Promise<FolderData | null>;
	moveFolder: (
		id: string,
		newParentId: string | null,
	) => Promise<FolderData | null>;
	deleteFolder: (id: string) => Promise<boolean>;
	getFolderPathString: (id: string | null) => string;
	foldersTree: FolderTreeNode[];
	getHierarchicalOptions: (
		expanded: Record<string, boolean>,
	) => HierarchicalFolderOption[];
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const [folders, setFolders] = useState<FolderData[]>([]);
	const [currentFolderContents, setCurrentFolderContents] = useState<{
		subfolders: FolderData[];
		snippets: PasteData[];
	}>({ subfolders: [], snippets: [] });

	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [loadingTree, setLoadingTree] = useState(false);
	const [loadingContents, setLoadingContents] = useState(false);

	const loadTree = useCallback(async () => {
		if (!user) return;
		setLoadingTree(true);
		try {
			const res = await foldersApi.getFoldersTree();
			setFolders(res.folders);
		} catch (error) {
			console.error("Error loading folders:", error);
		} finally {
			setLoadingTree(false);
		}
	}, [user]);

	const loadFolderContents = useCallback(
		async (id: string | null) => {
			if (!user) return;
			setLoadingContents(true);
			try {
				const res = await foldersApi.getFolderContents(id || "root");
				setCurrentFolderContents(res);
			} catch (error) {
				console.error("Error loading folder contents:", error);
			} finally {
				setLoadingContents(false);
			}
		},
		[user],
	);

	useEffect(() => {
		if (user) {
			loadTree();
		} else {
			setFolders([]);
			setCurrentFolderContents({ subfolders: [], snippets: [] });
			setActiveFolderId(null);
		}
	}, [user, loadTree]);

	useEffect(() => {
		if (user) {
			loadFolderContents(activeFolderId);
		}
	}, [user, activeFolderId, loadFolderContents]);

	const foldersTree = React.useMemo(() => {
		const map = new Map<string, FolderTreeNode>();
		const roots: FolderTreeNode[] = [];

		folders.forEach((f) => {
			map.set(f._id, {
				id: f._id,
				name: f.name,
				color: f.color,
				icon: f.icon,
				children: [],
			});
		});

		folders.forEach((f) => {
			const node = map.get(f._id)!;
			if (f.parentId) {
				const parent = map.get(f.parentId);
				if (parent) {
					parent.children = parent.children || [];
					parent.children.push(node);
				} else {
					roots.push(node);
				}
			} else {
				roots.push(node);
			}
		});

		return roots;
	}, [folders]);

	const getFolderPathString = useCallback(
		(id: string | null) => {
			if (!id || folders.length === 0) return "";
			const path: string[] = [];
			let current = folders.find((f) => f._id === id);
			while (current) {
				path.unshift(current.name);
				const parentId = current.parentId;
				current = parentId
					? folders.find((f) => f._id === parentId)
					: undefined;
			}
			return path.join(" / ");
		},
		[folders],
	);

	const getHierarchicalOptions = useCallback(
		(expanded: Record<string, boolean>): HierarchicalFolderOption[] => {
			const options: HierarchicalFolderOption[] = [];

			const buildOptions = (parentId: string | null, depth: number) => {
				const children = folders.filter((f) => f.parentId === parentId);
				children.sort((a, b) => a.name.localeCompare(b.name));

				children.forEach((child) => {
					const hasChildren = folders.some(
						(f) => f.parentId === child._id,
					);
					options.push({
						_id: child._id,
						name: child.name,
						color: child.color,
						depth,
						hasChildren,
					});
					if (expanded[child._id]) {
						buildOptions(child._id, depth + 1);
					}
				});
			};

			buildOptions(null, 0);
			return options;
		},
		[folders],
	);

	const createFolder = async (
		name: string,
		parentId?: string | null,
		color?: string | null,
		icon?: string | null,
	) => {
		const tempId = `temp_${Date.now()}`;
		const tempFolder: FolderData = {
			_id: tempId,
			name,
			owner: "local",
			parentId: parentId || null,
			path: `/${name}`,
			color: color || null,
			icon: icon || null,
			createdAt: new Date().toISOString(),
		};

		// Optimistic update
		setFolders((prev) => [...prev, tempFolder]);

		const toastId = toast.add({
			title: t("folders.creating"),
			type: "loading",
		});

		try {
			const newFolder = await foldersApi.createFolder({
				name,
				parentId,
				color,
				icon,
			});

			setFolders((prev) =>
				prev.map((f) => (f._id === tempId ? newFolder : f)),
			);

			toast.update(toastId, {
				title: t("folders.created_success"),
				type: "success",
			});

			await loadTree();
			if (activeFolderId === (parentId || null)) {
				await loadFolderContents(activeFolderId);
			}
			return newFolder;
		} catch (error: unknown) {
			// Rollback
			setFolders((prev) => prev.filter((f) => f._id !== tempId));

			const err = error as { response?: { data?: { error?: string } } };
			toast.update(toastId, {
				title:
					err?.response?.data?.error || t("folders.created_failed"),
				type: "error",
			});
			return null;
		}
	};

	const renameFolder = async (
		id: string,
		name: string,
		color?: string | null,
		icon?: string | null,
	) => {
		const previousFolder = folders.find((f) => f._id === id);

		// Optimistic update
		setFolders((prev) =>
			prev.map((f) =>
				f._id === id
					? {
							...f,
							name,
							color: color !== undefined ? color : f.color,
							icon: icon !== undefined ? icon : f.icon,
						}
					: f,
			),
		);

		const toastId = toast.add({
			title: t("folders.renaming"),
			type: "loading",
		});

		try {
			const updated = await foldersApi.updateFolder(id, {
				name,
				color,
				icon,
			});

			setFolders((prev) => prev.map((f) => (f._id === id ? updated : f)));

			toast.update(toastId, {
				title: t("folders.updated_success"),
				type: "success",
			});

			await loadTree();
			await loadFolderContents(activeFolderId);
			return updated;
		} catch (error: unknown) {
			// Rollback
			if (previousFolder) {
				setFolders((prev) =>
					prev.map((f) => (f._id === id ? previousFolder : f)),
				);
			}

			const err = error as { response?: { data?: { error?: string } } };
			toast.update(toastId, {
				title:
					err?.response?.data?.error || t("folders.updated_failed"),
				type: "error",
			});
			return null;
		}
	};

	const moveFolder = async (id: string, newParentId: string | null) => {
		const previousFolder = folders.find((f) => f._id === id);

		// Optimistic update
		setFolders((prev) =>
			prev.map((f) =>
				f._id === id ? { ...f, parentId: newParentId } : f,
			),
		);

		const toastId = toast.add({
			title: t("folders.moving"),
			type: "loading",
		});

		try {
			const moved = await foldersApi.moveFolder(id, newParentId);

			setFolders((prev) => prev.map((f) => (f._id === id ? moved : f)));

			toast.update(toastId, {
				title: t("folders.move_success"),
				type: "success",
			});

			await loadTree();
			await loadFolderContents(activeFolderId);
			return moved;
		} catch (error: unknown) {
			// Rollback
			if (previousFolder) {
				setFolders((prev) =>
					prev.map((f) => (f._id === id ? previousFolder : f)),
				);
			}

			const err = error as { response?: { data?: { error?: string } } };
			toast.update(toastId, {
				title: err?.response?.data?.error || t("folders.move_failed"),
				type: "error",
			});
			return null;
		}
	};

	const deleteFolder = async (id: string) => {
		const previousFolders = [...folders];

		// Optimistic update
		setFolders((prev) => prev.filter((f) => f._id !== id));

		const toastId = toast.add({
			title: t("folders.deleting"),
			type: "loading",
		});

		try {
			await foldersApi.deleteFolder(id);

			toast.update(toastId, {
				title: t("folders.deleted_success"),
				type: "success",
			});

			await loadTree();
			if (activeFolderId === id) {
				setActiveFolderId(null);
			} else {
				await loadFolderContents(activeFolderId);
			}
			return true;
		} catch (error: unknown) {
			// Rollback
			setFolders(previousFolders);

			const err = error as { response?: { data?: { error?: string } } };
			toast.update(toastId, {
				title:
					err?.response?.data?.error || t("folders.deleted_failed"),
				type: "error",
			});
			return false;
		}
	};

	return (
		<FolderContext.Provider
			value={{
				folders,
				currentFolderContents,
				activeFolderId,
				loadingTree,
				loadingContents,
				setActiveFolderId,
				loadTree,
				loadFolderContents,
				createFolder,
				renameFolder,
				moveFolder,
				deleteFolder,
				getFolderPathString,
				foldersTree,
				getHierarchicalOptions,
			}}
		>
			{children}
		</FolderContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFolders = () => {
	const context = useContext(FolderContext);
	if (context === undefined) {
		throw new Error("useFolders must be used within a FolderProvider");
	}
	return context;
};
