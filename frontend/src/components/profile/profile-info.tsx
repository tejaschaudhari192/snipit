import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Calendar, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { User as UserType, PasteData } from "@/types";

interface ProfileInfoProps {
	user: UserType;
	isEditingName: boolean;
	setIsEditingName: (v: boolean) => void;
	newName: string;
	setNewName: (v: string) => void;
	handleUpdateName: () => void;
	isUpdating: boolean;
	pastes: PasteData[];
}

export const ProfileInfo = ({
	user,
	isEditingName,
	setIsEditingName,
	newName,
	setNewName,
	handleUpdateName,
	isUpdating,
	pastes,
}: ProfileInfoProps) => {
	const { t } = useTranslation();

	const totalViews = pastes.reduce((acc, p) => acc + (p.views || 0), 0);

	const favoriteLanguage =
		pastes.length > 0
			? Object.entries(
					pastes.reduce(
						(acc, p) => {
							const lang = p.language || "text";
							acc[lang] = (acc[lang] || 0) + 1;
							return acc;
						},
						{} as Record<string, number>,
					),
				).sort((a, b) => b[1] - a[1])[0][0]
			: "N/A";

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4 }}
			>
				<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] ring-1 ring-white/5 overflow-hidden">
					<div className="h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative">
						<div className="absolute inset-0 bg-grid-white/[0.05]" />
					</div>
					<CardContent className="relative pt-0 px-8 pb-10">
						<div className="flex flex-col items-center -mt-16 mb-6">
							<div className="relative group">
								<motion.div
									whileHover={{ scale: 1.05 }}
									className="h-32 w-32 rounded-3xl bg-gradient-to-br from-primary to-primary/60 p-1.5 shadow-2xl ring-8 ring-background/80"
								>
									<div className="h-full w-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
										<User className="h-14 w-14 text-primary" />
									</div>
								</motion.div>
							</div>

							<div className="mt-6 w-full text-center space-y-4">
								<AnimatePresence mode="wait">
									{isEditingName ? (
										<motion.div
											key="edit"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											className="flex items-center gap-2 max-w-sm mx-auto"
										>
											<Input
												value={newName}
												onChange={(e) =>
													setNewName(e.target.value)
												}
												className="text-xl font-bold h-12 bg-background/50 border-primary/30 focus-visible:ring-primary/50"
												autoFocus
												onKeyDown={(e) => {
													if (e.key === "Enter")
														handleUpdateName();
													if (e.key === "Escape")
														setIsEditingName(false);
												}}
											/>
											<div className="flex gap-1.5">
												<Button
													onClick={handleUpdateName}
													disabled={isUpdating}
													size="icon"
													className="h-12 w-12 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20"
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
													className="h-12 w-12 shrink-0 rounded-xl"
													onClick={() =>
														setIsEditingName(false)
													}
												>
													<X className="h-5 w-5" />
												</Button>
											</div>
										</motion.div>
									) : (
										<motion.div
											key="view"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="flex items-center justify-center gap-2 group"
										>
											<h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
												{user.username}
												<span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse shrink-0" />
											</h1>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
												onClick={() =>
													setIsEditingName(true)
												}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="space-y-1.5 pt-1">
									<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 font-medium">
										<Mail className="h-4 w-4" />
										{user.email}
									</div>
									<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 font-bold uppercase tracking-wider">
										<Calendar className="h-3.5 w-3.5" />
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
						</div>

						<div className="grid grid-cols-2 gap-4 pt-2">
							<div className="bg-primary/[0.03] hover:bg-primary/[0.06] border border-primary/10 rounded-3xl p-5 text-center transition-all group/stat">
								<div className="text-3xl font-black text-primary mb-1">
									{pastes.length}
								</div>
								<div className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary/60 group-hover/stat:text-primary transition-colors">
									{t("profile.snippets_count", "Snippets")}
								</div>
							</div>
							<div className="bg-muted/20 hover:bg-muted/30 border border-border/50 rounded-3xl p-5 text-center transition-all group/stat">
								<div className="text-3xl font-black text-foreground mb-1">
									{totalViews}
								</div>
								<div className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground group-hover/stat:text-foreground transition-colors">
									{t("profile.views", "Views")}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-xl rounded-[2rem] overflow-hidden ring-1 ring-white/5">
					<CardContent className="p-8 space-y-6">
						<div className="flex items-center justify-between border-b border-border/50 pb-4">
							<h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
								{t("profile.activity", "Stats")}
							</h3>
							<div className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded italic">
								account history
							</div>
						</div>
						<div className="space-y-4">
							<div className="flex items-center justify-between group/row">
								<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
									{t("profile.total_views", "Total Views")}
								</span>
								<div className="font-black text-lg text-primary tabular-nums">
									{totalViews}
								</div>
							</div>
							<div className="flex items-center justify-between group/row">
								<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
									{t(
										"profile.most_used_language",
										"Fav Language",
									)}
								</span>
								<div className="px-3 py-1 rounded-full bg-muted/60 text-[10px] font-black uppercase tracking-widest text-foreground group-hover/row:bg-primary/10 group-hover/row:text-primary transition-all">
									{favoriteLanguage}
								</div>
							</div>
							<div className="flex items-center justify-between group/row">
								<span className="text-sm text-muted-foreground group-hover/row:text-foreground transition-colors">
									{t("profile.avg_views", "Efficiency")}
								</span>
								<div className="font-black text-md text-foreground/80 italic font-mono">
									{pastes.length > 0
										? (totalViews / pastes.length).toFixed(
												1,
											)
										: "0.0"}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
};
