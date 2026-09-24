"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { cn } from "cn";
import { buttonVariants, type ButtonVariants } from "./variants";

const MotionCopyIcon = motion.create(CopyIcon);
const MotionCheckIcon = motion.create(CheckIcon);

const copyIconVariants: Variants = {
	initial: { rotate: 0, scale: 1, y: 0 },
	hover: {
		rotate: [0, -8, 8, -4, 0],
		scale: 1.1,
		y: -0.5,
		transition: { duration: 0.4, ease: "easeInOut" },
	},
};

const checkIconVariants: Variants = {
	initial: { scale: 0, rotate: -30 },
	animate: {
		scale: [0, 1.3, 0.95, 1],
		rotate: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
};

export type CopyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	ButtonVariants & {
		content?: string;
		delay?: number;
		onCopy?: (content: string) => void;
		isCopied?: boolean;
		onCopyChange?: (isCopied: boolean) => void;
		children?: React.ReactNode;
	};

export function CopyButton({
	content,
	className,
	size,
	variant,
	delay = 2000,
	onClick,
	onCopy,
	isCopied,
	onCopyChange,
	children,
	...props
}: CopyButtonProps) {
	const [localIsCopied, setLocalIsCopied] = React.useState(isCopied ?? false);

	React.useEffect(() => {
		setLocalIsCopied(isCopied ?? false);
	}, [isCopied]);

	const handleIsCopied = React.useCallback(
		(copied: boolean) => {
			setLocalIsCopied(copied);
			onCopyChange?.(copied);
		},
		[onCopyChange],
	);

	const handleCopy = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (localIsCopied) return;
			if (content) {
				navigator.clipboard
					.writeText(content)
					.then(() => {
						handleIsCopied(true);
						setTimeout(() => handleIsCopied(false), delay);
						onCopy?.(content);
					})
					.catch(console.error);
			}
			onClick?.(e);
		},
		[localIsCopied, content, delay, onClick, onCopy, handleIsCopied],
	);

	return (
		<motion.button
			className={cn(
				buttonVariants({ variant, size }),
				"relative cursor-pointer overflow-hidden transition-all duration-200 select-none",
				localIsCopied && "text-teal-500 dark:text-teal-400",
				className,
			)}
			onClick={handleCopy}
			whileHover="hover"
			whileTap="tap"
			variants={{
				hover: { scale: 1.03 },
				tap: { scale: 0.97 },
			}}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			{...(props as any)}
		>
			<AnimatePresence mode="wait" initial={false}>
				{localIsCopied ? (
					<motion.span
						key="copied"
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						transition={{ duration: 0.15 }}
						className="inline-flex items-center gap-1.5"
					>
						<MotionCheckIcon
							className="size-3.5 stroke-teal-500 dark:stroke-teal-400"
							variants={checkIconVariants}
							initial="initial"
							animate="animate"
						/>
						{children ? <span>Copied!</span> : null}
					</motion.span>
				) : (
					<motion.span
						key="copy"
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 5 }}
						transition={{ duration: 0.15 }}
						className="inline-flex items-center gap-1.5"
					>
						<MotionCopyIcon
							className="size-3.5"
							variants={copyIconVariants}
							initial="initial"
						/>
						{children}
					</motion.span>
				)}
			</AnimatePresence>
		</motion.button>
	);
}

export default CopyButton;
