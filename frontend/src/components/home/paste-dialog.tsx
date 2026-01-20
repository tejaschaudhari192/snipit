import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wand2, Fingerprint, LogIn, Globe, Lock, Users } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import type { User } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";

interface PasteDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	idTypeTab: "system" | "dynamic";
	setIdTypeTab: (v: "system" | "dynamic") => void;
	customId: string;
	setCustomId: (v: string) => void;
	visibility: "public" | "private" | "shared";
	setVisibility: (v: "public" | "private" | "shared") => void;
	allowedUsers: string[];
	setAllowedUsers: (v: string[]) => void;
	password: string;
	setPassword: (v: string) => void;
	editPermission: "owner" | "shared" | "public";
	setEditPermission: (v: "owner" | "shared" | "public") => void;
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
	dialogError: string;
	user: User | null;
	isSubmitting: boolean;
	onSubmit: () => void;
}

export const PasteDialog = ({
	isOpen,
	onOpenChange,
	idTypeTab,
	setIdTypeTab,
	customId,
	setCustomId,
	visibility,
	setVisibility,
	allowedUsers,
	setAllowedUsers,
	password,
	setPassword,
	setEditPermission,
	shareList,
	setShareList,
	publicRole,
	setPublicRole,
	dialogError,
	user,
	isSubmitting,
	onSubmit,
	allowComments,
	setAllowComments,
}: PasteDialogProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [isPasswordEnabled, setIsPasswordEnabled] = useState(!!password);

	if (isOpen && !isPasswordEnabled && password) {
		setIsPasswordEnabled(true);
	}

	const [pendingEmails, setPendingEmails] = useState<string[]>([]);
	const [pendingRole, setPendingRole] = useState<
		"viewer" | "editor" | "admin" | "commenter"
	>("editor");

	const handleAddPeople = () => {
		if (pendingEmails.length === 0) return;

		const newShareItems = pendingEmails.map((email) => ({
			email,
			role: pendingRole,
		}));

		// Filter out duplicates based on email
		const uniqueItems = newShareItems.filter(
			(newItem) =>
				!shareList.some((existing) => existing.email === newItem.email),
		);

		setShareList([...shareList, ...uniqueItems]);
		setPendingEmails([]); // Clear input
		// Also sync to legacy allowedUsers for backward compat
		setAllowedUsers([...allowedUsers, ...uniqueItems.map((i) => i.email)]);
	};

	const handleRemovePerson = (emailToRemove: string) => {
		setShareList(shareList.filter((i) => i.email !== emailToRemove));
		setAllowedUsers(allowedUsers.filter((e) => e !== emailToRemove));
	};

	const handleUpdateRole = (
		email: string,
		newRole: "viewer" | "editor" | "admin" | "commenter",
	) => {
		setShareList(
			shareList.map((item) =>
				item.email === email ? { ...item, role: newRole } : item,
			),
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md gap-0">
				<DialogHeader className="mb-4">
					<DialogTitle>{t("home.paste_button")}</DialogTitle>
				</DialogHeader>

				<Tabs
					value={idTypeTab}
					onValueChange={(v) =>
						setIdTypeTab(v as "system" | "dynamic")
					}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="system">
							<Wand2 className="h-4 w-4 mr-2" />
							{t("home.paste_system_id")}
						</TabsTrigger>
						<TabsTrigger value="dynamic">
							<Fingerprint className="h-4 w-4 mr-2" />
							{t("home.paste_dynamic_id")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="system" className="mt-0 mb-4">
						<p className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-md">
							{t("home.paste_system_id_desc")}
						</p>
					</TabsContent>

					<TabsContent
						value="dynamic"
						className="mt-0 space-y-4 mb-4"
					>
						<div className="space-y-2">
							<Input
								placeholder={t(
									"home.dynamic_id_dialog.placeholder",
								)}
								value={customId}
								className="h-11 focus-visible:ring-primary/50"
								onChange={(e) => setCustomId(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && onSubmit()
								}
							/>
							{customId.trim() && (
								<p className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
									{t("home.dynamic_id_dialog.preview")}{" "}
									<span className="text-primary font-medium">
										{window.location.origin}/{customId}
									</span>
								</p>
							)}
						</div>
					</TabsContent>
				</Tabs>

				<div className="space-y-4 mb-6">
					<div className="grid grid-cols-2 gap-4">
						<div
							className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer group"
							onClick={() => {
								const newValue = !isPasswordEnabled;
								setIsPasswordEnabled(newValue);
								if (!newValue) setPassword("");
							}}
						>
							<Label
								htmlFor="password-switch"
								className="flex items-center gap-2.5 text-sm font-medium cursor-pointer pointer-events-none"
							>
								<Lock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
								{t("common.password", "Password")}
							</Label>
							<Switch
								id="password-switch"
								checked={isPasswordEnabled}
								onCheckedChange={(checked) => {
									setIsPasswordEnabled(checked);
									if (!checked) setPassword("");
								}}
							/>
						</div>

						<div
							className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer group"
							onClick={() => setAllowComments(!allowComments)}
						>
							<Label
								htmlFor="allowComments"
								className="flex items-center gap-2.5 text-sm font-medium cursor-pointer pointer-events-none"
							>
								<Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
								{t("common.open_discussion", "Open discussion")}
							</Label>
							<Switch
								id="allowComments"
								checked={allowComments}
								onCheckedChange={(checked) =>
									setAllowComments(checked)
								}
							/>
						</div>
					</div>

					{isPasswordEnabled && (
						<div className="animate-in slide-in-from-top-2 fade-in duration-200">
							<Input
								type="text"
								placeholder={t(
									"common.password_placeholder",
									"Enter password...",
								)}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-11"
								autoFocus
							/>
						</div>
					)}

					{!user ? (
						<div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
							<div className="flex items-center gap-2 text-primary font-semibold">
								<LogIn className="h-4 w-4" />
								<span>
									{t(
										"common.auth_required",
										"Authentication Required",
									)}
								</span>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{t("common.auth_required_desc", {
									defaultValue: `Advanced access control requires an account.`,
								})}
							</p>
							<div className="flex gap-2 pt-1">
								<Button
									size="sm"
									variant="outline"
									className="h-8 text-xs font-bold"
									onClick={() => navigate("/login")}
								>
									{t("header.login", "Login")}
								</Button>
								<Button
									size="sm"
									className="h-8 text-xs font-bold"
									onClick={() => navigate("/signup")}
								>
									{t("header.signup", "Sign Up")}
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>
									{t("common.access_control", "Access Level")}
								</Label>
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
												{t(
													"common.general_access",
													"General access",
												)}
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
										value={
											visibility === "public"
												? publicRole
												: "restricted"
										}
										onValueChange={(val) => {
											if (val === "restricted") {
												setVisibility("private");
												setPublicRole("viewer");
												setEditPermission("owner");
											} else {
												setVisibility("public");
												setPublicRole(
													val as
														| "viewer"
														| "editor"
														| "commenter",
												);
												setEditPermission(
													val === "editor"
														? "public"
														: "owner",
												);
											}
										}}
									>
										<SelectTrigger className="w-[130px] h-9 text-xs font-medium bg-background border-input/50 focus:ring-primary/20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="restricted">
												{t(
													"common.restricted",
													"Private",
												)}
											</SelectItem>
											<SelectItem value="viewer">
												{t("common.viewer", "Can view")}
											</SelectItem>
											<SelectItem value="editor">
												{t("common.editor", "Can edit")}
											</SelectItem>
											<SelectItem value="commenter">
												{t(
													"common.commenter",
													"Can comment",
												)}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-3">
								<Label className="flex items-center gap-2 text-sm font-medium">
									<Users className="h-4 w-4 text-muted-foreground" />
									{t(
										"common.share_with_people",
										"Share with people",
									)}
								</Label>
								<div className="flex gap-2 p-1">
									<div className="flex-1">
										<MultiEmailInput
											value={pendingEmails}
											onChange={setPendingEmails}
											placeholder={t(
												"common.add_people_placeholder",
												"Add people...",
											)}
											className="min-h-[44px] bg-background"
										/>
									</div>
									<Select
										value={pendingRole}
										onValueChange={(
											r:
												| "viewer"
												| "editor"
												| "admin"
												| "commenter",
										) => setPendingRole(r)}
									>
										<SelectTrigger className="w-[110px] h-[44px] bg-background border-input focus:ring-primary/20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="viewer">
												{t("common.viewer", "Viewer")}
											</SelectItem>
											<SelectItem value="editor">
												{t("common.editor", "Editor")}
											</SelectItem>
											<SelectItem value="admin">
												{t("common.admin", "Admin")}
											</SelectItem>
											<SelectItem value="commenter">
												{t(
													"common.commenter",
													"Commenter",
												)}
											</SelectItem>
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddPeople}
										disabled={pendingEmails.length === 0}
										className="h-[44px] w-[60px]"
										variant="secondary"
									>
										{t("common.add", "Add")}
									</Button>
								</div>

								{shareList.length > 0 && (
									<div className="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto pr-1">
										<Label className="text-xs text-muted-foreground mt-2">
											{t(
												"common.people_with_access",
												"People with access",
											)}
										</Label>
										{shareList.map((item) => (
											<div
												key={item.email}
												className="flex items-center justify-between p-2 rounded-md border bg-muted/20"
											>
												<div className="flex items-center gap-2 overflow-hidden">
													<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
														{item.email[0].toUpperCase()}
													</div>
													<span
														className="text-sm truncate"
														title={item.email}
													>
														{item.email}
													</span>
												</div>
												<div className="flex items-center gap-2 shrink-0">
													<Select
														value={item.role}
														onValueChange={(
															r:
																| "viewer"
																| "editor"
																| "admin"
																| "commenter",
														) =>
															handleUpdateRole(
																item.email,
																r,
															)
														}
													>
														<SelectTrigger className="w-[110px] h-7 text-xs bg-background">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="viewer">
																{t(
																	"common.viewer",
																	"Viewer",
																)}
															</SelectItem>
															<SelectItem value="editor">
																{t(
																	"common.editor",
																	"Editor",
																)}
															</SelectItem>
															<SelectItem value="admin">
																{t(
																	"common.admin",
																	"Admin",
																)}
															</SelectItem>
															<SelectItem value="commenter">
																{t(
																	"common.commenter",
																	"Commenter",
																)}
															</SelectItem>
														</SelectContent>
													</Select>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-muted-foreground hover:text-red-500"
														onClick={() =>
															handleRemovePerson(
																item.email,
															)
														}
													>
														<span className="sr-only">
															{t(
																"common.remove",
																"Remove",
															)}
														</span>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="14"
															height="14"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M18 6 6 18" />
															<path d="m6 6 12 12" />
														</svg>
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{dialogError && (
					<motion.div
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2 theme-error-box"
					>
						<div className="mt-0.5">⚠️</div>
						<p>{dialogError}</p>
					</motion.div>
				)}

				<DialogFooter className="sm:justify-between gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						{t("home.dynamic_id_dialog.cancel")}
					</Button>
					<Button
						onClick={onSubmit}
						disabled={
							isSubmitting ||
							(idTypeTab === "dynamic" && !customId.trim()) ||
							(!user && visibility !== "public")
						}
						className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
					>
						{isSubmitting
							? t("common.submitting", "Submitting...")
							: t("home.dynamic_id_dialog.submit")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
