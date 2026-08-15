import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FolderIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarGroupAction,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FolderActions } from "./folder-actions";
import { FOLDER_ICONS } from "@/tools/password-manager/utils/constants";

import type { Folder } from "@/tools/password-manager/types";

interface FolderListProps {
	folders: Folder[];
	activeFilter: string;
	onSelectFolder: (id: string) => void;
	onAddFolder: () => void;
	onEditFolder: (
		id: string,
		name: string,
		color: string,
		iconName?: string,
	) => void;
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
				{t("tools.password_manager.folders")}
			</SidebarGroupLabel>
			<SidebarGroupAction
				title={t("tools.password_manager.add_folder")}
				onClick={onAddFolder}
			>
				<Plus />{" "}
				<span className="sr-only">
					{t("tools.password_manager.add_folder")}
				</span>
			</SidebarGroupAction>
			<SidebarGroupContent>
				<ScrollArea className="h-40 pr-3 fade-y">
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
														<circle
															cx="9"
															cy="7"
															r="4"
														/>
														<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
														<path d="M16 3.13a4 4 0 0 1 0 7.75" />
													</svg>
												</div>
											) : (
												(() => {
													const IconComp =
														folder.iconName
															? FOLDER_ICONS.find(
																	(i) =>
																		i.id ===
																		folder.iconName,
																)?.icon ||
																FolderIcon
															: FolderIcon;
													return (
														<IconComp
															className="w-4 h-4 shrink-0"
															style={{
																color: folder.color,
																fill:
																	!folder.iconName ||
																	folder.iconName ===
																		"folder"
																		? folder.color
																		: "transparent",
															}}
														/>
													);
												})()
											)}
											<span className="truncate">
												{folder.name}
											</span>
										</div>
									</SidebarMenuButton>

									<FolderActions
										folder={folder}
										onEditFolder={onEditFolder}
										onDeleteFolder={onDeleteFolder}
										onShareFolder={onShareFolder}
									/>
								</>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</ScrollArea>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
