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
import {
	shareFolder,
	selectVault,
} from "@/tools/password-manager/store/password-slice";
import { toast } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";

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
	const [isSharing, setIsSharing] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setSelectedFolderId(folderId || "");
			setEmail("");
			setRole("viewer");
		}
	}, [isOpen, folderId]);

	const handleShare = async (e: React.FormEvent) => {
		e.preventDefault();
		const finalFolderId = folderId || selectedFolderId;
		if (!email || !finalFolderId) return;

		setIsSharing(true);
		try {
			const finalFolderName =
				folderName ||
				vault?.folders?.find((f) => f.id === finalFolderId)?.name ||
				"Folder";
			await dispatch(
				shareFolder({
					targetEmail: email,
					role,
					folderId: finalFolderId,
					folderName: finalFolderName,
				}),
			).unwrap();

			toast.add({
				title: t(
					"tools.password_manager.share.folder_securely_shared_with",
					{ email },
				),
				type: "success",
			});
			setEmail("");
			onClose();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.add({
				title:
					msg ||
					t("tools.password_manager.share.failed_to_share_folder"),
				type: "error",
			});
		} finally {
			setIsSharing(false);
		}
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
						{folderName
							? t(
									"tools.password_manager.share.share_folder_title",
									{ name: folderName },
								)
							: t("tools.password_manager.share.share_a_folder")}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t("tools.password_manager.share.share_folder_desc")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-4 py-4">
					{!folderId && (
						<div className="space-y-2">
							<Label className="text-sm font-medium">
								{t(
									"tools.password_manager.share.select_folder",
								)}
							</Label>
							<Select
								value={selectedFolderId}
								onValueChange={(val) =>
									setSelectedFolderId(val!)
								}
							>
								<SelectTrigger className="w-full bg-background border-border text-foreground">
									<SelectValue
										placeholder={t(
											"tools.password_manager.share.choose_folder_to_share",
										)}
									/>
								</SelectTrigger>
								<SelectContent className="bg-background border-border text-foreground">
									{vault?.folders?.map(
										(f: {
											id: string;
											name: string;
											collectionId?: string;
										}) =>
											!f.collectionId && (
												<SelectItem
													key={f.id}
													value={f.id}
												>
													{f.name}
												</SelectItem>
											),
									)}
								</SelectContent>
							</Select>
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
							className="border-border bg-transparent text-foreground hover:bg-muted"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								!email ||
								(!folderId && !selectedFolderId) ||
								isSharing
							}
						>
							{isSharing
								? t("tools.password_manager.share.sharing")
								: t(
										"tools.password_manager.share.share_securely",
									)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
