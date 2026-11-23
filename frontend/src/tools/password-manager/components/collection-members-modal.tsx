import { useTranslation } from "react-i18next";
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
import { toast } from "@/components/ui/toast";
import api from "@/lib/api";
import { useAppDispatch } from "@/tools/password-manager/store";
import { revokeSharedAccess } from "@/tools/password-manager/store/thunks";
import { MemberRowSkeleton } from "./skeletons";

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
	const { t } = useTranslation();
	const [members, setMembers] = useState<MemberData[]>([]);
	const [loading, setLoading] = useState(true);
	const [confirmingRevokeId, setConfirmingRevokeId] = useState<string | null>(
		null,
	);
	const dispatch = useAppDispatch();

	const fetchMembers = useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.get(
				`/tools/password-manager/vault/share/${collectionId}`,
			);
			setMembers(res.data?.data || []);
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			toast.add({
				title:
					err.response?.data?.message ||
					t("tools.password_manager.share.failed_to_fetch_members"),
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [collectionId, t]);

	useEffect(() => {
		if (isOpen && collectionId) {
			fetchMembers();
			setConfirmingRevokeId(null);
		}
	}, [isOpen, collectionId, fetchMembers]);

	const handleRevoke = async (accessId: string, email: string) => {
		try {
			await dispatch(revokeSharedAccess(accessId)).unwrap();
			toast.add({
				title: t("tools.password_manager.share.access_revoked", {
					email,
				}),
				type: "success",
			});
			setConfirmingRevokeId(null);
			fetchMembers();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.add({
				title:
					msg || t("tools.password_manager.share.failed_to_revoke"),
				type: "error",
			});
		}
	};

	const getInitials = (name?: string, email?: string) => {
		const target = name || email || "?";
		return target.slice(0, 2).toUpperCase();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="sm:max-w-lg bg-background/95 backdrop-blur-md border-border text-foreground shadow-2xl rounded-2xl"
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl font-semibold">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Users className="w-5 h-5" />
						</div>
						{t("tools.password_manager.share.manage_access")}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">
						{t("tools.password_manager.share.people_with_access", {
							name: collectionName,
						})}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2 min-h-45">
					{loading ? (
						<MemberRowSkeleton />
					) : members.length === 0 ? (
						<div className="text-center text-muted-foreground py-8 flex flex-col items-center">
							<ShieldAlert className="w-8 h-8 mb-2 opacity-40 text-muted-foreground" />
							<p className="text-sm">
								{t(
									"tools.password_manager.share.no_members_found",
								)}
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{members.map((member) => {
								const isConfirming =
									confirmingRevokeId === member.id;
								return (
									<div
										key={member.id}
										className="p-3 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-2 transition-colors"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 min-w-0">
												<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
													{getInitials(
														member.username,
														member.email,
													)}
												</div>
												<div className="min-w-0">
													<p className="font-medium text-sm text-foreground truncate">
														{member.username ||
															t(
																"tools.password_manager.share.unknown_user",
															)}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{member.email ||
															t(
																"tools.password_manager.share.unknown_email",
															)}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-2 shrink-0">
												<span className="text-xs capitalize px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground font-medium">
													{member.role}
												</span>
												{member.role !== "owner" &&
													!isConfirming && (
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
															onClick={() =>
																setConfirmingRevokeId(
																	member.id,
																)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
											</div>
										</div>

										{isConfirming && (
											<div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
												<span className="text-destructive font-medium">
													{t(
														"tools.password_manager.share.remove_member_confirm",
													)}
												</span>
												<div className="flex items-center gap-2">
													<Button
														size="sm"
														variant="ghost"
														className="h-7 px-2.5 text-xs text-muted-foreground"
														onClick={() =>
															setConfirmingRevokeId(
																null,
															)
														}
													>
														{t(
															"common.actions.cancel",
														)}
													</Button>
													<Button
														size="sm"
														variant="destructive"
														className="h-7 px-2.5 text-xs"
														onClick={() =>
															handleRevoke(
																member.id,
																member.email ||
																	"user",
															)
														}
													>
														{t(
															"tools.password_manager.share.revoke",
														)}
													</Button>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="border-border bg-transparent text-foreground hover:bg-muted rounded-lg"
					>
						{t("tools.password_manager.share.close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
