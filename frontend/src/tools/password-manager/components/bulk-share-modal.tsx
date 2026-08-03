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
import { shareItem } from "@/tools/password-manager/store/password-slice";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface BulkShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	items: PasswordItem[];
}

export default function BulkShareModal({
	isOpen,
	onClose,
	items,
}: BulkShareModalProps) {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"viewer" | "editor">("viewer");
	const [isSharing, setIsSharing] = useState(false);

	const dispatch = useAppDispatch();

	const handleShare = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || items.length === 0) return;

		setIsSharing(true);
		let successCount = 0;

		// Sequential sharing to avoid hammering the API and for better per-item error reporting
		for (const item of items) {
			try {
				await dispatch(
					shareItem({
						targetEmail: email,
						role,
						item,
					}),
				).unwrap();
				successCount++;
			} catch (error: unknown) {
				const msg =
					error instanceof Error ? error.message : String(error);
				toast.add({
					title: t(
						"tools.password_manager.share.failed_to_share_item_msg",
						{ title: item.title, msg },
					),
					type: "error",
				});
			}
		}

		setIsSharing(false);

		if (successCount > 0) {
			toast.add({
				title: t("tools.password_manager.share.bulk_shared_success", {
					successCount,
					totalCount: items.length,
					email,
				}),
				type: "success",
			});
		}

		if (successCount === items.length) {
			setEmail("");
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={isSharing ? undefined : onClose}>
			<DialogContent
				showCloseButton={false}
				className="sm:max-w-md bg-background border-border text-foreground shadow-2xl"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="w-5 h-5 text-primary" />
						{t("tools.password_manager.share.bulk_share_title", {
							count: items.length,
						})}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t("tools.password_manager.share.bulk_share_desc")}
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
							disabled={isSharing}
							className="bg-background border-border text-foreground placeholder:text-muted-foreground"
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium">
							{t("tools.password_manager.share.permission")}
						</Label>
						<Select
							value={role}
							onValueChange={(val) => {
								if (!val) return;
								return setRole(val);
							}}
							disabled={isSharing}
						>
							<SelectTrigger className="w-full bg-background border-border text-foreground">
								<SelectValue
									placeholder={t(
										"tools.password_manager.share.select_permission",
									)}
								/>
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
							disabled={isSharing}
							className="border-border bg-transparent text-foreground hover:bg-muted"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!email || isSharing}
							className="min-w-32 gap-2"
						>
							{isSharing ? (
								<>
									<Spinner className="w-4 h-4 animate-spin" />
									{t("tools.password_manager.share.sharing")}
								</>
							) : (
								t("tools.password_manager.share.share_securely")
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
