import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
	User,
	Mail,
	Calendar,
	FileText,
	Edit2,
	Check,
	X,
	Timer,
	Calendar as CalendarIcon,
	Link as LinkIcon,
	ChevronRight,
	Loader2,
	Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LanguageIcon } from "@/components/language-icon";
import { timeAgo, getTimeRemaining } from "@/lib/utils";
import type { PasteData } from "@/types";

const ProfilePage = () => {
	const { t } = useTranslation();
	const { user, loading: authLoading, setUser } = useAuth();
	const apiHelpers = useApiHelpers();

	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [pastes, setPastes] = useState<PasteData[]>([]);
	const [loadingPastes, setLoadingPastes] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	const fetchPastes = useCallback(async () => {
		try {
			setLoadingPastes(true);
			const data = await apiHelpers.getUserPastes();
			setPastes(data);
		} catch (error) {
			console.error("Failed to fetch pastes", error);
			toast.error(
				t("profile.loading_failed", "Failed to load your snippets"),
			);
		} finally {
			setLoadingPastes(false);
		}
	}, [apiHelpers, t]);

	useEffect(() => {
		if (user) {
			setNewName(user.username);
			fetchPastes();
		}
	}, [user, fetchPastes]);

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
			toast.success(
				t("profile.profile_updated", "Profile updated successfully"),
			);
			setIsEditingName(false);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } })
							.response?.data?.message
					: undefined;
			toast.error(
				errorMessage ||
					t("profile.update_failed", "Failed to update profile"),
			);
		} finally {
			setIsUpdating(false);
		}
	};

	const getLanguageColor = (language: string) => {
		const colors: Record<string, string> = {
			javascript:
				"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
			typescript:
				"bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
			python: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
			java: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
			html: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
			css: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
			json: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
			rust: "bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20",
			go: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
			shell: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
			bash: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
		};
		return (
			colors[language] || "bg-primary/10 text-primary border-primary/20"
		);
	};

	if (authLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh] container mx-auto px-4">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<p className="mt-4 text-muted-foreground animate-pulse">
					{t("profile.checking_auth", "Checking authentication...")}
				</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh] container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center space-y-4"
				>
					<div className="p-4 rounded-full bg-muted inline-block">
						<User className="h-12 w-12 text-muted-foreground" />
					</div>
					<h2 className="text-2xl font-bold">
						{t("profile.access_denied", "Access Denied")}
					</h2>
					<p className="text-muted-foreground max-w-sm">
						{t(
							"profile.login_required",
							"Please login to view your profile and manage your snippets.",
						)}
					</p>
					<Link to="/login">
						<Button className="mt-4">
							{t("header.login", "Login Now")}
						</Button>
					</Link>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
			<div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
				{/* Profile Header Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative"
				>
					<div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
					<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden">
						<div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
						<CardContent className="relative pt-0 px-6 pb-8">
							<div className="flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 md:-mt-16">
								<div className="relative group">
									<div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-1 shadow-2xl transform transition-transform group-hover:scale-105">
										<div className="h-full w-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
											<User className="h-12 w-12 md:h-16 md:w-16 text-primary" />
										</div>
									</div>
								</div>

								<div className="flex-1 space-y-2 text-center md:text-left min-w-0 w-full md:w-auto">
									<AnimatePresence mode="wait">
										{isEditingName ? (
											<motion.div
												key="edit"
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												className="flex items-center gap-2 max-w-md mx-auto md:mx-0"
											>
												<Input
													value={newName}
													onChange={(e) =>
														setNewName(
															e.target.value,
														)
													}
													className="text-2xl font-bold h-12 bg-background/50 border-primary/30"
													autoFocus
													onKeyDown={(e) => {
														if (e.key === "Enter")
															handleUpdateName();
														if (e.key === "Escape")
															setIsEditingName(
																false,
															);
													}}
												/>
												<Button
													size="icon"
													className="h-12 w-12 shrink-0"
													onClick={handleUpdateName}
													disabled={isUpdating}
												>
													{isUpdating ? (
														<Loader2 className="h-5 w-5 animate-spin" />
													) : (
														<Check className="h-5 w-5" />
													)}
												</Button>
												<Button
													variant="outline"
													size="icon"
													className="h-12 w-12 shrink-0"
													onClick={() =>
														setIsEditingName(false)
													}
												>
													<X className="h-5 w-5" />
												</Button>
											</motion.div>
										) : (
											<motion.div
												key="view"
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												className="flex items-center justify-center md:justify-start gap-3"
											>
												<h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
													{user.username}
													<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
												</h1>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
													onClick={() =>
														setIsEditingName(true)
													}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
											</motion.div>
										)}
									</AnimatePresence>

									<div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-muted-foreground">
										<div className="flex items-center gap-1.5 text-sm font-medium">
											<Mail className="h-4 w-4" />
											{user.email}
										</div>
										<Separator
											orientation="vertical"
											className="h-4 hidden sm:block"
										/>
										<div className="flex items-center gap-1.5 text-sm font-medium">
											<Calendar className="h-4 w-4" />
											{t("profile.joined", "Joined")}{" "}
											{new Date(
												user.createdAt || Date.now(),
											).toLocaleDateString(undefined, {
												month: "long",
												year: "numeric",
											})}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-4 w-full md:w-auto justify-center">
									<div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center min-w-[100px]">
										<div className="text-2xl font-black text-primary">
											{pastes.length}
										</div>
										<div className="text-[10px] uppercase tracking-wider font-bold text-primary/70">
											{t(
												"profile.snippets_count",
												"Snippets",
											)}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
					{/* Sidebar / Stats */}
					<div className="lg:col-span-1 space-y-6">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Card className="border-border/50 bg-background/50 backdrop-blur-md">
								<CardContent className="p-6 space-y-6">
									<h3 className="font-bold flex items-center gap-2">
										<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
											<Loader2 className="h-4 w-4" />
										</div>
										{t(
											"profile.activity",
											"Account Activity",
										)}
									</h3>
									<div className="space-y-4">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												{t(
													"profile.total_views",
													"Total Views",
												)}
											</span>
											<span className="font-bold">
												{pastes.reduce(
													(acc, p) =>
														acc + (p.views || 0),
													0,
												)}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												{t(
													"profile.most_used_language",
													"Most Used Language",
												)}
											</span>
											<span className="font-bold uppercase">
												{pastes.length > 0
													? Object.entries(
															pastes.reduce(
																(acc, p) => {
																	const lang =
																		p.language ||
																		"text";
																	acc[lang] =
																		(acc[
																			lang
																		] ||
																			0) +
																		1;
																	return acc;
																},
																{} as Record<
																	string,
																	number
																>,
															),
														).sort(
															(a, b) =>
																b[1] - a[1],
														)[0][0]
													: t(
															"profile.not_applicable",
															"N/A",
														)}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Snippets List */}
					<div className="lg:col-span-2 space-y-6">
						<div className="flex items-center justify-between px-2">
							<h2 className="text-2xl font-bold flex items-center gap-3">
								<FileText className="h-6 w-6 text-primary" />
								{t("profile.your_snippets", "Your Snippets")}
							</h2>
							<Link to="/">
								<Button
									variant="outline"
									size="sm"
									className="gap-2"
								>
									{t("header.new_snippet", "New Snippet")}{" "}
									<ChevronRight className="h-4 w-4" />
								</Button>
							</Link>
						</div>

						{loadingPastes ? (
							<div className="flex flex-col items-center justify-center py-20 gap-4">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<p className="text-muted-foreground">
									{t(
										"profile.loading_pastes",
										"Loading your creations...",
									)}
								</p>
							</div>
						) : pastes.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="bg-card/30 backdrop-blur-sm rounded-3xl border border-dashed border-border/60 p-20 text-center"
							>
								<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
									<Inbox className="h-10 w-10 text-muted-foreground" />
								</div>
								<h3 className="text-2xl font-semibold mb-2">
									{t(
										"profile.no_snippets",
										"No snippets yet",
									)}
								</h3>
								<p className="text-muted-foreground mb-8 text-lg">
									{t(
										"profile.no_snippets_desc",
										"Your shared code masterpieces will appear here!",
									)}
								</p>
								<Link to="/">
									<Button
										size="lg"
										className="rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
									>
										{t(
											"profile.create_first",
											"Create Your First Snippet",
										)}
									</Button>
								</Link>
							</motion.div>
						) : (
							<div className="grid gap-4">
								{pastes.map((paste, idx) => (
									<motion.div
										key={paste.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 + idx * 0.05 }}
									>
										<Link
											to={`/${paste.id}`}
											className="group block bg-card/40 backdrop-blur-sm hover:bg-card/70 border border-border/50 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
										>
											<div className="flex flex-col gap-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<Badge
															className={`px-2.5 py-0.5 border shadow-none ${
																paste.redirectUrl
																	? "bg-blue-500/10 text-blue-600 border-blue-500/20"
																	: getLanguageColor(
																			paste.language ||
																				"text",
																		)
															}`}
														>
															{paste.redirectUrl ? (
																<LinkIcon className="h-3 w-3 mr-1" />
															) : (
																<LanguageIcon
																	language={
																		paste.language ||
																		"text"
																	}
																	className="h-3 w-3 mr-1"
																/>
															)}
															<span className="uppercase text-[10px] font-bold tracking-wider">
																{paste.redirectUrl
																	? "Link"
																	: paste.language}
															</span>
														</Badge>
														<span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded italic">
															/{paste.id}
														</span>
													</div>

													<div className="flex items-center gap-4">
														<div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
															<CalendarIcon className="h-3 w-3" />
															{timeAgo(
																paste.createdAt,
															)}
														</div>
														<div
															className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
																new Date(
																	paste.expiresAt,
																).getTime() <
																Date.now()
																	? "bg-destructive/10 text-destructive border-destructive/20"
																	: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
															}`}
														>
															<Timer className="h-3 w-3" />
															{new Date(
																paste.expiresAt,
															).getTime() <
															Date.now()
																? t(
																		"profile.expired",
																		"Expired",
																	)
																: getTimeRemaining(
																		paste.expiresAt,
																	)}
														</div>
													</div>
												</div>

												<div className="relative">
													<pre className="text-sm font-mono text-foreground/70 bg-muted/20 p-4 rounded-xl border border-border/20 overflow-hidden line-clamp-2 italic leading-relaxed">
														{paste.content}
													</pre>
													<div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-xl" />
												</div>

												<div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
													<div className="flex items-center gap-4">
														<span className="flex items-center gap-1">
															<span className="h-1.5 w-1.5 rounded-full bg-primary" />
															{paste.views || 0}{" "}
															{t(
																"profile.views",
																"views",
															)}
														</span>
														{paste.visibility && (
															<span className="flex items-center gap-1 capitalize">
																<span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
																{t(
																	`profile.visibility.${paste.visibility}`,
																	paste.visibility,
																)}
															</span>
														)}
													</div>
													<div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider text-[10px]">
														{t(
															"profile.view_details",
															"View Details",
														)}
														<ChevronRight className="h-3 w-3" />
													</div>
												</div>
											</div>
										</Link>
									</motion.div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
