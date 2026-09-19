import { useState } from "react";
import { type Editor } from "@tiptap/core";
import { enhanceContent } from "@/lib/api/ai";
import {
	Sparkles,
	ArrowUp,
	RefreshCw,
	CheckCheck,
	ChevronDown,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BubbleMenuAiProps {
	editor: Editor;
	onClose: () => void;
}

export function BubbleMenuAi({ editor, onClose }: BubbleMenuAiProps) {
	const [customPrompt, setCustomPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleAiAction = async (prompt: string) => {
		const { from, to } = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(from, to, " ");
		if (!selectedText) return;

		setIsLoading(true);
		try {
			const formattedPrompt = `${prompt} (IMPORTANT: Return the response as clean, nicely formatted HTML suitable for a rich text editor. Use proper semantic tags like <p>, <strong>, <em>, <ul>, <li>, <h3>, <h4>, <blockquote>, <code> etc. Do NOT wrap the code/response in markdown formatting like \`\`\`html or similar code blocks. Output ONLY the raw HTML content.)`;
			const response = await enhanceContent(
				selectedText,
				formattedPrompt,
			);
			if (response && response.result) {
				editor.chain().focus().insertContent(response.result).run();
			}
		} catch (error) {
			console.error("AI Error:", error);
		} finally {
			setIsLoading(false);
			onClose();
		}
	};

	return (
		<div className="flex flex-col w-72 max-h-87.5 overflow-hidden bg-popover text-popover-foreground rounded-md p-1.5 shadow-lg border border-border/80">
			{/* AI Input Header */}
			<div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50">
				<Sparkles className="h-4 w-4 text-purple-500 animate-pulse shrink-0" />
				<Input
					type="text"
					value={customPrompt}
					onChange={(e) => setCustomPrompt(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && customPrompt.trim()) {
							handleAiAction(customPrompt);
						}
					}}
					placeholder={
						isLoading
							? "Generating..."
							: "Ask AI to edit or generate..."
					}
					disabled={isLoading}
					className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none h-8 text-sm px-0 placeholder:text-muted-foreground/70"
					autoFocus
				/>
				<Button
					size="icon"
					onClick={() =>
						customPrompt.trim() && handleAiAction(customPrompt)
					}
					disabled={isLoading || !customPrompt.trim()}
					className="h-6 w-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white shrink-0 cursor-pointer"
				>
					<ArrowUp className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* Options List */}
			{!isLoading && (
				<div className="flex flex-col mt-1 overflow-y-auto max-h-55 text-xs">
					<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
						Edit or review selection
					</div>
					<Button
						variant="ghost"
						onClick={() =>
							handleAiAction(
								"Improve the writing quality, grammar, and style.",
							)
						}
						className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm cursor-pointer"
					>
						<RefreshCw className="h-3.5 w-3.5 text-purple-500" />
						<span>Improve writing</span>
					</Button>
					<Button
						variant="ghost"
						onClick={() =>
							handleAiAction(
								"Identify and fix spelling, grammar, or syntax errors.",
							)
						}
						className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm cursor-pointer"
					>
						<CheckCheck className="h-3.5 w-3.5 text-purple-500" />
						<span>Fix grammar</span>
					</Button>
					<Button
						variant="ghost"
						onClick={() =>
							handleAiAction(
								"Make this selection shorter and more concise.",
							)
						}
						className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm cursor-pointer"
					>
						<ChevronDown className="h-3.5 w-3.5 text-purple-500 rotate-180" />
						<span>Make shorter</span>
					</Button>
					<Button
						variant="ghost"
						onClick={() =>
							handleAiAction(
								"Expand this selection with more detailed information.",
							)
						}
						className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm cursor-pointer"
					>
						<ChevronDown className="h-3.5 w-3.5 text-purple-500" />
						<span>Make longer</span>
					</Button>

					<div className="h-px bg-border/50 my-1 mx-1" />

					<div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
						Use AI to do more
					</div>
					<Button
						variant="ghost"
						onClick={() =>
							handleAiAction(
								"Continue writing or extending the thoughts in this text.",
							)
						}
						className="w-full justify-start gap-2 h-8 px-2.5 rounded-sm cursor-pointer"
					>
						<Play className="h-3.5 w-3.5 text-purple-500" />
						<span>Continue writing</span>
					</Button>
				</div>
			)}
		</div>
	);
}
