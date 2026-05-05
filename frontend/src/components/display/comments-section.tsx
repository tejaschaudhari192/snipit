import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { timeAgo } from "@/utils";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PasteData, CommentData } from "@/types";
import { useApiHelpers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShimmerSection } from "@/components/common/shimmer-section";

interface CommentsSectionProps {
	paste: PasteData;
	onCommentAdded: (updatedPaste: PasteData) => void;
}

export const CommentsSection = ({
	paste,
	onCommentAdded,
}: CommentsSectionProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const apiHelpers = useApiHelpers();
	const [newComment, setNewComment] = useState("");
	const [authorName, setAuthorName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [paste.comments]);

	const userEmail = user?.email;
	const isOwner = !!(user && paste.owner === user._id);

	const getUserRole = (): "admin" | "editor" | "viewer" | "commenter" => {
		if (isOwner) return "admin";
		if (paste.role) return paste.role;

		if (paste.shareList && userEmail) {
			const shareEntry = paste.shareList.find(
				(s) => s.email === userEmail,
			);
			if (shareEntry) return shareEntry.role;
		}

		return paste.publicRole || "viewer";
	};

	const userRole = getUserRole();
	const isExplicitUser =
		isOwner ||
		(paste.shareList &&
			userEmail &&
			paste.shareList.some((s) => s.email === userEmail));
	const canComment = isExplicitUser
		? ["admin", "editor", "commenter"].includes(userRole)
		: paste.allowComments &&
			["admin", "editor", "commenter"].includes(userRole);

	const handleSubmit = async () => {
		if (!newComment.trim()) return;

		setIsSubmitting(true);
		try {
			const updatedPaste = await apiHelpers.addComment(
				paste.id,
				newComment,
				authorName || undefined,
			);
			if (updatedPaste) {
				onCommentAdded(updatedPaste);
				setNewComment("");
				setAuthorName("");
				toast.success(t("messages.comment_added", "Comment added"));
			}
		} catch (error) {
			const axiosError = error as AxiosError<{ error: string }>;
			toast.error(
				axiosError.response?.data?.error ||
					t("messages.comment_failed", "Failed to add comment"),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col h-[85vh] max-h-full gap-4 pb-2">
			<ScrollArea className="flex-1 min-h-0 pr-4 -mr-3">
				<div className="space-y-3 pr-3">
					{paste.comments && paste.comments.length > 0 ? (
						paste.comments.map((comment: CommentData) => (
							<div
								key={comment.id}
								className="group flex gap-3 p-3 rounded-lg border bg-card/50 shadow-sm transition-all hover:bg-card hover:shadow-md"
							>
								<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary border border-primary/20">
									{comment.author.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1 min-w-0 grid gap-1">
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-sm leading-none text-foreground">
											{comment.author}
										</span>
										<span className="text-[10px] text-muted-foreground whitespace-nowrap">
											{timeAgo(comment.createdAt, t)}
										</span>
									</div>
									<p className="text-sm text-foreground/80 leading-relaxed break-words">
										{comment.content}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="flex flex-col items-center justify-center h-40 text-muted-foreground italic opacity-70">
							<MessageSquare className="w-8 h-8 mb-2 opacity-20" />
							<p className="text-sm">
								{t("common.no_comments", "No comments yet")}
							</p>
						</div>
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			<div className="flex-shrink-0 space-y-3 pt-2 border-t mt-auto bg-background z-10">
				{canComment ? (
					<div className="space-y-3">
						{!user && (
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium ml-1 text-muted-foreground">
									{t(
										"common.your_name",
										"Your Name (Optional)",
									)}
								</label>
								<input
									type="text"
									placeholder={t(
										"common.anonymus",
										"Anonymous",
									)}
									value={authorName}
									onChange={(e) =>
										setAuthorName(e.target.value)
									}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
						)}
						<div className="flex flex-col gap-2">
							<Textarea
								placeholder={t(
									"common.write_comment",
									"Write a comment...",
								)}
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								className="min-h-[80px] max-h-[150px] resize-y bg-muted/20 focus-visible:ring-primary/30 text-sm"
							/>
							<div className="flex justify-end">
								<Button
									onClick={handleSubmit}
									disabled={
										!newComment.trim() || isSubmitting
									}
									size="sm"
									className="gap-2 h-8"
								>
									{isSubmitting ? (
										<ShimmerSection
											type="mini-loader"
											className="w-3 h-3"
										/>
									) : (
										<Send className="w-3 h-3" />
									)}
									{t("common.post_comment", "Post Comment")}
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground border border-dashed text-balance">
						{t(
							"common.comment_restricted",
							"You don't have permission to comment on this snippet.",
						)}
					</div>
				)}
			</div>
		</div>
	);
};
