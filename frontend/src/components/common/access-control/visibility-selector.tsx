import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VISIBILITY_OPTIONS, ROLE_OPTIONS } from "@/constants";
import { OptionDisplay } from "@/components/common/option-display";

import type { Visibility, PublicRole, EditPermission } from "@/types";

interface VisibilitySelectorProps {
	visibility: Visibility;
	setVisibility: (v: Visibility) => void;
	publicRole: PublicRole;
	setPublicRole: (v: PublicRole) => void;
	setEditPermission: (v: EditPermission) => void;
	disabled?: boolean;
	compact?: boolean;
}

export const VisibilitySelector = ({
	visibility,
	setVisibility,
	publicRole,
	setPublicRole,
	setEditPermission,
	disabled = false,
	compact = false,
}: VisibilitySelectorProps) => {
	const { t } = useTranslation();

	const handleValueChange = (val: string | null) => {
		if (!val) return;
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
							{t("common.access.general")}
						</span>
						{!compact && (
							<span className="text-[10px] text-muted-foreground tracking-tight font-medium">
								{visibility === "public"
									? t("common.access.anyone_with_link")
									: t("common.access.restricted")}
							</span>
						)}
					</div>
				</div>
				<Select
					value={visibility === "public" ? publicRole : "restricted"}
					onValueChange={handleValueChange}
					disabled={disabled}
				>
					<SelectTrigger className="w-full min-[440px]:w-36 h-10 font-medium bg-background border-input/50 focus:ring-primary/20">
						<SelectValue>
							{(() => {
								const val =
									visibility === "public"
										? publicRole
										: "restricted";
								const opt =
									val === "restricted"
										? VISIBILITY_OPTIONS.find(
												(o) => o.value === val,
											)
										: ROLE_OPTIONS.find(
												(o) => o.value === val,
											);
								return opt ? (
									<OptionDisplay
										icon={opt.icon}
										label={t(opt.labelKey)}
									/>
								) : null;
							})()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{(() => {
							const restrictedOpt = VISIBILITY_OPTIONS.find(
								(o) => o.value === "restricted",
							);
							return (
								restrictedOpt && (
									<SelectItem value="restricted">
										<OptionDisplay
											icon={restrictedOpt.icon}
											label={t(restrictedOpt.labelKey)}
										/>
									</SelectItem>
								)
							);
						})()}
						{ROLE_OPTIONS.filter((o) => o.value !== "admin").map(
							(opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									<OptionDisplay
										icon={opt.icon}
										label={t(opt.labelKey)}
									/>
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
