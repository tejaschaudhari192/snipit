import { useState } from "react";
import type { CommentData, User } from "@/types";
import { Message, MessageContent, MessageHeader, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CommentBubbleProps {
	comment: CommentData;
	currentUser: User | null;
	onEdit?: (newContent: string) => void;
	onDelete?: () => void;
}

export const CommentBubble = ({ comment, currentUser, onEdit, onDelete }: CommentBubbleProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	const isMe =
		currentUser &&
		(comment.userId === currentUser._id ||
			(comment.user && comment.user._id === currentUser._id));

	const formattedTime = new Date(comment.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleSave = () => {
		if (editContent.trim() && editContent !== comment.content) {
			onEdit?.(editContent);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditContent(comment.content);
		setIsEditing(false);
	};

	return (
		<Message 
			align={isMe ? "end" : "start"} 
			className="mb-2 animate-in fade-in slide-in-from-bottom-1 duration-300 w-full group"
		>
			<MessageContent className="w-full">
				{!isMe && (
					<MessageHeader className="font-semibold text-primary/80">
						{comment.author}
					</MessageHeader>
				)}
				
				<div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
					{isMe && !isEditing && (
						<div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onClick={() => setIsEditing(true)} className="p-1.5 bg-background border shadow-sm rounded-md text-muted-foreground hover:text-foreground transition-colors">
								<Pencil className="w-3 h-3" />
							</button>
							<button onClick={onDelete} className="p-1.5 bg-background border shadow-sm rounded-md text-muted-foreground hover:text-destructive transition-colors">
								<Trash2 className="w-3 h-3" />
							</button>
						</div>
					)}
					
					{isEditing ? (
						<div className="flex flex-col gap-2 w-full min-w-55">
							<Textarea 
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="min-h-15 text-[13px] resize-y bg-background"
								autoFocus
							/>
							<div className="flex justify-end gap-1">
								<Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={handleCancel}>
									<X className="w-3 h-3 mr-1" /> Cancel
								</Button>
								<Button size="sm" variant="default" className="h-7 text-xs px-2" onClick={handleSave}>
									<Check className="w-3 h-3 mr-1" /> Save
								</Button>
							</div>
						</div>
					) : (
						<Bubble variant={isMe ? "default" : "muted"} className="w-full">
							<BubbleContent className="whitespace-pre-wrap text-[13px] shadow-sm">
								{comment.content}
							</BubbleContent>
						</Bubble>
					)}
				</div>

				{!isEditing && (
					<MessageFooter className={`tabular-nums opacity-60 ${isMe ? 'self-end' : 'self-start'}`}>
						{formattedTime}
					</MessageFooter>
				)}
			</MessageContent>
		</Message>
	);
};
