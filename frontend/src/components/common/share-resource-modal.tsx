import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { IndeterminateProgressBar } from "@/components/ui/indeterminate-progress-bar";
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
import { Users, User, Trash2, Eye, Edit3 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import api from "@/lib/api";

interface CollaboratorMember {
	_id: string;
	id?: string;
	email: string;
	role: "viewer" | "editor" | "admin" | "commenter";
	userId?:
		| {
				_id: string;
				username?: string;
				email?: string;
		  }
		| string;
}

interface ShareResourceModalProps {
	isOpen: boolean;
	onClose: () => void;
	resourceType: "folder" | "paste";
	resourceId: string;
	resourceName: string;
}

export default function ShareResourceModal({
	isOpen,
	onClose,
	resourceType,
	resourceId,
	resourceName,
}: ShareResourceModalProps) {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"viewer" | "editor">("viewer");
	const [isSharing, setIsSharing] = useState(false);
	const [members, setMembers] = useState<CollaboratorMember[]>([]);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	const fetchMembers = useCallback(async () => {
		if (!resourceId) return;
		try {
			const endpoint =
				resourceType === "folder"
					? `/collaborators/folder/${resourceId}`
					: `/collaborators/${resourceId}`;
			const res = await api.get<CollaboratorMember[]>(endpoint);
			setMembers(Array.isArray(res.data) ? res.data : []);
		} catch {
			// silently ignore if user has no access
		}
	}, [resourceId, resourceType]);

	useEffect(() => {
		if (isOpen && resourceId) {
			setEmail("");
			setRole("viewer");
			setMembers([]);
			setActionLoadingId(null);
			void fetchMembers();
		}
	}, [isOpen, resourceId, fetchMembers]);

	const handleShare = async (e: React.FormEvent) => {
		e.preventDefault();
		const targetEmail = email.trim().toLowerCase();
		if (!targetEmail || isSharing) return;

		setIsSharing(true);
		try {
			const endpoint =
				resourceType === "folder"
					? `/collaborators/folder/${resourceId}`
					: `/collaborators/${resourceId}`;

			await api.post(endpoint, { email: targetEmail, role });

			toast.add({
				title: t("shared.shared_with_success", { email: targetEmail }),
				type: "success",
			});

			setEmail("");
			await fetchMembers();
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { error?: string; message?: string } };
				message?: string;
			};
			toast.add({
				title:
					err.response?.data?.error ||
					err.response?.data?.message ||
					err.message ||
					t("shared.share_failed"),
				type: "error",
			});
		} finally {
			setIsSharing(false);
		}
	};

	const handleRoleChange = async (
		collaboratorId: string,
		newRole: "viewer" | "editor",
	) => {
		setActionLoadingId(collaboratorId);
		try {
			await api.patch(`/collaborators/role/${collaboratorId}`, {
				role: newRole,
			});
			setMembers((prev) =>
				prev.map((m) =>
					(m._id || m.id) === collaboratorId
						? { ...m, role: newRole }
						: m,
				),
			);
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			toast.add({
				title:
					err.response?.data?.error ||
					err.message ||
					t("shared.role_update_failed"),
				type: "error",
			});
		} finally {
			setActionLoadingId(null);
		}
	};

	const handleRevoke = async (member: CollaboratorMember) => {
		const id = member._id || member.id || member.email;
		setActionLoadingId(id);
		try {
			const endpoint =
				resourceType === "folder"
					? `/collaborators/folder/${resourceId}`
					: `/collaborators/${resourceId}`;

			await api.delete(endpoint, { data: { email: member.email } });
			toast.add({
				title: t("shared.access_revoked", { email: member.email }),
				type: "success",
			});
			setMembers((prev) => prev.filter((m) => m.email !== member.email));
		} catch (error: unknown) {
			const err = error as {
				response?: { data?: { error?: string } };
				message?: string;
			};
			toast.add({
				title:
					err.response?.data?.error ||
					err.message ||
					t("shared.revoke_failed"),
				type: "error",
			});
		} finally {
			setActionLoadingId(null);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={true}
				className="sm:max-w-lg bg-background border-border text-foreground shadow-2xl overflow-hidden p-6 gap-0"
			>
				{isSharing && (
					<IndeterminateProgressBar
						className="absolute top-0 left-0 right-0 w-full h-1.5 rounded-none z-10"
						trackClassName="bg-muted rounded-none"
						indicatorClassName="bg-primary"
						duration={1.4}
						aria-label={t("shared.sharing")}
					/>
				)}

				<DialogHeader className="space-y-1.5 pr-6 pb-4">
					<DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Users className="w-5 h-5 shrink-0" />
						</div>
						<span className="truncate">
							{resourceType === "folder"
								? t("shared.share_folder_title", {
										name: resourceName,
									})
								: t("shared.share_snippet_title", {
										name: resourceName,
									})}
						</span>
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-xs leading-normal">
						{resourceType === "folder"
							? t("shared.share_folder_desc")
							: t("shared.share_snippet_desc")}
					</DialogDescription>
				</DialogHeader>

				{/* Invite Bar */}
				<form onSubmit={handleShare} className="pt-2 pb-5">
					<div className="flex items-center gap-2.5">
						<Input
							placeholder={t("shared.enter_email")}
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
												? t("shared.role_editor")
												: t("shared.role_viewer")}
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
												{t("shared.role_viewer")}
											</span>
											<span className="text-[11px] text-muted-foreground leading-snug">
												{t("shared.viewer_desc")}
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
												{t("shared.role_editor")}
											</span>
											<span className="text-[11px] text-muted-foreground leading-snug">
												{t("shared.editor_desc")}
											</span>
										</div>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>

						<Button
							type="submit"
							disabled={!email.trim() || isSharing}
							className="h-10 px-5 shrink-0 font-medium rounded-lg"
						>
							{isSharing
								? t("shared.sharing")
								: t("shared.share")}
						</Button>
					</div>
				</form>

				{/* People with access */}
				<div className="border-t border-border pt-4 space-y-3">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						{t("shared.people_with_access")}
					</p>

					{members.length === 0 ? (
						<div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
							{t("shared.no_collaborators")}
						</div>
					) : (
						<ul className="space-y-2 max-h-56 overflow-y-auto pr-1 -mr-1">
							{members.map((m) => {
								const mId = m._id || m.id || m.email;
								const username =
									typeof m.userId === "object"
										? m.userId?.username
										: undefined;
								return (
									<li
										key={mId}
										className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-xs border border-primary/20">
												{username ? (
													username
														.slice(0, 2)
														.toUpperCase()
												) : (
													<User className="w-4 h-4" />
												)}
											</div>
											<div className="min-w-0">
												{username && (
													<p className="text-sm font-medium truncate text-foreground leading-tight">
														{username}
													</p>
												)}
												<p className="text-xs text-muted-foreground truncate leading-tight">
													{m.email}
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
															mId,
															val,
														);
													}
												}}
												disabled={
													actionLoadingId === mId ||
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
																			"shared.role_editor",
																		)
																	: t(
																			"shared.role_viewer",
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
																		"shared.role_viewer",
																	)}
																</span>
																<span className="text-[11px] text-muted-foreground leading-snug">
																	{t(
																		"shared.viewer_desc",
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
																		"shared.role_editor",
																	)}
																</span>
																<span className="text-[11px] text-muted-foreground leading-snug">
																	{t(
																		"shared.editor_desc",
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
												onClick={() => handleRevoke(m)}
												disabled={
													actionLoadingId === mId ||
													isSharing
												}
												className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
												title={t("shared.revoke")}
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

				{/* Footer */}
				<div className="flex justify-end pt-4 mt-3 border-t border-border">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onClose}
						className="px-5 border-border bg-transparent text-foreground hover:bg-muted rounded-lg"
					>
						{t("shared.close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
