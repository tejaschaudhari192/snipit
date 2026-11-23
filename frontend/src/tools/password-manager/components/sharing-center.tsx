import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Users,
	UserPlus,
	Shield,
	Lock,
	ChevronDown,
	ChevronUp,
	Trash2,
	Folder,
	ShieldAlert,
	ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	selectSharedCollections,
	selectVaultLoading,
	setActiveFilter,
} from "@/tools/password-manager/store/password-slice";
import { revokeSharedAccess } from "@/tools/password-manager/store/thunks";
import { Badge } from "@/components/ui/badge";
import ShareFolderModal from "./share-folder-modal";
import { SharingCenterSkeleton, MemberRowSkeleton } from "./skeletons";
import api from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";
import type { SharedCollection } from "@/tools/password-manager/types";

interface MemberData {
	id: string;
	userId: string;
	role: string;
	username: string;
	email: string;
}

export default function SharingCenter() {
	const [activeTab, setActiveTab] = useState("with-me");
	const [isShareNewModalOpen, setIsShareNewModalOpen] = useState(false);
	const [expandedCollectionId, setExpandedCollectionId] = useState<
		string | null
	>(null);
	const [membersMap, setMembersMap] = useState<Record<string, MemberData[]>>(
		{},
	);
	const [loadingMembersId, setLoadingMembersId] = useState<string | null>(
		null,
	);
	const [confirmingRevokeId, setConfirmingRevokeId] = useState<string | null>(
		null,
	);

	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const sharedCollections = useAppSelector(selectSharedCollections);
	const isLoading = useAppSelector(selectVaultLoading);

	const sharedWithMe = sharedCollections.filter(
		(c) => c.access.role !== "owner",
	);
	const sharedByMe = sharedCollections.filter(
		(c) => c.access.role === "owner",
	);

	const fetchMembers = useCallback(
		async (collectionId: string) => {
			setLoadingMembersId(collectionId);
			try {
				const res = await api.get(
					`/tools/password-manager/vault/share/${collectionId}`,
				);
				setMembersMap((prev) => ({
					...prev,
					[collectionId]: res.data?.data || [],
				}));
			} catch (error: unknown) {
				const err = error as {
					response?: { data?: { message?: string } };
				};
				toast.add({
					title:
						err.response?.data?.message ||
						t(
							"tools.password_manager.share.failed_to_fetch_members",
						),
					type: "error",
				});
			} finally {
				setLoadingMembersId(null);
			}
		},
		[t],
	);

	const toggleExpand = (collectionId: string) => {
		if (expandedCollectionId === collectionId) {
			setExpandedCollectionId(null);
			setConfirmingRevokeId(null);
		} else {
			setExpandedCollectionId(collectionId);
			setConfirmingRevokeId(null);
			if (!membersMap[collectionId]) {
				fetchMembers(collectionId);
			}
		}
	};

	const handleRevoke = async (
		collectionId: string,
		accessId: string,
		email: string,
	) => {
		try {
			await dispatch(revokeSharedAccess(accessId)).unwrap();
			toast.add({
				title: t("tools.password_manager.share.access_revoked", {
					email,
				}),
				type: "success",
			});
			setConfirmingRevokeId(null);
			fetchMembers(collectionId);
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

	const renderRoleBadge = (role: string) => {
		switch (role.toLowerCase()) {
			case "owner":
				return (
					<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 capitalize">
						{role}
					</span>
				);
			case "editor":
				return (
					<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 capitalize">
						{role}
					</span>
				);
			default:
				return (
					<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/80 capitalize">
						{role}
					</span>
				);
		}
	};

	const renderCollectionCard = (coll: SharedCollection, isOwner: boolean) => {
		const isExpanded = expandedCollectionId === coll.collection.id;
		const members = membersMap[coll.collection.id] || [];
		const isLoadingMembers = loadingMembersId === coll.collection.id;

		return (
			<div
				key={coll.collection.id}
				className={cn(
					"rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-xs transition-all duration-200 overflow-hidden",
					isExpanded
						? "ring-1 ring-primary/40 border-primary/40"
						: "hover:border-border hover:shadow-md",
				)}
			>
				<div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-start sm:items-center gap-3.5">
						<div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
							{coll.collection.isHidden ? (
								<Lock className="w-5 h-5" />
							) : (
								<Folder className="w-5 h-5" />
							)}
						</div>
						<div className="space-y-1">
							<div className="flex items-center gap-2 flex-wrap">
								<h4 className="font-semibold text-foreground text-base tracking-tight">
									{coll.collection.name}
								</h4>
								{renderRoleBadge(coll.access.role)}
								<Badge
									variant="outline"
									className="text-xs font-normal text-muted-foreground bg-muted/40 border-border/60"
								>
									{coll.items.length}{" "}
									{coll.items.length === 1
										? t(
												"tools.password_manager.item_singular",
											)
										: t(
												"tools.password_manager.item_plural",
											)}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">
								{isOwner ? (
									<span>
										{t(
											"tools.password_manager.share.shared_folder_own_desc",
										)}
									</span>
								) : (
									<span>
										{t(
											"tools.password_manager.share.shared_folder_with_me_desc",
											{ role: coll.access.role },
										)}
									</span>
								)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 justify-end">
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5 text-xs h-9 rounded-xl font-medium border-border/70 hover:bg-primary/10 hover:text-primary transition-colors"
							onClick={() =>
								dispatch(setActiveFilter(coll.collection.id))
							}
						>
							<ExternalLink className="w-3.5 h-3.5" />
							<span>
								{t("tools.password_manager.share.view_items")}
							</span>
						</Button>

						{isOwner && (
							<Button
								variant={isExpanded ? "secondary" : "outline"}
								size="sm"
								className="gap-1.5 text-xs h-9 rounded-xl font-medium border-border/70"
								onClick={() => toggleExpand(coll.collection.id)}
							>
								<Users className="w-3.5 h-3.5 text-primary" />
								<span>
									{t("tools.password_manager.manage_access")}
								</span>
								{isExpanded ? (
									<ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
								) : (
									<ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Expanded Member Management Panel for Owner Cards */}
				{isOwner && isExpanded && (
					<div className="border-t border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
						<div className="flex items-center justify-between">
							<h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t(
									"tools.password_manager.share.people_with_access_title",
								)}
							</h5>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs text-primary hover:text-primary gap-1 px-2"
								onClick={() => fetchMembers(coll.collection.id)}
							>
								{t("common.actions.refresh")}
							</Button>
						</div>

						{isLoadingMembers ? (
							<MemberRowSkeleton />
						) : members.length === 0 ? (
							<div className="text-center py-6 flex flex-col items-center text-muted-foreground">
								<ShieldAlert className="w-7 h-7 mb-1.5 opacity-40" />
								<p className="text-xs">
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
											className="p-3 rounded-xl border border-border/60 bg-card/60 flex flex-col gap-2 transition-colors"
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
													{renderRoleBadge(
														member.role,
													)}
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
												<div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs animate-in fade-in duration-150">
													<span className="text-destructive font-medium">
														{t(
															"tools.password_manager.share.revoke_access_title",
															{
																email:
																	member.email ||
																	"user",
															},
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
															className="h-7 px-2.5 text-xs font-medium"
															onClick={() =>
																handleRevoke(
																	coll
																		.collection
																		.id,
																	member.id,
																	member.email ||
																		"user",
																)
															}
														>
															{t(
																"tools.password_manager.share.revoke_access_button",
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
				)}
			</div>
		);
	};

	if (isLoading && sharedCollections.length === 0) {
		return <SharingCenterSkeleton />;
	}

	return (
		<div className="relative h-full flex flex-col p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar">
			{/* Ambient Gradient Glow */}
			<div className="pointer-events-none absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
				<div>
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
						<div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
							<Users className="w-6 h-6" />
						</div>
						{t("tools.password_manager.sharing_center_title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1 max-w-xl">
						{t("tools.password_manager.sharing_center_desc")}
					</p>
				</div>
				<Button
					className="gap-2 rounded-xl shadow-xs self-start sm:self-auto"
					onClick={() => setIsShareNewModalOpen(true)}
				>
					<UserPlus className="w-4 h-4" />
					{t("tools.password_manager.share_new_collection")}
				</Button>
			</div>

			{/* Tab Switcher */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full flex-col space-y-6"
			>
				<TabsList className="bg-muted/60 border border-border/60 w-full sm:w-auto justify-start p-1 rounded-xl h-auto">
					<TabsTrigger
						value="with-me"
						className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg py-2 px-4 flex items-center gap-2 text-sm font-medium transition-all"
					>
						{t("tools.password_manager.shared_with_me")}
						<Badge
							variant="secondary"
							className="rounded-full px-2 py-0 text-xs font-semibold"
						>
							{sharedWithMe.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="by-me"
						className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg py-2 px-4 flex items-center gap-2 text-sm font-medium transition-all"
					>
						{t("tools.password_manager.shared_by_me")}
						<Badge
							variant="secondary"
							className="rounded-full px-2 py-0 text-xs font-semibold"
						>
							{sharedByMe.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				{/* Shared With Me Tab */}
				<TabsContent value="with-me" className="mt-0 space-y-4">
					{sharedWithMe.length === 0 ? (
						<div className="relative overflow-hidden flex flex-col items-center justify-center p-12 sm:p-16 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center">
							<span className="absolute text-7xl sm:text-8xl font-black text-muted-foreground/5 select-none pointer-events-none">
								EMPTY
							</span>
							<div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 relative">
								<Shield className="w-8 h-8" />
							</div>
							<h3 className="text-lg font-semibold text-foreground relative">
								{t(
									"tools.password_manager.shared_with_me_empty",
								)}
							</h3>
							<p className="text-sm text-muted-foreground mt-1 max-w-sm relative">
								{t(
									"tools.password_manager.shared_with_me_empty_desc",
								)}
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedWithMe.map((c) =>
								renderCollectionCard(c, false),
							)}
						</div>
					)}
				</TabsContent>

				{/* Shared By Me Tab */}
				<TabsContent value="by-me" className="mt-0 space-y-4">
					{sharedByMe.length === 0 ? (
						<div className="relative overflow-hidden flex flex-col items-center justify-center p-12 sm:p-16 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center">
							<span className="absolute text-7xl sm:text-8xl font-black text-muted-foreground/5 select-none pointer-events-none">
								EMPTY
							</span>
							<div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 relative">
								<Users className="w-8 h-8" />
							</div>
							<h3 className="text-lg font-semibold text-foreground relative">
								{t("tools.password_manager.shared_by_me_empty")}
							</h3>
							<p className="text-sm text-muted-foreground mt-1 max-w-sm relative">
								{t(
									"tools.password_manager.shared_by_me_empty_desc",
								)}
							</p>
							<Button
								variant="outline"
								className="mt-5 rounded-xl gap-2 relative border-border/70"
								onClick={() => setIsShareNewModalOpen(true)}
							>
								<UserPlus className="w-4 h-4" />
								{t(
									"tools.password_manager.share_new_collection",
								)}
							</Button>
						</div>
					) : (
						<div className="grid gap-3">
							{sharedByMe.map((c) =>
								renderCollectionCard(c, true),
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Share New Folder Modal */}
			<ShareFolderModal
				isOpen={isShareNewModalOpen}
				onClose={() => setIsShareNewModalOpen(false)}
			/>
		</div>
	);
}
