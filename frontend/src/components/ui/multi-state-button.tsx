import * as React from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";
import { Loader2, Check } from "lucide-react";
import { cn } from "cn";

export interface MultiStateButtonProps extends Omit<
	HTMLMotionProps<"button">,
	"children" | "onAnimationStart"
> {
	status?: "idle" | "loading" | "success";
	idleLabel?: React.ReactNode;
	loadingLabel?: React.ReactNode;
	successLabel?: React.ReactNode;
	idleIcon?: React.ReactNode;
	loadingIcon?: React.ReactNode;
	successIcon?: React.ReactNode;
	duration?: number;
	autoResetDelay?: number;
	onAction?: () => void | Promise<void>;
}

export const MultiStateButton = React.forwardRef<
	HTMLButtonElement,
	MultiStateButtonProps
>(
	(
		{
			status: controlledStatus,
			idleLabel = "Submit",
			loadingLabel = "Submitting...",
			successLabel = "Success!",
			idleIcon,
			loadingIcon,
			successIcon,
			duration = 1800,
			autoResetDelay = 2500,
			onAction,
			className,
			onClick,
			disabled,
			...props
		},
		ref,
	) => {
		const [uncontrolledStatus, setUncontrolledStatus] = React.useState<
			"idle" | "loading" | "success"
		>("idle");

		const isControlled = controlledStatus !== undefined;
		const currentStatus = isControlled
			? controlledStatus
			: uncontrolledStatus;

		const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
			if (currentStatus !== "idle") return;

			if (onClick) onClick(e);

			if (!isControlled) {
				setUncontrolledStatus("loading");
				if (onAction) {
					try {
						await onAction();
						setUncontrolledStatus("success");
					} catch {
						setUncontrolledStatus("idle");
						return;
					}
				} else {
					setTimeout(() => {
						setUncontrolledStatus("success");
					}, duration);
				}

				if (autoResetDelay > 0) {
					setTimeout(() => {
						setUncontrolledStatus("idle");
					}, duration + autoResetDelay);
				}
			}
		};

		return (
			<motion.button
				ref={ref}
				data-slot="button"
				onClick={handleClick}
				disabled={disabled || currentStatus !== "idle"}
				whileHover={{ scale: currentStatus === "idle" ? 1.02 : 1 }}
				whileTap={{ scale: currentStatus === "idle" ? 0.97 : 1 }}
				className={cn(
					"group relative inline-flex items-center justify-center gap-2 overflow-hidden font-medium text-sm transition-all duration-300 select-none outline-none rounded-lg",
					currentStatus === "idle"
						? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
						: currentStatus === "success"
							? "bg-emerald-600 text-white cursor-not-allowed!"
							: "bg-primary/80 text-primary-foreground cursor-not-allowed!",
					"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:cursor-not-allowed!",
					disabled && "opacity-60",
					className,
				)}
				{...props}
			>
				<AnimatePresence mode="wait" initial={false}>
					{currentStatus === "idle" && (
						<motion.span
							key="idle"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
							className="relative z-10 flex items-center gap-2 font-medium"
						>
							{idleIcon}
							<span>{idleLabel}</span>
						</motion.span>
					)}

					{currentStatus === "loading" && (
						<motion.span
							key="loading"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
							className="relative z-10 flex items-center gap-2 font-medium"
						>
							{loadingIcon || (
								<Loader2 className="size-4 animate-spin" />
							)}
							<span>{loadingLabel}</span>
						</motion.span>
					)}

					{currentStatus === "success" && (
						<motion.span
							key="success"
							initial={{ opacity: 0, scale: 0.85 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.85 }}
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 22,
							}}
							className="relative z-10 flex items-center gap-2 font-medium"
						>
							{successIcon || (
								<Check className="size-4 stroke-[2.5]" />
							)}
							<span>{successLabel}</span>
						</motion.span>
					)}
				</AnimatePresence>
			</motion.button>
		);
	},
);

MultiStateButton.displayName = "MultiStateButton";

export default MultiStateButton;
