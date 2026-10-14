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
import { enhanceContent } from "@/lib/api/ai";
import { toast } from "@/components/ui/toast";
import { Sparkles, Wand2, FileEdit } from "lucide-react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { GifLoader } from "@/components/common/gif-loader";
import { AnimatedBorderButton } from "@/components/ui/animated-border-button";
import { ShinyText } from "@/components/ui/shiny-text";

export interface AiWriterDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onApply: (newText: string) => void;
	selectedText?: string;
	contentType?: string;
	initialInstruction?: string;
}

export const AiWriterDialog = ({
	isOpen,
	onClose,
	onApply,
	selectedText = "",
	contentType,
	initialInstruction = "",
}: AiWriterDialogProps) => {
	const { t } = useTranslation();

	const isModifyMode = Boolean(
		selectedText && selectedText.trim().length > 0,
	);
	const [instruction, setInstruction] = useState(initialInstruction);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	// Reset state when dialog opens
	useEffect(() => {
		if (isOpen) {
			setInstruction(initialInstruction);
			setResult(null);
			setIsLoading(false);
		}
	}, [isOpen, initialInstruction]);

	const handleRun = async (overrideInstruction?: string) => {
		const targetInst = (overrideInstruction ?? instruction).trim();
		if (!targetInst) {
			toast.add({
				title: t("ai_dialog.error_instruction"),
				type: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			let finalInstruction = targetInst;
			if (contentType === "docs") {
				finalInstruction = `${finalInstruction} (IMPORTANT: Return the response as clean, nicely formatted HTML suitable for a rich text editor. Use proper semantic tags like <p>, <strong>, <em>, <ul>, <li>, <h3>, <h4>, <blockquote>, <code> etc. Do NOT wrap the code/response in markdown formatting like \`\`\`html or similar code blocks. Output ONLY the raw HTML content.)`;
			}

			const res = await enhanceContent(
				selectedText || "",
				finalInstruction,
			);
			if (res && res.result) {
				setResult(res.result);
				toast.add({ title: t("ai_dialog.success"), type: "success" });
			} else {
				toast.add({
					title: t("ai_dialog.error_failed"),
					type: "error",
				});
			}
		} catch (error: unknown) {
			console.error("AI Assistant error:", error);
			const axiosError = error as AxiosError<{ error: string }>;
			const errorMsg =
				axiosError?.response?.data?.error ||
				"Failed to process AI request";
			toast.add({ title: errorMsg, type: "error" });
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

	// Actions adapt to whether user has selected text (Modify mode) or no selection (Writer mode)
	const actionChips = isModifyMode
		? [
				{
					label: t("ai_dialog.actions.refactor"),
					instruction:
						"Refactor this code to be cleaner, more modular, and efficient.",
				},
				{
					label: t("ai_dialog.actions.fix"),
					instruction:
						"Identify and fix any bugs, errors, or edge cases in this code.",
				},
				{
					label: t("ai_dialog.actions.explain"),
					instruction:
						"Explain how this code works clearly with bullet points.",
				},
				{
					label: t("ai_dialog.actions.comments"),
					instruction:
						"Add clear, helpful comments and docstrings to this code.",
				},
				{
					label: t("ai_dialog.actions.simplify"),
					instruction:
						"Simplify this code while preserving exact behavior.",
				},
			]
		: [
				{
					label: t("ai_writer.actions.write_code"),
					instruction: t("ai_writer.tooltips.write_code"),
				},
				{
					label: t("ai_writer.actions.explain_write"),
					instruction: t("ai_writer.tooltips.explain_write"),
				},
				{
					label: t("ai_writer.actions.refactor_ideas"),
					instruction: t("ai_writer.tooltips.refactor_ideas"),
				},
			];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-150 border-border/50 bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isModifyMode ? (
							<FileEdit className="w-5 h-5 text-primary" />
						) : (
							<Wand2 className="w-5 h-5 text-primary" />
						)}
						{isModifyMode
							? t("ai_dialog.title")
							: t("ai_writer.title")}
					</DialogTitle>
					<DialogDescription>
						{isModifyMode
							? t("ai_dialog.description")
							: t("ai_writer.description")}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-3">
					{/* Selection Snippet Preview if in Modify Mode */}
					{isModifyMode && selectedText && (
						<div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
							<div className="flex items-center justify-between text-muted-foreground font-medium">
								<span>Selected snippet:</span>
								<span>{selectedText.length} characters</span>
							</div>
							<div className="font-mono text-muted-foreground/90 max-h-20 overflow-y-auto whitespace-pre-wrap line-clamp-3 select-none">
								{selectedText}
							</div>
						</div>
					)}

					<div className="flex flex-col gap-2">
						{/* Quick Action Chips */}
						<div className="flex flex-wrap gap-1.5">
							{actionChips.map((action) => (
								<Button
									key={action.label}
									type="button"
									variant="secondary"
									size="sm"
									className="text-xs h-7 rounded-full bg-secondary/50 hover:bg-secondary cursor-pointer"
									onClick={() => {
										setInstruction(action.instruction);
										handleRun(action.instruction);
									}}
								>
									{action.label}
								</Button>
							))}
						</div>

						<Textarea
							placeholder={
								isModifyMode
									? t("ai_dialog.placeholder")
									: t("ai_writer.placeholder")
							}
							className="min-h-24 resize-none focus-visible:ring-1 focus-visible:ring-primary/50 font-sans"
							value={instruction}
							onChange={(e) => setInstruction(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									if (!isLoading) handleRun();
								}
							}}
						/>
					</div>

					{isLoading && (
						<div className="p-6 bg-muted/20 rounded-lg border border-border/50 flex flex-col items-center justify-center">
							<GifLoader
								size="md"
								label={
									isModifyMode
										? t("ai_dialog.enhancing")
										: t("ai_writer.generating")
								}
							/>
						</div>
					)}

					{result && !isLoading && (
						<div className="flex flex-col gap-2 mt-1">
							<span className="text-xs font-semibold text-muted-foreground tracking-wider">
								{t("ai_dialog.preview")}
							</span>
							<div className="p-3 bg-muted/50 rounded-md border border-border/50 text-sm max-h-62.5 overflow-y-auto whitespace-pre-wrap font-mono">
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
							{isModifyMode
								? t("ai_dialog.replace")
								: t("ai_writer.apply")}
						</Button>
					) : (
						<AnimatedBorderButton
							onClick={() => handleRun()}
							disabled={isLoading}
							className="h-9 px-4 text-xs font-medium"
						>
							{isLoading ? (
								<>
									<Spinner className="mr-1.5 h-3.5 w-3.5 animate-spin" />
									<ShinyText>
										{isModifyMode
											? t("ai_dialog.enhancing")
											: t("ai_writer.generating")}
									</ShinyText>
								</>
							) : (
								<>
									<Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
									<span>{t("ai_writer.run")}</span>
								</>
							)}
						</AnimatedBorderButton>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AiWriterDialog;
