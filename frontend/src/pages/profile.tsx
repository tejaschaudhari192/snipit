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
	Laptop,
} from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupButton,
} from "@/components/ui/input-group";
import { ProfileFileManager } from "@/components/profile/profile-file-manager";
import { useSnippets } from "@/context/SnippetContext";
import { useFolders } from "@/context/FolderContext";
import { usePageTitle } from "@/hooks/use-page-title";
import type { User as UserType } from "@/types";
import { useSearchParams } from "react-router-dom";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { SidebarHeader } from "@/components/profile/sidebar-header";
import { ProfileSidebarNav } from "@/components/profile/profile-sidebar-nav";

const FolderTree = lazy(() =>
	import("@/components/profile/folder-tree").then((m) => ({
		default: m.FolderTree,
	})),
);
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
const DevicesView = lazy(() =>
	import("@/components/profile/devices-view").then((m) => ({
		default: m.DevicesView,
	})),
);
const LogoutDialog = lazy(() =>
	import("@/components/header/logout-dialog").then((m) => ({
		default: m.LogoutDialog,
	})),
);
const AvatarPickerDialog = lazy(() =>
	import("@/components/profile/avatar-picker-dialog").then((m) => ({
		default: m.AvatarPickerDialog,
	})),
);

const ProfilePage = () => {
	const { t } = useTranslation();
	usePageTitle("profile.title");
	const { user, loading: authLoading, setUser } = useAuth();
	const {
		activeFolderId,
		currentFolderContents,
		loadingContents,
		loadTree,
		loadFolderContents,
	} = useFolders();

	const { profile, loadProfile, loadStats } = useSnippets();

	const {
		items: pastes,
		loading: loadingPastes,
		hasMore,
		isLoadingMore,
	} = profile;

	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = (
		searchParams.get("tab") === "devices" ? "devices" : "snippets"
	) as "snippets" | "devices";

	const handleTabChange = (tab: "snippets" | "devices") => {
		setSearchParams(tab === "devices" ? { tab: "devices" } : {});
	};

	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	useEffect(() => {
		if (user) {
			setNewName(user.username);
			if (pastes.length === 0) loadProfile(true);
			loadStats();
			loadTree();
		} else {
			setNewName("Guest");
			if (pastes.length === 0) loadProfile(true);
		}
	}, [user, loadProfile, loadStats, loadTree, pastes.length]);

	useEffect(() => {
		if (user) {
			loadFolderContents(activeFolderId);
		}
	}, [user, activeFolderId, loadFolderContents]);

	const handleUpdateAvatar = async (avatar: string | undefined) => {
		try {
			const updatedUser = await updateMe({ avatar: avatar || "" });
			setUser({ ...user!, avatar: updatedUser.avatar });
			toast.add({
				title: t("profile.avatar.updated"),
				type: "success",
			});
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } })
							.response?.data?.message
					: undefined;
			toast.add({
				title: errorMessage || t("profile.avatar.update_failed"),
				type: "error",
			});
			throw error;
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
		<div className="flex flex-col flex-1 w-full min-h-0 gap-3">
			{/* Top Header */}
			<div className="flex items-center justify-between px-1 pt-1 shrink-0">
				<SidebarHeader />
				<button
					onClick={() => setIsSidebarOpen(false)}
					className="hidden lg:flex p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					title="Hide Sidebar"
				>
					<PanelLeftClose className="h-4 w-4" />
				</button>
			</div>

			{/* Microsoft/GitHub Style Tab Switcher */}
			<div className="shrink-0 pt-1 pb-1">
				<ProfileSidebarNav
					activeTab={activeTab}
					onTabChange={(tab) => {
						handleTabChange(tab);
						setIsMobileSidebarOpen(false);
					}}
					snippetsCount={pastes.length}
				/>
			</div>

			{/* Folder Explorer Tree Container (rendered when in snippets mode) */}
			<div className="flex-1 min-h-0 overflow-hidden">
				{activeTab === "snippets" ? (
					<Suspense
						fallback={
							<div className="space-y-2 p-2">
								<ShimmerSection
									type="card"
									className="h-10 rounded-xl"
								/>
								<ShimmerSection
									type="card"
									className="h-10 rounded-xl"
								/>
								<ShimmerSection
									type="card"
									className="h-10 rounded-xl"
								/>
							</div>
						}
					>
						<FolderTree />
					</Suspense>
				) : (
					<div className="h-full rounded-2xl border border-dashed border-border/60 p-4 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground bg-card/20">
						<Laptop className="w-8 h-8 text-primary/60 mb-1" />
						<p className="text-xs font-semibold text-foreground">
							{t("profile.devices.title")}
						</p>
						<p className="text-[11px] leading-relaxed">
							{t("profile.devices.subtitle")}
						</p>
					</div>
				)}
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
						onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
						onOpenDevices={() => handleTabChange("devices")}
					/>
				</Suspense>
			</div>
		</div>
	);

	return (
		<div className="relative h-full flex-1 flex flex-col bg-background w-full min-h-0 overflow-hidden">
			<div className="flex flex-1 w-full gap-6 p-4 md:p-6 min-h-0 overflow-hidden transition-all duration-300">
				{/* Desktop Left Sidebar Section */}
				{isSidebarOpen && (
					<aside className="hidden lg:flex w-80 shrink-0 border border-border/60 bg-sidebar/50 backdrop-blur-xl rounded-3xl p-4 flex-col h-full shadow-sm animate-in fade-in slide-in-from-left-4 duration-300 min-h-0">
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
				<main className="flex-1 min-w-0 min-h-0 bg-transparent p-0 flex flex-col overflow-y-auto custom-scrollbar">
					{activeTab === "devices" ? (
						<div className="space-y-5 pb-6">
							{/* Devices View Header controls */}
							<div className="flex items-center gap-3 px-1">
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
							</div>

							<Suspense
								fallback={
									<ShimmerSection
										type="card"
										className="h-96"
									/>
								}
							>
								<DevicesView />
							</Suspense>
						</div>
					) : (
						<div className="space-y-5 pb-6">
							{/* Main Header & Actions */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
								<div className="flex items-center gap-3">
									{/* Desktop Toggle Button */}
									{!isSidebarOpen && (
										<button
											onClick={() =>
												setIsSidebarOpen(true)
											}
											className="hidden lg:flex p-2 rounded-2xl bg-sidebar/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs shrink-0"
											title="Show Sidebar"
										>
											<PanelLeftOpen className="h-5 w-5 text-primary" />
										</button>
									)}
									{/* Mobile Open Sidebar Drawer Button */}
									<button
										onClick={() =>
											setIsMobileSidebarOpen(true)
										}
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
											Manage and organize your saved code
											snippets
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									{/* Contextual Snippet Search InputGroup */}
									<InputGroup className="w-56 sm:w-64 h-9 rounded-xl bg-card/60 border-border/50 focus-within:bg-background focus-within:border-primary/50 transition-all">
										<InputGroupAddon align="inline-start">
											<Tag className="h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within/input-group:text-primary ml-1" />
										</InputGroupAddon>
										<InputGroupInput
											type="text"
											placeholder="Search snippets..."
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											className="text-xs font-medium"
										/>
										{searchQuery && (
											<InputGroupAddon align="inline-end">
												<InputGroupButton
													variant="ghost"
													size="icon-xs"
													onClick={() =>
														setSearchQuery("")
													}
													className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
												>
													<FilterX className="h-3 w-3" />
												</InputGroupButton>
											</InputGroupAddon>
										)}
									</InputGroup>

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

							{/* Content Area */}
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
						</div>
					)}
				</main>
			</div>
			<Suspense fallback={null}>
				<LogoutDialog
					open={isLogoutDialogOpen}
					onOpenChange={setIsLogoutDialogOpen}
				/>
				{user && (
					<AvatarPickerDialog
						open={isAvatarPickerOpen}
						onOpenChange={setIsAvatarPickerOpen}
						currentAvatar={user.avatar}
						username={user.username}
						onSave={handleUpdateAvatar}
					/>
				)}
			</Suspense>
		</div>
	);
};

export default ProfilePage;
