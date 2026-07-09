import { useState } from "react";
import { Check, Pencil, Trash2, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { usePasswordUI } from "@/tools/password-manager/context/password-ui-context";
import { usePassword } from "@/tools/password-manager/context/use-password";
import {
	SIDEBAR_NAV_ITEMS,
	ITEM_TYPE_OPTIONS,
	UI_DEFAULTS,
} from "@/tools/password-manager/utils/constants";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuAction,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroupContent,
	SidebarGroupAction,
} from "@/components/ui/sidebar";
import { Cloud, HardDrive, MoreHorizontal, User } from "lucide-react";
import TextGradient from "@/components/text-gradient";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FolderModal } from "./folder-modal";

interface PasswordSidebarProps {
	onNewItem: (itemType: string) => void;
}

export default function PasswordSidebar({ onNewItem }: PasswordSidebarProps) {
	const { t } = useTranslation();
	const { activeFilter, setActiveFilter } = usePasswordUI();
	const {
		vault,
		setVault,
		isCloudSyncEnabled,
		setIsCloudSyncEnabled,
		isSyncing,
	} = usePassword();
	const { user } = useAuth();

	const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalMode, setFolderModalMode] = useState<
		"create" | "edit" | "delete"
	>("create");
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [folderName, setFolderName] = useState("");
	const [folderColor, setFolderColor] = useState(UI_DEFAULTS.FOLDER_COLOR);

	const folders = vault?.folders || [];

	const handleSaveFolder = (
		name: string,
		color: string,
		deletePasswordsInside = false,
	) => {
		if (folderModalMode === "delete") {
			if (!activeFolderId || !vault) return;
			const newFolders = folders.filter((f) => f.id !== activeFolderId);

			let newItems = vault.items || [];
			if (deletePasswordsInside) {
				newItems = newItems.filter(
					(item) => item.folderId !== activeFolderId,
				);
			} else {
				// Unlink passwords from the deleted folder so they aren't orphaned
				newItems = newItems.map((item) =>
					item.folderId === activeFolderId
						? {
								...item,
								folderId: undefined,
								updatedAt: new Date().toISOString(),
							}
						: item,
				);
			}

			setVault({
				...vault,
				folders: newFolders,
				items: newItems,
				updatedAt: new Date().toISOString(),
			});
			if (activeFilter === activeFolderId) setActiveFilter("all");
			setFolderModalOpen(false);
			return;
		}

		if (!name.trim() || !vault) return;

		if (folderModalMode === "create") {
			const newFolder = {
				id: crypto.randomUUID(),
				name: name.trim(),
				color: color,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setVault({
				...vault,
				folders: [...folders, newFolder],
				updatedAt: new Date().toISOString(),
			});
		} else if (folderModalMode === "edit" && activeFolderId) {
			const newFolders = folders.map((f) =>
				f.id === activeFolderId
					? {
							...f,
							name: name.trim(),
							color: color,
							updatedAt: new Date().toISOString(),
						}
					: f,
			);
			setVault({
				...vault,
				folders: newFolders,
				updatedAt: new Date().toISOString(),
			});
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
										onClick={() => setActiveFilter(item.id)}
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
												setActiveFilter(item.id)
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

				<SidebarGroup>
					<SidebarGroupLabel>
						{t("tools.password_manager_folders")}
					</SidebarGroupLabel>
					<SidebarGroupAction
						title={t("tools.password_manager_add_folder")}
						onClick={() => {
							setFolderModalMode("create");
							setFolderName("");
							setFolderColor(UI_DEFAULTS.FOLDER_COLOR);
							setFolderModalOpen(true);
						}}
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
												isActive={
													activeFilter === folder.id
												}
												onClick={() =>
													setActiveFilter(folder.id)
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
															setFolderModalMode(
																"edit",
															);
															setActiveFolderId(
																folder.id,
															);
															setFolderName(
																folder.name,
															);
															setFolderColor(
																folder.color ||
																	UI_DEFAULTS.FOLDER_COLOR,
															);
															setFolderModalOpen(
																true,
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
															setFolderModalMode(
																"delete",
															);
															setActiveFolderId(
																folder.id,
															);
															setFolderName(
																folder.name,
															);
															setFolderModalOpen(
																true,
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
			</SidebarContent>

			<SidebarFooter className="p-2 border-t border-sidebar-border mt-auto shrink-0">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="w-full justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
										<User className="size-4" />
									</div>
									<div className="flex flex-col gap-0.5 leading-none mr-auto">
										<span className="font-semibold text-sm">
											{user
												? user.username
												: t(
														"tools.password_manager_guest_user",
													)}
										</span>
										<span className="text-xs text-muted-foreground flex items-center gap-1">
											{isCloudSyncEnabled ? (
												<>
													<Cloud className="size-3 text-primary" />{" "}
													{isSyncing ? (
														<TextGradient
															highlightColor="var(--foreground)"
															baseColor="var(--muted-foreground)"
															spread={20}
															duration={2}
															className="font-medium"
														>
															{t(
																"tools.password_manager_syncing",
															)}
														</TextGradient>
													) : (
														t(
															"tools.password_manager_cloud_sync_on",
														)
													)}
												</>
											) : (
												<>
													<HardDrive className="size-3 text-muted-foreground" />{" "}
													{t(
														"tools.password_manager_syncing_locally",
													)}
												</>
											)}
										</span>
									</div>
									<MoreHorizontal className="size-4 text-muted-foreground ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="right"
								align="end"
								sideOffset={4}
								className="w-56"
							>
								<div className="px-2 py-1.5 text-sm font-semibold">
									{t(
										"tools.password_manager_storage_settings",
									)}
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 cursor-pointer"
									onClick={() => setIsCloudSyncEnabled(false)}
								>
									<HardDrive className="size-4 text-muted-foreground" />
									<div className="flex flex-col">
										<span>
											{t(
												"tools.password_manager_local_storage",
											)}
										</span>
										<span className="text-[10px] text-muted-foreground">
											{t(
												"tools.password_manager_local_storage_desc",
											)}
										</span>
									</div>
									{!isCloudSyncEnabled && (
										<Check className="size-4 ml-auto" />
									)}
								</DropdownMenuItem>
								<DropdownMenuItem
									className={`gap-2 cursor-pointer ${!user ? "opacity-50" : ""}`}
									onClick={() => {
										if (user) setIsCloudSyncEnabled(true);
										else
											alert(
												"Please log in to enable Cloud Sync",
											);
									}}
								>
									<Cloud className="size-4 text-muted-foreground" />
									<div className="flex flex-col">
										<span>
											{t(
												"tools.password_manager_cloud_sync",
											)}
										</span>
										<span className="text-[10px] text-muted-foreground">
											{!user
												? t(
														"tools.password_manager_requires_login",
													)
												: t(
														"tools.password_manager_cloud_sync_desc",
													)}
										</span>
									</div>
									{isCloudSyncEnabled && (
										<Check className="size-4 ml-auto" />
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
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
		</div>
	);
}
