import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { FolderActions } from "./folder-actions";
import { FOLDER_ICONS } from "@/tools/password-manager/utils/constants";
import { FolderIcon, GripVertical } from "lucide-react";
import type { Folder } from "@/tools/password-manager/types";
import { Reorder, useDragControls } from "motion/react";

interface FolderListProps {
	folders: Folder[];
	activeFilter: string;
	folderCounts?: Record<string, number>;
	isReorderMode?: boolean;
	onReorderFolders?: (newFolders: Folder[]) => void;
	onSelectFolder: (id: string) => void;
	onEditFolder: (
		id: string,
		name: string,
		color: string,
		iconName?: string,
	) => void;
	onDeleteFolder: (id: string, name: string) => void;
	onShareFolder?: (id: string, name: string) => void;
}

function FolderItemRow({
	folder,
	activeFilter,
	count,
	isReorderMode,
	onSelectFolder,
	onEditFolder,
	onDeleteFolder,
	onShareFolder,
}: {
	folder: Folder;
	activeFilter: string;
	count: number;
	isReorderMode?: boolean;
	onSelectFolder: (id: string) => void;
	onEditFolder: (
		id: string,
		name: string,
		color: string,
		iconName?: string,
	) => void;
	onDeleteFolder: (id: string, name: string) => void;
	onShareFolder?: (id: string, name: string) => void;
}) {
	const dragControls = useDragControls();

	const content = (
		<SidebarMenuItem className="relative select-none list-none">
			<SidebarMenuButton
				isActive={activeFilter === folder.id}
				onClick={() => {
					if (!isReorderMode) onSelectFolder(folder.id);
				}}
				className={`group flex items-center justify-between w-full pr-8 ${isReorderMode ? "cursor-default" : ""}`}
			>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					{folder.collectionId ? (
						<div className="text-primary flex items-center justify-center shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-users h-3.5 w-3.5"
							>
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
					) : (
						(() => {
							const IconComp = folder.iconName
								? FOLDER_ICONS.find(
										(i) => i.id === folder.iconName,
									)?.icon || FolderIcon
								: FolderIcon;
							return (
								<IconComp
									className="w-4 h-4 shrink-0"
									style={{
										color: folder.color,
										fill:
											!folder.iconName ||
											folder.iconName === "folder"
												? folder.color
												: "transparent",
									}}
								/>
							);
						})()
					)}
					<span className="truncate text-sm font-normal">
						{folder.name}
					</span>
				</div>
				{count > 0 && !isReorderMode && (
					<SidebarMenuBadge className="right-7 group-hover/menu-item:opacity-0 group-focus-within/menu-item:opacity-0 transition-opacity">
						{count}
					</SidebarMenuBadge>
				)}
			</SidebarMenuButton>

			{isReorderMode ? (
				<button
					type="button"
					aria-label="Reorder folder"
					onPointerDown={(e) => dragControls.start(e)}
					className="absolute right-1 top-1.5 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-primary cursor-grab active:cursor-grabbing rounded hover:bg-sidebar-accent touch-none"
				>
					<GripVertical className="h-4 w-4" />
				</button>
			) : (
				<FolderActions
					folder={folder}
					onEditFolder={onEditFolder}
					onDeleteFolder={onDeleteFolder}
					onShareFolder={onShareFolder}
				/>
			)}
		</SidebarMenuItem>
	);

	if (isReorderMode) {
		return (
			<Reorder.Item
				value={folder}
				id={folder.id}
				dragListener={false}
				dragControls={dragControls}
				className="relative list-none"
				whileDrag={{
					scale: 1.02,
					boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
					zIndex: 50,
				}}
			>
				{content}
			</Reorder.Item>
		);
	}

	return content;
}

export function FolderList({
	folders,
	activeFilter,
	folderCounts,
	isReorderMode,
	onReorderFolders,
	onSelectFolder,
	onEditFolder,
	onDeleteFolder,
	onShareFolder,
}: FolderListProps) {
	if (folders.length === 0) {
		return (
			<div className="px-3 py-2 text-xs text-muted-foreground/70 italic">
				No folders created yet
			</div>
		);
	}

	if (isReorderMode && onReorderFolders) {
		return (
			<Reorder.Group
				axis="y"
				values={folders}
				onReorder={onReorderFolders}
				className="flex flex-col gap-1 p-0 m-0 list-none"
			>
				{folders.map((folder) => {
					const count = folderCounts?.[folder.id] ?? 0;
					return (
						<FolderItemRow
							key={folder.id}
							folder={folder}
							activeFilter={activeFilter}
							count={count}
							isReorderMode={isReorderMode}
							onSelectFolder={onSelectFolder}
							onEditFolder={onEditFolder}
							onDeleteFolder={onDeleteFolder}
							onShareFolder={onShareFolder}
						/>
					);
				})}
			</Reorder.Group>
		);
	}

	return (
		<SidebarMenu>
			{folders.map((folder) => {
				const count = folderCounts?.[folder.id] ?? 0;
				return (
					<FolderItemRow
						key={folder.id}
						folder={folder}
						activeFilter={activeFilter}
						count={count}
						isReorderMode={false}
						onSelectFolder={onSelectFolder}
						onEditFolder={onEditFolder}
						onDeleteFolder={onDeleteFolder}
						onShareFolder={onShareFolder}
					/>
				);
			})}
		</SidebarMenu>
	);
}
