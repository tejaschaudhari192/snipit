import { timeAgo } from "@/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExternalLink, Calendar, Tag } from "lucide-react";
import { LanguageBadge } from "../common/language-badge";
import { ExpirationBadge } from "../common/expiration-badge";
import { useAuth } from "@/context/AuthContext";

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
	const { t, i18n } = useTranslation();
	const { user } = useAuth();

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt).getTime() < Date.now();
	};

	const isExpiringSoon = (expiresAt: string) => {
		const hoursRemaining =
			(new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
		return hoursRemaining < 24 && hoursRemaining > 0;
	};

	const expired = item.expiresAt && isExpired(item.expiresAt);
	const expiringSoon =
		item.expiresAt && !expired && isExpiringSoon(item.expiresAt);

	const isShared =
		user && item.owner && item.owner.toString() !== user._id.toString();

	return (
		<div
			className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<Link
				to={"/" + item.id}
				className={`group block glass-card p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1 ${
					expired
						? "opacity-60 border-destructive/30"
						: expiringSoon
							? "border-amber-500/30"
							: ""
				}`}
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						<LanguageBadge
							language={item.language}
							contentMode={item.contentMode}
							isLink={!!item.redirectUrl}
							isFile={item.contentMode === "file"}
							fileName={item.fileName}
							mimeType={item.fileMimeType}
						/>
						<span className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded italic truncate max-w-[80px] sm:max-w-none">
							/{item.id}
						</span>
						{isShared && (
							<span className="text-[10px] sm:text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider ml-auto sm:ml-0">
								{t("common.shared")}
							</span>
						)}
					</div>

					<div className="flex items-center gap-3 text-[10px] sm:text-xs shrink-0 self-end sm:self-auto">
						<div className="flex items-center gap-1.5 text-muted-foreground/60 font-bold uppercase tracking-wider">
							<Calendar className="h-3.5 w-3.5" />
							<span>{timeAgo(item.createdAt, t)}</span>
						</div>
						{(item.expiresAt || item.expiresTime === "never") && (
							<ExpirationBadge
								expiresAt={item.expiresAt}
								burnAfterRead={!!item.burnAfterRead}
								expiresTime={item.expiresTime}
							/>
						)}
					</div>
				</div>

				<div className="relative">
					<div className="bg-muted/30 rounded-lg p-4 border border-border/20">
						<pre className="text-sm font-mono text-foreground/70 whitespace-pre-wrap wrap-break-word line-clamp-2 italic leading-relaxed">
							{item.contentMode === "draw"
								? t("common.drawing")
								: item.contentMode === "link" ||
									  item.redirectUrl
									? item.content
									: item.contentMode === "file" &&
										  item.fileName
										? item.fileName
										: item.content}
						</pre>
					</div>
					<div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent rounded-xl pointer-events-none" />
				</div>

				{item.labels && item.labels.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mt-4 px-1">
						{item.labels.map((label) => (
							<span
								key={label}
								className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase tracking-tighter"
							>
								<Tag className="w-2.5 h-2.5" />
								{label}
							</span>
						))}
					</div>
				)}

				<div className="flex items-center justify-between mt-4 text-[10px] md:text-xs text-muted-foreground font-medium">
					<div className="flex items-center gap-4">
						{showViews && (
							<span className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-md">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								{new Intl.NumberFormat(i18n.language).format(
									item.views || 0,
								)}{" "}
								{t("profile.views")}
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
						<span>{t("history.view_snippet")}</span>
						<ExternalLink className="h-3 w-3" />
					</div>
				</div>
			</Link>
		</div>
	);
};
