import React, { type RefObject } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanionInputDockProps {
	inputPrompt: string;
	isStreaming: boolean;
	hasChosenName: boolean;
	displayName: string;
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	onChangeInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onSubmit: (e?: React.FormEvent) => void;
}

export const CompanionInputDock: React.FC<CompanionInputDockProps> = ({
	inputPrompt,
	isStreaming,
	hasChosenName,
	displayName,
	textareaRef,
	onChangeInput,
	onSubmit,
}) => {
	return (
		<div className="p-3 md:p-5 border-t border-border/60 bg-card/30 backdrop-blur-md shrink-0">
			<form
				onSubmit={onSubmit}
				className="max-w-3xl mx-auto flex items-end gap-2"
			>
				<div className="flex-1 bg-background/90 border border-border/70 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 rounded-2xl transition-all flex items-center px-3.5 py-1.5 shadow-inner">
					<textarea
						ref={textareaRef}
						value={inputPrompt}
						onChange={onChangeInput}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSubmit();
							}
						}}
						rows={1}
						data-voice="companion-input"
						placeholder={
							hasChosenName
								? `Talk with ${displayName}...`
								: "Say hello to begin..."
						}
						disabled={isStreaming}
						className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none resize-none max-h-32 py-1.5 custom-scrollbar"
					/>
				</div>

				<Button
					type="submit"
					data-voice="companion-submit"
					disabled={!inputPrompt.trim() || isStreaming}
					className="h-11 w-11 rounded-2xl shrink-0 transition-transform active:scale-95 shadow-md flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Send className="w-4 h-4" />
				</Button>
			</form>
		</div>
	);
};
