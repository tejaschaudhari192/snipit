import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
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
		<div className="bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200/50 rounded-2xl p-4 w-[350px] relative overflow-hidden pointer-events-auto shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15),0_0_60px_30px_rgba(99,102,241,0.05)]">
			<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100/40" />
			<motion.div
				className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
				initial={{ width: "0%" }}
				animate={{ width: "100%" }}
				transition={{ duration: duration, ease: "linear" }}
				onAnimationComplete={onConfirm}
			/>

			<div className="flex items-center justify-between gap-4 relative z-10 px-1">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold tracking-tight text-slate-800">
						{t(
							"messages.snippet_deleted",
							"Snippet has been deleted",
						)}
					</span>
				</div>
				<Button
					variant="secondary"
					size="sm"
					className="h-8 px-4 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-all border-none relative z-20"
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
