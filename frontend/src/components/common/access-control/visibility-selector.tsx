import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VisibilitySelectorProps {
	visibility: "public" | "private" | "shared";
	setVisibility: (v: "public" | "private" | "shared") => void;
	publicRole: "viewer" | "editor" | "commenter";
	setPublicRole: (v: "viewer" | "editor" | "commenter") => void;
	setEditPermission: (v: "owner" | "shared" | "public") => void;
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
			const role = val as "viewer" | "editor" | "commenter";
			setPublicRole(role);
			setEditPermission(role === "editor" ? "public" : "owner");
		}
	};

	return (
		<div className="space-y-2">
			<Label>{t("common.access_control", "Access Level")}</Label>
			<div className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/50 transition-all shadow-sm group">
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
					<SelectTrigger className="w-[130px] h-9 text-xs font-medium bg-background border-input/50 focus:ring-primary/20">
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
