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
import { toast } from "sonner";
import { useAppDispatch } from "@/tools/password-manager/store";
import { shareItem } from "@/tools/password-manager/store/password-slice";

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
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"viewer" | "editor">("viewer");

	const dispatch = useAppDispatch();
	const [isSharing, setIsSharing] = useState(false);

	const handleShare = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setIsSharing(true);
		try {
			await dispatch(shareItem({
				targetEmail: email,
				role,
				item
			})).unwrap();
			
			toast.success(`Securely shared with ${email}`);
			setEmail("");
			onClose();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.error(msg || "Failed to share securely");
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
						Share "{item.title}"
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Share this password securely using End-to-End Encryption.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-4 py-4">
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
						<Button type="submit" disabled={!email || isSharing}>
							{isSharing ? "Sharing..." : "Share Securely"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
