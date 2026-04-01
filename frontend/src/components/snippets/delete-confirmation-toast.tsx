import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { playUndoSound } from "@/lib/utils";

interface DeleteConfirmationToastProps {
	onConfirm: () => void;
	onUndo: () => void;
	duration?: number;
}

export const DeleteConfirmationToast = ({
	onConfirm,
	onUndo,
	duration = 5,
}: DeleteConfirmationToastProps) => {
	const { t } = useTranslation();

	return (
		<div className="bg-background/80 backdrop-blur-2xl text-foreground border border-border/50 rounded-2xl p-4 w-[350px] relative overflow-hidden pointer-events-auto shadow-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted" />
			<div
				className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.3)] animate-progress"
				style={{
					animationDuration: `${duration}s`,
					animationTimingFunction: "linear",
				}}
				onAnimationEnd={onConfirm}
			/>

			<div className="flex items-center justify-between gap-4 relative z-10 px-1">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold tracking-tight text-foreground">
						{t(
							"messages.snippet_deleted",
							"Snippet has been deleted",
						)}
					</span>
				</div>
				<Button
					variant="secondary"
					size="sm"
					className="h-8 px-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 transition-all border-none relative z-20"
					onClick={() => {
						playUndoSound();
						onUndo();
					}}
				>
					{t("common.undo", "Undo")}
				</Button>
			</div>
		</div>
	);
};
