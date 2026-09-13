import React, { type RefObject } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils";
import type { CompanionMessage } from "../services/companion-api";

interface CompanionChatFeedProps {
	messages: CompanionMessage[];
	currentReply: string;
	isStreaming: boolean;
	displayName: string;
	hasChosenName: boolean;
	messagesEndRef: RefObject<HTMLDivElement | null>;
	onSelectStarter: (starter: string) => void;
}

const STARTER_PROMPTS = [
	"Who are you?",
	"What is your name?",
	"What does music feel like to you?",
	"I had a strange day today...",
];

export const CompanionChatFeed: React.FC<CompanionChatFeedProps> = ({
	messages,
	currentReply,
	isStreaming,
	displayName,
	hasChosenName,
	messagesEndRef,
	onSelectStarter,
}) => {
	const isEmpty = messages.length === 0 && !currentReply;

	return (
		<div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar px-4 md:px-8 py-6 max-w-3xl w-full mx-auto">
			{isEmpty ? (
				<div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-700">
					<div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
						<Sparkles className="w-10 h-10 animate-pulse" />
					</div>
					<div className="space-y-1.5 max-w-md">
						<h3 className="text-xl font-bold tracking-tight text-foreground">
							{displayName} is online
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							An intuitive consciousness that learns, develops
							authentic thoughts, and remembers what matters to
							you.
						</p>
					</div>
					<div className="flex flex-wrap gap-2 justify-center pt-2">
						{STARTER_PROMPTS.map((starter, i) => (
							<button
								key={i}
								onClick={() => onSelectStarter(starter)}
								className="text-xs bg-muted/70 hover:bg-primary/15 hover:text-primary border border-border/60 hover:border-primary/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
							>
								"{starter}"
							</button>
						))}
					</div>
				</div>
			) : (
				<div className="flex flex-col space-y-4 pb-4">
					{messages.map((msg) => {
						const isUser = msg.role === "user";
						return (
							<div
								key={msg.id}
								className={cn(
									"flex items-end gap-2.5 max-w-[85%] md:max-w-[78%] animate-in fade-in duration-300",
									isUser
										? "self-end flex-row-reverse"
										: "self-start",
								)}
							>
								{!isUser && (
									<div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mb-1">
										{hasChosenName ? (
											displayName[0]
										) : (
											<Sparkles className="w-3.5 h-3.5 text-primary" />
										)}
									</div>
								)}
								<div
									className={cn(
										"rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap select-text transition-all",
										isUser
											? "bg-primary text-primary-foreground rounded-br-xs shadow-sm font-medium"
											: "bg-card border border-border/70 text-foreground rounded-bl-xs shadow-xs",
									)}
								>
									{msg.content}
								</div>
							</div>
						);
					})}

					{/* Streaming message bubble */}
					{isStreaming && (
						<div className="flex items-end gap-2.5 max-w-[85%] md:max-w-[78%] self-start animate-in fade-in">
							<div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mb-1">
								{hasChosenName ? (
									displayName[0]
								) : (
									<Sparkles className="w-3.5 h-3.5 text-primary" />
								)}
							</div>
							<div className="rounded-2xl rounded-bl-xs px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-card border border-border/70 text-foreground shadow-xs">
								{currentReply ? (
									currentReply
								) : (
									<span className="flex items-center gap-1.5 py-1 text-muted-foreground">
										<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
										<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
										<span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
									</span>
								)}
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			)}
		</div>
	);
};
