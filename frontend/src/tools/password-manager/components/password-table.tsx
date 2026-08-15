import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Folder, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/utils";
import { ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ItemAvatar } from "./item-avatar";
import { ItemActions } from "./item-actions";
import type {
	PasswordItem,
	Folder as FolderType,
} from "@/tools/password-manager/types";
import {
	ITEM_TYPE_OPTIONS,
	FOLDER_ICONS,
} from "@/tools/password-manager/utils/constants";
import {
	getDomain,
	formatRelativeTime,
} from "@/tools/password-manager/utils/formatters";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";

interface PasswordTableProps {
	data: PasswordItem[];
	folders: FolderType[];
	activeId: string | null;
	searchQuery: string;
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: (
		selection:
			| Record<string, boolean>
			| ((prev: Record<string, boolean>) => Record<string, boolean>),
	) => void;
	onSelect: (item: PasswordItem) => void;
	onEdit: (item: PasswordItem) => void;
	onDelete: (id: string) => void;
	visibleCount: number;
}

export function PasswordTable({
	data,
	folders,
	activeId,
	searchQuery,
	rowSelection,
	onRowSelectionChange,
	onSelect,
	onEdit,
	onDelete,
	visibleCount,
}: PasswordTableProps) {
	const { t } = useTranslation();

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
				enableSorting: false,
			}),
			columnHelper.accessor("title", {
				header: t("tools.password_manager.table_company") as string,
				cell: ({ row }) => {
					const item = row.original;
					const domain = getDomain(
						item.url ||
							item.metadata?.url ||
							item.metadata?.website,
					);
					const schemaFields = getFieldsForType(
						item.itemType || "login",
					);
					const subtitleField = schemaFields.find(
						(f) =>
							(f.type === "text" || f.type === "email") &&
							item.metadata?.[f.key],
					);
					const subtitle =
						subtitleField && item.metadata
							? item.metadata[subtitleField.key]
							: null;

					return (
						<div className="flex items-center gap-3.5">
							<ItemAvatar item={item} />
							<ItemContent className="gap-0.5">
								<ItemTitle className="font-semibold text-foreground tracking-tight">
									{item.title}
								</ItemTitle>
								<ItemDescription className="text-[13px] truncate max-w-50">
									{item.username ||
										subtitle ||
										domain ||
										"No details"}
								</ItemDescription>
							</ItemContent>
						</div>
					);
				},
			}),
			columnHelper.accessor("updatedAt", {
				header: t(
					"tools.password_manager.table_last_modified",
				) as string,
				cell: ({ getValue }) => (
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{formatRelativeTime(
							getValue(),
							t("tools.password_manager.just_now") as string,
						)}
					</span>
				),
			}),
			...(folders.length > 0
				? [
						columnHelper.accessor("folderId", {
							header: t(
								"tools.password_manager.table_folder",
							) as string,
							cell: ({ getValue }) => {
								const folderId = getValue();
								if (!folderId) return null;
								const folder = folders.find(
									(f: FolderType) => f.id === folderId,
								);
								if (!folder) return null;
								const IconComp = folder.iconName
									? FOLDER_ICONS.find(
											(i) => i.id === folder.iconName,
										)?.icon || Folder
									: Folder;
								return (
									<Badge
										variant="outline"
										className="bg-transparent border-pm-border shadow-none font-medium px-2 py-0.5 text-xs text-foreground/80 rounded-md max-w-30"
									>
										<IconComp
											className="w-3 h-3 mr-1.5 shrink-0 text-muted-foreground"
											style={{
												color: folder.color,
												fill:
													!folder.iconName ||
													folder.iconName === "folder"
														? folder.color
														: "transparent",
											}}
										/>
										<span className="truncate">
											{folder.name}
										</span>
									</Badge>
								);
							},
						}),
					]
				: []),
			columnHelper.accessor("itemType", {
				header: t("tools.password_manager.table_type") as string,
				cell: ({ getValue }) => {
					const type = getValue() || "login";
					const option = ITEM_TYPE_OPTIONS.find((o) => o.id === type);
					return (
						<Badge
							variant="outline"
							className="bg-transparent border-pm-border shadow-none font-medium px-2 py-0.5 text-xs text-foreground/80 rounded-md"
						>
							{option && option.icon ? (
								<option.icon
									className={`w-3 h-3 mr-1.5 shrink-0 ${option.color}`}
								/>
							) : (
								<span
									className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${option?.color || "text-gray-500"}`}
								/>
							)}
							{option ? t(option.label) : type}
						</Badge>
					);
				},
			}),
			columnHelper.display({
				id: "actions",
				cell: ({ row }) => {
					const item = row.original;
					return (
						<div className="text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
							<ItemActions
								item={item}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						</div>
					);
				},
			}),
		];
	}, [t, folders, onEdit, onDelete]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		enableRowSelection: true,
		manualPagination: true,
		state: {
			rowSelection,
		},
		initialState: {
			sorting: [{ id: "updatedAt", desc: true }],
		},
		onRowSelectionChange,
	});

	const hasSelection = Object.keys(rowSelection).length > 0;

	return (
		<div className="rounded-xl border border-pm-border bg-background shadow-sm overflow-hidden">
			<Table>
				<TableHeader className="bg-muted/30 hover:bg-muted/30">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="border-pm-border hover:bg-transparent"
						>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										className={`h-11 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 ${
											header.id === "select"
												? "w-10 pr-2"
												: ""
										}`}
									>
										{header.isPlaceholder ? null : (
											<div
												className={cn(
													"flex items-center",
													header.column.getCanSort()
														? "cursor-pointer select-none hover:text-foreground"
														: "",
												)}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
												{{
													asc: (
														<ArrowUp className="w-3 h-3 ml-1" />
													),
													desc: (
														<ArrowDown className="w-3 h-3 ml-1" />
													),
												}[
													header.column.getIsSorted() as string
												] ?? null}
											</div>
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table
							.getRowModel()
							.rows.slice(0, visibleCount)
							.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
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
												cell.column.id === "select"
													? "w-10 pr-2"
													: ""
											}`}
											onClick={(e) => {
												if (
													cell.column.id === "select"
												) {
													e.stopPropagation();
												}
											}}
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
									? t("tools.password_manager.no_results")
									: t("tools.password_manager.no_passwords")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
