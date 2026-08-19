import { useState, useRef, useEffect } from "react";
import { type ActiveUser } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatMessage {
	sender: string;
	text: string;
	color: string;
}

interface CinemaChatProps {
	activeUsers: ActiveUser[];
	commentsList: ChatMessage[];
	chatInput: string;
	setChatInput: (val: string) => void;
	sendChatMessage: () => void;
	currentSocketId?: string;
}

export const CinemaChat = ({
	activeUsers,
	commentsList,
	chatInput,
	setChatInput,
	sendChatMessage,
	currentSocketId,
}: CinemaChatProps) => {
	const [isSending, setIsSending] = useState(false);
	const chatBottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [commentsList]);

	const handleSend = () => {
		if (isSending || !chatInput.trim()) return;

		setIsSending(true);
		sendChatMessage();

		setTimeout(() => {
			setIsSending(false);
		}, 300);
	};

	return (
		<div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border bg-card/95 flex flex-col shrink-0 p-4 min-h-87.5 md:min-h-0 backdrop-blur-md">
			{/* Top Section: Active Watchers */}
			<div className="flex flex-col gap-2 min-h-0 border-b border-border pb-3">
				<div className="flex items-center gap-2">
					<div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
					<span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
						Watch Party ({activeUsers.length})
					</span>
				</div>
				{/* Compact Watcher avatars */}
				<div className="flex flex-wrap gap-1.5 mt-1 max-h-24 overflow-y-auto">
					{activeUsers.map((friend) => {
						const isMe =
							friend.isMe ||
							(currentSocketId &&
								friend.socketId === currentSocketId);
						return (
							<div
								key={friend.socketId}
								title={`${friend.name} ${isMe ? "(You)" : ""}`}
								className="relative"
							>
								<Avatar className="w-7 h-7 rounded-full border border-border shrink-0">
									<AvatarFallback
										style={{
											backgroundColor: friend.color,
										}}
										className="text-primary-foreground font-bold text-[10px] flex items-center justify-center w-full h-full"
									>
										{friend.name
											.substring(0, 2)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{isMe && (
									<div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Middle Section: Live Chat History */}
			<div className="flex-1 flex flex-col gap-2 min-h-0 py-3">
				<span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
					Live Chat
				</span>
				<ScrollArea className="flex-1 pr-2">
					<div className="flex flex-col gap-2.5">
						{commentsList.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground/50 text-xs italic">
								No messages yet. Say hi!
							</div>
						) : (
							commentsList.map((msg, idx) => (
								<div
									key={idx}
									className="flex flex-col gap-0.5 text-xs"
								>
									<span
										style={{ color: msg.color }}
										className="font-bold text-[11px]"
									>
										{msg.sender}
									</span>
									<span className="text-foreground wrap-break-word bg-muted px-2.5 py-1.5 rounded-lg border border-border inline-block w-fit max-w-[95%]">
										{msg.text}
									</span>
								</div>
							))
						)}
						<div ref={chatBottomRef} />
					</div>
				</ScrollArea>
			</div>

			{/* Bottom Section: Chat Input */}
			<div className="pt-3 border-t border-border flex gap-1.5 bg-transparent">
				<Input
					placeholder="Send message..."
					value={chatInput}
					maxLength={500}
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSend();
						}
					}}
					className="bg-background border-border text-foreground placeholder:text-muted-foreground h-9 text-xs"
				/>
				<Button
					size="icon"
					disabled={isSending || !chatInput.trim()}
					onClick={handleSend}
					className="h-9 w-9 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-50"
				>
					<Send className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};
