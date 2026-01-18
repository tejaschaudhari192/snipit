import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileText,
	Code2,
	Link,
	Users,
	Globe,
	Lock,
	ShieldCheck,
} from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EditControlsProps {
	contentType: "text" | "code" | "link";
	setContentType: (v: "text" | "code" | "link") => void;
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
	shareList: { email: string; role: "viewer" | "editor" | "admin" }[];
	setShareList: (
		v: { email: string; role: "viewer" | "editor" | "admin" }[],
	) => void;
	publicRole: "viewer" | "editor";
	setPublicRole: (v: "viewer" | "editor") => void;
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
}: EditControlsProps) => {
	const { t } = useTranslation();

	// Local state for the "Add people" input
	const [pendingEmails, setPendingEmails] = useState<string[]>([]);
	const [pendingRole, setPendingRole] = useState<
		"viewer" | "editor" | "admin"
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
		// Sync allowedUsers
		setAllowedUsers([...allowedUsers, ...uniqueItems.map((i) => i.email)]);
	};

	const handleRemovePerson = (emailToRemove: string) => {
		setShareList(shareList.filter((i) => i.email !== emailToRemove));
		setAllowedUsers(allowedUsers.filter((e) => e !== emailToRemove));
	};

	const handleUpdateRole = (
		email: string,
		newRole: "viewer" | "editor" | "admin",
	) => {
		setShareList(
			shareList.map((item) =>
				item.email === email ? { ...item, role: newRole } : item,
			),
		);
	};

	return (
		<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center -mb-1">
					<Tabs
						value={contentType}
						onValueChange={(val) =>
							setContentType(val as "text" | "code" | "link")
						}
						className="w-full xl:w-auto"
					>
						<TabsList className="h-9 w-full xl:w-fit flex">
							<TabsTrigger
								value="text"
								className="h-7 px-3 text-xs font-semibold gap-2"
							>
								<FileText className="h-3.5 w-3.5" />
								{t("home.tab_text")}
							</TabsTrigger>
							<TabsTrigger
								value="code"
								className="h-7 px-3 text-xs font-semibold gap-2"
							>
								<Code2 className="h-3.5 w-3.5" />
								{t("home.tab_code")}
							</TabsTrigger>
							<TabsTrigger
								value="link"
								className="h-7 px-3 text-xs font-semibold gap-2"
							>
								<Link className="h-3.5 w-3.5" />
								{t("home.tab_link")}
							</TabsTrigger>
						</TabsList>
					</Tabs>

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
									className="pl-8 h-9 text-xs bg-muted/20 border-transparent focus:border-border transition-all"
								/>
							</div>
						)}

						{contentType === "code" && (
							<div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
								<LanguageSelector
									value={language}
									onValueChange={setLanguage}
									isDetecting={isDetecting}
									className="w-[140px] h-9 text-xs"
								/>
								{!isDetecting && (
									<Button
										variant="outline"
										size="icon"
										className="h-9 w-9 shrink-0"
										onClick={onAutoDetect}
										title={t("home.auto_detecting")}
									>
										<Code2 className="h-3.5 w-3.5" />
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{(isOwner || isAdmin) && (
					<div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 shadow-sm animate-in slide-in-from-top-2 duration-300">
						<div className="flex items-center gap-3 pr-4 border-r border-border/50">
							<Checkbox
								id="password-protected"
								checked={isPasswordEnabled}
								onCheckedChange={(checked) =>
									setIsPasswordEnabled(checked as boolean)
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
						</div>

						{isPasswordEnabled && (
							<div className="relative group w-40 animate-in slide-in-from-left-2 fade-in duration-200">
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
									className="h-9 text-xs bg-background border-input focus:border-border transition-all shadow-sm pl-8"
								/>
								<Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
							</div>
						)}

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
										{/* General Access Card */}
										<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 transition-all hover:bg-muted/40 group">
											<div className="flex items-center gap-3">
												<div className="p-2.5 rounded-full bg-background border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
													{visibility === "public" ? (
														<Globe className="h-4 w-4 text-primary" />
													) : (
														<Lock className="h-4 w-4 text-muted-foreground" />
													)}
												</div>
												<div className="flex flex-col">
													<span className="text-sm font-bold">
														{t(
															"common.general_access",
														)}
													</span>
													<span className="text-[10px] text-muted-foreground uppercase tracking-tight">
														{visibility === "public"
															? t(
																	"common.anyone_with_link",
																)
															: t(
																	"common.restricted",
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
														setVisibility(
															"private",
														);
														setPublicRole("viewer");
														setEditPermission(
															"owner",
														);
													} else {
														setVisibility("public");
														setPublicRole(
															val as
																| "viewer"
																| "editor",
														);
														setEditPermission(
															val === "editor"
																? "public"
																: "owner",
														);
													}
												}}
												disabled={!isOwner && !isAdmin}
											>
												<SelectTrigger className="w-[130px] h-9 text-xs bg-background">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="restricted">
														{t("common.restricted")}
													</SelectItem>
													<SelectItem value="viewer">
														{t("common.viewer")}
													</SelectItem>
													<SelectItem value="editor">
														{t("common.editor")}
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Collaborators section */}
										<div className="space-y-4">
											<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 ml-1">
												<Users className="h-3 w-3" />
												{t("common.share_with_people")}
											</Label>

											<div className="flex gap-2">
												<div className="flex-1">
													<MultiEmailInput
														value={pendingEmails}
														onChange={
															setPendingEmails
														}
														placeholder={t(
															"common.add_people_placeholder",
														)}
														className="min-h-[40px] text-sm"
													/>
												</div>
												<Select
													value={pendingRole}
													onValueChange={(
														r:
															| "viewer"
															| "editor"
															| "admin",
													) => setPendingRole(r)}
												>
													<SelectTrigger className="w-[110px] h-10 text-xs bg-background">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="viewer">
															{t("common.viewer")}
														</SelectItem>
														<SelectItem value="editor">
															{t("common.editor")}
														</SelectItem>
														<SelectItem value="admin">
															{t("common.admin")}
														</SelectItem>
													</SelectContent>
												</Select>
												<Button
													onClick={handleAddPeople}
													disabled={
														pendingEmails.length ===
														0
													}
													size="sm"
													className="h-10 px-4 font-bold"
												>
													{t("common.add")}
												</Button>
											</div>

											{shareList.length > 0 && (
												<div className="flex flex-col gap-2 mt-2 max-h-[200px] overflow-y-auto pr-1">
													<Label className="text-[10px] uppercase font-bold text-muted-foreground mt-2">
														{t(
															"common.people_with_access",
														)}
													</Label>
													{shareList.map((item) => (
														<div
															key={item.email}
															className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
														>
															<div className="flex items-center gap-2 overflow-hidden">
																<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-primary/20">
																	{item.email[0].toUpperCase()}
																</div>
																<span
																	className="text-sm font-medium truncate"
																	title={
																		item.email
																	}
																>
																	{item.email}
																</span>
															</div>
															<div className="flex items-center gap-2 shrink-0">
																<Select
																	value={
																		item.role
																	}
																	onValueChange={(
																		r:
																			| "viewer"
																			| "editor"
																			| "admin",
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
																			)}
																		</SelectItem>
																		<SelectItem value="editor">
																			{t(
																				"common.editor",
																			)}
																		</SelectItem>
																		<SelectItem value="admin">
																			{t(
																				"common.admin",
																			)}
																		</SelectItem>
																	</SelectContent>
																</Select>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
																	onClick={() =>
																		handleRemovePerson(
																			item.email,
																		)
																	}
																>
																	<span className="sr-only">
																		{t(
																			"common.remove",
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
								</DialogContent>
							</Dialog>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
