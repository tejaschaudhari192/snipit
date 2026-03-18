import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import chaloAudio from "@/assets/audio/chalo.mp3";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JumpToDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export const JumpToDialog = ({ isOpen, onOpenChange }: JumpToDialogProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [snippetId, setSnippetId] = useState("");

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onOpenChange(!isOpen);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [isOpen, onOpenChange]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (snippetId.trim()) {
			// Play chalo sound
			const audio = new Audio(chaloAudio);
			audio.play().catch((e) => console.error("Error playing audio:", e));

			navigate(`/${snippetId.trim()}`);
			onOpenChange(false);
			setSnippetId("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden">
				<DialogHeader>
					<div className="flex items-center gap-2 mb-1">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<Search className="h-5 w-5" />
						</div>
						<DialogTitle>
							{t("header.jump_to_title", "Jump to Snippet")}
						</DialogTitle>
					</div>
					<p className="text-sm text-muted-foreground">
						{t(
							"header.jump_to_desc",
							"Enter the snippet ID to navigate directly to it.",
						)}
					</p>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="flex items-center gap-2 mt-4"
				>
					<div className="relative flex-1 group">
						<Input
							placeholder={t(
								"header.jump_to_placeholder",
								"Enter snippet ID...",
							)}
							value={snippetId}
							onChange={(e) => setSnippetId(e.target.value)}
							className="pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
							autoFocus
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
							<kbd className="h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium flex">
								<span className="text-xs">⌘</span>
							</kbd>
							<kbd className="h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium flex">
								K
							</kbd>
						</div>
					</div>
					<Button
						type="submit"
						size="icon"
						disabled={!snippetId.trim()}
					>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
