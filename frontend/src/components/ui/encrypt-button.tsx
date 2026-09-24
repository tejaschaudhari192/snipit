"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, AnimatePresence } from "motion/react";
import { Lock, Unlock, Terminal } from "lucide-react";
import { cn } from "cn";

const DEFAULT_TEXT = "Encrypt Data";
const CYCLES_PER_CHAR = 4;
const SHUFFLE_SPEED = 30;
const SCRAMBLE_CHARS = "010101_!@#$%^&*()<>{}[]░▒▓█";

export interface EncryptButtonProps extends Omit<
	HTMLMotionProps<"button">,
	"children"
> {
	text?: string;
	children?: React.ReactNode;
	icon?: React.ReactNode;
	showIcon?: boolean;
	isLocked?: boolean;
}

export const EncryptButton = React.forwardRef<
	HTMLButtonElement,
	EncryptButtonProps
>(
	(
		{
			text,
			className,
			children,
			icon,
			showIcon = true,
			isLocked = true,
			onMouseEnter,
			onMouseLeave,
			disabled,
			...props
		},
		ref,
	) => {
		const labelText =
			(typeof children === "string" ? children : text) || DEFAULT_TEXT;

		const [displayText, setDisplayText] = React.useState(labelText);
		const [isHovered, setIsHovered] = React.useState(false);
		const [isDecrypted, setIsDecrypted] = React.useState(false);
		const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

		const stopScramble = React.useCallback(() => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setDisplayText(labelText);
			setIsDecrypted(false);
		}, [labelText]);

		const startScramble = React.useCallback(() => {
			stopScramble();
			let step = 0;
			const totalSteps = labelText.length * CYCLES_PER_CHAR;

			intervalRef.current = setInterval(() => {
				setDisplayText(() => {
					const scrambled = labelText
						.split("")
						.map((char, index) => {
							if (step / CYCLES_PER_CHAR > index) return char;
							if (char === " ") return " ";
							return SCRAMBLE_CHARS[
								Math.floor(
									Math.random() * SCRAMBLE_CHARS.length,
								)
							];
						})
						.join("");
					return scrambled;
				});

				step++;
				if (step > totalSteps) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					setDisplayText(labelText);
					setIsDecrypted(true);
				}
			}, SHUFFLE_SPEED);
		}, [labelText, stopScramble]);

		React.useEffect(() => {
			setDisplayText(labelText);
		}, [labelText]);

		React.useEffect(() => {
			return () => {
				if (intervalRef.current) clearInterval(intervalRef.current);
			};
		}, []);

		return (
			<motion.button
				ref={ref}
				disabled={disabled}
				onMouseEnter={(e) => {
					if (disabled) return;
					setIsHovered(true);
					startScramble();
					if (onMouseEnter) onMouseEnter(e);
				}}
				onMouseLeave={(e) => {
					if (disabled) return;
					setIsHovered(false);
					stopScramble();
					if (onMouseLeave) onMouseLeave(e);
				}}
				whileHover={disabled ? undefined : { scale: 1.01 }}
				whileTap={disabled ? undefined : { scale: 0.99 }}
				className={cn(
					"group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 select-none cursor-pointer outline-none border",
					"bg-primary text-primary-foreground border-primary/50 hover:bg-primary/95",
					"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			>
				{/* HUD Tech Corner Brackets */}
				<span className="absolute top-1 left-1 size-1.5 border-t border-l border-primary-foreground/30 transition-colors duration-300 group-hover:border-primary-foreground group-hover:size-2" />
				<span className="absolute top-1 right-1 size-1.5 border-t border-r border-primary-foreground/30 transition-colors duration-300 group-hover:border-primary-foreground group-hover:size-2" />
				<span className="absolute bottom-1 left-1 size-1.5 border-b border-l border-primary-foreground/30 transition-colors duration-300 group-hover:border-primary-foreground group-hover:size-2" />
				<span className="absolute bottom-1 right-1 size-1.5 border-b border-r border-primary-foreground/30 transition-colors duration-300 group-hover:border-primary-foreground group-hover:size-2" />

				{/* Laser Sweep Scan Beam */}
				<AnimatePresence>
					{isHovered && !disabled && (
						<motion.span
							initial={{ x: "-100%" }}
							animate={{ x: "200%" }}
							exit={{ opacity: 0 }}
							transition={{
								repeat: Infinity,
								duration: 1.4,
								ease: "easeInOut",
							}}
							className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
						/>
					)}
				</AnimatePresence>

				{/* High-Tech Icon Indicator */}
				{showIcon && (
					<span className="relative z-10 flex items-center justify-center">
						{icon ? (
							icon
						) : (
							<AnimatePresence mode="wait" initial={false}>
								{isDecrypted ? (
									<motion.span
										key="unlocked"
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.5, opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<Unlock className="size-4" />
									</motion.span>
								) : isHovered ? (
									<motion.span
										key="terminal"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<Terminal className="size-4 animate-pulse" />
									</motion.span>
								) : (
									<motion.span
										key="locked"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										{isLocked ? (
											<Lock className="size-4" />
										) : (
											<Unlock className="size-4" />
										)}
									</motion.span>
								)}
							</AnimatePresence>
						)}
					</span>
				)}

				{/* Text Container with invisible reference element for width stability */}
				<span className="relative z-10 inline-flex items-center justify-center">
					<span className="opacity-0 select-none" aria-hidden={true}>
						{children || labelText}
					</span>
					<span className="absolute inset-0 flex items-center justify-center font-mono">
						{displayText}
					</span>
				</span>
			</motion.button>
		);
	},
);

EncryptButton.displayName = "EncryptButton";

export default EncryptButton;
