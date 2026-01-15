import { timeAgo, getTimeRemaining } from "@/lib/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	FileText,
	Trash2,
	Inbox,
	ExternalLink,
	Timer,
	Calendar,
	Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { LanguageIcon } from "@/components/language-icon";

const HistoryPage = () => {
	const { t } = useTranslation();
	const stored = localStorage.getItem("items");
	const [items, setItems] = useState<Array<PasteData>>(
		stored ? JSON.parse(stored) : [],
	);

	const handleClearHistory = () => {
		toast("Clear all history?", {
			position: "top-center",
			action: {
				label: "Clear",
				onClick: () => {
					localStorage.removeItem("items");
					setItems([]);
					toast.success("History cleared");
				},
			},
			cancel: { label: "Cancel", onClick: () => {} },
		});
	};

	const getLanguageColor = (language: string) => {
		const colors: Record<string, string> = {
			javascript: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
			typescript: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
			python: "bg-green-500/20 text-green-600 dark:text-green-400",
			java: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
			html: "bg-red-500/20 text-red-600 dark:text-red-400",
			css: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
			json: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
			rust: "bg-orange-600/20 text-orange-700 dark:text-orange-400",
			go: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
			c: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
			cpp: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
			csharp: "bg-violet-500/20 text-violet-600 dark:text-violet-400",
			markdown: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
			shell: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
			bash: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
			other: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
		};
		return colors[language] || "bg-primary/10 text-primary";
	};

	const isExpiringSoon = (expiresAt: string) => {
		const hoursRemaining =
			(new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
		return hoursRemaining < 24 && hoursRemaining > 0;
	};

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt).getTime() < Date.now();
	};

	return (
		<div className="min-h-[90vh] bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
			<div className="max-w-5xl mx-auto">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
				>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
							{t("history.title")}
						</h1>
						{items.length > 0 && (
							<p className="text-muted-foreground mt-1">
								{items.length} snippet
								{items.length !== 1 ? "s" : ""} saved
							</p>
						)}
					</div>
					{items.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearHistory}
							className="gap-2 text-destructive hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
							{t("history.clear_history")}
						</Button>
					)}
				</motion.div>

				{items.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-16 text-center shadow-lg"
					>
						<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
							<Inbox className="h-10 w-10 text-muted-foreground" />
						</div>
						<h2 className="text-2xl font-semibold mb-3">
							{t("history.no_history_title")}
						</h2>
						<p className="text-muted-foreground mb-6 max-w-md mx-auto">
							{t("history.no_history_desc")}
						</p>
						<Link to="/">
							<Button
								size="lg"
								className="gap-2 shadow-lg shadow-primary/20"
							>
								<FileText className="h-4 w-4" />
								{t("history.create_first")}
							</Button>
						</Link>
					</motion.div>
				) : (
					<div className="grid gap-4">
						{items.map((item, index) => {
							const expired =
								item.expiresAt && isExpired(item.expiresAt);
							const expiringSoon =
								item.expiresAt &&
								!expired &&
								isExpiringSoon(item.expiresAt);

							return (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Link
										to={"/" + item.id}
										className={`group block bg-card/80 backdrop-blur-sm rounded-xl border p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5 ${
											expired
												? "opacity-60 border-destructive/30"
												: expiringSoon
													? "border-amber-500/30"
													: "border-border/50"
										}`}
									>
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
											{/* Left: Type Badge & ID */}
											<div className="flex items-center gap-3">
												<div
													className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
														item.redirectUrl
															? "bg-primary/10 text-primary"
															: item.language &&
																  item.language !==
																		"text"
																? getLanguageColor(
																		item.language,
																	)
																: "bg-muted text-muted-foreground"
													}`}
												>
													{item.redirectUrl ? (
														<>
															<LinkIcon className="h-3.5 w-3.5" />
															<span>
																{t(
																	"history.link_snippet",
																)}
															</span>
														</>
													) : item.language &&
													  item.language !==
															"text" ? (
														<>
															<LanguageIcon
																language={
																	item.language
																}
																className="h-3.5 w-3.5"
															/>
															<span className="uppercase">
																{item.language}
															</span>
														</>
													) : (
														<>
															<LanguageIcon
																language="text"
																className="h-3.5 w-3.5"
															/>
															<span>
																{t(
																	"history.plain_text_snippet",
																)}
															</span>
														</>
													)}
												</div>
												<span className="text-xs text-muted-foreground font-mono">
													/{item.id}
												</span>
											</div>

											{/* Right: Time Info */}
											<div className="flex items-center gap-4 text-xs">
												<div className="flex items-center gap-1.5 text-muted-foreground">
													<Calendar className="h-3.5 w-3.5" />
													<span>
														{timeAgo(
															item.createdAt,
														)}
													</span>
												</div>
												{item.expiresAt && (
													<div
														className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded-md ${
															expired
																? "bg-destructive/10 text-destructive"
																: expiringSoon
																	? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
																	: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
														}`}
													>
														<Timer className="h-3.5 w-3.5" />
														<span>
															{item.burnAfterRead ||
															item.expiresTime ===
																"one-time"
																? t(
																		"home.expire_options.one_time_snippet",
																	)
																: expired
																	? "Expired"
																	: getTimeRemaining(
																			item.expiresAt,
																		)}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Content Preview */}
										<div className="relative">
											<div className="bg-muted/30 rounded-lg p-4 border border-border/30">
												<pre className="text-sm text-foreground/80 font-mono whitespace-pre-wrap break-words line-clamp-3 leading-relaxed">
													{item.content}
												</pre>
											</div>
											<div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent rounded-lg pointer-events-none" />
										</div>

										{/* Hover indicator */}
										<div className="flex items-center justify-end gap-1 mt-3 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
											<span>View snippet</span>
											<ExternalLink className="h-3 w-3" />
										</div>
									</Link>
								</motion.div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default HistoryPage;
