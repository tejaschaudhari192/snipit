"use client";

import { Code2, Laptop } from "lucide-react";
import { cn } from "@/utils/index";
import { useTranslation } from "react-i18next";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface ProfileSidebarNavProps {
	activeTab: "snippets" | "devices";
	onTabChange: (tab: "snippets" | "devices") => void;
	snippetsCount?: number;
	className?: string;
}

export function ProfileSidebarNav({
	activeTab,
	onTabChange,
	snippetsCount,
	className,
}: ProfileSidebarNavProps) {
	const { t } = useTranslation();

	return (
		<nav className={cn("w-full select-none", className)}>
			<SidebarMenu className="gap-1.5">
				{/* My Snippets Tab */}
				<SidebarMenuItem>
					<SidebarMenuButton
						isActive={activeTab === "snippets"}
						onClick={() => onTabChange("snippets")}
						className={cn(
							"h-10 px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
							activeTab === "snippets"
								? "bg-primary/10 text-primary border border-primary/25 shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent",
						)}
					>
						<Code2 className="w-4 h-4 shrink-0 text-primary" />
						<span className="truncate">
							{t("profile.tabs.snippets")}
						</span>
					</SidebarMenuButton>

					{typeof snippetsCount === "number" && (
						<SidebarMenuBadge className="right-2.5">
							<Badge
								variant={
									activeTab === "snippets"
										? "default"
										: "secondary"
								}
								className="text-[10px] font-extrabold h-5 px-2 rounded-full"
							>
								{snippetsCount}
							</Badge>
						</SidebarMenuBadge>
					)}
				</SidebarMenuItem>

				{/* Devices & Sessions Tab */}
				<SidebarMenuItem>
					<SidebarMenuButton
						isActive={activeTab === "devices"}
						onClick={() => onTabChange("devices")}
						className={cn(
							"h-10 px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
							activeTab === "devices"
								? "bg-primary/10 text-primary border border-primary/25 shadow-xs"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent",
						)}
					>
						<Laptop className="w-4 h-4 shrink-0 text-primary" />
						<span className="truncate">
							{t("profile.tabs.devices")}
						</span>
					</SidebarMenuButton>

					<SidebarMenuBadge className="right-2.5">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>{t("profile.devices.active")}</span>
						</span>
					</SidebarMenuBadge>
				</SidebarMenuItem>
			</SidebarMenu>
		</nav>
	);
}
