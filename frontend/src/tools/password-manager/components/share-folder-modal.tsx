import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Eye, Edit3, ShieldCheck } from "lucide-react";
import { selectVault } from "@/tools/password-manager/store/password-slice";
import { toast } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import { Label } from "@/components/ui/label";
import { shareFolder } from "../store/thunks";
import { FolderCombobox } from "./folder-combobox";
import { cn } from "cn";

interface ShareFolderModalProps {
	isOpen: boolean;
	onClose: () => void;
	folderId?: string;
	folderName?: string;
}

export default function ShareFolderModal({
	isOpen,
	onClose,
	folderId,
	folderName,
}: ShareFolderModalProps) {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"viewer" | "editor">("viewer");
	const [selectedFolderId, setSelectedFolderId] = useState<string>("");

	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);

	// Only personal folders without a collectionId can be shared
	const shareableFolders = (vault?.folders || []).filter(
		(f) => !f.collectionId,
	);

	useEffect(() => {
		if (isOpen) {
			setSelectedFolderId(folderId || "");
			setEmail("");
			setRole("viewer");
		}
	}, [isOpen, folderId]);

	const handleShare = (e: React.FormEvent) => {
		e.preventDefault();
		const finalFolderId = folderId || selectedFolderId;
		if (!email || !finalFolderId) return;

		const targetEmail = email.trim();
		const finalFolderName =
			folderName ||
			vault?.folders?.find((f) => f.id === finalFolderId)?.name ||
			"Folder";

		onClose();
		setEmail("");

		dispatch(
			shareFolder({
				targetEmail,
				role,
				folderId: finalFolderId,
				folderName: finalFolderName,
			}),
		)
			.unwrap()
			.then(() => {
				toast.add({
					title: t(
						"tools.password_manager.share.folder_securely_shared_with",
						{ email: targetEmail },
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
						t(
							"tools.password_manager.share.failed_to_share_folder",
						),
					type: "error",
				});
			});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="sm:max-w-md bg-background/95 backdrop-blur-md border-border text-foreground shadow-2xl rounded-2xl"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2.5 text-xl font-semibold">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Users className="w-5 h-5" />
						</div>
						{folderName
							? t(
									"tools.password_manager.share.share_folder_title",
									{ name: folderName },
								)
							: t("tools.password_manager.share.share_a_folder")}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">
						{t("tools.password_manager.share.share_folder_desc")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-5 py-2">
					{!folderId && (
						<div className="space-y-2">
							<Label className="text-sm font-medium">
								{t(
									"tools.password_manager.share.select_folder",
								)}
							</Label>
							<FolderCombobox
								folders={shareableFolders}
								value={selectedFolderId || null}
								onChange={(val) =>
									setSelectedFolderId(val || "")
								}
								showNoneOption={false}
								placeholder={t(
									"tools.password_manager.share.choose_folder_to_share",
								)}
								triggerClassName="w-full bg-background border-border text-foreground"
							/>
						</div>
					)}

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
							className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
						/>
						<p className="flex items-center gap-1.5 text-xs text-muted-foreground/80 pt-0.5">
							<ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
							<span>
								{t("tools.password_manager.share.e2ee_badge")}
							</span>
						</p>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium">
							{t("tools.password_manager.share.permission")}
						</Label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setRole("viewer")}
								className={cn(
									"flex flex-col items-start p-3 rounded-xl border text-left transition-all",
									role === "viewer"
										? "border-primary bg-primary/10 ring-1 ring-primary text-foreground"
										: "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground",
								)}
							>
								<div className="flex items-center gap-2 mb-1">
									<Eye className="w-4 h-4 text-primary" />
									<span className="text-sm font-semibold text-foreground">
										{t(
											"tools.password_manager.share.viewer",
										)}
									</span>
								</div>
								<span className="text-xs text-muted-foreground leading-relaxed">
									{t(
										"tools.password_manager.share.viewer_desc",
									)}
								</span>
							</button>

							<button
								type="button"
								onClick={() => setRole("editor")}
								className={cn(
									"flex flex-col items-start p-3 rounded-xl border text-left transition-all",
									role === "editor"
										? "border-primary bg-primary/10 ring-1 ring-primary text-foreground"
										: "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground",
								)}
							>
								<div className="flex items-center gap-2 mb-1">
									<Edit3 className="w-4 h-4 text-primary" />
									<span className="text-sm font-semibold text-foreground">
										{t(
											"tools.password_manager.share.editor",
										)}
									</span>
								</div>
								<span className="text-xs text-muted-foreground leading-relaxed">
									{t(
										"tools.password_manager.share.editor_desc",
									)}
								</span>
							</button>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="border-border bg-transparent text-foreground hover:bg-muted rounded-lg"
						>
							{t("common.actions.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={
								!email || (!folderId && !selectedFolderId)
							}
							className="rounded-lg"
						>
							{t("tools.password_manager.share.share_securely")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
