import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { LogIn, Lock, Shield, Settings, Tag } from "lucide-react";
import { cn } from "@/utils";
import { LockedSettingWrapper } from "@/components/common/locked-setting-wrapper";

import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { IdTypeTabs } from "@/components/home/paste-dialog/id-type-tabs";
import { LabelManager } from "@/components/common/label-manager";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const VisibilitySelector = lazy(() =>
	import("@/components/common/access-control/visibility-selector").then(
		(m) => ({ default: m.VisibilitySelector }),
	),
);

const CollaboratorsManager = lazy(() =>
	import("@/components/common/access-control/collaborators-manager").then(
		(m) => ({ default: m.CollaboratorsManager }),
	),
);

import type {
	IdTypeTab,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	AiIdFileContext,
} from "@/types";

export interface AdvancedConfigGridProps {
	pasteId?: string;
	idTypeTab: IdTypeTab;
	setIdTypeTab: (v: IdTypeTab) => void;
	customId: string;
	setCustomId: (v: string) => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	newPassword: string;
	setNewPassword: (v: string) => void;
	visibility: Visibility;
	setVisibility: (v: Visibility) => void;
	publicRole: PublicRole;
	setPublicRole: (v: PublicRole) => void;
	setEditPermission: (v: EditPermission) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	collaborators: {
		email: string;
		role: ShareRole;
	}[];
	setCollaborators: (
		v: {
			email: string;
			role: ShareRole;
		}[],
	) => void;
	isOwner: boolean;
	isAdmin: boolean;
	disabled?: boolean;
	onSubmit?: () => void;
	textValue?: string;
	files?: AiIdFileContext[];
	originalPasswordProtected?: boolean;
}

export const AdvancedConfigSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div className="space-y-1">
			<div className="h-4 w-24 bg-muted animate-pulse rounded" />
			<Skeleton className="h-35 w-full rounded-xl" />
			<div>
				<Skeleton className="h-11.5 w-full rounded-xl" />
			</div>
		</div>
		<div className="space-y-6">
			<div className="h-4 w-24 bg-muted animate-pulse rounded" />
			<div className="space-y-4">
				<Skeleton className="h-15.5 w-full rounded-xl" />
			</div>
			<div className="h-4 w-24 bg-muted animate-pulse rounded mt-6" />
			<Skeleton className="h-15.5 w-full rounded-xl" />
		</div>
		<div className="space-y-6">
			<div className="h-4 w-24 bg-muted animate-pulse rounded" />
			<div className="space-y-4">
				<Skeleton className="h-15.5 w-full rounded-xl" />
				<div className="pt-4 border-t border-border/10">
					<Skeleton className="h-11.5 w-full rounded-xl" />
				</div>
			</div>
		</div>
	</div>
);

const SectionHeader = ({
	icon: Icon,
	label,
}: {
	icon: React.ElementType;
	label: string;
}) => (
	<div className="flex items-center gap-2 mb-2 group/header">
		<div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover/header:bg-primary group-hover/header:text-white transition-all duration-300">
			<Icon className="h-3.5 w-3.5" />
		</div>
		<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 group-hover/header:text-primary transition-colors">
			{label}
		</span>
	</div>
);

