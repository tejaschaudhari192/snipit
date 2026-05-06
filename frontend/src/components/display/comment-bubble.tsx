import type { CommentData, User } from "@/types";

interface CommentBubbleProps {
	comment: CommentData;
	currentUser: User | null;
}

export const CommentBubble = ({ comment, currentUser }: CommentBubbleProps) => {
	const isMe =
		currentUser &&
		(comment.userId === currentUser._id ||
			(comment.user && comment.user._id === currentUser._id));

	const formattedTime = new Date(comment.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div
			className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-2 animate-in fade-in slide-in-from-bottom-1 duration-300 w-full`}
		>
			{!isMe && (
				<span className="text-[10px] font-bold text-primary/70 mb-0.5 ml-1.5">
					{comment.author}
				</span>
			)}
			<div
				className={`relative flex flex-col max-w-[85%] px-3 py-2 shadow-sm border ${
					isMe
						? "bg-primary/15 border-primary/10 rounded-lg rounded-tr-none mr-1"
						: "bg-card border-border/50 rounded-lg rounded-tl-none ml-1"
				}`}
			>
				<div className="flex items-end gap-3">
					<p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap wrap-break-word flex-1">
						{comment.content}
					</p>
					<span className="text-[9px] text-muted-foreground/30 font-bold tabular-nums whitespace-nowrap -mb-0.5">
						{formattedTime}
					</span>
				</div>
			</div>
		</div>
	);
};
