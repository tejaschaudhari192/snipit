import { Button } from "@/components/ui/button";
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
import { Wand2, Fingerprint, LogIn } from "lucide-react";
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
	dialogError,
	user,
	isSubmitting,
	onSubmit,
}: PasteDialogProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

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
					<div className="space-y-2">
						<Label>{t("common.visibility", "Visibility")}</Label>
						<Select
							value={visibility}
							onValueChange={(
								val: "public" | "private" | "shared",
							) => setVisibility(val)}
						>
							<SelectTrigger className="w-full h-11">
								<SelectValue
									placeholder={t(
										"common.visibility",
										"Visibility",
									)}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">
									{t("common.public", "Public")}
								</SelectItem>
								<SelectItem value="private">
									{t("common.private", "Private")}
								</SelectItem>
								<SelectItem value="shared">
									{t("common.shared", "Shared")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{!user && visibility !== "public" ? (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3"
						>
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
									visibility: t(
										`common.${visibility}`,
										visibility,
									),
									defaultValue: `Creating ${visibility} snippets requires an account to manage access control and ownership.`,
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
						</motion.div>
					) : (
						visibility === "shared" && (
							<div className="space-y-2 animate-in fade-in slide-in-from-top-2">
								<Label>
									{t("common.allowed_users", "Allowed Users")}
								</Label>
								<MultiEmailInput
									value={allowedUsers}
									onChange={setAllowedUsers}
									placeholder={t(
										"common.allowed_users_placeholder",
										"Enter emails...",
									)}
									className="w-full min-h-[44px]"
								/>
							</div>
						)
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
