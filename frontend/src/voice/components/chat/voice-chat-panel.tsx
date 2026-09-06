import React from "react";
import {
	MessageScrollerProvider,
	MessageScroller,
	MessageScrollerViewport,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, X, RotateCcw, Volume2, Cpu, Mic } from "lucide-react";
import type { VoiceAgentStatus, ChatMessage } from "../../types/voice.types";
import { VoiceChatMessage } from "./voice-chat-message";
import { VoiceChatInput } from "./voice-chat-input";
import { AiMascot } from "../mascot";

interface VoiceChatPanelProps {
	status: VoiceAgentStatus;
	messages: ChatMessage[];
	isListening: boolean;
	isSpeaking: boolean;
	isMascotVisible: boolean;
	onStartListening: () => void;
	onStopListening: () => void;
	onSendMessage: (text: string) => Promise<void>;
	onClearMessages: () => void;
	onClose: () => void;
}

export const VoiceChatPanel: React.FC<VoiceChatPanelProps> = ({
	status,
	messages,
	isListening,
	isSpeaking,
	isMascotVisible,
	onStartListening,
	onStopListening,
	onSendMessage,
	onClearMessages,
	onClose,
}) => {
	const getStatusBadge = () => {
		if (isSpeaking || status === "speaking") {
			return (
				<Badge
					variant="secondary"
					className="h-5 gap-1 px-2 text-[10px] font-medium border border-primary/30 text-primary bg-primary/10"
				>
					<Volume2 className="size-2.5 animate-pulse" />
					Speaking
				</Badge>
			);
		}

		switch (status) {
			case "listening":
				return (
					<Badge
						variant="destructive"
						className="h-5 gap-1 px-2 text-[10px] font-medium animate-pulse"
					>
						<Mic className="size-2.5" />
						Listening
					</Badge>
				);
			case "thinking":
				return (
					<Badge
						variant="secondary"
						className="h-5 gap-1 px-2 text-[10px] font-medium border border-amber-500/30 text-amber-400 bg-amber-500/10"
					>
						<Cpu className="size-2.5 animate-spin" />
						Thinking
					</Badge>
				);
			case "executing":
			case "observing":
				return (
					<Badge
						variant="secondary"
						className="h-5 gap-1 px-2 text-[10px] font-medium border border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
					>
						<Sparkles className="size-2.5 animate-spin" />
						Executing
					</Badge>
				);
			default:
				return (
					<Badge
						variant="outline"
						className="h-5 gap-1 px-2 text-[10px] font-medium text-muted-foreground border-border/60"
					>
						<span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
						Ready
					</Badge>
				);
		}
	};

	return (
		<div className="relative flex flex-col z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
			{/* Nick Wilde mascot perches above the panel WITHOUT getting cut off by overflow-hidden */}
			{isMascotVisible && (
				<div className="absolute -top-24 right-8 z-20 pointer-events-none drop-shadow-2xl">
					<AiMascot
						status={status}
						size={100}
						mode="perched"
						enableSounds={false}
					/>
				</div>
			)}

			{/* Main Chat Capsule Card */}
			<div className="flex flex-col w-87.5 sm:w-102.5 h-120 max-h-[calc(100vh-5rem)] rounded-2xl border border-border/60 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
				{/* Header - Strictly shrink-0 */}
				<div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-border/40 bg-muted/20">
					<div className="flex items-center gap-2">
						<div className="size-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
							<Sparkles className="size-3.5" />
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold text-foreground tracking-tight">
								SnipIt AI
							</span>
							{getStatusBadge()}
						</div>
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onClearMessages}
							className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
							title="Clear Conversation"
						>
							<RotateCcw className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onClose}
							className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
							title="Close Panel"
						>
							<X className="size-3.5" />
						</Button>
					</div>
				</div>

				{/* Shadcn Message Scroller Body - Flexible scrolling region */}
				<div className="flex-1 min-h-0 relative overflow-hidden bg-background/50">
					<MessageScrollerProvider>
						<MessageScroller className="h-full">
							<MessageScrollerViewport className="p-3">
								<MessageScrollerContent className="gap-1">
									{messages.map((msg, idx) => (
										<MessageScrollerItem
											key={msg.id || idx}
											scrollAnchor={
												idx === messages.length - 1
											}
										>
											<VoiceChatMessage
												message={msg}
												isLast={
													idx === messages.length - 1
												}
											/>
										</MessageScrollerItem>
									))}
								</MessageScrollerContent>
							</MessageScrollerViewport>
							<MessageScrollerButton
								direction="end"
								variant="secondary"
							/>
						</MessageScroller>
					</MessageScrollerProvider>
				</div>

				{/* Input Bar - Strictly shrink-0 at bottom */}
				<div className="shrink-0">
					<VoiceChatInput
						status={status}
						isListening={isListening}
						onStartListening={onStartListening}
						onStopListening={onStopListening}
						onSendMessage={onSendMessage}
					/>
				</div>
			</div>
		</div>
	);
};
