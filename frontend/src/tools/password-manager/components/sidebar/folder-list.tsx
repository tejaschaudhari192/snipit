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

import type { Folder } from "@/tools/password-manager/types";

interface FolderListProps {
	folders: Folder[];
	activeFilter: string;
	onSelectFolder: (id: string) => void;
	onAddFolder: () => void;
	onEditFolder: (id: string, name: string, color: string) => void;
	onDeleteFolder: (id: string, name: string) => void;
	onShareFolder?: (id: string, name: string) => void;
}

export function FolderList({
	folders,
	activeFilter,
	onSelectFolder,
	onAddFolder,
	onEditFolder,
	onDeleteFolder,
	onShareFolder,
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
											{folder.collectionId ? (
												<div className="text-primary flex items-center justify-center shrink-0">
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-3.5 w-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
												</div>
											) : (
												<div
													className="w-2 h-2 rounded-full shrink-0"
													style={{
														backgroundColor: folder.color,
													}}
												/>
											)}
											<span className="truncate">{folder.name}</span>
										</div>
									</SidebarMenuButton>

									{!folder.isVirtual && (
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
												{!folder.collectionId && onShareFolder && (
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															onShareFolder(
																folder.id,
																folder.name
															);
														}}
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 mr-2 h-4 w-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
														<span>Share Folder</span>
													</DropdownMenuItem>
												)}
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
									)}
								</>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</ScrollArea>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
