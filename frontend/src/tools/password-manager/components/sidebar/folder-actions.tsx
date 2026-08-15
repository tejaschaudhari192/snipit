import { useTranslation } from "react-i18next";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import type { Folder } from "@/tools/password-manager/types";

interface FolderActionsProps {
	folder: Folder;
	onEditFolder: (
		id: string,
		name: string,
		color: string,
		iconName?: string,
	) => void;
	onDeleteFolder: (id: string, name: string) => void;
	onShareFolder?: (id: string, name: string) => void;
}

export function FolderActions({
	folder,
	onEditFolder,
	onDeleteFolder,
	onShareFolder,
}: FolderActionsProps) {
	const { t } = useTranslation();

	if (folder.isVirtual) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuAction
						showOnHover
						className="hover:bg-accent hover:text-accent-foreground"
					>
						<MoreHorizontal className="h-4 w-4" />
					</SidebarMenuAction>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent side="right" align="start">
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						onEditFolder(
							folder.id,
							folder.name,
							folder.color,
							folder.iconName,
						);
					}}
				>
					<Pencil className="mr-2 h-4 w-4" />
					<span>{t("common.actions.edit")}</span>
				</DropdownMenuItem>
				{!folder.collectionId && onShareFolder && (
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							onShareFolder(folder.id, folder.name);
						}}
					>
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
							className="lucide lucide-share2 mr-2 h-4 w-4"
						>
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
							<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
						</svg>
						<span>Share Folder</span>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					onClick={(e) => {
						e.stopPropagation();
						onDeleteFolder(folder.id, folder.name);
					}}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					{t("common.actions.remove")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
