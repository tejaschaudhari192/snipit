import { useState, useEffect, useRef } from "react";
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
import { useTranslation } from "react-i18next";

export interface AiEnhanceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	selectedText: string;
	onApply: (newText: string) => void;
	initialInstruction?: string;
	contentType?: string;
}

export const AiEnhanceDialog = ({
	isOpen,
	onClose,
	selectedText,
	onApply,
	initialInstruction = "",
	contentType,
}: AiEnhanceDialogProps) => {
	const { t } = useTranslation();
	const apiHelpers = useApiHelpers();
	const [instruction, setInstruction] = useState(initialInstruction);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Reset state when dialog opens
	useEffect(() => {
		if (isOpen) {
			setInstruction(initialInstruction);
			setResult(null);
			setIsLoading(false);
			// Auto-focus the textarea
			setTimeout(() => textareaRef.current?.focus(), 100);
		}
	}, [isOpen, initialInstruction]);

	const handleEnhance = async (overrideInstruction?: string) => {
		let targetInstruction = overrideInstruction ?? instruction;
		if (!targetInstruction.trim()) {
			toast.error(t("ai_dialog.error_instruction"));
			return;
		}

		if (contentType === "richtext") {
			targetInstruction = `${targetInstruction} (IMPORTANT: Return the response as clean, nicely formatted HTML suitable for a rich text editor. Use proper semantic tags like <p>, <strong>, <em>, <ul>, <li>, <h3>, <h4>, <blockquote>, <code> etc. Do NOT wrap the code/response in markdown formatting like \`\`\`html or similar code blocks. Output ONLY the raw HTML content.)`;
		}

		setIsLoading(true);
		try {
			const res = await apiHelpers.enhanceContent(
				selectedText,
				targetInstruction,
			);
			if (res && res.result) {
				setResult(res.result);
				toast.success(t("ai_dialog.success"));
			} else {
				toast.error(t("ai_dialog.error_failed"));
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
		{
			label: t("ai_dialog.actions.professional"),
			tooltip: t("ai_dialog.tooltips.professional"),
		},
		{
			label: t("ai_dialog.actions.simplify"),
			tooltip: t("ai_dialog.tooltips.simplify"),
		},
		{
			label: t("ai_dialog.actions.grammar"),
			tooltip: t("ai_dialog.tooltips.grammar"),
		},
		{
			label: t("ai_dialog.actions.summarize"),
			tooltip: t("ai_dialog.tooltips.summarize"),
		},
		{
			label: t("ai_dialog.actions.comments"),
			tooltip: t("ai_dialog.tooltips.comments"),
		},
	];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-150 border-border/50 bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary" />
						{t("ai_dialog.title")}
					</DialogTitle>
					<DialogDescription>
						{t("ai_dialog.description")}
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
									className="text-xs h-7 rounded-full bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all"
									onClick={() => {
										setInstruction(action.tooltip);
										handleEnhance(action.tooltip);
									}}
								>
									{action.label}
								</Button>
							))}
						</div>
						<Textarea
							ref={textareaRef}
							placeholder={t("ai_dialog.placeholder")}
							className="min-h-25 resize-none focus-visible:ring-1 focus-visible:ring-primary/50 bg-background/50 border-border/40"
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
						<div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
									<div className="w-1 h-1 rounded-full bg-primary" />
									{t("ai_dialog.preview")}
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-[10px] text-muted-foreground hover:text-primary"
									onClick={() => setResult(null)}
								>
									{t("common.clear_all")}
								</Button>
							</div>
							<div className="p-4 bg-muted/30 rounded-xl border border-border/30 text-sm max-h-62.5 overflow-y-auto whitespace-pre-wrap font-mono shadow-inner custom-scrollbar selection:bg-primary/20">
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
						{t("ai_dialog.cancel")}
					</Button>
					{result ? (
						<Button onClick={handleApply} disabled={isLoading}>
							{t("ai_dialog.replace")}
						</Button>
					) : (
						<Button
							onClick={() => handleEnhance()}
							disabled={isLoading || !instruction.trim()}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("ai_dialog.enhancing")}
								</>
							) : (
								<>
									<Wand2 className="mr-2 h-4 w-4" />
									{t("ai_dialog.run")}
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
