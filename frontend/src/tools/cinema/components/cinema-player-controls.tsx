import React from "react";
import { ArrowLeft, Check, Copy, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CINEMA_EMOJIS } from "@/constants";

export interface CinemaTopBarProps {
	onLeave: () => void;
	isHost: boolean;
	isP2pMode?: boolean;
	copied: boolean;
	onCopyInvite: () => void;
	onChangeVideo?: () => void;
}

export const CinemaTopBar: React.FC<CinemaTopBarProps> = ({
	onLeave,
	isHost,
	isP2pMode,
	copied,
	onCopyInvite,
	onChangeVideo,
}) => {
	return (
		<div className="absolute top-0 left-0 right-0 z-30 p-3 bg-linear-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={onLeave}
					className="h-8 px-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg gap-1.5 cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-xs font-semibold">Leave</span>
				</Button>
				<div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white/90 text-xs font-medium">
					<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
					<span>
						{isHost ? "Host" : isP2pMode ? "P2P Stream" : "Synced"}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{isHost && onChangeVideo && !isP2pMode && (
					<Button
						variant="secondary"
						size="sm"
						onClick={onChangeVideo}
						className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md cursor-pointer"
					>
						<Film className="w-3.5 h-3.5" />
						<span>Change Video</span>
					</Button>
				)}
				<Button
					variant="secondary"
					size="sm"
					onClick={onCopyInvite}
					className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md cursor-pointer"
				>
					{copied ? (
						<Check className="w-3.5 h-3.5 text-emerald-400" />
					) : (
						<Copy className="w-3.5 h-3.5" />
					)}
					{copied ? "Copied" : "Copy Invite"}
				</Button>
			</div>
		</div>
	);
};

export interface CinemaFloatingReactionsProps {
	reactions: Array<{ id: number; emoji: string; name: string; left: number }>;
}

export const CinemaFloatingReactions: React.FC<
	CinemaFloatingReactionsProps
> = ({ reactions }) => {
	return (
		<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
			{reactions.map((react) => (
				<div
					key={react.id}
					style={{ left: `${react.left}%` }}
					className="absolute bottom-24 animate-float-emoji flex flex-col items-center gap-1 bg-background/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/50 shadow-lg"
				>
					<span className="text-3xl filter drop-shadow-md">
						{react.emoji}
					</span>
					<span className="text-[10px] text-foreground/80 font-bold whitespace-nowrap drop-shadow-md">
						{react.name}
					</span>
				</div>
			))}
		</div>
	);
};

export interface CinemaReactionBarProps {
	onSendReaction: (emoji: string) => void;
	bottomClass?: string;
}

export const CinemaReactionBar: React.FC<CinemaReactionBarProps> = ({
	onSendReaction,
	bottomClass = "bottom-20",
}) => {
	return (
		<div
			className={`absolute ${bottomClass} left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
		>
			{CINEMA_EMOJIS.map((emoji) => (
				<button
					key={emoji}
					onClick={() => onSendReaction(emoji)}
					className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 hover:scale-125 active:scale-95 transition-all text-lg cursor-pointer"
					title={`React ${emoji}`}
				>
					{emoji}
				</button>
			))}
		</div>
	);
};