export const AdvancedConfigGrid = ({
	pasteId,
	idTypeTab,
	setIdTypeTab,
	customId,
	setCustomId,
	allowComments,
	setAllowComments,
	isPasswordEnabled,
	setIsPasswordEnabled,
	newPassword,
	setNewPassword,
	visibility,
	setVisibility,
	publicRole,
	setPublicRole,
	setEditPermission,
	allowedUsers,
	setAllowedUsers,
	collaborators,
	setCollaborators,
	isOwner,
	isAdmin,
	disabled = false,
	onSubmit,
	textValue,
	files,
	originalPasswordProtected = false,
}: AdvancedConfigGridProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();

	const isIdDisabled = disabled || (!isOwner && !isAdmin);
	const tooltipText =
		!user && !pasteId
			? t("common.auth_required") || "Authentication Required"
			: t("common.no_edit_permitted") || "Edit not permitted";

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
			{/* Column 1: Identification */}
			<div className="flex flex-col space-y-1">
				<div>
					<SectionHeader
						icon={Tag}
						label={t("home.identification_type")}
					/>
					<LockedSettingWrapper
						disabled={isIdDisabled}
						tooltipText={tooltipText}
					>
						<IdTypeTabs
							idTypeTab={idTypeTab}
							setIdTypeTab={setIdTypeTab}
							customId={customId}
							setCustomId={setCustomId}
							onSubmit={onSubmit || (() => {})}
							compact={true}
							textValue={textValue}
							files={files}
							disabled={isIdDisabled}
						/>
					</LockedSettingWrapper>
				</div>

				<div>
					<LabelManager pasteId={pasteId} />
				</div>
			</div>

			{/* Column 2: General Settings */}
			<div className="flex flex-col space-y-6 animate-in fade-in duration-300">
				<div>
					<SectionHeader
						icon={Settings}
						label={t("common.settings")}
					/>
					<div className="flex flex-col gap-4">
						<LockedSettingWrapper
							disabled={!(isOwner || isAdmin) || disabled}
							tooltipText={tooltipText}
						>
							<div
								className={cn(
									"flex items-center justify-between p-3 rounded-xl border shadow-sm group transition-all select-none",
									allowComments
										? "bg-emerald-500/5 border-emerald-500/20"
										: "bg-background/60 border-border/50 hover:border-primary/30",
									(isOwner || isAdmin) && !disabled
										? "cursor-pointer"
										: "",
								)}
								onClick={() =>
									!disabled &&
									(isOwner || isAdmin) &&
									setAllowComments(!allowComments)
								}
							>
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"p-2 rounded-lg transition-colors",
											allowComments
												? "bg-emerald-500/10 text-emerald-600"
												: "bg-primary/5 text-primary group-hover:bg-primary/10",
										)}
									>
										<Settings className="h-4 w-4" />
									</div>
									<span className="text-sm font-semibold">
										{t("common.open_discussion")}
									</span>
								</div>
								<Switch
									checked={allowComments}
									onCheckedChange={setAllowComments}
									disabled={
										disabled || (!isOwner && !isAdmin)
									}
									className="scale-90 data-[state=checked]:bg-emerald-500"
								/>
							</div>
						</LockedSettingWrapper>
					</div>
				</div>

				<div>
					<SectionHeader icon={Lock} label={t("common.security")} />
					<div className="flex flex-col gap-4">
						<LockedSettingWrapper
							disabled={!(isOwner || isAdmin) || disabled}
							tooltipText={tooltipText}
						>
							<div
								className={cn(
									"flex flex-col gap-4 p-4 rounded-xl transition-all border shadow-sm",
									isPasswordEnabled
										? "bg-primary/5 border-primary/20"
										: "bg-background/60 border-border/50 hover:border-primary/30",
									(isOwner || isAdmin) && !disabled
										? "cursor-pointer"
										: "",
								)}
							>
								<div
									className="flex items-between justify-between select-none"
									onClick={() =>
										!disabled &&
										(isOwner || isAdmin) &&
										setIsPasswordEnabled(!isPasswordEnabled)
									}
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"p-2 rounded-lg transition-colors",
												isPasswordEnabled
													? "bg-primary text-white"
													: "bg-primary/5 text-primary",
											)}
										>
											<Lock className="h-4 w-4" />
										</div>
										<span className="text-sm font-semibold">
											{t("common.password_protected")}
										</span>
									</div>
									<Switch
										checked={isPasswordEnabled}
										onCheckedChange={setIsPasswordEnabled}
										disabled={
											disabled || (!isOwner && !isAdmin)
										}
										className="scale-90"
									/>
								</div>

								{isPasswordEnabled && (
									<div className="animate-in slide-in-from-top-2 duration-200">
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
											<PasswordInput
												value={newPassword}
												onChange={(e) =>
													setNewPassword(
														e.target.value,
													)
												}
												placeholder={t(
													"common.password_placeholder",
												)}
												disabled={
													disabled ||
													(!isOwner && !isAdmin)
												}
												className="h-10 pl-10 text-sm bg-background/80"
											/>
										</div>
									</div>
								)}

								{(() => {
									const isPasswordDirty =
										(originalPasswordProtected &&
											!isPasswordEnabled) ||
										(isPasswordEnabled &&
											newPassword.trim().length > 0);

									if (!pasteId || !isPasswordDirty)
										return null;

									return (
										<div className="flex justify-end pt-2 border-t border-border/10 animate-in fade-in slide-in-from-top-1 duration-200">
											<Button
												size="sm"
												variant="default"
												className="h-8 text-xs px-4"
												onClick={(e) => {
													e.stopPropagation();
													if (onSubmit) onSubmit();
												}}
												disabled={
													disabled ||
													(!isOwner && !isAdmin)
												}
											>
												{t("common.set")}
											</Button>
										</div>
									);
								})()}
							</div>
						</LockedSettingWrapper>
					</div>
				</div>
			</div>

			{/* Column 3: Access Control / Auth Gate */}
			<div className="flex flex-col">
				<SectionHeader icon={Shield} label={t("common.privacy")} />
				{!user ? (
					<div className="flex flex-col justify-center items-center text-center p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 min-h-35 animate-in fade-in duration-300">
						<LogIn className="h-5 w-5 text-primary/50 mb-2 animate-bounce" />
						<p className="text-primary font-bold text-sm mb-1">
							{t("common.auth_required")}
						</p>
						<p className="text-xs text-muted-foreground mb-3 leading-relaxed">
							{t("common.auth_required_desc")}
						</p>
						<div className="flex items-center gap-2 w-full">
							<Button
								size="sm"
								variant="outline"
								className="h-8 text-xs flex-1 bg-background/80"
								onClick={() => navigate("/login")}
							>
								{t("header.login")}
							</Button>
							<Button
								size="sm"
								className="h-8 text-xs flex-1"
								onClick={() => navigate("/signup")}
							>
								{t("header.signup")}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<Suspense
							fallback={
								<Skeleton className="h-15.5 w-full rounded-xl" />
							}
						>
							<VisibilitySelector
								visibility={visibility}
								setVisibility={setVisibility}
								publicRole={publicRole}
								setPublicRole={setPublicRole}
								setEditPermission={setEditPermission}
								disabled={disabled || (!isOwner && !isAdmin)}
								compact={true}
							/>
						</Suspense>

						<div className="pt-4 border-t border-border/10">
							<Suspense
								fallback={
									<Skeleton className="h-11.5 w-full rounded-xl" />
								}
							>
								<CollaboratorsManager
									pasteId={pasteId}
									collaborators={collaborators}
									setCollaborators={setCollaborators}
									allowedUsers={allowedUsers}
									setAllowedUsers={setAllowedUsers}
									disabled={
										disabled || (!isOwner && !isAdmin)
									}
									compact={true}
								/>
							</Suspense>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
