import { useState, useEffect, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAppDispatch } from "@/tools/password-manager/store";
import { revokeSharedAccess } from "@/tools/password-manager/store/password-slice";

interface CollectionMembersModalProps {
	isOpen: boolean;
	onClose: () => void;
	collectionId: string;
	collectionName: string;
}

interface MemberData {
	id: string;
	userId: string;
	role: string;
	username: string;
	email: string;
}

export default function CollectionMembersModal({
	isOpen,
	onClose,
	collectionId,
	collectionName,
}: CollectionMembersModalProps) {
	const [members, setMembers] = useState<MemberData[]>([]);
	const [loading, setLoading] = useState(true);
	const dispatch = useAppDispatch();

	const fetchMembers = useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.get(`/tools/password-manager/vault/share/${collectionId}`);
			setMembers(res.data?.data || []);
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			toast.error(err.response?.data?.message || "Failed to fetch members");
		} finally {
			setLoading(false);
		}
	}, [collectionId]);

	useEffect(() => {
		if (isOpen && collectionId) {
			fetchMembers();
		}
	}, [isOpen, collectionId, fetchMembers]);

	const handleRevoke = async (accessId: string, email: string) => {
		if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;

		try {
			await dispatch(revokeSharedAccess(accessId)).unwrap();
			toast.success(`Access revoked for ${email}`);
			fetchMembers();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.error(msg || "Failed to revoke access");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg bg-vault-card border-white/10 text-white shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="w-5 h-5 text-primary" />
						Manage Access
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						People with access to "{collectionName}"
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4 min-h-50">
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						</div>
					) : members.length === 0 ? (
						<div className="text-center text-muted-foreground py-8 flex flex-col items-center">
							<ShieldAlert className="w-8 h-8 mb-2 opacity-50" />
							<p>No members found</p>
						</div>
					) : (
						<div className="space-y-2">
							{members.map((member) => (
								<div
									key={member.id}
									className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20"
								>
									<div>
										<p className="font-medium text-white/90">
											{member.username || "Unknown User"}
										</p>
										<p className="text-xs text-muted-foreground">
											{member.email || "Unknown Email"}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs capitalize text-white/50 bg-white/5 px-2 py-1 rounded">
											{member.role}
										</span>
										{member.role !== "owner" && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
												onClick={() =>
													handleRevoke(
														member.id,
														member.email || "user"
													)
												}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="border-white/10 bg-transparent text-white hover:bg-white/5"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
