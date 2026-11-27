"use client";

import { Code2, Laptop, User, Users } from "lucide-react";
import { cn } from "cn";
import { useTranslation } from "react-i18next";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface ProfileSidebarNavProps {
	activeTab: "snippets" | "devices" | "profile";
	snippetsSection?: "my_snippets" | "shared";
	onTabChange: (tab: "snippets" | "devices" | "profile") => void;
	onSnippetsSectionChange?: (section: "my_snippets" | "shared") => void;
	snippetsCount?: number;
	className?: string;
}

export function ProfileSidebarNav({
	activeTab,
	snippetsSection = "my_snippets",
	onTabChange,
	onSnippetsSectionChange,
	snippetsCount,
	className,
}: ProfileSidebarNavProps) {
	const { t } = useTranslation();

	const isMySnippets =
		activeTab === "snippets" && snippetsSection === "my_snippets";
	const isShared = activeTab === "snippets" && snippetsSection === "shared";

	return (
		<nav className={cn("w-full select-none space-y-2", className)}>
			{/* Workspace Group */}
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					{t("profile.tabs.snippets")}
				</SidebarGroupLabel>
				<SidebarMenu className="gap-1">
					<SidebarMenuItem>
						<SidebarMenuButton
							isActive={isMySnippets}
							onClick={() => {
								onSnippetsSectionChange?.("my_snippets");
								onTabChange("snippets");
							}}
							className="cursor-pointer"
						>
							<Code2 className="w-4 h-4 shrink-0" />
							<span className="truncate">
								{t("profile.your_snippets")}
							</span>
						</SidebarMenuButton>
						{typeof snippetsCount === "number" && (
							<SidebarMenuBadge>
								<Badge
									variant={
										isMySnippets ? "default" : "secondary"
									}
									className="text-[10px] font-bold h-5 px-1.5 rounded-full"
								>
									{snippetsCount}
								</Badge>
							</SidebarMenuBadge>
						)}
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton
							isActive={isShared}
							onClick={() => {
								onSnippetsSectionChange?.("shared");
								onTabChange("snippets");
							}}
							className="cursor-pointer"
						>
							<Users className="w-4 h-4 shrink-0" />
							<span className="truncate">
								{t("shared.page_title")}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			{/* Account & Devices Group */}
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					{t("profile.tabs.profile")}
				</SidebarGroupLabel>
				<SidebarMenu className="gap-1">
					<SidebarMenuItem>
						<SidebarMenuButton
							isActive={activeTab === "profile"}
							onClick={() => onTabChange("profile")}
							className="cursor-pointer"
						>
							<User className="w-4 h-4 shrink-0" />
							<span className="truncate">
								{t("profile.tabs.profile")}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton
							isActive={activeTab === "devices"}
							onClick={() => onTabChange("devices")}
							className="cursor-pointer"
						>
							<Laptop className="w-4 h-4 shrink-0" />
							<span className="truncate">
								{t("profile.tabs.devices")}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</nav>
	);
}
