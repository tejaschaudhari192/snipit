import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Cloud, HardDrive, MoreHorizontal, Check, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

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
			toast.success(t("tools.password_manager_vault_deleted"));
		} catch (error) {
			toast.error(t("tools.password_manager_delete_vault_failed"));
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
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="w-full justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
									<User className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none mr-auto">
									<span className="font-semibold text-sm">
										{user
											? user.username
											: t("tools.password_manager_guest_user")}
									</span>
									<span className="text-xs text-muted-foreground flex items-center gap-1">
										{isCloudSyncEnabled ? (
											<>
												<Cloud className="size-3 text-primary" />{" "}
												{isSyncing ? (
													<span
									style={{
										"--highlight-color": "var(--foreground)",
										"--base-color": "var(--muted-foreground)",
										"--spread": "20px",
										"--duration": "2s"
									} as React.CSSProperties}
									className="shimmer font-medium"
								>
														{t("tools.password_manager_syncing")}
													</span>
												) : (
													t("tools.password_manager_cloud_sync_on")
												)}
											</>
										) : (
											<>
												<HardDrive className="size-3 text-muted-foreground" />{" "}
												{t("tools.password_manager_syncing_locally")}
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
							className="w-64 p-2"
						>
							<div className="px-2 py-1.5 text-sm font-semibold text-foreground/80">
								{t("tools.password_manager_storage_settings")}
							</div>
							<DropdownMenuSeparator className="my-1" />
							<DropdownMenuItem
								className="gap-3 cursor-pointer rounded-md p-2 transition-colors focus:bg-accent"
								onClick={() => onSetCloudSync(false)}
							>
								<div className="bg-muted p-1.5 rounded-md">
									<HardDrive className="size-4 text-muted-foreground" />
								</div>
								<div className="flex flex-col flex-1">
									<span className="text-sm font-medium">
										{t("tools.password_manager_local_storage")}
									</span>
									<span className="text-[10px] text-muted-foreground leading-tight">
										{t("tools.password_manager_local_storage_desc")}
									</span>
								</div>
								{!isCloudSyncEnabled && (
									<Check className="size-4 text-primary ml-auto" />
								)}
							</DropdownMenuItem>
							<DropdownMenuItem
								className={`gap-3 cursor-pointer rounded-md p-2 transition-colors focus:bg-accent ${!user ? "opacity-50" : ""}`}
								onClick={() => {
									if (user) onSetCloudSync(true);
									else toast.error(t("tools.password_manager_requires_login"));
								}}
							>
								<div className="bg-muted p-1.5 rounded-md">
									<Cloud className="size-4 text-muted-foreground" />
								</div>
								<div className="flex flex-col flex-1">
									<span className="text-sm font-medium">
										{t("tools.password_manager_cloud_sync")}
									</span>
									<span className="text-[10px] text-muted-foreground leading-tight">
										{!user
											? t("tools.password_manager_requires_login")
											: t("tools.password_manager_cloud_sync_desc")}
									</span>
								</div>
								{isCloudSyncEnabled && (
									<Check className="size-4 text-primary ml-auto" />
								)}
							</DropdownMenuItem>
							
							<div className="mt-2 pt-2 border-t border-border/50">
								<div className="px-2 py-1 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									{t("tools.password_manager_danger_zone")}
								</div>
								<DropdownMenuItem
									className="gap-3 cursor-pointer rounded-md p-2 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
									onClick={() => setIsDeleteDialogOpen(true)}
								>
									<div className="bg-destructive/10 p-1.5 rounded-md text-destructive">
										<Trash2 className="size-4" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">{t("tools.password_manager_delete_vault")}</span>
									</div>
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent className="border-destructive/20">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive flex items-center gap-2">
							<Trash2 className="size-5" />
							{t("tools.password_manager_delete_vault_confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-base text-foreground/80 mt-2">
							<span dangerouslySetInnerHTML={{ __html: t("tools.password_manager_delete_vault_confirm_desc") }} />
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
						<AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDeleteVault();
							}}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
						>
							{isDeleting ? t("tools.password_manager_deleting") : t("tools.password_manager_delete_vault")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
