import React, { useState } from "react";
import { timeAgo, isExpired, isExpiringSoon } from "@/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	ExternalLink,
	Calendar,
	MoreVertical,
	FolderInput,
	Trash2,
} from "lucide-react";
import { LanguageBadge } from "@/components/common/language-badge";
import { FileTypeIcon } from "@/components/common/file-type-icon";
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

export const SnippetCard = React.memo(
	({
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

		const expired = item.expiresAt ? isExpired(item.expiresAt) : false;
		const expiringSoon =
			item.expiresAt && !expired ? isExpiringSoon(item.expiresAt) : false;

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
									{new Intl.NumberFormat(
										i18n.language,
									).format(item.views || 0)}{" "}
									{t("profile.views")}
								</span>
							)}

							{user &&
								item.owner &&
								item.owner.toString() ===
									user._id.toString() && (
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
														deleteSnippet(item.id);
														loadFolderContents(
															activeFolderId,
														);
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
				className="min-w-0 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
				style={{ animationDelay: `${index * 40}ms` }}
			>
				<Link
					to={"/" + item.id}
					className={`group flex flex-col h-full glass-card p-3 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-0.5 ${
						expired
							? "opacity-60 border-destructive/30"
							: expiringSoon
								? "border-amber-500/30"
								: ""
					}`}
				>
					{/* Top Header: Badge, ID & Dropdown */}
					<div className="flex items-center justify-between gap-1.5 mb-2">
						<div className="flex items-center gap-1.5 min-w-0 flex-1">
							<LanguageBadge
								language={item.language}
								contentMode={item.contentMode}
								isLink={!!item.redirectUrl}
								isFile={item.contentMode === "file"}
								fileName={item.fileName}
								mimeType={item.fileMimeType}
							/>
							<span className="text-[11px] font-mono font-bold text-foreground/90 bg-muted/40 px-1.5 py-0.5 rounded italic truncate max-w-[100px]">
								/{item.id}
							</span>
							{folderPath && (
								<span className="text-[9px] text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded font-mono truncate max-w-[80px] hidden xs:inline">
									{folderPath}
								</span>
							)}
						</div>

						<div className="flex items-center gap-1 shrink-0">
							{(item.expiresAt ||
								item.expiresTime === "never") && (
								<ExpirationBadge
									expiresAt={item.expiresAt}
									burnAfterRead={!!item.burnAfterRead}
									expiresTime={item.expiresTime}
								/>
							)}
							{user &&
								item.owner &&
								item.owner.toString() ===
									user._id.toString() && (
									<div
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										className="shrink-0 relative z-20"
									>
										<DropdownMenu>
											<DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none flex items-center justify-center">
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
													className="gap-2 cursor-pointer text-xs"
												>
													<FolderInput className="w-3.5 h-3.5" />
													<span>Move to Folder</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={async (e) => {
														e.stopPropagation();
														deleteSnippet(item.id);
														loadFolderContents(
															activeFolderId,
														);
													}}
													variant="destructive"
													className="gap-2 cursor-pointer text-xs"
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

					{/* Compact Attachment Preview Box */}
					<div className="relative rounded-lg bg-muted/20 border border-border/30 p-2.5 h-16 flex flex-col justify-center overflow-hidden transition-all duration-200 group-hover:bg-muted/30 group-hover:border-primary/20">
						{item.contentMode === "file" && item.fileName ? (
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
									<FileTypeIcon
										fileName={item.fileName}
										mimeType={item.fileMimeType}
										className="w-4 h-4"
									/>
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-[11px] font-semibold text-foreground truncate font-mono leading-tight">
										{item.fileName}
									</p>
									<p className="text-[9px] text-muted-foreground uppercase font-mono mt-0.5 tracking-wider truncate">
										{item.fileMimeType || "File Attachment"}
									</p>
								</div>
							</div>
						) : item.contentMode === "link" || item.redirectUrl ? (
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-xs">
									<ExternalLink className="w-4 h-4" />
								</div>
								<div className="min-w-0 flex-1">
									<span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">
										Link Redirect
									</span>
									<p className="text-[11px] text-foreground/80 truncate font-mono mt-0.5 leading-tight">
										{item.content}
									</p>
								</div>
							</div>
						) : item.contentMode === "draw" ? (
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 shadow-xs">
									<ExternalLink className="w-4 h-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-[11px] font-semibold text-foreground truncate leading-tight">
										{t("common.drawing")}
									</p>
									<p className="text-[9px] text-muted-foreground font-mono mt-0.5">
										Interactive Canvas
									</p>
								</div>
							</div>
						) : (
							<pre className="text-[11px] font-mono text-foreground/75 whitespace-pre-wrap wrap-break-word line-clamp-2 leading-relaxed select-none">
								{item.content}
							</pre>
						)}
						<div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent pointer-events-none" />
					</div>

					{/* Pinned Bottom Info & Footer */}
					<div className="flex items-center justify-between mt-auto pt-2 text-[10px] text-muted-foreground font-medium">
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1 text-muted-foreground/70 text-[9px] font-semibold uppercase tracking-wider">
								<Calendar className="h-2.5 w-2.5" />
								<span>{timeAgo(item.createdAt, t)}</span>
							</div>
							{showViews && (
								<span className="flex items-center gap-1 bg-primary/5 px-1 py-0.2 rounded text-[9px]">
									<span className="h-1 w-1 rounded-full bg-primary" />
									{new Intl.NumberFormat(
										i18n.language,
									).format(item.views || 0)}
								</span>
							)}
						</div>
						<div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 font-bold uppercase text-[9px] tracking-wider">
							<span>{t("history.view_snippet")}</span>
							<ExternalLink className="h-2.5 w-2.5" />
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
	},
);

SnippetCard.displayName = "SnippetCard";
