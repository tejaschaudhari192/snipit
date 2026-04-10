import { useState, useEffect } from "react";
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
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { AxiosError } from "axios";

export interface AiEnhanceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	selectedText: string;
	onApply: (newText: string) => void;
}

export const AiEnhanceDialog = ({
	isOpen,
	onClose,
	selectedText,
	onApply,
}: AiEnhanceDialogProps) => {
	const apiHelpers = useApiHelpers();
	const [instruction, setInstruction] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	// Reset state when dialog opens
	useEffect(() => {
		if (isOpen) {
			setInstruction("");
			setResult(null);
			setIsLoading(false);
		}
	}, [isOpen]);

	const handleEnhance = async () => {
		if (!instruction.trim()) {
			toast.error("Please enter an instruction.");
			return;
		}

		setIsLoading(true);
		try {
			const res = await apiHelpers.enhanceContent(
				selectedText,
				instruction,
			);
			if (res && res.result) {
				setResult(res.result);
				toast.success("Content enhanced successfully.");
			} else {
				toast.error("Failed to get a valid response from AI.");
			}
		} catch (error: unknown) {
			console.error("AI Enhance error:", error);
			const axiosError = error as AxiosError<{ error: string }>;
			const errorMsg =
				axiosError?.response?.data?.error || "Failed to process text";
			toast.error(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	const handleApply = () => {
		if (result) {
			onApply(result);
			onClose();
		}
	};

	const predefinedActions = [
		{ label: "professional", tooltip: "Make it professional" },
		{ label: "simplify", tooltip: "Simplify the text" },
		{ label: "fix grammar", tooltip: "Fix grammar & spelling" },
		{ label: "summarize", tooltip: "Summarize the text" },
		{ label: "add comments", tooltip: "Add code comments" },
	];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[600px] border-border/50 bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary" />
						AI Editor Assistant
					</DialogTitle>
					<DialogDescription>
						Transform the selected text. Tell the AI what you want
						to do.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap gap-2 mb-1">
							{predefinedActions.map((action) => (
								<Button
									key={action.label}
									variant="secondary"
									size="sm"
									className="text-xs h-7 rounded-full bg-secondary/50 hover:bg-secondary"
									onClick={() =>
										setInstruction(action.tooltip)
									}
								>
									{action.label}
								</Button>
							))}
						</div>
						<Textarea
							placeholder="e.g. Make this more professional, or summarize into bullet points."
							className="min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-primary/50"
							value={instruction}
							onChange={(e) => setInstruction(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									if (!isLoading) handleEnhance();
								}
							}}
						/>
					</div>

					{result && (
						<div className="flex flex-col gap-2 mt-2">
							<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Preview Result
							</span>
							<div className="p-3 bg-muted/50 rounded-md border border-border/50 text-sm max-h-[250px] overflow-y-auto whitespace-pre-wrap">
								{result}
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					{result ? (
						<Button onClick={handleApply} disabled={isLoading}>
							Replace Text
						</Button>
					) : (
						<Button
							onClick={handleEnhance}
							disabled={isLoading || !instruction.trim()}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enhancing...
								</>
							) : (
								<>
									<Wand2 className="mr-2 h-4 w-4" />
									Run
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
