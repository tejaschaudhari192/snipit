import { timeAgo, getTimeRemaining } from "@/lib/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	ExternalLink,
	Timer,
	Calendar,
	Link as LinkIcon,
	File,
	FileText,
	Terminal,
} from "lucide-react";
import { motion } from "motion/react";
import { LanguageIcon } from "@/components/language-icon";

interface SnippetCardProps {
	item: PasteData;
	index: number;
	showViews?: boolean;
}

export const SnippetCard = ({
	item,
	index,
	showViews = true,
}: SnippetCardProps) => {
	const { t } = useTranslation();

	const getLanguageColor = (language: string) => {
		const colors: Record<string, string> = {
			javascript:
				"bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold border-yellow-500/20",
			typescript:
				"bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border-blue-500/20",
			python: "bg-green-500/20 text-green-600 dark:text-green-400 font-bold border-green-500/20",
			java: "bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border-orange-500/20",
			html: "bg-red-500/20 text-red-600 dark:text-red-400 font-bold border-red-500/20",
			css: "bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold border-purple-500/20",
			json: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/20",
			rust: "bg-orange-600/20 text-orange-700 dark:text-orange-400 font-bold border-orange-600/20",
			go: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold border-cyan-500/20",
			c: "bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/20",
			cpp: "bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border-pink-500/20",
			csharp: "bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold border-violet-500/20",
			markdown:
				"bg-gray-500/20 text-gray-600 dark:text-gray-400 font-bold border-gray-500/20",
			shell: "bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/20",
			bash: "bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/20",
			other: "bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/20",
		};
		return (
			colors[language] || "bg-primary/10 text-primary border-primary/20"
		);
	};

	const isExpiringSoon = (expiresAt: string) => {
		const hoursRemaining =
			(new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
		return hoursRemaining < 24 && hoursRemaining > 0;
	};

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt).getTime() < Date.now();
	};

	const expired = item.expiresAt && isExpired(item.expiresAt);
	const expiringSoon =
		item.expiresAt && !expired && isExpiringSoon(item.expiresAt);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
		>
			<Link
				to={"/" + item.id}
				className={`group block bg-card/40 backdrop-blur-sm rounded-xl border p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5 ${
					expired
						? "opacity-60 border-destructive/30"
						: expiringSoon
							? "border-amber-500/30"
							: "border-border/50"
				}`}
			>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
								item.redirectUrl ||
								item.contentMode === "file" ||
								item.fileUrl
									? "bg-primary/10 text-primary border-primary/20"
									: item.language && item.language !== "text"
										? getLanguageColor(item.language)
										: "bg-muted text-muted-foreground border-border/50"
							}`}
						>
							{item.redirectUrl ? (
								<>
									<LinkIcon className="h-3.5 w-3.5" />
									<span>{t("history.link_snippet")}</span>
								</>
							) : item.fileUrl || item.contentMode === "file" ? (
								<>
									{(() => {
										const ext =
											item.fileName
												?.toLowerCase()
												.split(".")
												.pop() || "";
										const mime =
											item.fileMimeType?.toLowerCase() ||
											"";
										const isPdf =
											ext === "pdf" ||
											mime.includes("pdf");
										const isExec =
											[
												"exe",
												"msi",
												"bin",
												"apk",
												"dmg",
												"app",
												"bat",
												"cmd",
											].includes(ext) ||
											mime.includes("executable") ||
											mime.includes("octet-stream");

										if (isExec)
											return (
												<Terminal className="h-3.5 w-3.5" />
											);
										if (isPdf)
											return (
												<FileText className="h-3.5 w-3.5" />
											);
										return <File className="h-3.5 w-3.5" />;
									})()}
									<span>{t("home.tab_file", "File")}</span>
								</>
							) : item.language && item.language !== "text" ? (
								<>
									<LanguageIcon
										language={item.language}
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
										{t("history.plain_text_snippet")}
									</span>
								</>
							)}
						</div>
						<span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded italic">
							/{item.id}
						</span>
					</div>

					<div className="flex items-center gap-4 text-xs">
						<div className="flex items-center gap-1.5 text-muted-foreground font-medium">
							<Calendar className="h-3.5 w-3.5" />
							<span>{timeAgo(item.createdAt, t)}</span>
						</div>
						{item.expiresAt && (
							<div
								className={`flex items-center gap-1.5 font-bold px-2 py-1 rounded-md border ${
									expired
										? "bg-destructive/10 text-destructive border-destructive/20"
										: expiringSoon
											? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
											: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
								}`}
							>
								<Timer className="h-3.5 w-3.5" />
								<span>
									{item.burnAfterRead ||
									item.expiresTime === "one-time"
										? t(
												"home.expire_options.one_time_snippet",
											)
										: expired
											? t("common.time.expired")
											: getTimeRemaining(
													item.expiresAt,
													t,
												)}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="relative">
					<div className="bg-muted/30 rounded-lg p-4 border border-border/20">
						<pre className="text-sm font-mono text-foreground/70 whitespace-pre-wrap break-words line-clamp-2 italic leading-relaxed">
							{item.contentMode === "file" && item.fileName
								? item.fileName
								: item.content}
						</pre>
					</div>
					<div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-xl pointer-events-none" />
				</div>

				<div className="flex items-center justify-between mt-4 text-[10px] md:text-xs text-muted-foreground font-medium">
					<div className="flex items-center gap-4">
						{showViews && (
							<span className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-md">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								{item.views || 0} {t("profile.views", "views")}
							</span>
						)}
						{item.visibility && (
							<span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md uppercase tracking-wider">
								<span
									className={`h-1.5 w-1.5 rounded-full ${
										item.visibility === "public"
											? "bg-green-500"
											: item.visibility === "shared"
												? "bg-blue-500"
												: "bg-red-500"
									}`}
								/>
								{t(
									`profile.visibility.${item.visibility}`,
									item.visibility,
								)}
							</span>
						)}
					</div>
					<div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 font-bold uppercase tracking-widest">
						<span>{t("history.view_snippet", "View")}</span>
						<ExternalLink className="h-3 w-3" />
					</div>
				</div>
			</Link>
		</motion.div>
	);
};
