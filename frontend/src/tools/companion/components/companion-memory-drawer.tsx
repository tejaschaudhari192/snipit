import React from "react";
import { Brain, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompanionSessionData } from "../services/companion-api";

interface CompanionMemoryDrawerProps {
	isOpen: boolean;
	session: CompanionSessionData;
	onClose: () => void;
	onDeleteMemory: (memoryId: string) => void;
	onHardReset: () => void;
}

export const CompanionMemoryDrawer: React.FC<CompanionMemoryDrawerProps> = ({
	isOpen,
	session,
	onClose,
	onDeleteMemory,
	onHardReset,
}) => {
	if (!isOpen) return null;

	return (
		<aside className="w-72 md:w-80 border-l border-border/70 bg-card/60 backdrop-blur-xl flex flex-col p-4 z-30 shrink-0 animate-in slide-in-from-right duration-300 shadow-xl overflow-y-auto custom-scrollbar">
			<div className="flex items-center justify-between pb-3 border-b border-border/50">
				<div className="flex items-center gap-2">
					<Brain className="w-4 h-4 text-primary" />
					<h4 className="font-bold text-sm tracking-tight">
						Subconscious Memory
					</h4>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="h-7 w-7 rounded-lg"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>

			{/* Relationship Stats Card */}
			<div className="mt-4 p-3.5 rounded-xl bg-background/70 border border-border/60 space-y-2.5">
				<div className="flex justify-between items-center text-xs">
					<span className="text-muted-foreground font-medium">
						Connection Depth
					</span>
					<span className="font-bold text-primary">
						{session.stage}
					</span>
				</div>
				<div className="flex justify-between items-center text-xs">
					<span className="text-muted-foreground font-medium">
						Fondness
					</span>
					<span className="font-bold text-rose-400">
						{session.metrics.fondness}%
					</span>
				</div>
				<div className="flex justify-between items-center text-xs">
					<span className="text-muted-foreground font-medium">
						Tension / Friction
					</span>
					<span className="font-bold text-amber-400">
						{session.metrics.friction}/10
					</span>
				</div>
			</div>

			{/* Stored Memories List */}
			<div className="mt-4 flex-1 flex flex-col space-y-2">
				<div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider px-1">
					<span>What She Remembers</span>
					<span>({session.memories.length})</span>
				</div>

				{session.memories.length === 0 ? (
					<p className="text-xs text-muted-foreground/70 italic p-3 text-center bg-muted/20 rounded-lg">
						No stored memories yet. She picks up details organically
						during conversation.
					</p>
				) : (
					session.memories.map((m) => (
						<div
							key={m.id}
							className="group p-2.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 flex items-start justify-between gap-2 transition-colors text-xs"
						>
							<div className="space-y-0.5 flex-1 min-w-0">
								<span className="font-semibold text-primary block truncate">
									{m.key}
								</span>
								<p className="text-muted-foreground text-xs leading-tight">
									{m.detail}
								</p>
							</div>
							<button
								onClick={() => onDeleteMemory(m.id)}
								title="Forget this memory"
								className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</div>
					))
				)}
			</div>

			{/* Hard Wipe Option */}
			<div className="pt-4 mt-auto border-t border-border/50">
				<Button
					variant="destructive"
					size="sm"
					onClick={onHardReset}
					className="w-full text-xs h-8 rounded-lg"
				>
					<Trash2 className="w-3.5 h-3.5 mr-1.5" />
					Wipe Consciousness & Memory
				</Button>
			</div>
		</aside>
	);
};
