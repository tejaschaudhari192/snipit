import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Visibility, PublicRole, EditPermission } from "@/types";

interface VisibilitySelectorProps {
	visibility: Visibility;
	setVisibility: (v: Visibility) => void;
	publicRole: PublicRole;
	setPublicRole: (v: PublicRole) => void;
	setEditPermission: (v: EditPermission) => void;
	disabled?: boolean;
}

export const VisibilitySelector = ({
	visibility,
	setVisibility,
	publicRole,
	setPublicRole,
	setEditPermission,
	disabled = false,
}: VisibilitySelectorProps) => {
	const { t } = useTranslation();

	const handleValueChange = (val: string) => {
		if (val === "restricted") {
			setVisibility("private");
			setPublicRole("viewer");
			setEditPermission("owner");
		} else {
			setVisibility("public");
			const role = val as PublicRole;
			setPublicRole(role);
			setEditPermission(role === "editor" ? "public" : "owner");
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between p-3 gap-3 rounded-lg border bg-card/40 hover:bg-card/80 transition-all shadow-sm group">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-full bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
						{visibility === "public" ? (
							<Globe className="h-4 w-4 text-primary" />
						) : (
							<Lock className="h-4 w-4 text-primary" />
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold">
							{t("common.general_access", "General access")}
						</span>
						<span className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
							{visibility === "public"
								? t(
										"common.anyone_with_link",
										"Anyone with link",
									)
								: t(
										"common.restricted",
										"Private (Restricted)",
									)}
						</span>
					</div>
				</div>
				<Select
					value={visibility === "public" ? publicRole : "restricted"}
					onValueChange={handleValueChange}
					disabled={disabled}
				>
					<SelectTrigger className="w-full min-[440px]:w-[130px] h-9 text-xs font-medium bg-background border-input/50 focus:ring-primary/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="restricted">
							{t("common.restricted", "Private")}
						</SelectItem>
						<SelectItem value="viewer">
							{t("common.viewer", "Can view")}
						</SelectItem>
						<SelectItem value="editor">
							{t("common.editor", "Can edit")}
						</SelectItem>
						<SelectItem value="commenter">
							{t("common.commenter", "Can comment")}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
