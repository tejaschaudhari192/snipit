import { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import BulkActionBar from "./bulk-action-bar";
import {
	selectVault,
	selectActiveFilter,
	setSidebarDrawerOpen,
	deleteItem,
	handleEdit,
} from "@/tools/password-manager/store/password-slice";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Menu, MoreHorizontal, Pencil, Trash2, Folder, Copy, Share2, Upload, Search, GitMerge } from "lucide-react";
import { ITEM_TYPE_OPTIONS } from "@/tools/password-manager/utils/constants";
import {
	getDomain,
	getInitials,
	getBrandColor,
	formatRelativeTime,
} from "@/tools/password-manager/utils/formatters";
import { getFaviconUrl } from "@/tools/password-manager/utils/favicon";
import ShareFolderModal from "./share-folder-modal";
import { MergeItemsModal } from "./merge-items-modal";
import type { PasswordItem, Folder as FolderType } from "@/tools/password-manager/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteItem } from "@/tools/password-manager/hooks/use-delete-item";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog})),
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

function ItemAvatar({ item }: { item: PasswordItem }) {
	const faviconUrl = getFaviconUrl(item.url || item.metadata?.url || item.metadata?.website);
	const [imgError, setImgError] = useState(false);

	if (faviconUrl && !imgError) {
		return (
			<div className="w-8 h-8 rounded-[10px] border border-border/50 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
				<img
					src={faviconUrl}
					alt=""
					className="w-4 h-4 object-contain"
					onError={() => setImgError(true)}
				/>
			</div>
		);
	}
	// Fallback to colored initials
	return (
		<div
			className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm ${getBrandColor(item.title)}`}
		>
			<span className="text-white text-xs font-bold">
				{getInitials(item.title)}
			</span>
		</div>
	);
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
	const isMobile = useIsMobile();
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const folders = useAppSelector((state) => state.passwordManager?.folders || []);
	const activeFilter = useAppSelector(selectActiveFilter);
	const {
		isDeleteDialogOpen,
		deleteTargetId,
		confirmDelete,
		handleConfirm,
		cancelDelete,
	} = useDeleteItem();
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const activeFolder = folders.find((f: FolderType) => f.id === activeFilter);

	// First apply sidebar filter
	const categoryFiltered = useMemo(() => {
		const items = vault?.items ?? [];
		return items.filter((item: PasswordItem) => {
			if (activeFilter === "all") return true;
			if (activeFilter === "favorites") return item.isFavorite === true;
			if (activeFilter === "recent") return true; // placeholder for recent
			// Filter by folder
			if (item.folderId === activeFilter || item.collectionId === activeFilter)
				return true;
			// Filter by item type
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
				"metadata.email"
			]});
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
		if (target.scrollHeight - target.scrollTop <= target.clientHeight + 200) {
			if (visibleCount < searchFiltered.length) {
				setVisibleCount((prev) => Math.min(prev + 50, searchFiltered.length));
			}
		}
	};

	const columns = useMemo(() => {
		const columnHelper = createColumnHelper<PasswordItem>();
		return [
			columnHelper.display({
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
						className="border-muted-foreground/30 shadow-sm"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
						onClick={(e) => e.stopPropagation()}
						className="border-muted-foreground/30 shadow-sm"
					/>
				),
				enableSorting: false}),
			columnHelper.accessor("title", {
				header: t("tools.password_manager_table_company") as string,
				cell: ({ row }) => {
					const item = row.original;
					const domain = getDomain(item.url || item.metadata?.url || item.metadata?.website);
					const schemaFields = getFieldsForType(item.itemType || "login");
					const subtitleField = schemaFields.find(
						(f) => f.type === "text" || f.type === "email",
					);
					const subtitle =
						subtitleField && item.metadata
							? item.metadata[subtitleField.key]
							: null;

					return (
						<div className="flex items-center gap-3.5">
							<ItemAvatar item={item} />
							<div className="flex flex-col gap-0.5">
								<span className="font-semibold text-foreground tracking-tight">{item.title}</span>
								<span className="text-[13px] text-muted-foreground truncate max-w-50">
									{subtitle || item.username || domain || "No details"}
								</span>
							</div>
						</div>
					);
				}}),
			columnHelper.accessor("updatedAt", {
				header: t("tools.password_manager_table_last_modified") as string,
				cell: ({ getValue }) => (
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{formatRelativeTime(getValue(), t("tools.password_manager_just_now") as string)}
					</span>
				)}),
			...(folders.length > 0 ? [
				columnHelper.accessor("folderId", {
					header: t("tools.password_manager_table_folder") as string,
					cell: ({ getValue }) => {
						const folderId = getValue();
						if (!folderId) return null;
						const folder = folders.find((f: FolderType) => f.id === folderId);
						if (!folder) return null;
						return (
							<Badge variant="outline" className="bg-transparent border-pm-border shadow-none font-medium px-2 py-0.5 text-xs text-foreground/80 rounded-md max-w-30">
								<Folder className="w-3 h-3 mr-1.5 shrink-0 text-muted-foreground" style={{ color: folder.color }} />
								<span className="truncate">{folder.name}</span>
							</Badge>
						);
					}})
			] : []),
			columnHelper.accessor("itemType", {
				header: t("tools.password_manager_table_type") as string,
				cell: ({ getValue }) => {
					const type = getValue() || "login";
					const option = ITEM_TYPE_OPTIONS.find((o) => o.id === type);
					return (
						<Badge variant="outline" className="bg-transparent border-pm-border shadow-none font-medium px-2 py-0.5 text-xs text-foreground/80 rounded-md">
							<span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${option?.color || 'text-gray-500'}`} />
							{option ? t(option.label) : type}
						</Badge>
					);
				}}),
			columnHelper.display({
				id: "actions",
				cell: ({ row }) => {
					const item = row.original;
					return (
						<div className="text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0"
										onClick={(e) => e.stopPropagation()}
									>
										<span className="sr-only">Open menu</span>
										<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40">
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											onEdit(item);
										}}
									>
										<Pencil className="mr-2 h-4 w-4" />
										<span>{t("tools.password_manager_edit")}</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											if (item.password) {
												navigator.clipboard.writeText(item.password);
											}
										}}
										disabled={!item.password}
									>
										<Copy className="mr-2 h-4 w-4" />
										<span>{t("tools.password_manager_copy_password")}</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={(e) => {
											e.stopPropagation();
											confirmDelete(item.id);
										}}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										<span>{t("tools.password_manager_delete")}</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				}}),
		];
	}, [t, folders, onEdit, confirmDelete]);

	const table = useReactTable({
		data: useMemo(() => searchFiltered.slice(0, visibleCount), [searchFiltered, visibleCount]),
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		enableRowSelection: true,
		manualPagination: true,
		state: {
			rowSelection,
		},
		onRowSelectionChange: setRowSelection});

	const selectedItems = table.getSelectedRowModel().rows.map((r) => r.original);
	const hasSelection = selectedItems.length > 0;

	let pageTitle = t("tools.password_manager_all_items");
	if (activeFilter === "favorites") pageTitle = t("tools.password_manager_favorites");
	else if (activeFilter === "recent") pageTitle = t("tools.password_manager_recent");
	else if (activeFilter === "sharing") pageTitle = t("tools.password_manager_sharing_center_title");
	else {
		const typeOpt = ITEM_TYPE_OPTIONS.find((o) => o.id === activeFilter);
		if (typeOpt) pageTitle = t(typeOpt.label);
	}

	return (
		<div className="h-full flex flex-col bg-pm-surface relative">
			{/* Header */}
			<div className="flex items-center justify-between p-6 pb-4">
				<div className="flex items-center gap-3 whitespace-nowrap">
					{isMobile && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => dispatch(setSidebarDrawerOpen(true))}
							className="h-9 w-9 text-muted-foreground hover:text-foreground"
						>
							<Menu className="h-5 w-5" />
						</Button>
					)}
					{hasSelection ? (
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-muted-foreground">
								{selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
							</span>
							{selectedItems.length > 1 && (
								<Button size="sm" variant="secondary" onClick={() => setIsMergeModalOpen(true)}>
									<GitMerge className="w-4 h-4 mr-2" />
									{t("tools.password_manager_merge")}
								</Button>
							)}
						</div>
					) : (
						<h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
					)}
				</div>
				{!hasSelection && onSearchChange && (
					<div className="relative flex-1 max-w-md mx-6 hidden sm:block">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("tools.password_manager_search")}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="w-full bg-background pl-10 border-border rounded-xl h-9 shadow-sm"
						/>
					</div>
				)}
				<div className="flex items-center gap-2 shrink-0">
					{activeFolder && !hasSelection && (
						<Button variant="outline" className="gap-2 h-9 hidden sm:flex" size="sm" onClick={() => setIsShareModalOpen(true)}>
							<Share2 className="h-4 w-4" /> {t("tools.password_manager_share")}
						</Button>
					)}
					<Button variant="outline" className="h-9 gap-2 hidden sm:flex" size="sm" onClick={onImport} disabled={hasSelection}>
						<Upload className="w-4 h-4 mr-1" /> Import
					</Button>
					<Button className="h-9 gap-2" size="sm" onClick={onNewItem} disabled={hasSelection}>
						<span className="mr-1">+</span> <span className="hidden sm:inline">{t("tools.password_manager_new_item")}</span>
					</Button>
				</div>
			</div>

			{/* Mobile search bar if applicable */}
			{!hasSelection && onSearchChange && (
				<div className="sm:hidden px-6 pb-4">
					<div className="relative w-full">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("tools.password_manager_search")}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="w-full bg-background pl-10 border-border rounded-xl h-9 shadow-sm"
						/>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="flex-1 overflow-y-auto px-6 pb-6" onScroll={handleScroll} ref={scrollContainerRef}>
				<div className="rounded-xl border border-pm-border bg-background shadow-sm overflow-hidden">
					<Table>
						<TableHeader className="bg-muted/30 hover:bg-muted/30">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="border-pm-border hover:bg-transparent">
									{headerGroup.headers.map((header) => {
										return (
											<TableHead 
												key={header.id} 
												className={`h-11 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 ${
													header.id === 'select' ? 'w-10 pr-2' : ''
												}`}
											>
												{header.isPlaceholder
													? null
													: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onClick={() => {
											if (hasSelection) {
												row.toggleSelected();
											} else {
												onSelect(row.original);
											}
										}}
										className={`group cursor-pointer border-pm-border/60 transition-colors ${
											row.getIsSelected()
												? "bg-primary/5 hover:bg-primary/5"
												: row.original.id === activeId
													? "bg-pm-row-active hover:bg-pm-row-active"
													: "hover:bg-pm-row-hover"
										}`}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell 
												key={cell.id} 
												className={`py-3 px-4 ${
													cell.column.id === 'select' ? 'w-10 pr-2' : ''
												}`}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow className="hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-32 text-center text-muted-foreground"
									>
										{searchQuery
											? t("tools.password_manager_no_results")
											: t("tools.password_manager_no_passwords")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Bulk Action Bar */}
			<BulkActionBar
				selectedItems={selectedItems}
				folders={folders}
				onClearSelection={() => table.resetRowSelection()}
			/>

			{deleteTargetId && (
				<Suspense fallback={null}>
					<DeleteConfirmDialog
						isOpen={isDeleteDialogOpen}
						onOpenChange={(open) => {
							if (!open) cancelDelete();
						}}
						onConfirm={handleConfirm}
						title={t("tools.password_manager_delete_title")}
						description={t("tools.password_manager_delete_desc")}
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
			<MergeItemsModal
				isOpen={isMergeModalOpen}
				onClose={() => setIsMergeModalOpen(false)}
				items={selectedItems}
				onMerge={(mergedItem, originalItemIds) => {
					dispatch(handleEdit(mergedItem));
					originalItemIds.forEach(id => {
						if (id !== mergedItem.id) {
							dispatch(deleteItem(id));
						}
					});
					setRowSelection({});
				}}
			/>
		</div>
	);
}
