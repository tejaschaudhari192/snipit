import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
import { Shield } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FolderModal, type FolderModalMode } from "./folder-modal";
import { FolderList } from "./sidebar/folder-list";
import { SettingsMenu } from "./sidebar/settings-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShareFolderModal from "./share-folder-modal";

interface PasswordSidebarProps {
	onNewItem: (itemType: string) => void;
}

export default function PasswordSidebar({ onNewItem }: PasswordSidebarProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const activeFilter = useAppSelector(selectActiveFilter);
	const isCloudSyncEnabled = useAppSelector(selectIsCloudSyncEnabled);
	const isSyncing = useAppSelector(selectIsSyncing);
	const { user } = useAuth();

	const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>("create");
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [folderName, setFolderName] = useState("");
	const [folderColor, setFolderColor] = useState(UI_DEFAULTS.FOLDER_COLOR);
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const folders = useAppSelector(selectMergedFolders) || [];

	const { createFolder, editFolder, deleteFolder } = useFolderMutations();

	const handleSaveFolder = (
		name: string,
		color: string,
		deletePasswordsInside = false,
	) => {
		if (folderModalMode === "delete") {
			if (!activeFolderId) return;
			deleteFolder(activeFolderId, deletePasswordsInside);
			setFolderModalOpen(false);
			return;
		}

		if (folderModalMode === "create") {
			createFolder(name, color);
		} else if (folderModalMode === "edit" && activeFolderId) {
			editFolder(activeFolderId, name, color);
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

			<SidebarContent className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-sidebar">
				<div className="p-4 pb-0">
					<Button
						onClick={() => setIsTypeDialogOpen(true)}
						className="w-full gap-2 shadow-sm"
						variant="default"
					>
						<Plus className="h-4 w-4" />
						{t("tools.password_manager_new_item")}
					</Button>
				</div>
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
						<ScrollArea className="h-35 pr-3">
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
						setFolderModalOpen(true);
					}}
					onEditFolder={(id, name, color) => {
						setFolderModalMode("edit");
						setActiveFolderId(id);
						setFolderName(name);
						setFolderColor(color || UI_DEFAULTS.FOLDER_COLOR);
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

			<Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
				<DialogContent
					className="sm:max-w-md bg-background"
					aria-describedby={undefined}
				>
					<DialogHeader>
						<DialogTitle>
							{t("tools.password_manager_select_type")}
						</DialogTitle>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-3 py-4">
						{ITEM_TYPE_OPTIONS.map((item) => (
							<Button
								key={item.id}
								variant="outline"
								className="h-auto flex flex-col items-center justify-center p-4 gap-2 hover:bg-muted/50 border-border"
								onClick={() => {
									setIsTypeDialogOpen(false);
									onNewItem(item.id);
								}}
							>
								<item.icon
									className={`h-6 w-6 ${item.color}`}
								/>
								<span className="text-sm font-medium">
									{t(item.label)}
								</span>
							</Button>
						))}
					</div>
				</DialogContent>
			</Dialog>
			<FolderModal
				open={folderModalOpen}
				onOpenChange={setFolderModalOpen}
				mode={folderModalMode}
				initialFolderName={folderName}
				initialFolderColor={folderColor}
				onSave={handleSaveFolder}
				onDelete={(deletePasswords) =>
					handleSaveFolder("", "", deletePasswords)
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
