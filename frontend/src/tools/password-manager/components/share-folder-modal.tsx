import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { SubNavProgressBar } from "@/components/ui/sub-nav-progress-bar";
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
import { Users, User, Trash2, Eye, Edit3, ShieldCheck } from "lucide-react";
import { selectVault } from "@/tools/password-manager/store/password-slice";
import { toast } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import { shareFolder, revokeSharedAccess } from "../store/thunks";
import { updateVaultAccessRole } from "../api/password-manager";
import { FolderCombobox } from "./folder-combobox";
import api from "@/lib/api";

interface MemberData {
	id: string;
	userId: string;
	role: string;
	username: string;
	email: string;
}

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
	const [isSharing, setIsSharing] = useState(false);
	const [members, setMembers] = useState<MemberData[]>([]);
	const [collectionId, setCollectionId] = useState<string | undefined>();
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);

	// Only personal folders without a collectionId can be shared
	const shareableFolders = (vault?.folders || []).filter(
		(f) => !f.collectionId,
	);

	const fetchMembers = useCallback(async (cId: string) => {
		try {
			const res = await api.get<{ data: MemberData[] }>(
				`/tools/password-manager/vault/share/${cId}`,
			);
			setMembers(res.data?.data || []);
		} catch {
			// silently ignore — user may not be owner
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			setSelectedFolderId(folderId || "");
			setEmail("");
			setRole("viewer");
			setMembers([]);
			setActionLoadingId(null);
			const folder = vault?.folders?.find((f) => f.id === folderId);
			const existingCollectionId = folder?.collectionId;
			setCollectionId(existingCollectionId);
			if (existingCollectionId) {
				void fetchMembers(existingCollectionId);
			}
		}
	}, [isOpen, folderId, vault?.folders, fetchMembers]);

	const handleShare = async (e: React.FormEvent) => {
		e.preventDefault();
		const finalFolderId = folderId || selectedFolderId;
		if (!email || !finalFolderId || isSharing) return;

		const targetEmail = email.trim();
		const finalFolderName =
			folderName ||
			vault?.folders?.find((f) => f.id === finalFolderId)?.name ||
			"Folder";

		setIsSharing(true);

		try {
			const result = await dispatch(
				shareFolder({
					targetEmail,
					role,
					folderId: finalFolderId,
					folderName: finalFolderName,
				}),
			).unwrap();

			toast.add({
				title: t(
					"tools.password_manager.share.folder_securely_shared_with",
					{ email: targetEmail },
				),
				type: "success",
			});

			setEmail("");
			const newCollectionId = result.collectionId ?? collectionId;
			if (newCollectionId) {
				setCollectionId(newCollectionId);
				await fetchMembers(newCollectionId);
			}
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

	const handleRoleChange = async (
		accessId: string,
		newRole: "viewer" | "editor",
	) => {
		setActionLoadingId(accessId);
		try {
			await updateVaultAccessRole(accessId, newRole);
			setMembers((prev) =>
				prev.map((m) =>
					m.id === accessId ? { ...m, role: newRole } : m,
				),
			);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.add({
				title: msg || t("tools.password_manager.share.failed_to_share"),
				type: "error",
			});
		} finally {
			setActionLoadingId(null);
		}
	};

	const handleRevoke = async (accessId: string, memberEmail: string) => {
		setActionLoadingId(accessId);
		try {
			await dispatch(revokeSharedAccess(accessId)).unwrap();
			toast.add({
				title: t("tools.password_manager.share.access_revoked", {
					email: memberEmail,
				}),
				type: "success",
			});
			setMembers((prev) => prev.filter((m) => m.id !== accessId));
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			toast.add({
				title:
					msg || t("tools.password_manager.share.failed_to_revoke"),
				type: "error",
			});
		} finally {
			setActionLoadingId(null);
		}
	};

	const filteredMembers = members.filter((m) => m.role !== "owner");

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={true}
				className="sm:max-w-lg bg-background border-border text-foreground shadow-2xl overflow-hidden p-6 gap-0 relative"
			>
				{/* Sub-nav hairline progress bar at top edge */}
				<SubNavProgressBar
					loading={isSharing || !!actionLoadingId}
					aria-label={t("tools.password_manager.share.sharing")}
				/>

				<DialogHeader className="space-y-1.5 pr-6 pb-4">
					<DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Users className="w-5 h-5 shrink-0" />
						</div>
						<span className="truncate">
							{folderName
								? t(
										"tools.password_manager.share.share_folder_title",
										{ name: folderName },
									)
								: t(
										"tools.password_manager.share.share_a_folder",
									)}
						</span>
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-xs leading-normal flex items-center gap-1.5">
						<ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
						<span>
							{t(
								"tools.password_manager.share.share_folder_desc",
							)}
						</span>
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleShare} className="pt-2 pb-5 space-y-3">
					{!folderId && (
						<div>
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
								triggerClassName="w-full h-10 bg-background border-border text-foreground text-sm rounded-lg"
							/>
						</div>
					)}

					<div className="flex items-center gap-2.5">
						<Input
							placeholder={t(
								"tools.password_manager.share.enter_email",
							)}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isSharing}
							className="flex-1 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground text-sm rounded-lg"
						/>

						<Select
							value={role}
							onValueChange={(val) => {
								if (val === "viewer" || val === "editor") {
									setRole(val);
								}
							}}
							disabled={isSharing}
						>
							<SelectTrigger className="w-32 h-10 text-xs font-medium bg-background border-border text-foreground shrink-0 rounded-lg">
								<SelectValue>
									<span className="flex items-center gap-1.5">
										{role === "editor" ? (
											<Edit3 className="w-3.5 h-3.5 text-primary" />
										) : (
											<Eye className="w-3.5 h-3.5 text-primary" />
										)}
										<span>
											{role === "editor"
												? t(
														"tools.password_manager.share.editor",
													)
												: t(
														"tools.password_manager.share.viewer",
													)}
										</span>
									</span>
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="bg-background border-border text-foreground shadow-xl rounded-xl min-w-50 p-1.5">
								<SelectItem
									value="viewer"
									className="rounded-lg py-2 cursor-pointer"
								>
									<div className="flex items-start gap-2.5">
										<Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
										<div className="flex flex-col">
											<span className="text-xs font-medium leading-none mb-1">
												{t(
													"tools.password_manager.share.viewer",
												)}
											</span>
											<span className="text-[11px] text-muted-foreground leading-snug">
												{t(
													"tools.password_manager.share.viewer_desc",
												)}
											</span>
										</div>
									</div>
								</SelectItem>
								<SelectItem
									value="editor"
									className="rounded-lg py-2 cursor-pointer"
								>
									<div className="flex items-start gap-2.5">
										<Edit3 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
										<div className="flex flex-col">
											<span className="text-xs font-medium leading-none mb-1">
												{t(
													"tools.password_manager.share.editor",
												)}
											</span>
											<span className="text-[11px] text-muted-foreground leading-snug">
												{t(
													"tools.password_manager.share.editor_desc",
												)}
											</span>
										</div>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>

						<Button
							type="submit"
							disabled={
								!email.trim() ||
								(!folderId && !selectedFolderId) ||
								isSharing
							}
							className="h-10 px-5 shrink-0 font-medium rounded-lg"
						>
							{isSharing
								? t("tools.password_manager.share.sharing")
								: t("tools.password_manager.share.share")}
						</Button>
					</div>
				</form>

				{/* People with access list */}
				<div className="border-t border-border pt-4 space-y-3">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						{t(
							"tools.password_manager.share.people_with_access_title",
						)}
					</p>

					{filteredMembers.length === 0 ? (
						<div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
							{t("tools.password_manager.share.no_members_found")}
						</div>
					) : (
						<ul className="space-y-2 max-h-56 overflow-y-auto pr-1 -mr-1">
							{filteredMembers.map((m) => {
								return (
									<li
										key={m.id}
										className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-xs border border-primary/20">
												{m.username ? (
													m.username
														.slice(0, 2)
														.toUpperCase()
												) : (
													<User className="w-4 h-4" />
												)}
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium truncate text-foreground leading-tight">
													{m.username ||
														t(
															"tools.password_manager.share.unknown_user",
														)}
												</p>
												<p className="text-xs text-muted-foreground truncate leading-tight">
													{m.email ||
														t(
															"tools.password_manager.share.unknown_email",
														)}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											<Select
												value={m.role}
												onValueChange={(val) => {
													if (
														val === "viewer" ||
														val === "editor"
													) {
														void handleRoleChange(
															m.id,
															val,
														);
													}
												}}
												disabled={
													actionLoadingId === m.id ||
													isSharing
												}
											>
												<SelectTrigger className="h-8 w-28 text-xs font-medium bg-background border-border rounded-lg">
													<SelectValue>
														<span className="flex items-center gap-1.5">
															{m.role ===
															"editor" ? (
																<Edit3 className="w-3.5 h-3.5 text-primary" />
															) : (
																<Eye className="w-3.5 h-3.5 text-primary" />
															)}
															<span>
																{m.role ===
																"editor"
																	? t(
																			"tools.password_manager.share.editor",
																		)
																	: t(
																			"tools.password_manager.share.viewer",
																		)}
															</span>
														</span>
													</SelectValue>
												</SelectTrigger>
												<SelectContent className="bg-background border-border text-foreground shadow-xl rounded-xl min-w-50 p-1.5">
													<SelectItem
														value="viewer"
														className="rounded-lg py-2 cursor-pointer"
													>
														<div className="flex items-start gap-2.5">
															<Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
															<div className="flex flex-col">
																<span className="text-xs font-medium leading-none mb-1">
																	{t(
																		"tools.password_manager.share.viewer",
																	)}
																</span>
																<span className="text-[11px] text-muted-foreground leading-snug">
																	{t(
																		"tools.password_manager.share.viewer_desc",
																	)}
																</span>
															</div>
														</div>
													</SelectItem>
													<SelectItem
														value="editor"
														className="rounded-lg py-2 cursor-pointer"
													>
														<div className="flex items-start gap-2.5">
															<Edit3 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
															<div className="flex flex-col">
																<span className="text-xs font-medium leading-none mb-1">
																	{t(
																		"tools.password_manager.share.editor",
																	)}
																</span>
																<span className="text-[11px] text-muted-foreground leading-snug">
																	{t(
																		"tools.password_manager.share.editor_desc",
																	)}
																</span>
															</div>
														</div>
													</SelectItem>
												</SelectContent>
											</Select>

											<Button
												type="button"
												variant="ghost"
												size="icon-xs"
												onClick={() =>
													handleRevoke(m.id, m.email)
												}
												disabled={
													actionLoadingId === m.id ||
													isSharing
												}
												className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
												title={t(
													"tools.password_manager.share.revoke",
												)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				{/* Footer with Done/Close button */}
				<div className="flex justify-end pt-4 mt-3 border-t border-border">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onClose}
						className="px-5 border-border bg-transparent text-foreground hover:bg-muted rounded-lg"
					>
						{t("tools.password_manager.share.close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
