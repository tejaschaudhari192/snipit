import { Code2, ShieldCheck, Lock } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/editor/language-selector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
} from "@/types";

interface EditControlsProps {
	pasteId?: string;
	contentType: ContentMode;
	setContentType: (v: ContentMode) => void;
	language: string;
	setLanguage: (v: string) => void;
	visibility: Visibility;
	setVisibility: (v: Visibility) => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	isDetecting: boolean;
	onAutoDetect: () => void;
	newPassword: string;
	setNewPassword: (v: string) => void;
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	editPermission: EditPermission;
	setEditPermission: (v: EditPermission) => void;
	isOwner: boolean;
	isAdmin: boolean;
	shareList: {
		email: string;
		role: ShareRole;
	}[];
	setShareList: (
		v: {
			email: string;
			role: ShareRole;
		}[],
	) => void;
	publicRole: PublicRole;
	setPublicRole: (v: PublicRole) => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
}

export const EditControls = ({
	pasteId,
	contentType,
	setContentType,
	language,
	setLanguage,
	visibility,
	setVisibility,
	allowedUsers,
	setAllowedUsers,
	isDetecting,
	onAutoDetect,
	newPassword,
	setNewPassword,
	isPasswordEnabled,
	setIsPasswordEnabled,
	setEditPermission,
	isOwner,
	isAdmin,
	shareList,
	setShareList,
	publicRole,
	setPublicRole,
	allowComments,
	setAllowComments,
}: EditControlsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
			<div className="flex flex-col gap-3">
				<div className="flex flex-col xl:flex-row gap-2.5 justify-end items-start xl:items-center -mb-1">
					<div className="w-full xl:w-auto flex flex-wrap items-center gap-3">
						{(isDetecting ||
							contentType === "code" ||
							contentType === "text") && (
							<div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
								<LanguageSelector
									value={language}
									onValueChange={(val) => {
										setLanguage(val);
										if (val === "text") {
											setContentType("text");
										}
									}}
									isDetecting={isDetecting}
									className="w-[180px] h-10 text-sm"
								/>
								{!isDetecting && (
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10 shrink-0 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm"
										onClick={onAutoDetect}
										title={t("home.auto_detecting")}
									>
										<Code2 className="h-4 w-4 text-muted-foreground" />
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{(isOwner || isAdmin) && (
					<div className="flex flex-wrap items-center gap-3 p-2 rounded-xl bg-muted/30 border border-border/50 shadow-sm animate-in slide-in-from-top-2 duration-300">
						<div className="flex items-center gap-3 pr-0 md:pr-4 md:border-r border-border/50">
							<Switch
								id="password-protected"
								checked={isPasswordEnabled}
								onCheckedChange={(checked) =>
									setIsPasswordEnabled(checked)
								}
								disabled={!isOwner && !isAdmin}
							/>
							<Label
								htmlFor="password-protected"
								className={`cursor-pointer font-bold select-none text-sm flex items-center gap-2 ${!isOwner && !isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								<Lock
									className={`h-3.5 w-3.5 ${isPasswordEnabled ? "text-primary" : "text-muted-foreground"}`}
								/>
								{t("common.password_protected")}
							</Label>
							{isPasswordEnabled && (
								<div className="relative group w-40 animate-in slide-in-from-left-2 fade-in duration-200 ml-2">
									<div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
										<Lock className="h-3.5 w-3.5 text-muted-foreground" />
									</div>
									<PasswordInput
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										placeholder={t(
											"common.password_placeholder",
										)}
										disabled={!isOwner && !isAdmin}
										className="h-10 text-sm bg-background border-input focus:border-border transition-all shadow-sm pl-8"
									/>
								</div>
							)}
						</div>

						<div className="flex items-center gap-3 pr-4 border-border/50">
							<Switch
								id="allow-comments"
								checked={allowComments}
								onCheckedChange={(checked) =>
									setAllowComments(checked)
								}
								disabled={!isOwner && !isAdmin}
							/>
							<Label
								htmlFor="allow-comments"
								className={`cursor-pointer font-bold select-none text-sm flex items-center gap-2 ${!isOwner && !isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{t("common.open_discussion")}
							</Label>
						</div>

						<div className="ml-auto">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="h-9 gap-2 font-bold px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm text-primary"
									>
										<ShieldCheck className="h-4 w-4" />
										{t("common.manage_access")}
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[500px]">
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<ShieldCheck className="h-5 w-5 text-primary" />
											{t("common.manage_access")}
										</DialogTitle>
									</DialogHeader>

									<div className="space-y-6 pt-4">
										<Suspense
											fallback={
												<Skeleton className="h-[62px] w-full rounded-lg" />
											}
										>
											<VisibilitySelector
												visibility={visibility}
												setVisibility={setVisibility}
												publicRole={publicRole}
												setPublicRole={setPublicRole}
												setEditPermission={
													setEditPermission
												}
												disabled={!isOwner && !isAdmin}
											/>
										</Suspense>

										<Suspense
											fallback={
												<Skeleton className="h-[46px] w-full rounded-lg" />
											}
										>
											<CollaboratorsManager
												pasteId={pasteId}
												shareList={shareList}
												setShareList={setShareList}
												allowedUsers={allowedUsers}
												setAllowedUsers={
													setAllowedUsers
												}
												disabled={!isOwner && !isAdmin}
											/>
										</Suspense>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
