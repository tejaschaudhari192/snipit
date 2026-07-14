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
import { shareFolder, selectVault } from "@/tools/password-manager/store/password-slice";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import { useEffect } from "react";

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
			const finalFolderName = folderName || vault?.folders?.find(f => f.id === finalFolderId)?.name || "Folder";
			await dispatch(shareFolder({
				targetEmail: email,
				role,
				folderId: finalFolderId,
				folderName: finalFolderName
			})).unwrap();
			
			toast.success(`Folder securely shared with ${email}`);
			setEmail("");
			onClose();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.error(msg || "Failed to share folder securely");
		} finally {
			setIsSharing(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md bg-vault-card border-white/10 text-white shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="w-5 h-5 text-primary" />
						{folderName ? `Share Folder "${folderName}"` : "Share a Folder"}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Share this entire folder and all its passwords using End-to-End Encryption.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-4 py-4">
					{!folderId && (
						<div className="space-y-2">
							<label className="text-sm font-medium">Select Folder</label>
							<Select
								value={selectedFolderId}
								onValueChange={(val) => setSelectedFolderId(val)}
							>
								<SelectTrigger className="w-full bg-black/50 border-white/10 text-white">
									<SelectValue placeholder="Choose a folder to share" />
								</SelectTrigger>
								<SelectContent className="bg-vault-card border-white/10 text-white">
									{vault?.folders?.map((f: { id: string; name: string; collectionId?: string }) => (
										!f.collectionId && (
											<SelectItem key={f.id} value={f.id}>
												{f.name}
											</SelectItem>
										)
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="space-y-2">
						<label className="text-sm font-medium">User Email</label>
						<Input
							placeholder="Enter email address"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="bg-black/50 border-white/10 text-white placeholder:text-white/30"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Permission</label>
						<Select
							value={role}
							onValueChange={(val: "viewer" | "editor") => setRole(val)}
						>
							<SelectTrigger className="w-full bg-black/50 border-white/10 text-white">
								<SelectValue placeholder="Select permission" />
							</SelectTrigger>
							<SelectContent className="bg-vault-card border-white/10 text-white">
								<SelectItem value="viewer">Viewer</SelectItem>
								<SelectItem value="editor">Editor</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="border-white/10 bg-transparent text-white hover:bg-white/5"
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!email || (!folderId && !selectedFolderId) || isSharing}>
							{isSharing ? "Sharing..." : "Share Securely"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
