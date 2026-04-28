import {
	User,
	Mail,
	Calendar,
	Edit2,
	Check,
	X,
	Eye,
	Files,
} from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassBadge } from "@/components/common/core/glass-badge";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils";
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
			<div className="animate-in fade-in zoom-in-95 duration-500">
				<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] ring-1 ring-white/5 overflow-hidden">
					<div className="h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative">
						<div className="absolute inset-0 bg-grid-white/[0.05]" />
					</div>
					<CardContent className="relative pt-0 px-8 pb-10">
						<div className="flex flex-col items-center -mt-16 mb-6">
							<div className="relative group">
								<Avatar className="h-32 w-32 rounded-3xl p-1.5 shadow-2xl ring-8 ring-background/80 transition-transform hover:scale-105 duration-300 bg-gradient-to-br from-primary to-primary/60">
									<AvatarImage
										className="rounded-2xl"
										src=""
									/>
									<AvatarFallback className="rounded-2xl bg-background flex items-center justify-center">
										<User className="h-14 w-14 text-primary" />
									</AvatarFallback>
								</Avatar>
							</div>

							<div className="mt-6 w-full text-center space-y-4">
								<div className="min-h-[48px] flex items-center justify-center">
									{isEditingName ? (
										<div className="flex items-center gap-2 max-w-sm mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
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
														<ShimmerSection type="mini-loader" />
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
										</div>
									) : (
										<div className="flex items-center justify-center gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-300">
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
										</div>
									)}
								</div>

								<div className="space-y-1.5 pt-1">
									<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 font-medium">
										<Mail className="h-4 w-4" />
										{user.email}
									</div>
									<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 font-bold uppercase tracking-wider">
										<Calendar className="h-3.5 w-3.5" />
										{t("profile.joined", "Joined")}{" "}
										{formatDate(
											user.createdAt || new Date(),
											{
												month: "long",
												year: "numeric",
											},
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-2">
							<div className="bg-primary/[0.03] hover:bg-primary/[0.06] border border-primary/10 rounded-[2rem] p-5 text-center transition-all group/stat">
								<div className="flex justify-center mb-1">
									<Files className="h-4 w-4 text-primary/40 group-hover/stat:text-primary/70 transition-colors" />
								</div>
								<div className="text-3xl font-black text-primary">
									{pastes.length}
								</div>
								<div className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary/60 group-hover/stat:text-primary transition-colors">
									{t("profile.snippets_count", "Snippets")}
								</div>
							</div>
							<div className="bg-muted/20 hover:bg-muted/30 border border-border/50 rounded-[2rem] p-5 text-center transition-all group/stat">
								<div className="flex justify-center mb-1">
									<Eye className="h-4 w-4 text-muted-foreground/30 group-hover/stat:text-foreground/50 transition-colors" />
								</div>
								<div className="text-3xl font-black text-foreground">
									{totalViews}
								</div>
								<div className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground group-hover/stat:text-foreground transition-colors">
									{t("profile.views", "Views")}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
				<Card className="border border-border/50 bg-background/60 backdrop-blur-3xl shadow-xl rounded-[2rem] overflow-hidden ring-1 ring-white/5">
					<CardContent className="p-8 space-y-6">
						<div className="flex items-center justify-between border-b border-border/50 pb-4">
							<h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
								{t("profile.activity", "Stats")}
							</h3>
							<GlassBadge
								size="xs"
								className="italic text-primary/60"
								variant="glass"
							>
								account history
							</GlassBadge>
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
								<GlassBadge
									size="xs"
									className="group-hover/row:bg-primary/10 transition-all uppercase tracking-widest"
									variant="outline"
								>
									{favoriteLanguage}
								</GlassBadge>
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
			</div>
		</div>
	);
};
