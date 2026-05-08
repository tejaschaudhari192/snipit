import { useState } from "react";
import { useTranslation } from "react-i18next";
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
			toast.warning(
				t(
					"ai.draw_empty_description",
					"Please describe what you want to draw",
				),
			);
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
				toast.success(
					t("ai.draw_success", "Diagram generated successfully!"),
				);
			}
		} catch (error) {
			console.error("Failed to generate diagram:", error);
			toast.error(
				t(
					"ai.draw_error",
					"Failed to generate diagram. Please try again.",
				),
			);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px] glass-card border-border/20 shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Sparkles className="w-5 h-5 text-primary animate-pulse" />
						{t("ai.draw_title", "AI Diagram Generator")}
					</DialogTitle>
					<DialogDescription>
						{t(
							"ai.draw_description",
							"Describe the diagram or flowchart you want to create, and AI will generate it for you.",
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<Textarea
						placeholder={t(
							"ai.draw_placeholder",
							"e.g., A simple flowchart for user login process with success and failure states.",
						)}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="min-h-[120px] bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
						disabled={isGenerating}
					/>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="clear-board"
							checked={clearBoard}
							onChange={(e) => setClearBoard(e.target.checked)}
							className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer bg-background"
						/>
						<label
							htmlFor="clear-board"
							className="text-sm font-medium leading-none cursor-pointer text-muted-foreground"
						>
							{t(
								"ai.draw_clear_board",
								"Clear board before generating",
							)}
						</label>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isGenerating}
					>
						{t("common.cancel", "Cancel")}
					</Button>
					<Button
						onClick={handleGenerate}
						disabled={isGenerating || !description.trim()}
						className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								{t("ai.generating", "Generating...")}
							</>
						) : (
							<>
								<Wand2 className="w-4 h-4 mr-2" />
								{t("ai.generate", "Generate")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
