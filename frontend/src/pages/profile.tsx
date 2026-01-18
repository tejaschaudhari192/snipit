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
	Loader2,
	ChevronRight,
	Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SnippetCard } from "@/components/snippet-card";
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
			<div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
					<div className="md:col-span-4 space-y-6 md:sticky md:top-24">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden">
								<div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
								<CardContent className="relative pt-0 px-6 pb-8">
									<div className="flex flex-col items-center -mt-12 mb-6">
										<div className="relative group">
											<div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-1 shadow-2xl transform transition-transform group-hover:scale-105">
												<div className="h-full w-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
													<User className="h-10 w-10 text-primary" />
												</div>
											</div>
										</div>

										<div className="mt-4 w-full text-center space-y-4">
											<AnimatePresence mode="wait">
												{isEditingName ? (
													<motion.div
														key="edit"
														initial={{
															opacity: 0,
															y: -5,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: 5,
														}}
														className="flex items-center gap-2"
													>
														<Input
															value={newName}
															onChange={(e) =>
																setNewName(
																	e.target
																		.value,
																)
															}
															className="text-lg font-bold h-10 bg-background/50 border-primary/30"
															autoFocus
															onKeyDown={(e) => {
																if (
																	e.key ===
																	"Enter"
																)
																	handleUpdateName();
																if (
																	e.key ===
																	"Escape"
																)
																	setIsEditingName(
																		false,
																	);
															}}
														/>
														<div className="flex gap-1">
															<Button
																size="icon"
																variant="default"
																className="h-10 w-10 shrink-0"
																onClick={
																	handleUpdateName
																}
																disabled={
																	isUpdating
																}
															>
																{isUpdating ? (
																	<Loader2 className="h-4 w-4 animate-spin" />
																) : (
																	<Check className="h-4 w-4" />
																)}
															</Button>
															<Button
																variant="outline"
																size="icon"
																className="h-10 w-10 shrink-0"
																onClick={() =>
																	setIsEditingName(
																		false,
																	)
																}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</motion.div>
												) : (
													<motion.div
														key="view"
														initial={{
															opacity: 0,
															y: 5,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: -5,
														}}
														className="flex items-center justify-center gap-2 group"
													>
														<h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
															{user.username}
															<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
														</h1>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
															onClick={() =>
																setIsEditingName(
																	true,
																)
															}
														>
															<Edit2 className="h-3 w-3" />
														</Button>
													</motion.div>
												)}
											</AnimatePresence>

											<div className="space-y-1">
												<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
													<Mail className="h-3.5 w-3.5" />
													{user.email}
												</div>
												<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
													<Calendar className="h-3.5 w-3.5" />
													{t(
														"profile.joined",
														"Joined",
													)}{" "}
													{new Date(
														user.createdAt ||
															Date.now(),
													).toLocaleDateString(
														undefined,
														{
															month: "short",
															year: "numeric",
														},
													)}
												</div>
											</div>
										</div>
									</div>

									<Separator className="bg-border/50 mb-6" />

									<div className="grid grid-cols-2 gap-4">
										<div className="bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl p-3 text-center transition-colors">
											<div className="text-xl font-black text-primary">
												{pastes.length}
											</div>
											<div className="text-[10px] uppercase tracking-wider font-bold text-primary/70">
												{t(
													"profile.snippets_count",
													"Snippets",
												)}
											</div>
										</div>
										<div className="bg-muted/30 border border-border/50 rounded-xl p-3 text-center">
											<div className="text-xl font-black text-foreground">
												{pastes.reduce(
													(acc, p) =>
														acc + (p.views || 0),
													0,
												)}
											</div>
											<div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
												{t("profile.views", "Views")}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Card className="border-border/50 bg-background/50 backdrop-blur-md">
								<CardContent className="p-6 space-y-6">
									<h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
										<div className="p-1 px-2 rounded-md bg-muted text-foreground lowercase italic">
											stats
										</div>
										{t("profile.activity", "Activity")}
									</h3>
									<div className="space-y-4">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												{t(
													"profile.total_views",
													"Total Views",
												)}
											</span>
											<span className="font-bold font-mono">
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
													"Favorite",
												)}
											</span>
											<span className="font-bold uppercase text-primary">
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

					<div className="md:col-span-8 space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
							<h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
								<FileText className="h-7 w-7 text-primary" />
								{t("profile.your_snippets", "Snippets")}
							</h2>
							<Link to="/">
								<Button
									size="sm"
									className="gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto"
								>
									{t("header.new_snippet", "New")}
									<ChevronRight className="h-4 w-4" />
								</Button>
							</Link>
						</div>

						{loadingPastes ? (
							<div className="flex flex-col items-center justify-center py-24 gap-4 bg-muted/10 rounded-3xl border border-dashed border-border/50">
								<Loader2 className="h-10 w-10 animate-spin text-primary/50" />
								<p className="text-muted-foreground italic">
									{t(
										"profile.loading_pastes",
										"Summoning your creations...",
									)}
								</p>
							</div>
						) : pastes.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="bg-card/30 backdrop-blur-sm rounded-3xl border border-dashed border-border/60 p-8 md:p-20 text-center"
							>
								<div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
									<Inbox className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
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
										className="rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold"
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
									<SnippetCard
										key={paste.id}
										item={paste}
										index={idx}
									/>
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
