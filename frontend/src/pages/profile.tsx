import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { updateMe } from "@/lib/api/auth";
import { toast } from "@/components/ui/toast";
import { Link } from "react-router-dom";
import {
	User,
	Tag,
	FilterX,
	PanelLeftClose,
	PanelLeftOpen,
} from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLabels } from "@/hooks/use-labels";
import { FolderTree } from "@/components/profile/folder-tree";
import { ProfileFileManager } from "@/components/profile/profile-file-manager";
import { useSnippets } from "@/context/SnippetContext";
import { useFolders } from "@/context/FolderContext";
import { usePageTitle } from "@/hooks/use-page-title";
import type { User as UserType } from "@/types";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { SidebarHeader } from "@/components/profile/sidebar-header";

const ProfileInfo = lazy(() =>
	import("@/components/profile/profile-info").then((m) => ({
		default: m.ProfileInfo,
	})),
);
const ProfileSnippetList = lazy(() =>
	import("@/components/profile/profile-snippet-list").then((m) => ({
		default: m.ProfileSnippetList,
	})),
);
const LogoutDialog = lazy(() =>
	import("@/components/header/logout-dialog").then((m) => ({
		default: m.LogoutDialog,
	})),
);

const ProfilePage = () => {
	const { t } = useTranslation();
	usePageTitle("profile.title");
	const { user, loading: authLoading, setUser } = useAuth();
	const { activeFolderId, currentFolderContents, loadingContents } =
		useFolders();

	const {
		profile,
		filteredPastes,
		loadProfile,
		loadFilteredPastes,
		clearFilter,
	} = useSnippets();

	const { allLabels } = useLabels();

	const {
		items: pastes,
		loading: loadingPastes,
		hasMore,
		isLoadingMore,
	} = profile;

	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [activeLabel, setActiveLabel] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const snippetCount = pastes.length;
	const folderCount = allLabels?.length;

	useEffect(() => {
		if (user) {
			setNewName(user.username);
			if (pastes.length === 0) loadProfile(true);
		} else {
			setNewName("Guest");
			if (pastes.length === 0) loadProfile(true);
		}
	}, [user, loadProfile, pastes.length]);

	const handleLabelClick = (label: string) => {
		if (activeLabel === label) {
			setActiveLabel(null);
			clearFilter();
		} else {
			setActiveLabel(label);
			loadFilteredPastes(label);
		}
	};

	const handleUpdateName = async () => {
		if (!newName.trim() || newName === user?.username) {
			setIsEditingName(false);
			return;
		}

		try {
			setIsUpdating(true);
			const updatedUser = await updateMe({
				username: newName,
			});
			setUser({ ...user!, username: updatedUser.username });
			toast.add({ title: t("profile.profile_updated"), type: "success" });
			setIsEditingName(false);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } })
							.response?.data?.message
					: undefined;
			toast.add({
				title: errorMessage || t("profile.update_failed"),
				type: "error",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	if (authLoading) {
		return (
			<div className="w-full px-2 py-4">
				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
					<div className="lg:col-span-4">
						<ShimmerSection type="card" className="h-100" />
					</div>
					<div className="lg:col-span-8 flex flex-col gap-4">
						<ShimmerSection type="card" />
						<ShimmerSection type="card" />
					</div>
				</div>
			</div>
		);
	}

	const displayPastes = searchQuery.trim()
		? pastes.filter(
				(p) =>
					p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.fileName
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					p.content
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			)
		: pastes;
	const displayLoading = loadingPastes;

	const SidebarContent = (
		<div className="flex flex-col h-full gap-4">
			{/* Top Header */}
			<div className="flex items-center justify-between px-1 pt-1 shrink-0">
				<SidebarHeader
					snippetCount={snippetCount}
					folderCount={folderCount}
				/>
				<button
					onClick={() => setIsSidebarOpen(false)}
					className="hidden lg:flex p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					title="Hide Sidebar"
				>
					<PanelLeftClose className="h-4 w-4" />
				</button>
			</div>

			{/* Folder Explorer Tree Container */}
			<div className="flex-1 overflow-y-auto pr-1 min-h-0">
				<FolderTree />
			</div>

			{/* Account Footer Info Widget */}
			<div className="pt-3 border-t border-border/40 shrink-0">
				<Suspense
					fallback={<ShimmerSection type="card" className="h-16" />}
				>
					<ProfileInfo
						user={
							user ||
							({
								username: "Guest",
								email: "Guest User",
							} as UserType)
						}
						isEditingName={isEditingName}
						setIsEditingName={setIsEditingName}
						newName={newName}
						setNewName={setNewName}
						handleUpdateName={handleUpdateName}
						isUpdating={isUpdating}
						onLogout={() => setIsLogoutDialogOpen(true)}
					/>
				</Suspense>
			</div>
		</div>
	);

	return (
		<div className="relative min-h-dvh bg-background w-full">
			<div className="flex w-full gap-6 p-4 md:p-6 transition-all duration-300">
				{/* Desktop Left Sidebar Section */}
				{isSidebarOpen && (
					<aside className="hidden lg:flex w-80 shrink-0 border border-border/60 bg-sidebar/50 backdrop-blur-xl rounded-3xl p-4 flex-col sticky top-4 h-[calc(100vh-2rem)] shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
						{SidebarContent}
					</aside>
				)}

				{/* Mobile Sheet / Drawer Sidebar */}
				<Sheet
					open={isMobileSidebarOpen}
					onOpenChange={setIsMobileSidebarOpen}
				>
					<SheetContent
						side="left"
						className="w-77.5 p-4 flex flex-col h-full bg-sidebar/95 backdrop-blur-2xl border-r border-border/60"
					>
						<SheetHeader className="p-0 mb-2">
							<SheetTitle className="sr-only">
								{t("profile.overview")}
							</SheetTitle>
						</SheetHeader>
						{SidebarContent}
					</SheetContent>
				</Sheet>

				{/* Right Content Section */}
				<main className="flex-1 min-w-0 bg-transparent p-0 space-y-5">
					{/* Main Header & Actions */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
						<div className="flex items-center gap-3">
							{/* Desktop Toggle Button */}
							{!isSidebarOpen && (
								<button
									onClick={() => setIsSidebarOpen(true)}
									className="hidden lg:flex p-2 rounded-2xl bg-sidebar/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs shrink-0"
									title="Show Sidebar"
								>
									<PanelLeftOpen className="h-5 w-5 text-primary" />
								</button>
							)}
							{/* Mobile Open Sidebar Drawer Button */}
							<button
								onClick={() => setIsMobileSidebarOpen(true)}
								className="lg:hidden flex p-2 rounded-2xl bg-sidebar/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs shrink-0"
								title="Open Sidebar"
							>
								<PanelLeftOpen className="h-5 w-5 text-primary" />
							</button>
							<div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-xs">
								<User className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-2xl font-black tracking-tight text-foreground">
									{t("profile.your_snippets")}
								</h2>
								<p className="text-xs text-muted-foreground font-medium">
									Manage and organize your saved code snippets
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							{/* Contextual Snippet Search Input */}
							<div className="relative group min-w-50 sm:min-w-60">
								<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
									<Tag className="h-4 w-4" />
								</div>
								<Input
									type="text"
									placeholder="Search snippets..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="pl-9 pr-8 h-9 text-xs rounded-xl bg-card/60 border-border/50 focus:bg-background transition-all"
								/>
								{searchQuery && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setSearchQuery("")}
										className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
									>
										<FilterX className="h-3 w-3" />
									</Button>
								)}
							</div>

							<Link to="/">
								<Button
									size="sm"
									className="h-9 gap-2 font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-5"
								>
									{t("header.new_snippet")}
								</Button>
							</Link>
						</div>
					</div>

					{/* Labels Filter Bar */}
					{allLabels && allLabels.length > 0 && (
						<div className="flex items-center gap-2 mb-4 px-2 overflow-x-auto no-scrollbar pb-2">
							<div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground tracking-wider mr-2 shrink-0">
								<Tag className="w-3 h-3" />
								Filters
							</div>
							{allLabels.map((label) => (
								<Button
									key={label}
									variant={
										activeLabel === label
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => handleLabelClick(label)}
									className={`rounded-full text-xs font-bold transition-all shrink-0 ${
										activeLabel === label
											? "shadow-md scale-105"
											: "text-muted-foreground"
									}`}
								>
									{label}
								</Button>
							))}
							{activeLabel && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										setActiveLabel(null);
										clearFilter();
									}}
									className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
									title="Clear filter"
								>
									<FilterX className="w-4 h-4" />
								</Button>
							)}
						</div>
					)}

					{/* Content Area */}
					{activeLabel ? (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							<div className="flex items-center gap-2 px-2 mb-4 text-sm text-muted-foreground">
								<span>Showing results for</span>
								<span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
									{activeLabel}
								</span>
							</div>
							<Suspense
								fallback={
									<ShimmerSection type="card" lines={3} />
								}
							>
								<ProfileSnippetList
									pastes={filteredPastes || []}
									loading={filteredPastes === null}
									loadMore={() => {}}
									hasMore={false}
									isLoadingMore={false}
									viewMode={viewMode}
								/>
							</Suspense>
						</div>
					) : (
						<>
							<ProfileFileManager
								viewMode={viewMode}
								onViewModeChange={setViewMode}
								subfolders={
									activeFolderId !== null
										? currentFolderContents.subfolders
										: undefined
								}
							/>

							<Suspense fallback={<ShimmerSection type="card" />}>
								<ProfileSnippetList
									pastes={
										activeFolderId !== null
											? currentFolderContents.snippets
											: displayPastes
									}
									loading={
										activeFolderId !== null
											? loadingContents
											: displayLoading
									}
									loadMore={() =>
										user &&
										activeFolderId === null &&
										loadProfile(false)
									}
									hasMore={
										user && activeFolderId === null
											? hasMore
											: false
									}
									isLoadingMore={
										user && activeFolderId === null
											? isLoadingMore
											: false
									}
									isFolderEmpty={
										activeFolderId !== null &&
										currentFolderContents.snippets
											.length === 0
									}
									viewMode={viewMode}
								/>
							</Suspense>
						</>
					)}
				</main>
			</div>
			<Suspense fallback={null}>
				<LogoutDialog
					open={isLogoutDialogOpen}
					onOpenChange={setIsLogoutDialogOpen}
				/>
			</Suspense>
		</div>
	);
};

export default ProfilePage;
