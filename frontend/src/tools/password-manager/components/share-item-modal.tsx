import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import type { PasswordItem } from "@/tools/password-manager/types";
import { toast } from "@/components/ui/toast";
import { useAppDispatch } from "@/tools/password-manager/store";
import { Label } from "@/components/ui/label";
import { shareItem } from "../store/thunks";

interface ShareItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: PasswordItem;
}

export default function ShareItemModal({
	isOpen,
	onClose,
	item,
}: ShareItemModalProps) {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"viewer" | "editor">("viewer");

	const dispatch = useAppDispatch();

	const handleShare = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		const targetEmail = email;
		onClose();
		setEmail("");

		dispatch(
			shareItem({
				targetEmail,
				role,
				item,
			}),
		)
			.unwrap()
			.then(() => {
				toast.add({
					title: t(
						"tools.password_manager.share.securely_shared_with",
						{
							email: targetEmail,
						},
					),
					type: "success",
				});
			})
			.catch((error: unknown) => {
				const msg =
					error instanceof Error ? error.message : String(error);
				toast.add({
					title:
						msg ||
						t("tools.password_manager.share.failed_to_share"),
					type: "error",
				});
			});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="sm:max-w-md bg-background border-border text-foreground shadow-2xl"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="w-5 h-5 text-primary" />
						{t("tools.password_manager.share.share_item_title", {
							title: item.title,
						})}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t("tools.password_manager.share.share_item_desc")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium">
							{t("tools.password_manager.share.user_email")}
						</Label>
						<Input
							placeholder={t(
								"tools.password_manager.share.enter_email",
							)}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="bg-background border-border text-foreground placeholder:text-muted-foreground"
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium">
							{t("tools.password_manager.share.permission")}
						</Label>
						<Select
							value={role}
							onValueChange={(val: "viewer" | "editor" | null) =>
								setRole(val!)
							}
						>
							<SelectTrigger className="w-full bg-background border-border text-foreground">
								<SelectValue
									placeholder={t(
										"tools.password_manager.share.select_permission",
									)}
								>
									{role === "editor"
										? t(
												"tools.password_manager.share.editor",
											)
										: role === "viewer"
											? t(
													"tools.password_manager.share.viewer",
												)
											: undefined}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="bg-background border-border text-foreground">
								<SelectItem value="viewer">
									{t("tools.password_manager.share.viewer")}
								</SelectItem>
								<SelectItem value="editor">
									{t("tools.password_manager.share.editor")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="border-border bg-transparent text-foreground hover:bg-muted"
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!email}>
							{t("tools.password_manager.share.share_securely")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
