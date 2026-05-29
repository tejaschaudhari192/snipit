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
}

export const CinemaChat = ({
	activeUsers,
	commentsList,
	chatInput,
	setChatInput,
	sendChatMessage,
}: CinemaChatProps) => {
	return (
		<div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 bg-black/80 flex flex-col shrink-0 p-4 min-h-[350px] md:min-h-0">
			{/* Top Section: Active Watchers */}
			<div className="flex flex-col gap-2 min-h-0 border-b border-white/5 pb-3">
				<div className="flex items-center gap-2">
					<div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
					<span className="text-xs font-bold text-white/60 tracking-wider uppercase">
						Watch Party ({activeUsers.length})
					</span>
				</div>
				{/* Compact Watcher avatars */}
				<div className="flex flex-wrap gap-1.5 mt-1">
					{activeUsers.map((friend) => (
						<div
							key={friend.socketId}
							title={`${friend.name} (${friend.isEditing ? "Editing" : "Watching"})`}
							className="relative"
						>
							<Avatar className="w-7 h-7 rounded-full border border-white/20 shrink-0">
								<AvatarFallback
									style={{ backgroundColor: friend.color }}
									className="text-black font-bold text-[10px] flex items-center justify-center w-full h-full"
								>
									{friend.name.substring(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							{friend.isMe && (
								<div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border border-black" />
							)}
						</div>
					))}
				</div>
			</div>

			{/* Middle Section: Live Chat History */}
			<div className="flex-1 flex flex-col gap-2 min-h-0 py-3">
				<span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
					Live Chat
				</span>
				<ScrollArea className="flex-1 pr-2">
					<div className="flex flex-col gap-2.5">
						{commentsList.length === 0 ? (
							<div className="text-center py-8 text-white/30 text-xs italic">
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
									<span className="text-white/95 break-words bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 inline-block w-fit max-w-[95%]">
										{msg.text}
									</span>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Bottom Section: Chat Input */}
			<div className="pt-3 border-t border-white/5 flex gap-1 bg-transparent">
				<Input
					placeholder="Send message..."
					value={chatInput}
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							sendChatMessage();
						}
					}}
					className="bg-white/5 border-white/10 text-white placeholder-white/40 h-9 text-xs"
				/>
				<Button
					size="icon"
					onClick={sendChatMessage}
					className="h-9 w-9 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground"
				>
					<Send className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};
