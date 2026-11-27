import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	Users,
	Folder,
	FileText,
	ArrowLeft,
	ChevronRight,
	Shield,
	Settings2,
	Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import api from "@/lib/api";
import type { PasteData, FolderData } from "@/types";
import ShareResourceModal from "@/components/common/share-resource-modal";

const SnippetCard = lazy(() =>
	import("@/components/snippets/snippet-card").then((m) => ({
		default: m.SnippetCard,
	})),
);

interface SharedOwner {
	_id?: string;
	username?: string;
	email?: string;
}

interface SharedFolder extends Omit<FolderData, "owner"> {
	sharedRole?: string;
	collaboratorCount?: number;
	owner?: SharedOwner | string;
}

interface SharedPaste extends Omit<PasteData, "owner"> {
	title?: string;
	sharedRole?: string;
	collaboratorCount?: number;
	owner?: SharedOwner | string;
}

interface SharedResponse {
	sharedWithMe: {
		folders: SharedFolder[];
		pastes: SharedPaste[];
	};
	sharedByMe: {
		folders: SharedFolder[];
		pastes: SharedPaste[];
	};
}

interface BreadcrumbItem {
	id: string;
	name: string;
}

export default function SharedPage({
	embedded = false,
}: {
	embedded?: boolean;
}) {
	const { t } = useTranslation();
	const { user, loading: authLoading } = useAuth();
	usePageTitle("shared.page_title");

	const [activeTab, setActiveTab] = useState<"with_me" | "by_me">("with_me");
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<SharedResponse>({
		sharedWithMe: { folders: [], pastes: [] },
		sharedByMe: { folders: [], pastes: [] },
	});

	// Browsing inside a shared folder
	const [folderStack, setFolderStack] = useState<BreadcrumbItem[]>([]);
	const [folderContents, setFolderContents] = useState<{
		subfolders: FolderData[];
		snippets: PasteData[];
		role?: string;
	} | null>(null);
	const [folderLoading, setFolderLoading] = useState(false);

	// Share modal state
	const [shareTarget, setShareTarget] = useState<{
		resourceType: "folder" | "paste";
		resourceId: string;
		resourceName: string;
	} | null>(null);

	const fetchShared = useCallback(async () => {
		if (!user) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const res = await api.get<SharedResponse>("/collaborators/shared");
			setData(
				res.data || {
					sharedWithMe: { folders: [], pastes: [] },
					sharedByMe: { folders: [], pastes: [] },
				},
			);
		} catch {
			// ignore error
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (!authLoading) {
			void fetchShared();
		}
	}, [authLoading, fetchShared]);

	const openFolder = async (folderId: string, folderName: string) => {
		setFolderLoading(true);
		try {
			const res = await api.get<{
				subfolders: FolderData[];
				snippets: PasteData[];
				role?: string;
			}>(`/folders/contents/${folderId}`);
			setFolderContents(res.data);
			setFolderStack((prev) => [
				...prev,
				{ id: folderId, name: folderName },
			]);
		} catch {
			// ignore
		} finally {
			setFolderLoading(false);
		}
	};

	const navigateBreadcrumb = async (index: number) => {
		if (index < 0) {
			setFolderStack([]);
			setFolderContents(null);
			return;
		}
		const target = folderStack[index];
		if (!target) return;
		setFolderLoading(true);
		try {
			const res = await api.get<{
				subfolders: FolderData[];
				snippets: PasteData[];
				role?: string;
			}>(`/folders/contents/${target.id}`);
			setFolderContents(res.data);
			setFolderStack((prev) => prev.slice(0, index + 1));
		} catch {
			// ignore
		} finally {
			setFolderLoading(false);
		}
	};

	if (!authLoading && !user) {
		return (
			<div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
				<div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
					<Users className="w-7 h-7" />
				</div>
				<h1 className="text-2xl font-bold mb-2">
					{t("shared.login_required_title")}
				</h1>
				<p className="text-muted-foreground text-sm max-w-md mb-6">
					{t("shared.login_required_desc")}
				</p>
				<Link to="/login">
					<Button>{t("header.login")}</Button>
				</Link>
			</div>
		);
	}

	const currentList =
		activeTab === "with_me" ? data.sharedWithMe : data.sharedByMe;
	const isEmpty =
		currentList.folders.length === 0 && currentList.pastes.length === 0;

	return (
		<div
			className={
				embedded
					? "space-y-5 pb-6 w-full"
					: "relative min-h-[90vh] bg-background p-4 md:p-8 overflow-x-hidden w-full"
			}
		>
			<div
				className={
					embedded
						? "w-full animate-in fade-in duration-300"
						: "max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
				}
			>
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
							<Users className="w-6 h-6" />
						</div>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold">
								{t("shared.page_title")}
							</h1>
							<p className="text-sm text-muted-foreground">
								{t("shared.page_subtitle")}
							</p>
						</div>
					</div>
				</div>

				{/* Tabs */}
				{folderStack.length === 0 && (
					<div className="inline-flex p-1 rounded-xl bg-muted/50 border border-border/60 mb-6">
						<button
							type="button"
							onClick={() => setActiveTab("with_me")}
							className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								activeTab === "with_me"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{t("shared.shared_with_me")} (
							{data.sharedWithMe.folders.length +
								data.sharedWithMe.pastes.length}
							)
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("by_me")}
							className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								activeTab === "by_me"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{t("shared.shared_by_me")} (
							{data.sharedByMe.folders.length +
								data.sharedByMe.pastes.length}
							)
						</button>
					</div>
				)}

				{/* Breadcrumb when inside a shared folder */}
				{folderStack.length > 0 && (
					<div className="flex items-center gap-2 mb-6 flex-wrap">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigateBreadcrumb(-1)}
							className="h-8 gap-1.5 text-xs"
						>
							<ArrowLeft className="w-3.5 h-3.5" />
							{t("shared.back_to_shared")}
						</Button>
						{folderStack.map((bc, idx) => (
							<div
								key={bc.id}
								className="flex items-center gap-1.5 text-xs"
							>
								<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
								<button
									type="button"
									onClick={() => navigateBreadcrumb(idx)}
									className={`font-medium hover:text-primary transition-colors cursor-pointer ${
										idx === folderStack.length - 1
											? "text-foreground font-semibold"
											: "text-muted-foreground"
									}`}
								>
									{bc.name}
								</button>
							</div>
						))}
					</div>
				)}

				{/* Content */}
				{loading || folderLoading ? (
					<div className="flex justify-center py-16">
						<Spinner className="h-6 w-6" />
					</div>
				) : folderStack.length > 0 && folderContents ? (
					<div className="space-y-6">
						{folderContents.subfolders.length > 0 && (
							<div>
								<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
									{t("shared.folders_heading")}
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
									{folderContents.subfolders.map((sub) => (
										<div
											key={sub._id}
											onClick={() =>
												openFolder(sub._id, sub.name)
											}
											className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
										>
											<div
												className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
												style={{
													backgroundColor: sub.color
														? `${sub.color}15`
														: "var(--color-primary-10)",
												}}
											>
												<Folder
													className="w-4.5 h-4.5"
													style={{
														color:
															sub.color ||
															"var(--color-primary)",
													}}
												/>
											</div>
											<span className="text-sm font-semibold truncate">
												{sub.name}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div>
							<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
								{t("shared.snippets_heading")}
							</h2>
							{folderContents.snippets.length === 0 ? (
								<div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl">
									{t("shared.empty_folder")}
								</div>
							) : (
								<Suspense
									fallback={
										<div className="flex justify-center py-8">
											<Spinner className="h-5 w-5" />
										</div>
									}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{folderContents.snippets.map(
											(item, index) => (
												<SnippetCard
													key={item.id}
													item={item}
													index={index}
												/>
											),
										)}
									</div>
								</Suspense>
							)}
						</div>
					</div>
				) : isEmpty ? (
					<div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-2xl bg-card/30">
						<Inbox className="w-10 h-10 text-muted-foreground/60 mb-3" />
						<h3 className="text-base font-semibold mb-1">
							{activeTab === "with_me"
								? t("shared.empty_with_me_title")
								: t("shared.empty_by_me_title")}
						</h3>
						<p className="text-xs text-muted-foreground max-w-sm">
							{activeTab === "with_me"
								? t("shared.empty_with_me_desc")
								: t("shared.empty_by_me_desc")}
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* Folders Section */}
						{currentList.folders.length > 0 && (
							<div>
								<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
									<Folder className="w-3.5 h-3.5" />
									{t("shared.folders_heading")}
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
									{currentList.folders.map((folder) => {
										const ownerObj =
											typeof folder.owner === "object"
												? folder.owner
												: null;
										return (
											<div
												key={folder._id}
												onClick={() =>
													openFolder(
														folder._id,
														folder.name,
													)
												}
												className="group flex flex-col justify-between p-4 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer gap-3"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="flex items-center gap-3 min-w-0">
														<div
															className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
															style={{
																backgroundColor:
																	folder.color
																		? `${folder.color}15`
																		: "var(--color-primary-10)",
															}}
														>
															<Folder
																className="w-4.5 h-4.5"
																style={{
																	color:
																		folder.color ||
																		"var(--color-primary)",
																}}
															/>
														</div>
														<div className="min-w-0">
															<h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
																{folder.name}
															</h3>
															{activeTab ===
																"with_me" &&
																ownerObj && (
																	<p className="text-[11px] text-muted-foreground truncate">
																		{ownerObj.username ||
																			ownerObj.email}
																	</p>
																)}
														</div>
													</div>
													{folder.sharedRole && (
														<Badge
															variant="secondary"
															className="text-[10px] capitalize shrink-0"
														>
															{folder.sharedRole}
														</Badge>
													)}
												</div>

												{activeTab === "by_me" && (
													<div
														className="flex items-center justify-between pt-2 border-t border-border/40"
														onClick={(e) =>
															e.stopPropagation()
														}
													>
														<span className="text-[11px] text-muted-foreground flex items-center gap-1">
															<Shield className="w-3 h-3" />
															{t(
																"shared.collaborators_count",
																{
																	count:
																		folder.collaboratorCount ||
																		0,
																},
															)}
														</span>
														<Button
															variant="ghost"
															size="sm"
															className="h-7 px-2 text-xs gap-1"
															onClick={() =>
																setShareTarget({
																	resourceType:
																		"folder",
																	resourceId:
																		folder._id,
																	resourceName:
																		folder.name,
																})
															}
														>
															<Settings2 className="w-3 h-3" />
															{t(
																"shared.manage_access",
															)}
														</Button>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Snippets Section */}
						{currentList.pastes.length > 0 && (
							<div>
								<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
									<FileText className="w-3.5 h-3.5" />
									{t("shared.snippets_heading")}
								</h2>
								<Suspense
									fallback={
										<div className="flex justify-center py-8">
											<Spinner className="h-5 w-5" />
										</div>
									}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{currentList.pastes.map(
											(item, index) => (
												<div
													key={item.id}
													className="flex flex-col gap-2"
												>
													<SnippetCard
														item={
															{
																...item,
																owner:
																	typeof item.owner ===
																	"string"
																		? item.owner
																		: item
																				.owner
																				?._id,
															} as PasteData
														}
														index={index}
													/>
													{activeTab === "by_me" && (
														<div className="flex items-center justify-between px-2">
															<span className="text-[11px] text-muted-foreground">
																{t(
																	"shared.collaborators_count",
																	{
																		count:
																			item.collaboratorCount ||
																			0,
																	},
																)}
															</span>
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2 text-xs gap-1"
																onClick={() =>
																	setShareTarget(
																		{
																			resourceType:
																				"paste",
																			resourceId:
																				item.id,
																			resourceName:
																				item.title ||
																				item.id,
																		},
																	)
																}
															>
																<Settings2 className="w-3 h-3" />
																{t(
																	"shared.manage_access",
																)}
															</Button>
														</div>
													)}
												</div>
											),
										)}
									</div>
								</Suspense>
							</div>
						)}
					</div>
				)}
			</div>

			{shareTarget && (
				<ShareResourceModal
					isOpen={!!shareTarget}
					onClose={() => {
						setShareTarget(null);
						void fetchShared();
					}}
					resourceType={shareTarget.resourceType}
					resourceId={shareTarget.resourceId}
					resourceName={shareTarget.resourceName}
				/>
			)}
		</div>
	);
}
