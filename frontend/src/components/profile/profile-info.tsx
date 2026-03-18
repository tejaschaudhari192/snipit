import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Calendar, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
		<div className="md:col-span-4 space-y-6 md:sticky md:top-24">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Card className="border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden">
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
											initial={{ opacity: 0, y: -5 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 5 }}
											className="flex items-center gap-2"
										>
											<Input
												value={newName}
												onChange={(e) =>
													setNewName(e.target.value)
												}
												className="text-lg font-bold h-10 bg-background/50 border-primary/30"
												autoFocus
												onKeyDown={(e) => {
													if (e.key === "Enter")
														handleUpdateName();
													if (e.key === "Escape")
														setIsEditingName(false);
												}}
											/>
											<div className="flex gap-1">
												<button
													onClick={handleUpdateName}
													disabled={isUpdating}
													className="h-10 w-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
												>
													{isUpdating ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Check className="h-4 w-4" />
													)}
												</button>
												<Button
													variant="outline"
													size="icon"
													className="h-10 w-10 shrink-0"
													onClick={() =>
														setIsEditingName(false)
													}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</motion.div>
									) : (
										<motion.div
											key="view"
											initial={{ opacity: 0, y: 5 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -5 }}
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
													setIsEditingName(true)
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
										{t("profile.joined", "Joined")}{" "}
										{new Date(
											user.createdAt || Date.now(),
										).toLocaleDateString(undefined, {
											month: "short",
											year: "numeric",
										})}
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
									{t("profile.snippets_count", "Snippets")}
								</div>
							</div>
							<div className="bg-muted/30 border border-border/50 rounded-xl p-3 text-center">
								<div className="text-xl font-black text-foreground">
									{totalViews}
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
				<Card className="border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5">
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
									{t("profile.total_views", "Total Views")}
								</span>
								<span className="font-bold font-mono">
									{totalViews}
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
									{favoriteLanguage}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
};
