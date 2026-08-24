"use client";

import { User } from "lucide-react";
import { Tag } from "lucide-react";
import { cn } from "@/utils/index";
import { useTranslation } from "react-i18next";

interface SidebarHeaderProps {
	className?: string;
	snippetCount?: number;
	folderCount?: number;
}

export function SidebarHeader({
	className,
	snippetCount,
	folderCount,
}: SidebarHeaderProps) {
	const { t } = useTranslation();

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
				<User className="h-4 w-4" />
			</div>
			<h2 className="text-xl font-black tracking-tight text-foreground">
				{t("profile.overview")}
			</h2>

			{/* Snippet Count Badge */}
			{snippetCount !== undefined && (
				<span
					className={cn(
						"inline-flex items-center rounded-full bg-primary/10 text-primary-xs text-primary px-2.5 py-0.5 text-xs font-medium",
						"float-right",
					)}
				>
					{snippetCount}
					<Tag className="ml-1 h-2 w-2" />
				</span>
			)}

			{/* Folder Count Badge */}
			{folderCount !== undefined && (
				<span
					className={cn(
						"inline-flex items-center rounded-full bg-secondary/10 text-secondary px-2.5 py-0.5 text-xs font-medium",
						"float-right",
					)}
				>
					{folderCount}
					<Tag className="ml-1 h-2 w-2" />
				</span>
			)}
		</div>
	);
}
