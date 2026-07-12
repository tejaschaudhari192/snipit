import { useTranslation } from "react-i18next";
import { User, Cloud, HardDrive, MoreHorizontal, Check } from "lucide-react";
import TextGradient from "@/components/text-gradient";
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

	return (
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
							{t("tools.password_manager_storage_settings")}
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="gap-2 cursor-pointer"
							onClick={() => onSetCloudSync(false)}
						>
							<HardDrive className="size-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span>
									{t("tools.password_manager_local_storage")}
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
								if (user) onSetCloudSync(true);
								else
									alert("Please log in to enable Cloud Sync");
							}}
						>
							<Cloud className="size-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span>
									{t("tools.password_manager_cloud_sync")}
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
	);
}
