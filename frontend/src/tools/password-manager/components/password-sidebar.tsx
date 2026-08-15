import { useState } from "react";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "../store";
import {
	selectActiveFilter,
	selectIsCloudSyncEnabled,
	selectIsSyncing,
	setActiveFilter,
	setCloudSyncEnabled,
	selectMergedFolders,
} from "../store/password-slice";
import { useFolderMutations } from "@/tools/password-manager/hooks/use-folder-mutations";
import {
	SIDEBAR_NAV_ITEMS,
	ITEM_TYPE_OPTIONS,
	UI_DEFAULTS,
} from "@/tools/password-manager/utils/constants";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarHeader,
	SidebarContent,
	SidebarGroupContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

import { FolderModal, type FolderModalMode } from "./folder-modal";
import { FolderList } from "./sidebar/folder-list";
import { SettingsMenu } from "./sidebar/settings-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShareFolderModal from "./share-folder-modal";
export default function PasswordSidebar() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const activeFilter = useAppSelector(selectActiveFilter);
	const isCloudSyncEnabled = useAppSelector(selectIsCloudSyncEnabled);
	const isSyncing = useAppSelector(selectIsSyncing);
	const { user } = useAuth();

	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalMode, setFolderModalMode] =
		useState<FolderModalMode>("create");
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [folderName, setFolderName] = useState("");
	const [folderColor, setFolderColor] = useState(UI_DEFAULTS.FOLDER_COLOR);
	const [folderIcon, setFolderIcon] = useState("folder");
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const folders = useAppSelector(selectMergedFolders) || [];

	const { createFolder, editFolder, deleteFolder } = useFolderMutations();

	const handleSaveFolder = (
		name: string,
		color: string,
		iconName: string,
		deletePasswordsInside = false,
	) => {
		if (folderModalMode === "delete") {
			if (!activeFolderId) return;
			deleteFolder(activeFolderId, deletePasswordsInside);
			setFolderModalOpen(false);
			return;
		}

		if (folderModalMode === "create") {
			createFolder(name, color, iconName);
		} else if (folderModalMode === "edit" && activeFolderId) {
			editFolder(activeFolderId, name, color, iconName);
		}

		setFolderModalOpen(false);
	};

	return (
		<div className="flex flex-col h-full w-full bg-sidebar overflow-hidden">
			<SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar h-16.25 flex items-center justify-center shrink-0">
				<div className="flex items-center gap-2 w-full pl-2">
					<div className="bg-primary/20 p-1.5 rounded-lg flex items-center justify-center text-primary">
						<Shield className="h-5 w-5" />
					</div>
					<span className="font-semibold text-sm text-foreground">
						Snipit Vault
					</span>
				</div>
			</SidebarHeader>

			<SidebarContent className="flex-1 overflow-y-clip no-scrollbar flex flex-col bg-sidebar pt-4">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{SIDEBAR_NAV_ITEMS.map((item) => (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										isActive={activeFilter === item.id}
										onClick={() =>
											dispatch(setActiveFilter(item.id))
										}
										tooltip={t(item.label)}
									>
										<item.icon />
										<span>{t(item.label)}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupContent>
						<ScrollArea className="h-35 pr-3 fade-y">
							<SidebarMenu>
								{ITEM_TYPE_OPTIONS.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											isActive={activeFilter === item.id}
											onClick={() =>
												dispatch(
													setActiveFilter(item.id),
												)
											}
											tooltip={t(item.label)}
										>
											<item.icon className={item.color} />
											<span className="truncate">
												{t(item.label)}
											</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</ScrollArea>
					</SidebarGroupContent>
				</SidebarGroup>

				<FolderList
					folders={folders}
					activeFilter={activeFilter}
					onSelectFolder={(id) => dispatch(setActiveFilter(id))}
					onAddFolder={() => {
						setFolderModalMode("create");
						setFolderName("");
						setFolderColor(UI_DEFAULTS.FOLDER_COLOR);
						setFolderIcon("folder");
						setFolderModalOpen(true);
					}}
					onEditFolder={(id, name, color, iconName) => {
						setFolderModalMode("edit");
						setActiveFolderId(id);
						setFolderName(name);
						setFolderColor(color || UI_DEFAULTS.FOLDER_COLOR);
						setFolderIcon(iconName || "folder");
						setFolderModalOpen(true);
					}}
					onDeleteFolder={(id, name) => {
						setFolderModalMode("delete");
						setActiveFolderId(id);
						setFolderName(name);
						setFolderModalOpen(true);
					}}
					onShareFolder={(id, name) => {
						setActiveFolderId(id);
						setFolderName(name);
						setShareModalOpen(true);
					}}
				/>
			</SidebarContent>

			<SidebarFooter className="p-2 border-t border-sidebar-border mt-auto shrink-0">
				<SettingsMenu
					user={user}
					isCloudSyncEnabled={isCloudSyncEnabled}
					isSyncing={isSyncing}
					onSetCloudSync={(enabled) =>
						dispatch(setCloudSyncEnabled(enabled))
					}
				/>
			</SidebarFooter>

			<FolderModal
				open={folderModalOpen}
				onOpenChange={setFolderModalOpen}
				mode={folderModalMode}
				initialFolderName={folderName}
				initialFolderColor={folderColor}
				initialFolderIcon={folderIcon}
				onSave={handleSaveFolder}
				onDelete={(deletePasswords) =>
					handleSaveFolder("", "", "", deletePasswords)
				}
			/>
			{activeFolderId && (
				<ShareFolderModal
					isOpen={shareModalOpen}
					onClose={() => setShareModalOpen(false)}
					folderId={activeFolderId}
					folderName={folderName}
				/>
			)}
		</div>
	);
}
