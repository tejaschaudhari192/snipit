import React from "react";
import {
	Sparkles,
	Volume2,
	VolumeX,
	Brain,
	RefreshCw,
	Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import type { CompanionSessionData } from "../services/companion-api";

interface CompanionHeaderProps {
	session: CompanionSessionData;
	displayName: string;
	hasChosenName: boolean;
	isSpeaking: boolean;
	selectedModel: string;
	availableModels: Array<{ id: string; label: string }>;
	voiceEnabled: boolean;
	memoryDrawerOpen: boolean;
	onSelectModel: (model: string) => void;
	onToggleVoice: () => void;
	onToggleMemoryDrawer: () => void;
	onResetChat: () => void;
}

export const CompanionHeader: React.FC<CompanionHeaderProps> = ({
	session,
	displayName,
	hasChosenName,
	isSpeaking,
	selectedModel,
	availableModels,
	voiceEnabled,
	memoryDrawerOpen,
	onSelectModel,
	onToggleVoice,
	onToggleMemoryDrawer,
	onResetChat,
}) => {
	return (
		<header className="h-16 px-4 md:px-8 border-b border-border/60 flex items-center justify-between bg-card/40 backdrop-blur-md z-20 shrink-0">
			<div className="flex items-center gap-3.5">
				<div className="relative">
					<div
						className={cn(
							"w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg shadow-sm border transition-all",
							session.stage === "Intimate"
								? "bg-rose-500/20 text-rose-400 border-rose-500/30"
								: session.stage === "Confidant"
									? "bg-amber-500/20 text-amber-400 border-amber-500/30"
									: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
						)}
					>
						{hasChosenName ? (
							displayName[0]
						) : (
							<Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
						)}
					</div>
					<div
						className={cn(
							"absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-background animate-pulse",
							isSpeaking
								? "bg-emerald-400"
								: session.metrics.friction > 4
									? "bg-amber-500"
									: "bg-emerald-500",
						)}
					/>
				</div>

				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-bold text-base text-foreground tracking-tight">
							{displayName}
						</span>
						<span
							className={cn(
								"text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider border",
								session.stage === "Intimate"
									? "bg-rose-500/10 text-rose-400 border-rose-500/20"
									: session.stage === "Confidant"
										? "bg-amber-500/10 text-amber-400 border-amber-500/20"
										: "bg-primary/10 text-primary border-primary/20",
							)}
						>
							{session.stage}
						</span>
					</div>
					<span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
						<Smile className="w-3 h-3 text-muted-foreground/80" />
						{session.mood}
					</span>
				</div>
			</div>

			{/* Controls */}
			<div className="flex items-center gap-1.5 md:gap-2">
				{/* Model select pill */}
				<select
					value={selectedModel}
					onChange={(e) => onSelectModel(e.target.value)}
					className="hidden sm:block text-xs bg-muted/60 hover:bg-muted border border-border/70 text-muted-foreground rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-44 truncate"
				>
					{availableModels.map((m) => (
						<option key={m.id} value={m.id}>
							{m.label}
						</option>
					))}
				</select>

				{/* TTS Voice Toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleVoice}
					title={
						voiceEnabled
							? "Voice Muted (Click to enable)"
							: "Voice Enabled"
					}
					className={cn(
						"rounded-xl h-9 w-9 transition-colors",
						voiceEnabled
							? "bg-primary/15 text-primary hover:bg-primary/20"
							: "text-muted-foreground hover:bg-muted",
					)}
				>
					{voiceEnabled ? (
						<Volume2 className="w-4 h-4" />
					) : (
						<VolumeX className="w-4 h-4" />
					)}
				</Button>

				{/* Memory / Vibe Drawer Toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleMemoryDrawer}
					title="Memory & Subconscious Vibe"
					className={cn(
						"rounded-xl h-9 w-9 relative",
						memoryDrawerOpen
							? "bg-primary/20 text-primary"
							: "text-muted-foreground hover:bg-muted",
					)}
				>
					<Brain className="w-4 h-4" />
					{session.memories.length > 0 && (
						<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
					)}
				</Button>

				{/* Reset button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={onResetChat}
					title="Clear Chat"
					className="rounded-xl h-9 w-9 text-muted-foreground hover:bg-muted"
				>
					<RefreshCw className="w-4 h-4" />
				</Button>
			</div>
		</header>
	);
};
