import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { User, Tag, Bookmark, FilterX } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLabels } from "@/hooks/use-labels";

import { useSnippets } from "@/context/SnippetContext";
import { usePageTitle } from "@/hooks/use-page-title";
import type { User as UserType } from "@/types";

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
	const apiHelpers = useApiHelpers();
	const {
		profile,
		savedProfile,
		filteredPastes,
		loadProfile,
		loadSavedProfile,
		loadFilteredPastes,
		clearFilter,
		stats,
	} = useSnippets();

	const { allLabels } = useLabels();

	const {
		items: pastes,
		loading: loadingPastes,
		hasMore,
		isLoadingMore,
	} = profile;

	const { items: savedPastes, loading: loadingSaved } = savedProfile;

	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [activeLabel, setActiveLabel] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("owned");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (user) {
			setNewName(user.username);
			if (pastes.length === 0) loadProfile(true);
			if (savedPastes.length === 0) loadSavedProfile(true);
		} else {
			setNewName("Guest");
			if (pastes.length === 0) loadProfile(true);
			if (savedPastes.length === 0) loadSavedProfile(true);
		}
	}, [
		user,
		loadProfile,
		loadSavedProfile,
		pastes.length,
		savedPastes.length,
	]);

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
			const updatedUser = await apiHelpers.updateMe({
				username: newName,
			});
			setUser({ ...user!, username: updatedUser.username });
			toast.success(t("profile.profile_updated"));
			setIsEditingName(false);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } })
							.response?.data?.message
					: undefined;
			toast.error(errorMessage || t("profile.update_failed"));
		} finally {
			setIsUpdating(false);
		}
	};

	if (authLoading) {
		return (
			<div className="container mx-auto px-4 py-12 max-w-7xl animate-in fade-in duration-500">
				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
					<div className="lg:col-span-4">
						<ShimmerSection type="card" className="h-[400px]" />
					</div>
					<div className="lg:col-span-8 flex flex-col gap-4">
						<ShimmerSection type="card" />
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

	return (
		<div className="relative min-h-screen bg-background overflow-x-hidden flex flex-col items-center w-full">
			<div className="relative z-10 container mx-auto px-4 py-4 md:py-6 max-w-7xl w-full animate-in fade-in duration-700">
				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start">
					<div className="w-full lg:col-span-4 lg:sticky lg:top-8 max-w-2xl mx-auto lg:max-w-none flex flex-col gap-6 pt-1">
						{/* Alignment Header & Search */}
						<div className="px-2 space-y-4">
							<div className="flex items-center gap-3 h-10">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
									<User className="h-5 w-5" />
								</div>
								<h2 className="text-3xl font-black tracking-tight italic leading-none truncate">
									{t("profile.overview", "Profile Overview")}
								</h2>
							</div>

							<div className="relative group">
								<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
									<Tag className="h-4 w-4" />
								</div>
								<input
									type="text"
									placeholder="Search your snippets..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="w-full pl-11 pr-4 h-12 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery("")}
										className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
									>
										<FilterX className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>

						<Suspense
							fallback={
								<ShimmerSection
									type="card"
									className="h-[400px]"
								/>
							}
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
								pastes={displayPastes}
								onLogout={() => setIsLogoutDialogOpen(true)}
								stats={stats}
							/>
						</Suspense>
					</div>
					<div className="w-full lg:col-span-8 max-w-4xl mx-auto lg:max-w-none">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-2">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
									<User className="h-5 w-5" />
								</div>
								<h2 className="text-3xl font-black tracking-tight italic">
									{t("profile.your_snippets")}
								</h2>
							</div>
							<Link to="/">
								<Button
									size="sm"
									className="gap-2 font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-6 w-full sm:w-auto"
								>
									{t("header.new_snippet")}
								</Button>
							</Link>
						</div>

						{/* Labels Filter Bar */}
						{allLabels && allLabels.length > 0 && (
							<div className="flex items-center gap-2 mb-4 px-2 overflow-x-auto no-scrollbar pb-2">
								<div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
									<Tag className="w-3 h-3" />
									Filters
								</div>
								{allLabels.map((label) => (
									<button
										key={label}
										onClick={() => handleLabelClick(label)}
										className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
											activeLabel === label
												? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
												: "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
										}`}
									>
										{label}
									</button>
								))}
								{activeLabel && (
									<button
										onClick={() => {
											setActiveLabel(null);
											clearFilter();
										}}
										className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
										title="Clear filter"
									>
										<FilterX className="w-4 h-4" />
									</button>
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
									/>
								</Suspense>
							</div>
						) : (
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-full"
							>
								<TabsList className="mb-4 mx-2">
									<TabsTrigger
										value="owned"
										className="gap-2 px-6"
									>
										<User className="w-4 h-4" />
										My Snippets
									</TabsTrigger>
									<TabsTrigger
										value="saved"
										className="gap-2 px-6"
									>
										<Bookmark className="w-4 h-4" />
										Saved
									</TabsTrigger>
								</TabsList>
								<TabsContent
									value="owned"
									className="mt-0 outline-none"
								>
									<Suspense
										fallback={
											<ShimmerSection type="card" />
										}
									>
										<ProfileSnippetList
											pastes={displayPastes}
											loading={displayLoading}
											loadMore={() =>
												user && loadProfile(false)
											}
											hasMore={user ? hasMore : false}
											isLoadingMore={
												user ? isLoadingMore : false
											}
										/>
									</Suspense>
								</TabsContent>
								<TabsContent
									value="saved"
									className="mt-0 outline-none"
								>
									<Suspense
										fallback={
											<ShimmerSection type="card" />
										}
									>
										<ProfileSnippetList
											pastes={savedPastes}
											loading={loadingSaved}
											loadMore={() => {}}
											hasMore={false}
											isLoadingMore={false}
										/>
									</Suspense>
								</TabsContent>
							</Tabs>
						)}
					</div>
				</div>
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
