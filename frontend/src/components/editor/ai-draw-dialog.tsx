import { useState } from "react";
import { useTranslation } from "react-i18next";
import TextGradient from "@/components/text-gradient";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AiDrawDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onApply: (elements: string, clearBoard: boolean) => void;
}

export const AiDrawDialog = ({
	isOpen,
	onClose,
	onApply,
}: AiDrawDialogProps) => {
	const { t } = useTranslation();
	const apiHelpers = useApiHelpers();
	const [description, setDescription] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [clearBoard, setClearBoard] = useState(false);

	const handleGenerate = async () => {
		if (!description.trim()) {
			toast.warning(t("ai.draw_empty_description"));
			return;
		}

		setIsGenerating(true);
		try {
			const { elements } =
				await apiHelpers.generateDrawContent(description);
			if (elements) {
				onApply(elements, clearBoard);
				onClose();
				setDescription("");
				toast.success(t("ai.draw_success"));
			}
		} catch (error) {
			console.error("Failed to generate diagram:", error);
			toast.error(t("ai.draw_error"));
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[550px] p-0 border-border/20 bg-background/80 backdrop-blur-2xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

				<DialogHeader className="p-6 pb-2 relative z-10">
					<div className="space-y-1">
						<DialogTitle className="text-2xl font-black flex items-center gap-2 tracking-tight">
							<div className="p-2 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/5">
								<Sparkles className="w-5 h-5 animate-pulse" />
							</div>
							{t("ai.draw_title")}
							<Badge
								variant="glass"
								className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/20 text-primary bg-primary/10"
							>
								Beta
							</Badge>
						</DialogTitle>
						<DialogDescription className="text-sm font-medium opacity-70">
							{t("ai.draw_description")}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="px-6 py-4 space-y-6 relative z-10">
					<div className="relative group">
						<Textarea
							placeholder={t("ai.draw_placeholder")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="min-h-[140px] bg-muted/20 border-border/40 focus:border-primary/50 focus:ring-primary/20 
								rounded-2xl resize-none transition-all duration-300 text-sm leading-relaxed custom-scrollbar p-4"
							disabled={isGenerating}
						/>
						<div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
							<span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md">
								Enter ↵
							</span>
						</div>
					</div>

					<div className="flex items-center space-x-3 px-1">
						<div className="relative flex items-center">
							<input
								type="checkbox"
								id="clear-board"
								checked={clearBoard}
								onChange={(e) =>
									setClearBoard(e.target.checked)
								}
								className="w-5 h-5 rounded-lg border-border/50 text-primary focus:ring-primary/30 cursor-pointer bg-background/50 transition-all hover:border-primary/50"
							/>
						</div>
						<label
							htmlFor="clear-board"
							className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-pointer select-none"
						>
							{t("ai.draw_clear_board")}
						</label>
					</div>
				</div>

				<DialogFooter className="p-6 pt-2 bg-muted/10 border-t border-border/10 flex flex-col sm:flex-row gap-3">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isGenerating}
						className="rounded-xl font-bold uppercase tracking-wider text-xs h-11"
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={handleGenerate}
						disabled={isGenerating || !description.trim()}
						className="rounded-xl font-black uppercase tracking-wider text-xs h-11 px-8 shadow-xl shadow-primary/20
							bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								<TextGradient
									highlightColor="var(--foreground)"
									baseColor="var(--muted-foreground)"
									spread={20}
									duration={2}
									className="font-medium"
								>
									{t("ai.generating")}
								</TextGradient>
							</>
						) : (
							<>
								<Wand2 className="w-4 h-4 mr-2" />
								{t("ai.generate")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
