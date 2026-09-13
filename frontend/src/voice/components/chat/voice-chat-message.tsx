import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sparkles,
	Copy,
	Check,
	Code2,
	Compass,
	CheckCircle2,
	Music,
	Terminal,
} from "lucide-react";
import type { ChatMessage } from "@/voice/types/voice.types";
import { VoiceChatTrace } from "./voice-chat-trace";

interface VoiceChatMessageProps {
	message: ChatMessage;
	isLast?: boolean;
}

export const VoiceChatMessage: React.FC<VoiceChatMessageProps> = ({
	message,
	isLast,
}) => {
	const isUser = message.role === "user";
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	const handleCopy = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(code);
		setTimeout(() => setCopiedCode(null), 2000);
	};

	const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	if (isUser) {
		return (
			<div className="flex flex-col items-end my-2 pl-8">
				<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pb-1 px-1">
					<span className="font-semibold text-foreground/80">
						You
					</span>
					<span>•</span>
					<span>{formattedTime}</span>
				</div>
				<div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2 text-xs sm:text-[13px] leading-relaxed shadow-sm max-w-[85%] wrap-break-word">
					<p className="whitespace-pre-wrap font-medium">
						{message.content}
					</p>
				</div>
				<span className="text-[10px] text-muted-foreground/60 pt-0.5 px-1">
					Sent
				</span>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-2.5 my-2 pr-3">
			<div className="size-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
				<Sparkles className="size-3.5 animate-pulse" />
			</div>

			<div className="flex-1 min-w-0 flex flex-col items-start max-w-[92%]">
				<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pb-1 px-0.5">
					<span className="font-semibold text-foreground/80">
						SnipIt AI
					</span>
					<span>•</span>
					<span>{formattedTime}</span>
				</div>

				{/* Collapsible trace */}
				{message.executionSteps &&
					message.executionSteps.length > 0 && (
						<VoiceChatTrace
							steps={message.executionSteps}
							isStreaming={message.status === "streaming"}
						/>
					)}

				{/* Assistant Content Box */}
				<div className="w-full rounded-2xl rounded-tl-sm border border-border/50 bg-secondary/70 text-secondary-foreground p-3 text-xs sm:text-[13px] leading-relaxed select-text shadow-sm wrap-break-word">
					{message.content ? (
						<div className="prose prose-invert prose-sm max-w-none wrap-break-word [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									code({
										inline,
										className,
										children,
										...props
									}: {
										inline?: boolean;
										className?: string;
										children?: React.ReactNode;
									}) {
										const codeString = String(
											children,
										).replace(/\n$/, "");
										const match = /language-(\w+)/.exec(
											className || "",
										);

										if (
											!inline &&
											(match || codeString.includes("\n"))
										) {
											const lang = match
												? match[1]
												: "code";
											return (
												<div className="my-2 rounded-lg border border-border/60 bg-neutral-950/90 overflow-hidden font-mono text-[11px]">
													<div className="flex items-center justify-between px-3 py-1 bg-muted/40 border-b border-border/40 text-muted-foreground">
														<span className="flex items-center gap-1.5 font-sans text-[10px] uppercase font-semibold text-primary">
															<Terminal className="size-3" />
															{lang}
														</span>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() =>
																handleCopy(
																	codeString,
																)
															}
															className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
															title="Copy Code"
														>
															{copiedCode ===
															codeString ? (
																<Check className="size-3 text-emerald-400" />
															) : (
																<Copy className="size-3" />
															)}
														</Button>
													</div>
													<pre className="p-2.5 overflow-x-auto text-neutral-200">
														<code
															className={
																className
															}
															{...props}
														>
															{children}
														</code>
													</pre>
												</div>
											);
										}

										return (
											<code
												className="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary"
												{...props}
											>
												{children}
											</code>
										);
									},
								}}
							>
								{message.content}
							</ReactMarkdown>
						</div>
					) : message.status === "streaming" ? (
						<div className="flex items-center gap-2 py-0.5 text-muted-foreground">
							<span className="flex h-2 w-2 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
							<span className="text-xs italic">
								Generating response...
							</span>
						</div>
					) : null}
				</div>

				{/* Action Outcome Card */}
				{message.action && message.action.type !== "NONE" && (
					<div className="mt-1.5 w-full flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-xs">
						{message.action.type === "CREATE_SNIPPET" ? (
							<Code2 className="size-4 text-emerald-400 shrink-0" />
						) : message.action.type === "NAVIGATE" ? (
							<Compass className="size-4 text-blue-400 shrink-0" />
						) : message.action.type === "CONTROL_MUSIC" ? (
							<Music className="size-4 text-violet-400 shrink-0" />
						) : (
							<CheckCircle2 className="size-4 text-primary shrink-0" />
						)}

						<div className="flex-1 min-w-0">
							<p className="text-[11px] font-semibold text-foreground truncate">
								Action: {message.action.type.replace(/_/g, " ")}
							</p>
							{message.action.type === "CREATE_SNIPPET" &&
								message.action.params.language && (
									<p className="text-[10px] text-muted-foreground">
										Mode: {message.action.params.language}
									</p>
								)}
						</div>

						<Badge
							variant="outline"
							className="h-4 text-[9px] font-mono text-emerald-400 border-emerald-500/30"
						>
							Executed
						</Badge>
					</div>
				)}

				<span className="text-[10px] text-muted-foreground/60 pt-0.5 px-0.5">
					{message.status === "streaming" && isLast
						? "Streaming..."
						: "Delivered"}
				</span>
			</div>
		</div>
	);
};
