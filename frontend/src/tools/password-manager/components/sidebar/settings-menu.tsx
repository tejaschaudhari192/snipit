import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	User,
	Cloud,
	HardDrive,
	MoreHorizontal,
	Check,
	Trash2,
} from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemMedia,
} from "@/components/ui/item";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { removeKeyRecord, removeRecoveryRecord } from "../../utils/indexed-db";
import { resetVault, selectUserId } from "../../store/password-slice";
import { useAppDispatch, useAppSelector } from "../../store";
import { toast } from "@/components/ui/toast";

interface SettingsMenuProps {
	user: { username: string } | null;
	isCloudSyncEnabled: boolean;
	isSyncing: boolean;
	onSetCloudSync: (enabled: boolean) => void;
}

export function SettingsMenu({
	user,
	isCloudSyncEnabled,
	isSyncing,
	onSetCloudSync,
}: SettingsMenuProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const userId = useAppSelector(selectUserId);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteVault = async () => {
		try {
			setIsDeleting(true);
			// 1. Delete from cloud
			if (user) {
				await api.delete("/tools/password-manager/vault");
			}
			// 2. Clear local data
			if (userId) {
				await removeKeyRecord(userId);
				await removeRecoveryRecord(userId);
			}
			// 3. Reset state
			dispatch(resetVault());
			toast.add({
				title: t("tools.password_manager.vault_deleted"),
				type: "success",
			});
		} catch (error) {
			toast.add({
				title: t("tools.password_manager.delete_vault.failed"),
				type: "error",
			});
			console.error(error);
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton
									size="lg"
									className="w-full justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
								/>
							}
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
								<User className="size-4" />
							</div>
							<div className="flex flex-col gap-0.5 leading-none mr-auto">
								<span className="font-semibold text-sm">
									{user
										? user.username
										: t(
												"tools.password_manager.guest_user",
											)}
								</span>
								<span className="text-xs text-muted-foreground flex items-center gap-1">
									{isCloudSyncEnabled ? (
										<>
											<Cloud className="size-3 text-primary" />{" "}
											{isSyncing ? (
												<span
													style={
														{
															"--highlight-color":
																"var(--foreground)",
															"--base-color":
																"var(--muted-foreground)",
															"--spread": "20px",
															"--duration": "2s",
														} as React.CSSProperties
													}
													className="shimmer font-medium"
												>
													{t(
														"tools.password_manager.syncing",
													)}
												</span>
											) : (
												t(
													"tools.password_manager.cloud_sync_on",
												)
											)}
										</>
									) : (
										<>
											<HardDrive className="size-3 text-muted-foreground" />{" "}
											{t(
												"tools.password_manager.syncing_locally",
											)}
										</>
									)}
								</span>
							</div>
							<MoreHorizontal className="size-4 text-muted-foreground ml-auto" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="right"
							align="end"
							sideOffset={4}
							className="w-64 p-2"
						>
							<div className="px-2 py-1.5 text-sm font-semibold text-foreground/80">
								{t("tools.password_manager.storage_settings")}
							</div>
							<DropdownMenuSeparator className="my-1" />
							<DropdownMenuItem
								className="gap-3 cursor-pointer rounded-md p-2 transition-colors focus:bg-accent"
								onClick={() => onSetCloudSync(false)}
							>
								<ItemMedia
									variant="icon"
									className="bg-muted p-2 rounded-md"
								>
									<HardDrive className="text-muted-foreground" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>
										{t(
											"tools.password_manager.local_storage",
										)}
									</ItemTitle>
									<ItemDescription className="text-[10px] leading-tight">
										{t(
											"tools.password_manager.local_storage_desc",
										)}
									</ItemDescription>
								</ItemContent>
								{!isCloudSyncEnabled && (
									<Check className="size-4 text-primary ml-auto" />
								)}
							</DropdownMenuItem>
							<DropdownMenuItem
								className={`gap-3 cursor-pointer rounded-md p-2 transition-colors focus:bg-accent ${!user ? "opacity-50" : ""}`}
								onClick={() => {
									if (user) onSetCloudSync(true);
									else
										toast.add({
											title: t(
												"tools.password_manager.requires_login",
											),
											type: "error",
										});
								}}
							>
								<ItemMedia
									variant="icon"
									className="bg-muted p-2 rounded-md"
								>
									<Cloud className="text-muted-foreground" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>
										{t("tools.password_manager.cloud_sync")}
									</ItemTitle>
									<ItemDescription className="text-[10px] leading-tight">
										{!user
											? t(
													"tools.password_manager.requires_login",
												)
											: t(
													"tools.password_manager.cloud_sync_desc",
												)}
									</ItemDescription>
								</ItemContent>
								{isCloudSyncEnabled && (
									<Check className="size-4 text-primary ml-auto" />
								)}
							</DropdownMenuItem>

							<div className="mt-2 pt-2 border-t border-border/50">
								<div className="px-2 py-1 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									{t("tools.password_manager.danger_zone")}
								</div>
								<DropdownMenuItem
									className="gap-3 cursor-pointer rounded-md p-2 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
									onClick={() => setIsDeleteDialogOpen(true)}
								>
									<ItemMedia
										variant="icon"
										className="bg-destructive/10 p-2 rounded-md text-destructive"
									>
										<Trash2 />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>
											{t(
												"tools.password_manager.delete_vault.title",
											)}
										</ItemTitle>
									</ItemContent>
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent className="border-destructive/20">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive flex items-center gap-2">
							<Trash2 className="size-5" />
							{t(
								"tools.password_manager.delete_vault.confirm_title",
							)}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-base text-foreground/80 mt-2">
							<span
								dangerouslySetInnerHTML={{
									__html: t(
										"tools.password_manager.delete_vault.confirm_desc",
									),
								}}
							/>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
						<AlertDialogCancel disabled={isDeleting}>
							{t("cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDeleteVault();
							}}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
						>
							{isDeleting
								? t("tools.password_manager.deleting")
								: t(
										"tools.password_manager.delete_vault.title",
									)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
