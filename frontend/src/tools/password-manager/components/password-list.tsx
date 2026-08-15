import { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import BulkActionBar from "./bulk-action-bar";
import {
	selectVault,
	selectActiveFilter,
	selectVaultLoading,
	handleEdit,
} from "@/tools/password-manager/store/password-slice";
import { ListSkeleton } from "./skeletons";
import { ITEM_TYPE_OPTIONS } from "@/tools/password-manager/utils/constants";
import ShareFolderModal from "./share-folder-modal";
import type {
	PasswordItem,
	Folder as FolderType,
} from "@/tools/password-manager/types";
import { useDeleteItem } from "@/tools/password-manager/hooks/use-delete-item";
import { deleteItem } from "../store/thunks";
import { PasswordListHeader } from "./password-list-header";
import { PasswordTable } from "./password-table";

const MergeItemsModal = lazy(() =>
	import("./merge-items-modal").then((m) => ({ default: m.MergeItemsModal })),
);
const FindDuplicatesWizard = lazy(() =>
	import("./find-duplicates-wizard").then((m) => ({
		default: m.FindDuplicatesWizard,
	})),
);
const FieldCleanerWizard = lazy(() =>
	import("./field-cleaner-wizard").then((m) => ({
		default: m.FieldCleanerWizard,
	})),
);
const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog,
	})),
);

interface PasswordListProps {
	activeId: string | null;
	searchQuery: string;
	onSearchChange?: (val: string) => void;
	onSelect: (item: PasswordItem) => void;
	onEdit: (item: PasswordItem) => void;
	onNewItem: () => void;
	onImport: () => void;
}

export default function PasswordList({
	activeId,
	searchQuery,
	onSearchChange,
	onSelect,
	onEdit,
	onNewItem,
	onImport,
}: PasswordListProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const folders = useAppSelector(
		(state) => state.passwordManager?.folders || [],
	);
	const activeFilter = useAppSelector(selectActiveFilter);
	const isLoading = useAppSelector(selectVaultLoading);

	const {
		isDeleteDialogOpen,
		deleteTargetId,
		confirmDelete,
		handleConfirm,
		cancelDelete,
	} = useDeleteItem();

	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
	const [isFindDuplicatesOpen, setIsFindDuplicatesOpen] = useState(false);
	const [isFieldCleanerOpen, setIsFieldCleanerOpen] = useState(false);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
		{},
	);

	const activeFolder = folders.find((f: FolderType) => f.id === activeFilter);

	const categoryFiltered = useMemo(() => {
		const items = vault?.items ?? [];
		return items.filter((item: PasswordItem) => {
			if (activeFilter === "all") return true;
			if (activeFilter === "favorites") return !!item.isFavorite;
			if (activeFilter === "recent") return true;
			if (
				item.folderId === activeFilter ||
				item.collectionId === activeFilter
			)
				return true;
			return (
				item.itemType === activeFilter ||
				(!item.itemType && activeFilter === "login")
			);
		});
	}, [vault?.items, activeFilter]);

	const searchFiltered = useMemo(() => {
		if (!searchQuery) return categoryFiltered;
		return matchSorter(categoryFiltered, searchQuery, {
			keys: [
				"title",
				"username",
				"url",
				"notes",
				"metadata.website",
				"metadata.url",
				"metadata.username",
				"metadata.email",
			],
		});
	}, [categoryFiltered, searchQuery]);

	const [visibleCount, setVisibleCount] = useState(50);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setVisibleCount(50);
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = 0;
		}
	}, [activeFilter, searchQuery]);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		if (
			target.scrollHeight - target.scrollTop <=
			target.clientHeight + 200
		) {
			if (visibleCount < searchFiltered.length) {
				setVisibleCount((prev) =>
					Math.min(prev + 50, searchFiltered.length),
				);
			}
		}
	};

	let pageTitle = t("tools.password_manager.all_items");
	if (activeFilter === "favorites")
		pageTitle = t("tools.password_manager.favorites");
	else if (activeFilter === "recent")
		pageTitle = t("tools.password_manager.recent");
	else if (activeFilter === "sharing")
		pageTitle = t("tools.password_manager.sharing_center_title");
	else {
		const typeOpt = ITEM_TYPE_OPTIONS.find((o) => o.id === activeFilter);
		if (typeOpt) pageTitle = t(typeOpt.label);
	}

	if (isLoading && vault?.items?.length === 0) {
		return <ListSkeleton />;
	}

	const selectedItems = searchFiltered.filter((_, idx) => rowSelection[idx]);
	const hasSelection = Object.keys(rowSelection).length > 0;

	return (
		<div className="h-full flex flex-col bg-pm-surface relative">
			<PasswordListHeader
				pageTitle={pageTitle}
				hasSelection={hasSelection}
				selectedCount={selectedItems.length}
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				activeFolder={activeFolder}
				onMergeModalOpen={() => setIsMergeModalOpen(true)}
				onShareModalOpen={() => setIsShareModalOpen(true)}
				onImport={onImport}
				onFindDuplicatesOpen={() => setIsFindDuplicatesOpen(true)}
				onFieldCleanerOpen={() => setIsFieldCleanerOpen(true)}
				onNewItem={onNewItem}
			/>

			<div
				className="flex-1 overflow-y-auto px-6 pb-6"
				onScroll={handleScroll}
				ref={scrollContainerRef}
			>
				<PasswordTable
					data={searchFiltered}
					folders={folders}
					activeId={activeId}
					searchQuery={searchQuery}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					onSelect={onSelect}
					onEdit={onEdit}
					onDelete={confirmDelete}
					visibleCount={visibleCount}
				/>
			</div>

			<BulkActionBar
				selectedItems={selectedItems}
				folders={folders}
				onClearSelection={() => setRowSelection({})}
			/>

			{deleteTargetId && (
				<Suspense fallback={null}>
					<DeleteConfirmDialog
						isOpen={isDeleteDialogOpen}
						onOpenChange={(open) => {
							if (!open) cancelDelete();
						}}
						onConfirm={handleConfirm}
						title={t("tools.password_manager.delete_title")}
						description={t("tools.password_manager.delete_desc")}
					/>
				</Suspense>
			)}
			{isShareModalOpen && activeFolder && (
				<ShareFolderModal
					isOpen={isShareModalOpen}
					onClose={() => setIsShareModalOpen(false)}
					folderId={activeFolder.id}
				/>
			)}
			<Suspense fallback={null}>
				<MergeItemsModal
					isOpen={isMergeModalOpen}
					onClose={() => setIsMergeModalOpen(false)}
					items={selectedItems}
					onMerge={(mergedItem, originalItemIds) => {
						dispatch(handleEdit(mergedItem));
						originalItemIds.forEach((id) => {
							if (id !== mergedItem.id) {
								dispatch(deleteItem(id));
							}
						});
						setRowSelection({});
					}}
				/>
				{isFindDuplicatesOpen && (
					<FindDuplicatesWizard
						isOpen={isFindDuplicatesOpen}
						onClose={() => setIsFindDuplicatesOpen(false)}
						items={vault?.items || []}
					/>
				)}
				{isFieldCleanerOpen && (
					<FieldCleanerWizard
						isOpen={isFieldCleanerOpen}
						onClose={() => setIsFieldCleanerOpen(false)}
						items={vault?.items || []}
					/>
				)}
			</Suspense>
		</div>
	);
}
