"use client";

import { User } from "lucide-react";
import { cn } from "@/utils/index";
import { useTranslation } from "react-i18next";

interface SidebarHeaderProps {
	className?: string;
}

export function SidebarHeader({ className }: SidebarHeaderProps) {
	const { t } = useTranslation();

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
				<User className="h-4 w-4" />
			</div>
			<h2 className="text-xl font-black tracking-tight text-foreground">
				{t("profile.overview")}
			</h2>
		</div>
	);
}
