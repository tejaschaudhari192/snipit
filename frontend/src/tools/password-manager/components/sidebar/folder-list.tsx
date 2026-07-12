import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarGroupAction,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Folder {
	id: string;
	name: string;
	color: string;
}

interface FolderListProps {
	folders: Folder[];
	activeFilter: string;
	onSelectFolder: (id: string) => void;
	onAddFolder: () => void;
	onEditFolder: (id: string, name: string, color: string) => void;
	onDeleteFolder: (id: string, name: string) => void;
}

export function FolderList({
	folders,
	activeFilter,
	onSelectFolder,
	onAddFolder,
	onEditFolder,
	onDeleteFolder,
}: FolderListProps) {
	const { t } = useTranslation();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>
				{t("tools.password_manager_folders")}
			</SidebarGroupLabel>
			<SidebarGroupAction
				title={t("tools.password_manager_add_folder")}
				onClick={onAddFolder}
			>
				<Plus />{" "}
				<span className="sr-only">
					{t("tools.password_manager_add_folder")}
				</span>
			</SidebarGroupAction>
			<SidebarGroupContent>
				<ScrollArea className="h-40 pr-3">
					<SidebarMenu>
						{folders.map((folder) => (
							<SidebarMenuItem key={folder.id}>
								<>
									<SidebarMenuButton
										isActive={activeFilter === folder.id}
										onClick={() =>
											onSelectFolder(folder.id)
										}
										className="group flex justify-between w-full"
									>
										<div className="flex items-center gap-2">
											<div
												className="w-2 h-2 rounded-full"
												style={{
													backgroundColor:
														folder.color,
												}}
											/>
											<span>{folder.name}</span>
										</div>
									</SidebarMenuButton>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction
												showOnHover
												className="hover:bg-accent hover:text-accent-foreground"
											>
												<MoreHorizontal className="h-4 w-4" />
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											side="right"
											align="start"
										>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onEditFolder(
														folder.id,
														folder.name,
														folder.color,
													);
												}}
											>
												<Pencil className="mr-2 h-4 w-4" />
												<span>{t("edit")}</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive focus:text-destructive"
												onClick={(e) => {
													e.stopPropagation();
													onDeleteFolder(
														folder.id,
														folder.name,
													);
												}}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												{t("remove")}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</ScrollArea>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
