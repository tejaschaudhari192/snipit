import React, { useState } from "react";
import { Folder, ChevronRight, ChevronDown, Plus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFolders } from "@/context/FolderContext";
import { CreateFolderDialog } from "@/components/profile/create-folder-dialog";
import { cn } from "@/utils/index";

export interface FolderTreeListProps {
	folderId?: string | null;
	setFolderId?: (id: string | null) => void;
	disableFolderId?: string; // e.g. when moving a folder, disable itself and descendants
	className?: string;
	onSelect?: () => void;
}

export const FolderTreeList: React.FC<FolderTreeListProps> = ({
	folderId,
	setFolderId,
	disableFolderId,
	className,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { folders, getHierarchicalOptions } = useFolders();
	const [expandedFolders, setExpandedFolders] = useState<
		Record<string, boolean>
	>({});
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [createDialogParentId, setCreateDialogParentId] = useState<
		string | null
	>(null);

	const folderOptions = getHierarchicalOptions(expandedFolders);

	const handleCreateClick = (
		e: React.MouseEvent,
		parentId: string | null,
	) => {
		e.stopPropagation();
		e.preventDefault();
		setCreateDialogParentId(parentId);
		setCreateDialogOpen(true);
		if (parentId) {
			setExpandedFolders((prev) => ({
				...prev,
				[parentId]: true,
			}));
		}
	};

	const isFolderDisabled = (fId: string) => {
		if (!disableFolderId) return false;
		if (fId === disableFolderId) return true;
		const f = folders.find((folder) => folder._id === fId);
		if (f && f.path.includes(`,${disableFolderId},`)) return true;
		return false;
	};

	return (
		<div className={cn("max-h-60 overflow-y-auto w-full", className)}>
			{/* Root Option */}
			<button
				type="button"
				onClick={() => {
					setFolderId?.(null);
					onSelect?.();
				}}
				className={cn(
					"w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer transition-colors duration-150 group/item",
					!folderId
						? "bg-primary/10 text-primary"
						: "text-foreground/80 hover:bg-primary/5 hover:text-primary",
				)}
			>
				<div className="flex items-center gap-2">
					<Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
					<span>{t("profile.root_no_folder")}</span>
				</div>
				<div className="flex items-center gap-1">
					{!folderId && (
						<Check className="w-3.5 h-3.5 text-primary shrink-0" />
					)}
					<div
						onClick={(e) => handleCreateClick(e, null)}
						className="p-1 rounded-md text-muted-foreground/60 hover:text-primary hover:bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer"
						title={t("profile.enter_folder_name")}
					>
						<Plus className="w-3 h-3" />
					</div>
				</div>
			</button>

			{folderOptions.map((f) => {
				const isSelected = folderId === f._id;
				const isExpanded = !!expandedFolders[f._id];
				const disabled = isFolderDisabled(f._id);

				return (
					<button
						key={f._id}
						type="button"
						disabled={disabled}
						onClick={() => {
							if (!disabled) {
								setFolderId?.(f._id);
								onSelect?.();
							}
						}}
						className={cn(
							"w-full text-left py-2 pr-3 rounded-lg text-xs font-bold flex items-center justify-between transition-colors duration-150 group/item",
							isSelected
								? "bg-primary/10 text-primary font-bold"
								: "text-foreground/80 hover:bg-primary/5 hover:text-primary",
							disabled &&
								"opacity-50 cursor-not-allowed hover:bg-transparent hover:text-foreground/80",
						)}
						style={{ paddingLeft: `${f.depth * 14 + 6}px` }}
					>
						<div className="flex items-center gap-1.5 min-w-0 flex-1">
							{/* Toggle Expand Arrow */}
							<div
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									setExpandedFolders((prev) => ({
										...prev,
										[f._id]: !prev[f._id],
									}));
								}}
								className={cn(
									"w-4 h-4 flex items-center justify-center rounded text-muted-foreground/60 hover:bg-muted shrink-0 cursor-pointer",
									f.hasChildren
										? "opacity-100"
										: "opacity-0 pointer-events-none",
								)}
							>
								{isExpanded ? (
									<ChevronDown className="w-3 h-3" />
								) : (
									<ChevronRight className="w-3 h-3" />
								)}
							</div>

							<Folder
								className="w-3.5 h-3.5 shrink-0"
								style={{
									color:
										f.color ||
										(isSelected
											? "currentColor"
											: "var(--color-primary)"),
								}}
							/>
							<span className="truncate">{f.name}</span>
						</div>

						{/* Selected Checkmark & Hover Actions */}
						<div className="flex items-center gap-1 shrink-0">
							{isSelected && (
								<Check className="w-3.5 h-3.5 text-primary shrink-0" />
							)}
							{!disabled && (
								<div
									onClick={(e) => handleCreateClick(e, f._id)}
									className="p-1 rounded-md text-muted-foreground/60 hover:text-primary hover:bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer shrink-0"
									title={t("profile.enter_subfolder_name", {
										name: f.name,
									})}
								>
									<Plus className="w-3 h-3" />
								</div>
							)}
						</div>
					</button>
				);
			})}

			<CreateFolderDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				parentId={createDialogParentId}
			/>
		</div>
	);
};
