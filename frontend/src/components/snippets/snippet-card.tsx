import { useState } from "react";
import { timeAgo } from "@/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	ExternalLink,
	Calendar,
	Tag,
	MoreVertical,
	FolderInput,
	Trash2,
} from "lucide-react";
import { LanguageBadge } from "@/components/common/language-badge";
import { ExpirationBadge } from "@/components/common/expiration-badge";
import { useAuth } from "@/context/AuthContext";
import { useSnippets } from "@/context/SnippetContext";
import { useFolders } from "@/context/FolderContext";
import { MoveFolderDialog } from "@/components/profile/move-folder-dialog";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SnippetCardProps {
	item: PasteData;
	index: number;
	showViews?: boolean;
	viewMode?: "grid" | "list";
}

export const SnippetCard = ({
	item,
	index,
	showViews = true,
	viewMode = "grid",
}: SnippetCardProps) => {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const { deleteSnippet } = useSnippets();
	const { loadFolderContents, activeFolderId, getFolderPathString } =
		useFolders();
	const [moveOpen, setMoveOpen] = useState(false);

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

	const folderPath = getFolderPathString(item.folderId || null);

	if (viewMode === "list") {
		return (
			<div
				className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
				style={{ animationDelay: `${index * 30}ms` }}
			>
				<div
					className={`group flex items-center justify-between gap-3 glass-card px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-card/80 ${
						expired
							? "opacity-60 border-destructive/30"
							: expiringSoon
								? "border-amber-500/30"
								: ""
					}`}
				>
					<Link
						to={"/" + item.id}
						className="flex items-center gap-3 min-w-0 flex-1"
					>
						<LanguageBadge
							language={item.language}
							contentMode={item.contentMode}
							isLink={!!item.redirectUrl}
							isFile={item.contentMode === "file"}
							fileName={item.fileName}
							mimeType={item.fileMimeType}
						/>
						<div className="flex flex-col min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<span className="font-mono text-xs font-bold text-foreground/90 truncate">
									/{item.id}
								</span>
								{folderPath && (
									<span className="text-[10px] text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
										{folderPath}
									</span>
								)}
								{isShared && (
									<span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
										{t("common.access.shared")}
									</span>
								)}
							</div>
							<span className="text-xs text-muted-foreground truncate font-mono mt-0.5">
								{item.contentMode === "draw"
									? t("common.drawing")
									: item.contentMode === "link" ||
										  item.redirectUrl
										? item.content
										: item.contentMode === "file" &&
											  item.fileName
											? item.fileName
											: item.content}
							</span>
						</div>
					</Link>

					<div className="flex items-center gap-4 text-xs shrink-0">
						<div className="hidden md:flex items-center gap-1.5 text-muted-foreground/60 text-[11px] font-bold uppercase">
							<Calendar className="h-3 w-3" />
							<span>{timeAgo(item.createdAt, t)}</span>
						</div>

						{showViews && (
							<span className="text-xs text-muted-foreground font-medium hidden sm:inline">
								{new Intl.NumberFormat(i18n.language).format(
									item.views || 0,
								)}{" "}
								{t("profile.views")}
							</span>
						)}

						{user &&
							item.owner &&
							item.owner.toString() === user._id.toString() && (
								<div
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
								>
									<DropdownMenu>
										<DropdownMenuTrigger className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
											<MoreVertical className="w-4 h-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-40"
										>
											<DropdownMenuItem
												onClick={() =>
													setMoveOpen(true)
												}
												className="gap-2 cursor-pointer"
											>
												<FolderInput className="w-3.5 h-3.5" />
												<span>Move to Folder</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={async (e) => {
													e.stopPropagation();
													if (
														window.confirm(
															"Are you sure you want to delete this snippet?",
														)
													) {
														await deleteSnippet(
															item.id,
														);
														await loadFolderContents(
															activeFolderId,
														);
													}
												}}
												variant="destructive"
												className="gap-2 cursor-pointer"
											>
												<Trash2 className="w-3.5 h-3.5" />
												<span>Delete</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							)}
					</div>
				</div>

				<MoveFolderDialog
					open={moveOpen}
					onOpenChange={setMoveOpen}
					itemId={item.id}
					itemType="snippet"
					currentParentId={item.folderId}
				/>
			</div>
		);
	}

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
						<span className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded italic truncate max-w-20 sm:max-w-none">
							/{item.id}
						</span>
						{folderPath && (
							<span className="text-[10px] text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded font-mono truncate max-w-[120px]">
								{folderPath}
							</span>
						)}
						{isShared && (
							<span className="text-[10px] sm:text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider ml-auto sm:ml-0">
								{t("common.access.shared")}
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
						{user &&
							item.owner &&
							item.owner.toString() === user._id.toString() && (
								<div
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									className="shrink-0 relative z-20"
								>
									<DropdownMenu>
										<DropdownMenuTrigger className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none flex items-center justify-center">
											<MoreVertical className="w-3.5 h-3.5" />
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-40"
										>
											<DropdownMenuItem
												onClick={() =>
													setMoveOpen(true)
												}
												className="gap-2 cursor-pointer"
											>
												<FolderInput className="w-3.5 h-3.5" />
												<span>Move to Folder</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={async (e) => {
													e.stopPropagation();
													if (
														window.confirm(
															"Are you sure you want to delete this snippet?",
														)
													) {
														await deleteSnippet(
															item.id,
														);
														await loadFolderContents(
															activeFolderId,
														);
													}
												}}
												variant="destructive"
												className="gap-2 cursor-pointer"
											>
												<Trash2 className="w-3.5 h-3.5" />
												<span>Delete</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
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
			<MoveFolderDialog
				open={moveOpen}
				onOpenChange={setMoveOpen}
				itemId={item.id}
				itemType="snippet"
				currentParentId={item.folderId}
			/>
		</div>
	);
};
