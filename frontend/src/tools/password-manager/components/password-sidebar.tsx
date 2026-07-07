import { useState } from "react";
import { Check, X, Pencil, Trash2, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { usePasswordUI } from "@/tools/password-manager/context/password-ui-context";
import { usePassword } from "@/tools/password-manager/context/password-context";
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
	const [isAddingFolder, setIsAddingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderColor, setNewFolderColor] = useState(
		UI_DEFAULTS.FOLDER_COLOR,
	);
	const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
	const [editingFolderName, setEditingFolderName] = useState("");
	const [editingFolderColor, setEditingFolderColor] = useState("");

	const folders = vault?.folders || [];

	const handleAddFolder = () => {
		if (!newFolderName.trim() || !vault) return;

		const newFolder = {
			id: crypto.randomUUID(),
			name: newFolderName.trim(),
			color: newFolderColor,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		setVault({
			...vault,
			folders: [...folders, newFolder],
			updatedAt: new Date().toISOString(),
		});

		setNewFolderName("");
		setIsAddingFolder(false);
	};

	const handleEditFolder = (folderId: string) => {
		if (!editingFolderName.trim() || !vault) {
			setEditingFolderId(null);
			return;
		}

		const newFolders = folders.map((f) =>
			f.id === folderId
				? {
						...f,
						name: editingFolderName.trim(),
						color: editingFolderColor,
						updatedAt: new Date().toISOString(),
					}
				: f,
		);

		setVault({
			...vault,
			folders: newFolders,
			updatedAt: new Date().toISOString(),
		});

		setEditingFolderId(null);
	};

	const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!vault) return;

		const newFolders = folders.filter((f) => f.id !== folderId);

		setVault({
			...vault,
			folders: newFolders,
			updatedAt: new Date().toISOString(),
		});

		if (activeFilter === folderId) {
			setActiveFilter("all");
		}
	};

	return (
		<div className="flex flex-col h-full w-full bg-sidebar overflow-hidden">
			<SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar h-[65px] flex items-center justify-center shrink-0">
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
						<ScrollArea className="h-[140px] pr-3">
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
						onClick={() => setIsAddingFolder(true)}
					>
						<Plus />{" "}
						<span className="sr-only">
							{t("tools.password_manager_add_folder")}
						</span>
					</SidebarGroupAction>
					<SidebarGroupContent>
						<ScrollArea className="h-[160px] pr-3">
							<SidebarMenu>
								{isAddingFolder && (
									<SidebarMenuItem>
										<div className="flex items-center gap-2 px-2 py-1 mb-2">
											<input
												type="color"
												value={newFolderColor}
												onChange={(e) =>
													setNewFolderColor(
														e.target.value,
													)
												}
												className="w-6 h-6 border-0 p-0 rounded cursor-pointer shrink-0"
											/>
											<Input
												autoFocus
												value={newFolderName}
												onChange={(e) =>
													setNewFolderName(
														e.target.value,
													)
												}
												placeholder={t(
													"tools.password_manager_new_folder_placeholder",
												)}
												className="h-7 text-xs bg-background border-border px-2"
												onKeyDown={(e) => {
													if (e.key === "Enter")
														handleAddFolder();
													if (e.key === "Escape") {
														setIsAddingFolder(
															false,
														);
														setNewFolderName("");
													}
												}}
											/>
											<Button
												size="icon"
												variant="ghost"
												className="h-7 w-7"
												onClick={handleAddFolder}
											>
												<Check className="h-3 w-3 text-green-500" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												className="h-7 w-7"
												onClick={() =>
													setIsAddingFolder(false)
												}
											>
												<X className="h-3 w-3 text-destructive" />
											</Button>
										</div>
									</SidebarMenuItem>
								)}

								{folders.map((folder) => (
									<SidebarMenuItem key={folder.id}>
										{editingFolderId === folder.id ? (
											<div className="flex items-center gap-2 px-2 py-1 w-full">
												<input
													type="color"
													value={editingFolderColor}
													onChange={(e) =>
														setEditingFolderColor(
															e.target.value,
														)
													}
													className="w-6 h-6 border-0 p-0 rounded cursor-pointer shrink-0"
												/>
												<Input
													autoFocus
													value={editingFolderName}
													onChange={(e) =>
														setEditingFolderName(
															e.target.value,
														)
													}
													className="h-7 text-xs bg-background border-border px-2"
													onKeyDown={(e) => {
														if (e.key === "Enter")
															handleEditFolder(
																folder.id,
															);
														if (e.key === "Escape")
															setEditingFolderId(
																null,
															);
													}}
												/>
												<Button
													size="icon"
													variant="ghost"
													className="h-7 w-7"
													onClick={() =>
														handleEditFolder(
															folder.id,
														)
													}
												>
													<Check className="h-3 w-3 text-green-500" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="h-7 w-7"
													onClick={() =>
														setEditingFolderId(null)
													}
												>
													<X className="h-3 w-3 text-destructive" />
												</Button>
											</div>
										) : (
											<>
												<SidebarMenuButton
													isActive={
														activeFilter ===
														folder.id
													}
													onClick={() =>
														setActiveFilter(
															folder.id,
														)
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
														<span>
															{folder.name}
														</span>
													</div>
												</SidebarMenuButton>

												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
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
																setEditingFolderId(
																	folder.id,
																);
																setEditingFolderName(
																	folder.name,
																);
																setEditingFolderColor(
																	folder.color ||
																		"#8b5cf6",
																);
															}}
														>
															<Pencil className="mr-2 h-4 w-4" />
															{t(
																"tools.password_manager_edit",
															)}
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-destructive focus:bg-destructive/10 focus:text-destructive"
															onClick={(e) =>
																handleDeleteFolder(
																	folder.id,
																	e as unknown as React.MouseEvent,
																)
															}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															{t("remove")}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</>
										)}
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
													{t(
														"tools.password_manager_cloud_sync_on",
													)}{" "}
													{isSyncing &&
														` (${t("tools.password_manager_syncing")})`}
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
				<DialogContent className="sm:max-w-md bg-background">
					<DialogHeader>
						<DialogTitle>
							{t(
								"tools.password_manager_select_type",
								"Select Item Type",
							)}
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
		</div>
	);
}
