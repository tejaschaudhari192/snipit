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
import { Loader2, Wand2 } from "lucide-react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import TextGradient from "@/components/text-gradient";

export interface AiWriterDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onApply: (newText: string) => void;
	selectedText: string;
	contentType?: string;
}

export const AiWriterDialog = ({
	isOpen,
	onClose,
	onApply,
	selectedText,
	contentType,
}: AiWriterDialogProps) => {
	const { t } = useTranslation();
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

	const handleWrite = async () => {
		setIsLoading(true);
		try {
			// Using the same endpoint but with empty context if needed,
			// or a specialized writing endpoint if available.
			// For now, we reuse enhanceContent with the provided context (selectedText or empty).
			let targetInstruction =
				instruction ||
				"Write something interesting and useful for a developer.";
			if (contentType === "richtext") {
				targetInstruction = `${targetInstruction} (IMPORTANT: Return the response as clean, nicely formatted HTML suitable for a rich text editor. Use proper semantic tags like <p>, <strong>, <em>, <ul>, <li>, <h3>, <h4>, <blockquote>, <code> etc. Do NOT wrap the code/response in markdown formatting like \`\`\`html or similar code blocks. Output ONLY the raw HTML content.)`;
			}

			const res = await apiHelpers.enhanceContent(
				selectedText || "",
				targetInstruction,
			);
			if (res && res.result) {
				setResult(res.result);
				toast.success(t("ai_dialog.success"));
			} else {
				toast.error(t("ai_dialog.error_failed"));
			}
		} catch (error: unknown) {
			console.error("AI Writer error:", error);
			const axiosError = error as AxiosError<{ error: string }>;
			const errorMsg =
				axiosError?.response?.data?.error || "Failed to generate text";
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
			label: t("ai_writer.actions.write_code") || "Write Code",
			tooltip:
				t("ai_writer.tooltips.write_code") ||
				"Write a high-quality code snippet based on my request.",
		},
		{
			label: t("ai_writer.actions.explain_write") || "Explain & Write",
			tooltip:
				t("ai_writer.tooltips.explain_write") ||
				"Explain the logic and then write the code.",
		},
		{
			label: t("ai_writer.actions.refactor_ideas") || "Refactor Ideas",
			tooltip:
				t("ai_writer.tooltips.refactor_ideas") ||
				"Suggest ways to refactor this idea into code.",
		},
	];

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-150 border-border/50 bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Wand2 className="w-5 h-5 text-primary" />
						{t("ai_writer.title") || "AI Writer"}
					</DialogTitle>
					<DialogDescription>
						{t("ai_writer.description") ||
							"Describe what you want to write, and AI will generate it for you."}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="flex flex-col gap-2">
						{selectedText && (
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
						)}
						<Textarea
							placeholder={
								t("ai_writer.placeholder") ||
								"e.g. Write a React component for a login form..."
							}
							className="min-h-25 resize-none focus-visible:ring-1 focus-visible:ring-primary/50"
							value={instruction}
							onChange={(e) => setInstruction(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									if (!isLoading) handleWrite();
								}
							}}
						/>
					</div>

					{result && (
						<div className="flex flex-col gap-2 mt-2">
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
							{t("ai_writer.apply") || "Insert Code"}
						</Button>
					) : (
						<Button onClick={handleWrite} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<TextGradient
										highlightColor="var(--foreground)"
										baseColor="var(--muted-foreground)"
										spread={20}
										duration={2}
										className="font-medium"
									>
										{t("ai_writer.generating") ||
											"Generating..."}
									</TextGradient>
								</>
							) : (
								<>
									<Wand2 className="mr-2 h-4 w-4" />
									{t("ai_writer.run") || "Generate"}
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
