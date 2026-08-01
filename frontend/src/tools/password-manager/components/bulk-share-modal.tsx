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
import { Users, Loader2 } from "lucide-react";
import type { PasswordItem } from "@/tools/password-manager/types";
import { toast } from "@/components/ui/toast";
import { useAppDispatch } from "@/tools/password-manager/store";
import { shareItem } from "@/tools/password-manager/store/password-slice";
import { Label } from "@/components/ui/label";

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
					title: `Failed to share "${item.title}": ${msg}`,
					type: "error",
				});
			}
		}

		setIsSharing(false);

		if (successCount > 0) {
			toast.add({
				title: `Shared ${successCount}/${items.length} item${items.length > 1 ? "s" : ""} securely with ${email}`,
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
						Share {items.length} Item{items.length > 1 ? "s" : ""}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Each item will be end-to-end encrypted and shared as a
						separate secure collection.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium">
							User Email
						</Label>
						<Input
							placeholder="Enter email address"
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
							Permission
						</Label>
						<Select
							value={role}
							onValueChange={(val: "viewer" | "editor") =>
								setRole(val)
							}
							disabled={isSharing}
						>
							<SelectTrigger className="w-full bg-background border-border text-foreground">
								<SelectValue placeholder="Select permission" />
							</SelectTrigger>
							<SelectContent className="bg-background border-border text-foreground">
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
									<Loader2 className="w-4 h-4 animate-spin" />
									Sharing…
								</>
							) : (
								"Share Securely"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
