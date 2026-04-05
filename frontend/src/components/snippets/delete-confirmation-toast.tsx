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
		<div className="bg-background/90 backdrop-blur-2xl text-foreground border border-border/50 rounded-2xl w-[350px] relative overflow-hidden pointer-events-auto shadow-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="flex items-center justify-between gap-4 p-4 pb-3 relative z-10">
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

			<div className="px-4 pb-2">
				<div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.6)] origin-left"
						style={{
							width: "100%",
							animationName: "toast-progress",
							animationDuration: `${duration}s`,
							animationTimingFunction: "linear",
							animationFillMode: "forwards",
						}}
						onAnimationEnd={onConfirm}
					/>
				</div>
			</div>
		</div>
	);
};
