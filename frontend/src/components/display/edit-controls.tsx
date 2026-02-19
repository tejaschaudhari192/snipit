import { ContentTypeSelector } from "@/components/common/content-type-selector";
import { Code2, ShieldCheck, Lock, Globe } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ExpirySelector } from "@/components/common/expiry-selector";
import { VisibilitySelector } from "@/components/common/access-control/visibility-selector";
import { CollaboratorsManager } from "@/components/common/access-control/collaborators-manager";

interface EditControlsProps {
	contentType: "text" | "code" | "link" | "file";
	setContentType: (v: "text" | "code" | "link" | "file") => void;
	language: string;
	setLanguage: (v: string) => void;
	visibility: "public" | "private" | "shared";
	setVisibility: (v: "public" | "private" | "shared") => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	isDetecting: boolean;
	onAutoDetect: () => void;
	customId: string;
	setCustomId: (v: string) => void;
	newPassword: string;
	setNewPassword: (v: string) => void;
	isPasswordEnabled: boolean;
	setIsPasswordEnabled: (v: boolean) => void;
	editPermission: "owner" | "shared" | "public";
	setEditPermission: (v: "owner" | "shared" | "public") => void;
	isOwner: boolean;
	isAdmin: boolean;
	shareList: {
		email: string;
		role: "viewer" | "editor" | "admin" | "commenter";
	}[];
	setShareList: (
		v: {
			email: string;
			role: "viewer" | "editor" | "admin" | "commenter";
		}[],
	) => void;
	publicRole: "viewer" | "editor" | "commenter";
	setPublicRole: (v: "viewer" | "editor" | "commenter") => void;
	allowComments: boolean;
	setAllowComments: (v: boolean) => void;
	expiresTime: string;
	setExpiresTime: (v: string) => void;
	setIsCustomExpiryDialogOpen: (v: boolean) => void;
}

export const EditControls = ({
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
	customId,
	setCustomId,
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
	expiresTime,
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
}: EditControlsProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center -mb-1">
					<ContentTypeSelector
						value={contentType}
						onValueChange={setContentType}
						className="w-full xl:w-auto"
						listClassName="xl:w-fit"
						showFileOption={contentType === "file"}
					/>

					<div className="w-full xl:w-auto flex flex-wrap items-center gap-3">
						{(isOwner || isAdmin) && (
							<div className="relative group w-40">
								<Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
								<Input
									value={customId}
									onChange={(e) =>
										setCustomId(e.target.value)
									}
									placeholder={t(
										"home.dynamic_id_dialog.placeholder",
										"Custom ID...",
									)}
									disabled={!isOwner && !isAdmin}
									className="pl-8 h-10 text-sm bg-muted/20 border-transparent focus:border-border transition-all"
								/>
							</div>
						)}

						{contentType === "code" && (
							<div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
								<LanguageSelector
									value={language}
									onValueChange={setLanguage}
									isDetecting={isDetecting}
									className="w-[180px] h-10 text-sm"
								/>
								{!isDetecting && (
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10 shrink-0"
										onClick={onAutoDetect}
										title={t("home.auto_detecting")}
									>
										<Code2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{(isOwner || isAdmin) && (
					<div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 shadow-sm animate-in slide-in-from-top-2 duration-300">
						<div className="flex flex-col sm:flex-row sm:items-center gap-2 pr-0 md:pr-4 md:border-r border-border/50">
							<Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 sm:hidden">
								{t("common.expires", "Expires")}
							</Label>
							<ExpirySelector
								expiresTime={expiresTime}
								setExpiresTime={setExpiresTime}
								setIsCustomExpiryDialogOpen={
									setIsCustomExpiryDialogOpen
								}
								className="w-full sm:w-fit h-9"
							/>
						</div>

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
									<Input
										type="password"
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
									<Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
								{t("common.open_discussion", "Open discussion")}
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
										{t(
											"common.manage_access",
											"Manage Access",
										)}
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[500px]">
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<ShieldCheck className="h-5 w-5 text-primary" />
											{t(
												"common.manage_access",
												"Manage Access",
											)}
										</DialogTitle>
									</DialogHeader>

									<div className="space-y-6 pt-4">
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

										<CollaboratorsManager
											shareList={shareList}
											setShareList={setShareList}
											allowedUsers={allowedUsers}
											setAllowedUsers={setAllowedUsers}
											disabled={!isOwner && !isAdmin}
										/>
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
