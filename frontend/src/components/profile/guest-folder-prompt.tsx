import React from "react";
import { Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const GuestFolderPrompt: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div className="w-full h-full flex flex-col min-h-0 gap-3">
			<div className="flex items-center justify-between px-1 shrink-0">
				<span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
					{t("folders.explorer")}
				</span>
			</div>
			<div className="text-center py-8 px-4 border border-dashed rounded-2xl border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-2">
				<Folder className="w-8 h-8 text-muted-foreground/40 mb-1" />
				<p className="text-xs font-semibold text-foreground">
					{t("profile.guest_mode")}
				</p>
				<p className="text-[11px] text-muted-foreground max-w-45 mx-auto leading-relaxed">
					{t("profile.guest_hint")}
				</p>
				<Link
					to="/login"
					className="mt-2 text-xs font-bold text-primary hover:underline"
				>
					{t("auth.login")} / {t("auth.signup")}
				</Link>
			</div>
		</div>
	);
};
